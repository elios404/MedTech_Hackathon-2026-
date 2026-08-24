import { MaterialCategory, TargetBinType } from "./vision";

// 1. Tier 2 Smart Cart Bag Audit Record
export interface Tier2BagAudit {
  bagId: string; // e.g. "BAG-RAH-20260824-001"
  rfidTagId: string; // e.g. "RFID-9942-881"
  theatreId: string; // e.g. "OT_03"
  deptName: string; // e.g. "Orthopaedics"
  collectedAt: string; // ISO8601
  binType: TargetBinType;
  grossWeightKg: number; // Measured weight from load cell
  measuredVolumeL: number; // Volume from ultrasonic/LiDAR sensors
  bulkDensityKgL: number; // grossWeightKg / measuredVolumeL
  anomalyType: "LOW_DENSITY_MISCLASS" | "HIGH_DENSITY_FLUID_RISK" | "NORMAL";
  quarantineStatus: "NORMAL" | "QUARANTINED" | "RESOLVED";
  estimatedLossAUD: number;
}

// 2. EMR Surgical Schedule
export interface EMRSchedule {
  caseId: string;
  theatreId: string;
  deptName: string;
  procedureName: string;
  setupStart: string;
  incisionStart: string; // Cut start (Phase 1 -> Phase 2)
  closureStart: string; // Closure start (Phase 2 -> Phase 3)
  caseEnd: string;
}

// 3. Vendor Invoice Reconciliation
export interface VendorInvoice {
  billingPeriod: string; // e.g. "2026-07"
  vendorName: "Cleanaway" | "Daniels Health";
  invoicedWeightKg: number;
  actualWeightKg: number; // Sum of Tier 2 audited weight
  invoicedAmountAUD: number;
  calculatedAmountAUD: number;
  varianceAUD: number; // Invoiced - Calculated
  overbillingPercentage: number;
  auditStatus: "FLAGGED_DISCREPANCY" | "VERIFIED_ACCURATE" | "UNDER_REVIEW";
}

// 4. Theatre Operational Metrics
export interface TheatreMetric {
  theatreId: string;
  deptName: string;
  totalEvents: number;
  misclassEvents: number;
  sciPercentage: number; // Segregation Compliance / Misclass Rate %
  totalWeightKg: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  dominantPhase: "Phase 1: Setup" | "Phase 2: Intra-Op" | "Phase 3: Cleanup";
  recommendedAction: string;
}
