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

# High-contrast Medical SaaS Palette (BGR)
COLOR_MAP = {
    MaterialCategory.CLEAN_PLASTIC: (240, 160, 0),      # Vivid Cyan Blue
    MaterialCategory.CLEAN_PAPER: (0, 200, 255),        # Bright Amber Yellow
    MaterialCategory.BIOHAZARD_INFECTIOUS: (30, 30, 240), # Vivid Crimson Red
    MaterialCategory.SHARPS_HAZARD: (220, 30, 220),     # Neon Purple / Magenta
    MaterialCategory.UNKNOWN: (140, 140, 140),          # Neutral Slate Gray
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
        show_bbox: bool = True,
        is_locked_on: bool = True,
        display_mode: str = "3_CLASS", # "3_CLASS" (General_Waste) or "4_CLASS" (Detailed Plastic/Paper)
    ) -> np.ndarray:
        out = frame.copy()
        x1, y1, x2, y2 = self.roi_coords

        # 1. ROI Chute Zone (Professional Green boundary)
        cv2.rectangle(out, (x1, y1), (x2, y2), (0, 230, 120), 2)
        cv2.putText(
            out,
            f"Waste Influx Chute ({target_bin.value})",
            (x1 + 6, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (0, 230, 120),
            2,
            cv2.LINE_AA,
        )

        # 2. Enlarged High-Visibility Bounding Box & Category Badge
        if show_bbox and inference is not None and inference.bbox is not None:
            bx1, by1, bx2, by2 = inference.bbox
            color = COLOR_MAP.get(inference.category, (140, 140, 140))

            # Determine Label by Display Mode (3-Class Standard vs 4-Class Detailed)
            if display_mode == "3_CLASS" and inference.category in [MaterialCategory.CLEAN_PLASTIC, MaterialCategory.CLEAN_PAPER]:
                category_title = "General_Waste (Clean Packaging)"
                color = (240, 180, 0) # Unified General Clean Packaging Color
            else:
                category_title = inference.category.value

            # Thick high-visibility BBox
            cv2.rectangle(out, (bx1, by1), (bx2, by2), color, 3)

            # High-visibility Badge text
            badge_text = f" {category_title} ({inference.confidence*100:.0f}%) "
            if inference.is_contaminated:
                badge_text += "[BIO-ALERT] "

            font_scale = 0.62
            thickness = 2
            (tw, th), baseline = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)

            badge_y1 = max(0, by1 - th - 12)
            badge_y2 = by1
            badge_x2 = min(out.shape[1], bx1 + tw + 10)

            cv2.rectangle(out, (bx1, badge_y1), (badge_x2, badge_y2), color, -1)
            cv2.putText(
                out,
                badge_text,
                (bx1 + 4, badge_y2 - 6),
                cv2.FONT_HERSHEY_SIMPLEX,
                font_scale,
                (255, 255, 255),
                thickness,
                cv2.LINE_AA,
            )

            # Target crosshairs at corners
            cw = 12
            cv2.line(out, (bx1, by1), (bx1 + cw, by1), (255, 255, 255), 2)
            cv2.line(out, (bx1, by1), (bx1, by1 + cw), (255, 255, 255), 2)
            cv2.line(out, (bx2, by2), (bx2 - cw, by2), (255, 255, 255), 2)
            cv2.line(out, (bx2, by2), (bx2, by2 - cw), (255, 255, 255), 2)

        # 3. Top System Stats Overlay
        cv2.rectangle(out, (10, 10), (250, 65), (20, 20, 20), -1)
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
        mode_label = "3-Stream Standard" if display_mode == "3_CLASS" else "4-Class Detailed"
        cv2.putText(
            out,
            f"Mode: {mode_label}",
            (18, 46),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (255, 215, 0),
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            out,
            f"Standard: AS/NZS 3816",
            (18, 60),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.38,
            (200, 200, 200),
            1,
            cv2.LINE_AA,
        )

        # 4. Last Event Banner (Bottom)
        if last_event is not None:
            banner_color = (0, 140, 255) if last_event.is_misclassified else (50, 180, 50)
            cv2.rectangle(out, (0, frame.shape[0] - 38), (frame.shape[1], frame.shape[0]), banner_color, -1)

            status_str = "MISCLASSIFIED DIVERSION" if last_event.is_misclassified else "CORRECT SEGREGATION"
            category_str = (
                "General_Waste" if display_mode == "3_CLASS" and last_event.detected_category.value in ["Clean_Plastic", "Clean_Paper"]
                else last_event.detected_category.value
            )
            event_text = (
                f"[{status_str}] ID: {last_event.event_id} | "
                f"Category: {category_str} | "
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
