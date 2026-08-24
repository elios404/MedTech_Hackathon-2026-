"""Evaluates fine-tuned model against hold-out Test split and generates confusion matrix."""

from pathlib import Path
from ultralytics import YOLO
import numpy as np
from vision_system.config.settings import BASE_DIR, MODEL_PATH

TEST_DIR = BASE_DIR / "data" / "dataset" / "test"


def evaluate_model():
    if not MODEL_PATH.exists():
        print(f"[Error] Fine-tuned model not found at {MODEL_PATH}")
        return

    model = YOLO(str(MODEL_PATH))
    results = model.val(data=str(BASE_DIR / "data" / "dataset"), split="test", verbose=True)

    print("\n" + "=" * 50)
    print("      QUANTITATIVE TEST SET EVALUATION RESULTS      ")
    print("=" * 50)
    print(f"Top-1 Test Accuracy: {results.top1 * 100:.2f}%")
    print(f"Top-5 Test Accuracy: {results.top5 * 100:.2f}%")
    print("=" * 50)


if __name__ == "__main__":
    evaluate_model()
