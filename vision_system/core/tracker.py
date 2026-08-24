"""State Machine for Event Debouncing and JSONL Logging."""

import json
import os
from pathlib import Path
from typing import Optional
import uuid

from vision_system.config.settings import (
    LOG_FILE,
    THEATRE_ID,
    DEFAULT_TARGET_BIN,
    DROP_CONFIRM_FRAMES,
    DISAPPEAR_FRAMES,
)
from vision_system.shared.schemas import (
    InferenceResult,
    MaterialCategory,
    TargetBinType,
    WasteDropEvent,
)


class WasteEventTracker:
    """Tracks state of items passing through the waste chute ROI."""

    def __init__(
        self,
        log_file: Path = LOG_FILE,
        theatre_id: str = THEATRE_ID,
        target_bin: TargetBinType = TargetBinType.YELLOW_BIOHAZARD,
    ):
        self.log_file = log_file
        self.theatre_id = theatre_id
        self.target_bin = target_bin

        self.present_frame_count = 0
        self.disappear_frame_count = 0
        self.is_tracking_active = False

        self.sampled_inferences: list[InferenceResult] = []
        self._ensure_log_dir()

    def _ensure_log_dir(self):
        self.log_file.parent.mkdir(parents=True, exist_ok=True)

    def is_misclassification(
        self,
        detected_category: MaterialCategory,
        target_bin: TargetBinType,
    ) -> bool:
        """Determines misclassification based on AS/NZS 3816 clinical standards."""
        if target_bin == TargetBinType.YELLOW_BIOHAZARD:
            return detected_category in [
                MaterialCategory.CLEAN_PLASTIC,
                MaterialCategory.CLEAN_PAPER,
            ]
        elif target_bin == TargetBinType.GENERAL_RECYCLE:
            return detected_category in [
                MaterialCategory.BIOHAZARD_INFECTIOUS,
                MaterialCategory.SHARPS_HAZARD,
            ]
        elif target_bin == TargetBinType.SHARPS_CONTAINER:
            return detected_category != MaterialCategory.SHARPS_HAZARD
        return False

    def update(self, inference: Optional[InferenceResult]) -> Optional[WasteDropEvent]:
        """State machine update called on every frame."""
        if inference is not None:
            self.disappear_frame_count = 0
            self.present_frame_count += 1
            self.sampled_inferences.append(inference)

            if self.present_frame_count >= DROP_CONFIRM_FRAMES:
                self.is_tracking_active = True
            return None

        # Object is absent in current frame
        if self.is_tracking_active:
            self.disappear_frame_count += 1

            if self.disappear_frame_count >= DISAPPEAR_FRAMES:
                event = self._finalize_event()
                self._reset_state()
                return event

        return None

    def _finalize_event(self) -> Optional[WasteDropEvent]:
        """Aggregates sampled inferences and creates final logged WasteDropEvent."""
        if not self.sampled_inferences:
            return None

        # Majority Voting for Category
        category_counts: dict[MaterialCategory, int] = {}
        for item in self.sampled_inferences:
            category_counts[item.category] = category_counts.get(item.category, 0) + 1

        top_category = max(category_counts, key=category_counts.get)
        relevant_samples = [s for s in self.sampled_inferences if s.category == top_category]

        avg_confidence = (
            sum(s.confidence for s in relevant_samples) / len(relevant_samples)
            if relevant_samples
            else 0.0
        )
        is_contaminated = any(s.is_contaminated for s in self.sampled_inferences)
        max_red_ratio = max((s.red_ratio for s in self.sampled_inferences), default=0.0)

        misclassified = self.is_misclassification(top_category, self.target_bin)

        event = WasteDropEvent(
            event_id=f"EVT_{uuid.uuid4().hex[:8].upper()}",
            theatre_id=self.theatre_id,
            target_bin=self.target_bin,
            detected_category=top_category,
            confidence=round(avg_confidence, 3),
            is_contaminated=is_contaminated,
            is_misclassified=misclassified,
            details={
                "red_ratio": round(max_red_ratio, 4),
                "sample_count": len(self.sampled_inferences),
                "label": relevant_samples[0].label if relevant_samples else "",
            },
        )

        self._log_to_file(event)
        return event

    def _log_to_file(self, event: WasteDropEvent):
        """Appends event as JSONL to disk with immediate fsync."""
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(event.model_dump_json() + "\n")
                f.flush()
                os.fsync(f.fileno())
            print(f"[Tracker] Successfully logged event: {event.event_id} -> {self.log_file}")
        except Exception as e:
            print(f"[Tracker Error] Failed to write event to disk: {e}")

    def _reset_state(self):
        self.present_frame_count = 0
        self.disappear_frame_count = 0
        self.is_tracking_active = False
        self.sampled_inferences.clear()
