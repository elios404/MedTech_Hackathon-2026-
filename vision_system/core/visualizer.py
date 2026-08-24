"""Real-time HUD and ROI Visualization using OpenCV."""

from typing import Optional, Tuple
import cv2
import numpy as np

from vision_system.config.settings import ROI_COORDS
from vision_system.shared.schemas import (
    InferenceResult,
    MaterialCategory,
    TargetBinType,
    WasteDropEvent,
)

# Colors in BGR
COLOR_MAP = {
    MaterialCategory.CLEAN_PLASTIC: (255, 191, 0),      # Deep Sky Blue
    MaterialCategory.CLEAN_PAPER: (0, 215, 255),        # Amber Yellow
    MaterialCategory.BIOHAZARD_INFECTIOUS: (0, 0, 255),  # Crimson Red
    MaterialCategory.SHARPS_HAZARD: (180, 0, 255),      # Magenta Purple
    MaterialCategory.UNKNOWN: (128, 128, 128),          # Slate Gray
}


class WasteVisualizer:
    """Renders clinical ROI boundaries, BBoxes, HUD statistics, and warning banners."""

    def __init__(self, roi_coords: Tuple[int, int, int, int] = ROI_COORDS):
        self.roi_coords = roi_coords

    def draw_hud(
        self,
        frame: np.ndarray,
        inference: Optional[InferenceResult],
        last_event: Optional[WasteDropEvent],
        fps: float = 0.0,
        target_bin: TargetBinType = TargetBinType.YELLOW_BIOHAZARD,
    ) -> np.ndarray:
        out = frame.copy()
        x1, y1, x2, y2 = self.roi_coords

        # 1. ROI Chute Zone (Green boundary)
        cv2.rectangle(out, (x1, y1), (x2, y2), (0, 255, 128), 2)
        cv2.putText(
            out,
            f"Waste Influx Chute ({target_bin.value})",
            (x1 + 5, y1 - 8),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 128),
            1,
            cv2.LINE_AA,
        )

        # 2. Bounding Box & Category Badge
        if inference is not None and inference.bbox is not None:
            bx1, by1, bx2, by2 = inference.bbox
            color = COLOR_MAP.get(inference.category, (128, 128, 128))

            cv2.rectangle(out, (bx1, by1), (bx2, by2), color, 2)
            badge_text = f"{inference.category.value} ({inference.confidence*100:.0f}%)"
            if inference.is_contaminated:
                badge_text += " [BIO-ALERT]"

            (tw, th), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(out, (bx1, by1 - 22), (bx1 + tw + 8, by1), color, -1)
            cv2.putText(
                out,
                badge_text,
                (bx1 + 4, by1 - 6),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )

        # 3. Top System Stats Overlay
        cv2.rectangle(out, (10, 10), (220, 60), (20, 20, 20), -1)
        cv2.putText(
            out,
            f"FPS: {fps:.1f}",
            (18, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 0),
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            out,
            f"Standard: AS/NZS 3816",
            (18, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (200, 200, 200),
            1,
            cv2.LINE_AA,
        )

        # 4. Last Event Banner (Bottom)
        if last_event is not None:
            banner_color = (0, 140, 255) if last_event.is_misclassified else (50, 180, 50)
            cv2.rectangle(out, (0, frame.shape[0] - 38), (frame.shape[1], frame.shape[0]), banner_color, -1)

            status_str = "MISCLASSIFIED DIVERSION" if last_event.is_misclassified else "CORRECT SEGREGATION"
            event_text = (
                f"[{status_str}] ID: {last_event.event_id} | "
                f"Category: {last_event.detected_category.value} | "
                f"Conf: {last_event.confidence*100:.0f}%"
            )
            cv2.putText(
                out,
                event_text,
                (15, frame.shape[0] - 14),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )

        return out
