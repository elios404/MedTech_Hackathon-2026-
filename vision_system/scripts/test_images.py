"""Batch Image Benchmark Script for Fine-tuned Classifier."""

from pathlib import Path
import cv2
from vision_system.config.settings import BASE_DIR, ROI_COORDS
from vision_system.core.detector import WasteDetector

TEST_IMAGES_DIR = BASE_DIR / "test_images"
RESULTS_DIR = BASE_DIR / "test_results"


def run_test_images():
    if not TEST_IMAGES_DIR.exists():
        print(f"[Warning] No test_images folder found at {TEST_IMAGES_DIR}")
        return

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    detector = WasteDetector()

    images = list(TEST_IMAGES_DIR.glob("*.jpg")) + list(TEST_IMAGES_DIR.glob("*.png")) + list(TEST_IMAGES_DIR.glob("*.jpeg"))
    print(f"\n[Test Benchmark] Found {len(images)} test images in {TEST_IMAGES_DIR}")

    for img_p in images:
        frame = cv2.imread(str(img_p))
        if frame is None:
            continue

        res = detector.detect_in_roi(frame, ROI_COORDS)
        if res:
            print(f"  {img_p.name} -> {res.category.value} (Conf: {res.confidence*100:.1f}%) [Label: {res.label}]")


if __name__ == "__main__":
    run_test_images()
