"""Finetunes YOLOv8s-cls on the 4-category medical waste dataset using Apple Silicon MPS / GPU acceleration."""

from pathlib import Path
from ultralytics import YOLO
import torch
from vision_system.config.settings import BASE_DIR

DATASET_DIR = BASE_DIR / "data" / "dataset"
OUTPUT_MODEL_DIR = BASE_DIR / "models"
OUTPUT_MODEL_PATH = OUTPUT_MODEL_DIR / "medwaste_yolov8_cls.pt"


def train_classifier(epochs: int = 15, batch_size: int = 32, imgsz: int = 224):
    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n[Training] Using hardware accelerator: {device}")

    model = YOLO("yolov8s-cls.pt")
    results = model.train(
        data=str(DATASET_DIR),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        device=device,
        project="runs/classify",
        name="medwaste_train",
        exist_ok=True,
        workers=4,
        patience=5,
        save=True,
        verbose=True
    )

    OUTPUT_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    best_weight = Path(model.trainer.save_dir) / "weights" / "best.pt"
    if best_weight.exists():
        import shutil
        shutil.copy2(best_weight, OUTPUT_MODEL_PATH)
        print(f"\n[Success] Best fine-tuned model saved to: {OUTPUT_MODEL_PATH}")
    else:
        print(f"\n[Warning] Best weights not found at expected location: {best_weight}")


if __name__ == "__main__":
    train_classifier()
