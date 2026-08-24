export type MaterialCategory =
  | "Clean_Plastic"
  | "Clean_Paper"
  | "Biohazard_Infectious"
  | "Sharps_Hazard"
  | "Unknown";

export type TargetBinType =
  | "Yellow_Biohazard"
  | "General_Recycle"
  | "Sharps_Container";

export interface VisionInferenceEvent {
  event_id: string;
  timestamp: string; // ISO8601
  theatre_id: string;
  target_bin: TargetBinType;
  detected_category: MaterialCategory;
  confidence: number;
  is_contaminated: boolean;
  is_misclassified: boolean;
  details?: {
    label?: string;
    red_ratio?: number;
    sample_count?: number;
    [key: string]: any;
  };
}
