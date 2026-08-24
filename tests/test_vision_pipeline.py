"""Unit and Integration Tests for Vision Pipeline."""

import os
import unittest
import numpy as np
from pathlib import Path

from vision_system.config.settings import BASE_DIR, ROI_COORDS
from vision_system.core.detector import WasteDetector
from vision_system.core.tracker import WasteEventTracker
from vision_system.shared.schemas import (
    InferenceResult,
    MaterialCategory,
    TargetBinType,
)


class TestVisionPipeline(unittest.TestCase):

    def setUp(self):
        self.detector = WasteDetector()
        self.test_log = BASE_DIR / "tests" / "test_events.jsonl"
        self.tracker = WasteEventTracker(
            log_file=self.test_log,
            theatre_id="TEST_OT",
            target_bin=TargetBinType.YELLOW_BIOHAZARD,
        )

    def tearDown(self):
        if self.test_log.exists():
            self.test_log.unlink()

    def test_misclassification_rules(self):
        # 1. Yellow Biohazard Bin: Clean Plastic/Paper should be Misclassified
        self.assertTrue(
            self.tracker.is_misclassification(MaterialCategory.CLEAN_PLASTIC, TargetBinType.YELLOW_BIOHAZARD)
        )
        self.assertTrue(
            self.tracker.is_misclassification(MaterialCategory.CLEAN_PAPER, TargetBinType.YELLOW_BIOHAZARD)
        )
        self.assertFalse(
            self.tracker.is_misclassification(MaterialCategory.BIOHAZARD_INFECTIOUS, TargetBinType.YELLOW_BIOHAZARD)
        )

        # 2. General Bin: Biohazard & Sharps should be Misclassified
        self.assertTrue(
            self.tracker.is_misclassification(MaterialCategory.BIOHAZARD_INFECTIOUS, TargetBinType.GENERAL_RECYCLE)
        )
        self.assertTrue(
            self.tracker.is_misclassification(MaterialCategory.SHARPS_HAZARD, TargetBinType.GENERAL_RECYCLE)
        )
        self.assertFalse(
            self.tracker.is_misclassification(MaterialCategory.CLEAN_PLASTIC, TargetBinType.GENERAL_RECYCLE)
        )

    def test_tracker_event_logging(self):
        dummy_inference = InferenceResult(
            category=MaterialCategory.CLEAN_PLASTIC,
            confidence=0.92,
            bbox=[120, 120, 300, 300],
            is_contaminated=False,
            red_ratio=0.0,
            label="Clean_Plastic",
        )

        # Frame 1: Present
        event1 = self.tracker.update(dummy_inference)
        self.assertIsNone(event1)

        # Frame 2: Present (confirmed)
        event2 = self.tracker.update(dummy_inference)
        self.assertIsNone(event2)

        # Frame 3~6: Disappear
        for _ in range(3):
            self.assertIsNone(self.tracker.update(None))

        # Final disappearance frame triggers event
        final_event = self.tracker.update(None)
        self.assertIsNotNone(final_event)
        self.assertEqual(final_event.detected_category, MaterialCategory.CLEAN_PLASTIC)
        self.assertTrue(final_event.is_misclassified)
        self.assertTrue(self.test_log.exists())


if __name__ == "__main__":
    unittest.main()
