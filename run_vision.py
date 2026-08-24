"""Real-time Camera Waste Segregation Vision System (CLI Entrypoint)."""

import time
import cv2

from vision_system.config.settings import (
    CAMERA_INDEX,
    FPS,
    FRAME_HEIGHT,
    FRAME_WIDTH,
    ROI_COORDS,
    DEFAULT_TARGET_BIN,
    THEATRE_ID,
)
from vision_system.core.camera import ThreadedCamera
from vision_system.core.detector import WasteDetector
from vision_system.core.tracker import WasteEventTracker
from vision_system.core.visualizer import WasteVisualizer
from vision_system.shared.schemas import TargetBinType


def main():
    print("\n" + "=" * 65)
    print(f"  SURGIWASTE AI - OPERATING THEATRE VISION PIPELINE ({THEATRE_ID})")
    print(f"  Clinical Bin Stream: {DEFAULT_TARGET_BIN}")
    print("  Controls: [Q] Quit | [1] Yellow Bin | [2] General | [3] Sharps")
    print("=" * 65 + "\n")

    current_bin = TargetBinType(DEFAULT_TARGET_BIN)

    cam = ThreadedCamera(src=CAMERA_INDEX, width=FRAME_WIDTH, height=FRAME_HEIGHT, fps=FPS).start()
    detector = WasteDetector()
    tracker = WasteEventTracker(theatre_id=THEATRE_ID, target_bin=current_bin)
    visualizer = WasteVisualizer(roi_coords=ROI_COORDS)

    time.sleep(1.0)  # Camera warm-up

    last_event = None
    frame_count = 0
    start_time = time.time()
    current_fps = 0.0

    try:
        while True:
            ret, frame = cam.read()
            if not ret or frame is None:
                time.sleep(0.01)
                continue

            frame_count += 1
            if frame_count % 15 == 0:
                elapsed = time.time() - start_time
                current_fps = frame_count / elapsed if elapsed > 0 else 0.0

            # 1. Detect Waste in Chute ROI
            inference = detector.detect_in_roi(frame, ROI_COORDS)

            # 2. Update Event State Machine & Debouncer
            event = tracker.update(inference)
            if event is not None:
                last_event = event

            # 3. Render Clinical HUD
            vis_frame = visualizer.draw_hud(
                frame=frame,
                inference=inference,
                last_event=last_event,
                fps=current_fps,
                target_bin=tracker.target_bin,
            )

            cv2.imshow(f"SurgiWaste AI - {THEATRE_ID} Edge Vision", vis_frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or key == 27:
                break
            elif key == ord("1"):
                tracker.target_bin = TargetBinType.YELLOW_BIOHAZARD
                print("[Stream] Target Bin switched to: Yellow_Biohazard")
            elif key == ord("2"):
                tracker.target_bin = TargetBinType.GENERAL_RECYCLE
                print("[Stream] Target Bin switched to: General_Recycle")
            elif key == ord("3"):
                tracker.target_bin = TargetBinType.SHARPS_CONTAINER
                print("[Stream] Target Bin switched to: Sharps_Container")

    finally:
        cam.stop()
        cv2.destroyAllWindows()
        print("\n[Vision] Stream gracefully terminated.")


if __name__ == "__main__":
    main()
