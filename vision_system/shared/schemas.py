"""Shared Schemas for Waste Segregation Events."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class MaterialCategory(str, Enum):
    CLEAN_PLASTIC = "Clean_Plastic"
    CLEAN_PAPER = "Clean_Paper"
    BIOHAZARD_INFECTIOUS = "Biohazard_Infectious"
    SHARPS_HAZARD = "Sharps_Hazard"
    UNKNOWN = "Unknown"


class TargetBinType(str, Enum):
    YELLOW_BIOHAZARD = "Yellow_Biohazard"
    GENERAL_RECYCLE = "General_Recycle"
    SHARPS_CONTAINER = "Sharps_Container"


class InferenceResult(BaseModel):
    category: MaterialCategory
    confidence: float
    bbox: Optional[list[int]] = None  # [x1, y1, x2, y2]
    is_contaminated: bool = False
    red_ratio: float = 0.0
    label: str = ""


class WasteDropEvent(BaseModel):
    event_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    theatre_id: str
    target_bin: TargetBinType
    detected_category: MaterialCategory
    confidence: float
    is_contaminated: bool
    is_misclassified: bool
    details: Dict[str, Any] = Field(default_factory=dict)
