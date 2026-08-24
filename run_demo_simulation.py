"""Interactive Medical Waste Image Inspection Demo (CLI Entrypoint)."""

import os
import random
import time
from pathlib import Path
from typing import Tuple
import cv2
import numpy as np

from vision_system.config.settings import (
    BASE_DIR,
    FRAME_HEIGHT,
    FRAME_WIDTH,
    ROI_COORDS,
    THEATRE_ID,
)
from vision_system.core.detector import WasteDetector
from vision_system.core.tracker import WasteEventTracker
from vision_system.core.visualizer import WasteVisualizer
from vision_system.shared.schemas import TargetBinType

SAMPLE_MAPPING = {
    "Sharps_Hazard": [
        "ampoules_full", "ampuoles_broken", "used_syringes", "scalpels",
        "episiotomy_scissors", "mayo_scissors", "stitch_removal_scissors",
        "forceps", "hemostats", "tweezers", "vaccine_or_medicine_vials"
    ],
    "Biohazard_Infectious": [
        "blood_soaked_bandages", "human_organs", "general_organic_waste",
        "used_masks", "used_medical_gloves", "expired_tablets"
    ],
    "Clean_Plastic": [
        "waterbottles", "disinfectant_bottles", "iv_bottles", "syrup_bottles"
    ],
    "Clean_Paper": [
        "used_medical_paper"
    ]
}


def load_diverse_demo_samples():
    """Load all available high-quality demo samples from assets/demo_samples."""
    bundled_samples_dir = BASE_DIR / "assets" / "demo_samples"
    if bundled_samples_dir.exists() and any(bundled_samples_dir.iterdir()):
        samples = []
        for cat_dir in sorted(bundled_samples_dir.iterdir()):
            if cat_dir.is_dir():
                cat_name = cat_dir.name
                imgs = list(cat_dir.glob("*.jpg")) + list(cat_dir.glob("*.png")) + list(cat_dir.glob("*.jpeg"))
                for img in imgs:
                    samples.append((cat_name, cat_name, img))
        if samples:
            return samples

    # Fallback to data/photos
    photos_dir = BASE_DIR / "data" / "photos"
    samples = []
    for cat, subfolders in SAMPLE_MAPPING.items():
        for folder in subfolders:
            folder_p = photos_dir / folder
            if folder_p.exists():
                imgs = list(folder_p.glob("*.jpg")) + list(folder_p.glob("*.png")) + list(folder_p.glob("*.jpeg"))
                if imgs:
                    for img in imgs[:5]:
                        samples.append((cat, folder, img))
    return samples


def create_chute_canvas_with_image(img_path: Path) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
    canvas = np.full((FRAME_HEIGHT, FRAME_WIDTH, 3), 40, dtype=np.uint8)

    rx1, ry1, rx2, ry2 = ROI_COORDS
    rw = rx2 - rx1
    rh = ry2 - ry1

    img = cv2.imread(str(img_path))
    if img is None:
        return canvas, (rx1 + 20, ry1 + 20, rx2 - 20, ry2 - 20)

    ih, iw = img.shape[:2]
    scale = min((rw - 60) / iw, (rh - 60) / rh)
    nw, nh = int(iw * scale), int(ih * scale)
    resized = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_AREA)

    cx = rx1 + (rw - nw) // 2
    cy = ry1 + (rh - nh) // 2

    canvas[cy:cy + nh, cx:cx + nw] = resized
    bbox = (cx, cy, cx + nw, cy + nh)
    return canvas, bbox


def main():
    print("\n" + "=" * 70)
    print("      SURGIWASTE AI - INTERACTIVE IMAGE INSPECTION DEMO      ")
    print("=" * 70)
    print("  Controls:")
    print("    [SPACE] or [N] : Next Photo")
    print("    [P]            : Previous Photo")
    print("    [1]            : Switch Target Bin to Yellow_Biohazard (Cost Leak)")
    print("    [2]            : Switch Target Bin to General_Recycle")
    print("    [3]            : Switch Target Bin to Sharps_Container")
    print("    [D]            : Drop Item (Trigger Event & Log to data/events.jsonl)")
    print("    [Q] or [ESC]   : Exit Demo")
    print("=" * 70 + "\n")

    samples = load_diverse_demo_samples()
    if not samples:
        print("[Error] No sample images found in assets/demo_samples or data/photos")
        return

    detector = WasteDetector()
    current_bin = TargetBinType.YELLOW_BIOHAZARD
    tracker = WasteEventTracker(theatre_id=THEATRE_ID, target_bin=current_bin)
    visualizer = WasteVisualizer(roi_coords=ROI_COORDS)

    current_idx = 0
    last_event = None

    while True:
        cat_gt, folder_name, img_path = samples[current_idx]
        frame, item_bbox = create_chute_canvas_with_image(img_path)

        # Detect with precise item_bbox placement
        inference = detector.detect_in_roi(frame, ROI_COORDS, explicit_bbox=item_bbox)

        # Render HUD
        vis = visualizer.draw_hud(
            frame=frame,
            inference=inference,
            last_event=last_event,
            fps=0.0,
            target_bin=tracker.target_bin,
        )

        # Top Bar Info
        cv2.rectangle(vis, (0, 0), (FRAME_WIDTH, 35), (25, 25, 25), -1)
        info_text = f"Sample [{current_idx + 1}/{len(samples)}] | Folder: {folder_name} | GT: {cat_gt}"
        cv2.putText(vis, info_text, (15, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

        # Bottom Hint
        hint_text = "[SPACE] Next | [P] Prev | [D] Drop to Bin & Log | [1,2,3] Bin | [Q] Quit"
        cv2.putText(vis, hint_text, (15, FRAME_HEIGHT - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1, cv2.LINE_AA)

        cv2.imshow("SurgiWaste AI - Static Image Inspection", vis)
        key = cv2.waitKey(0) & 0xFF

        if key in [ord("q"), 27]:
            break
        elif key in [ord(" "), ord("n"), 83]:
            current_idx = (current_idx + 1) % len(samples)
        elif key in [ord("p"), 81]:
            current_idx = (current_idx - 1 + len(samples)) % len(samples)
        elif key == ord("1"):
            tracker.target_bin = TargetBinType.YELLOW_BIOHAZARD
            print("\n[Target Bin] Switched to -> Yellow_Biohazard (Infectious Bin)")
        elif key == ord("2"):
            tracker.target_bin = TargetBinType.GENERAL_RECYCLE
            print("\n[Target Bin] Switched to -> General_Recycle (Clean Packaging Bin)")
        elif key == ord("3"):
            tracker.target_bin = TargetBinType.SHARPS_CONTAINER
            print("\n[Target Bin] Switched to -> Sharps_Container")
        elif key == ord("d"):
            print(f"\n[Action] Simulating drop of '{folder_name}' into {tracker.target_bin.value}...")
            tracker.sampled_inferences = [inference] if inference else []
            tracker.is_tracking_active = True
            last_event = tracker._finalize_event()
            tracker._reset_state()
            if last_event:
                flag = "🔴 MISCLASSIFIED" if last_event.is_misclassified else "🟢 CORRECT"
                print(f"  -> Event Logged: {last_event.event_id} | {last_event.detected_category.value} | {flag}")

    cv2.destroyAllWindows()
    print("\n[Demo] Completed.")


if __name__ == "__main__":
    main()
