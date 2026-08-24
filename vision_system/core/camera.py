"""Thread-safe, non-blocking camera capture using OpenCV."""

import threading
import time
import cv2
import numpy as np
from typing import Optional, Tuple
from vision_system.config.settings import CAMERA_INDEX, FRAME_WIDTH, FRAME_HEIGHT, FPS


class ThreadedCamera:
    """Non-blocking camera streamer running on a dedicated thread."""

    def __init__(self, src: int = CAMERA_INDEX, width: int = FRAME_WIDTH, height: int = FRAME_HEIGHT, fps: int = FPS):
        self.src = src
        self.width = width
        self.height = height
        self.fps = fps

        self.cap = cv2.VideoCapture(self.src)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        self.cap.set(cv2.CAP_PROP_FPS, self.fps)

        self.grabbed, self.frame = self.cap.read()
        self.started = False
        self.read_lock = threading.Lock()
        self.thread: Optional[threading.Thread] = None

    def start(self) -> "ThreadedCamera":
        if self.started:
            return self
        self.started = True
        self.thread = threading.Thread(target=self._update, args=(), daemon=True)
        self.thread.start()
        return self

    def _update(self):
        while self.started:
            grabbed, frame = self.cap.read()
            with self.read_lock:
                self.grabbed = grabbed
                self.frame = frame
            time.sleep(1.0 / (self.fps * 1.5))

    def read(self) -> Tuple[bool, Optional[np.ndarray]]:
        with self.read_lock:
            if not self.grabbed or self.frame is None:
                return False, None
            return True, self.frame.copy()

    def stop(self):
        self.started = False
        if self.thread is not None:
            self.thread.join(timeout=1.0)
        if self.cap.isOpened():
            self.cap.release()
