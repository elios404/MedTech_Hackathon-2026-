"""Waste Detection and Classification Engine combining YOLO and Color Analysis."""

from pathlib import Path
from typing import Optional, Tuple
import cv2
import numpy as np
from ultralytics import YOLO

from vision_system.config.settings import (
    MODEL_PATH,
    YOLO_WORLD_MODEL_PATH,
    CONFIDENCE_THRESHOLD,
    COLOR_LOWER_BOUNDS,
    COLOR_UPPER_BOUNDS,
    RED_RATIO_THRESHOLD,
    MIN_CONTOUR_AREA,
)
from vision_system.shared.schemas import InferenceResult, MaterialCategory


class WasteDetector:
    """Hybrid Classifier combining YOLO Custom Classifier/World and Color Analysis."""

    def __init__(
        self,
        model_path: Optional[Path] = None,
        conf_thresh: float = CONFIDENCE_THRESHOLD,
    ):
        self.conf_thresh = conf_thresh

        # Prefer custom fine-tuned model if exists
        target_model = model_path or MODEL_PATH
        if not target_model.exists() and YOLO_WORLD_MODEL_PATH.exists():
            target_model = YOLO_WORLD_MODEL_PATH

        print(f"[Detector] Loading AI model from: {target_model}")
        self.model = YOLO(str(target_model))
        self.is_classifier = hasattr(self.model, "names") and not hasattr(self.model, "set_classes")

    def _is_empty_or_blank(self, roi_crop: np.ndarray) -> bool:
        """Determines if the ROI contains no physical object (e.g. solid white/black/empty chute)."""
        if roi_crop.size == 0:
            return True

        gray = cv2.cvtColor(roi_crop, cv2.COLOR_BGR2GRAY)
        std_dev = float(np.std(gray))

        # Check edge density via Canny
        edges = cv2.Canny(gray, 40, 120)
        edge_count = cv2.countNonZero(edges)

        # If variance is very low (< 14.0) or edge count is negligible, it's a blank background
        if std_dev < 14.0 or edge_count < 120:
            return True

        return False

    def _check_red_contamination(self, roi_crop: np.ndarray) -> Tuple[bool, float]:
        """Calculates ratio of red pixels (indicating blood/biohazard) in HSV color space."""
        if roi_crop.size == 0:
            return False, 0.0

        hsv = cv2.cvtColor(roi_crop, cv2.COLOR_BGR2HSV)
        mask1 = cv2.inRange(hsv, COLOR_LOWER_BOUNDS["red1"], COLOR_UPPER_BOUNDS["red1"])
        mask2 = cv2.inRange(hsv, COLOR_LOWER_BOUNDS["red2"], COLOR_UPPER_BOUNDS["red2"])
        red_mask = mask1 | mask2

        red_pixels = cv2.countNonZero(red_mask)
        total_pixels = roi_crop.shape[0] * roi_crop.shape[1]
        red_ratio = red_pixels / float(total_pixels) if total_pixels > 0 else 0.0

        return (red_ratio >= RED_RATIO_THRESHOLD), red_ratio

    def detect_in_roi(
        self,
        frame: np.ndarray,
        roi_coords: Tuple[int, int, int, int],
        explicit_bbox: Optional[Tuple[int, int, int, int]] = None,
    ) -> Optional[InferenceResult]:
        """Performs classification and contamination analysis on the ROI region."""
        x1, y1, x2, y2 = roi_coords
        roi_crop = frame[y1:y2, x1:x2]

        if roi_crop.size == 0:
            return None

        # 1. Blank / Empty Chute Saliency Check (Prevents false mapping on empty/white frames)
        if self._is_empty_or_blank(roi_crop):
            return None

        # 2. Color Contamination Check (Blood / Infectious)
        is_red, red_ratio = self._check_red_contamination(roi_crop)

        # 3. Custom Fine-tuned Classifier Model
        if self.is_classifier:
            results = self.model(roi_crop, verbose=False)
            if not results or results[0].probs is None:
                return None

            top1_idx = results[0].probs.top1
            top1_conf = float(results[0].probs.top1conf.cpu().numpy())
            class_name = results[0].names[top1_idx]

            # Reject low-confidence ambiguous inferences (< 55%)
            if top1_conf < 0.55:
                return None

            # Bounding Box
            if explicit_bbox is not None:
                bbox = list(explicit_bbox)
            else:
                gray = cv2.cvtColor(roi_crop, cv2.COLOR_BGR2GRAY)
                bg_val = np.median(gray)
                diff = cv2.absdiff(gray, int(bg_val))
                _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
                contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

                if contours:
                    valid_c = [c for c in contours if cv2.contourArea(c) > 400]
                    if valid_c:
                        largest = max(valid_c, key=cv2.contourArea)
                        bx, by, bw, bh = cv2.boundingRect(largest)
                        pad = 6
                        bx1 = max(x1, x1 + bx - pad)
                        by1 = max(y1, y1 + by - pad)
                        bx2 = min(x2, x1 + bx + bw + pad)
                        by2 = min(y2, y1 + by + bh + pad)
                        bbox = [bx1, by1, bx2, by2]
                    else:
                        bbox = [x1 + 15, y1 + 15, x2 - 15, y2 - 15]
                else:
                    bbox = [x1 + 15, y1 + 15, x2 - 15, y2 - 15]

            # Map to MaterialCategory enum
            category_mapping = {
                "Clean_Plastic": MaterialCategory.CLEAN_PLASTIC,
                "Clean_Paper": MaterialCategory.CLEAN_PAPER,
                "Biohazard_Infectious": MaterialCategory.BIOHAZARD_INFECTIOUS,
                "Sharps_Hazard": MaterialCategory.SHARPS_HAZARD,
            }
            category = category_mapping.get(class_name, MaterialCategory.UNKNOWN)

            # Red Blood Overrides clean plastic/paper into Biohazard
            if is_red and category in [MaterialCategory.CLEAN_PLASTIC, MaterialCategory.CLEAN_PAPER]:
                category = MaterialCategory.BIOHAZARD_INFECTIOUS
                class_name = f"{class_name}_BloodContaminated"

            return InferenceResult(
                category=category,
                confidence=round(top1_conf, 3),
                bbox=bbox,
                is_contaminated=is_red,
                red_ratio=round(red_ratio, 4),
                label=class_name,
            )

        # 4. Fallback: YOLO-World Object Detection
        results = self.model(roi_crop, conf=self.conf_thresh, verbose=False)
        if not results or len(results[0].boxes) == 0:
            return None

        boxes = results[0].boxes
        best_box_idx = int(np.argmax(boxes.conf.cpu().numpy()))
        cls_idx = int(boxes.cls[best_box_idx])
        conf = float(boxes.conf[best_box_idx])
        label = self.model.names.get(cls_idx, "waste")

        local_xyxy = boxes.xyxy[best_box_idx].cpu().numpy().astype(int)
        global_bbox = [
            x1 + int(local_xyxy[0]),
            y1 + int(local_xyxy[1]),
            x1 + int(local_xyxy[2]),
            y1 + int(local_xyxy[3]),
        ]

        category = MaterialCategory.UNKNOWN
        if "plastic" in label.lower():
            category = MaterialCategory.CLEAN_PLASTIC
        elif "paper" in label.lower() or "cardboard" in label.lower():
            category = MaterialCategory.CLEAN_PAPER
        elif "sharp" in label.lower() or "metal" in label.lower():
            category = MaterialCategory.SHARPS_HAZARD
        elif "biohazard" in label.lower() or is_red:
            category = MaterialCategory.BIOHAZARD_INFECTIOUS

        return InferenceResult(
            category=category,
            confidence=round(conf, 3),
            bbox=global_bbox,
            is_contaminated=is_red,
            red_ratio=round(red_ratio, 4),
            label=label,
        )
