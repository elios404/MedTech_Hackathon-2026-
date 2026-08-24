"""Vision Pipeline Configuration & Global Constants."""

import os
from pathlib import Path
import numpy as np

# Base Project Root Directory (Absolute Path)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Camera Settings
CAMERA_INDEX = 0
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
FPS = 30

# ROI (Region of Interest - Waste Influx Chute Zone)
ROI_COORDS = (100, 100, 540, 420)  # (x1, y1, x2, y2)

# AI Model Weights Paths
MODEL_PATH = BASE_DIR / "models" / "medwaste_yolov8_cls.pt"
YOLO_WORLD_MODEL_PATH = BASE_DIR / "yolov8s-worldv2.pt"
CONFIDENCE_THRESHOLD = 0.40

# 4 Clinical Waste Segregation Categories
CATEGORIES = [
    "Clean_Plastic",
    "Clean_Paper",
    "Biohazard_Infectious",
    "Sharps_Hazard",
]

# Color & Blood Contamination Detection (HSV Bounds)
COLOR_LOWER_BOUNDS = {
    "red1": np.array([0, 70, 50]),
    "red2": np.array([170, 70, 50]),
}
COLOR_UPPER_BOUNDS = {
    "red1": np.array([10, 255, 255]),
    "red2": np.array([180, 255, 255]),
}
RED_RATIO_THRESHOLD = 0.05  # >5% red area flags blood contamination

# Debounce & Drop State Machine Parameters
DROP_CONFIRM_FRAMES = 2  # Continuous frames required to confirm drop presence
DISAPPEAR_FRAMES = 4     # Frames required to confirm item has fallen into chute
MIN_CONTOUR_AREA = 1200  # Minimum pixel area to filter minor dust/sensor noise

# File Paths & Defaults
LOG_FILE = BASE_DIR / "data" / "events.jsonl"
THEATRE_ID = "OR_03"
DEFAULT_TARGET_BIN = "Yellow_Biohazard"
