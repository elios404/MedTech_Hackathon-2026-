"use client";

import { useState } from "react";
import { 
  Scale, 
  AlertOctagon, 
  ShieldAlert, 
  X, 
  FileText, 
  Lock,
  Info
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from "recharts";
import { 
  SMART_CART_AUDIT_LOGS, 
  SPECIALTY_SCATTER_DATA,
  SPECIALTY_DENSITY_RULES
} from "@/lib/mock-data";
import { Tier2BagAudit } from "@/types/waste";
import { formatCurrencyAUD, formatDensity, formatWeightKg, formatVolumeL } from "@/lib/utils";

const SPECIALTIES = [
  { id: "Orthopaedics", label: "Orthopaedics" },
  { id: "Neurosurgery", label: "Neurosurgery" },
  { id: "General Surgery", label: "General Surgery" },
  { id: "Emergency Trauma", label: "Emergency Trauma" },
  { id: "Ophthalmology & ENT", label: "Ophthal & ENT" }
];

export default function AuditPage() {
  const [selectedBag, setSelectedBag] = useState<Tier2BagAudit | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Orthopaedics");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  const activeRule = SPECIALTY_DENSITY_RULES[selectedSpecialty] || SPECIALTY_DENSITY_RULES["Orthopaedics"];
  const currentScatterPoints = SPECIALTY_SCATTER_DATA[selectedSpecialty] || SPECIALTY_SCATTER_DATA["Orthopaedics"];

  const filteredLogs = SMART_CART_AUDIT_LOGS.filter((b) => {
    if (filterType === "ALL") return true;
    if (filterType === "ANOMALY") return b.anomalyType !== "NORMAL";
    if (filterType === "LOW_DENSITY") return b.anomalyType === "LOW_DENSITY_MISCLASS";
    if (filterType === "HIGH_DENSITY") return b.anomalyType === "HIGH_DENSITY_FLUID_RISK";
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1">
            <span>Hospital Logistics</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Tier 2 Smart Cart</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Non-Destructive Bulk Density Audit & Physics-Grounded Anomaly Detection
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Specialty-dynamic weight vs 3D volume audit enforcing AS/NZS 3816 standards without unsealing biohazard bags.
          </p>
        </div>

        {/* Quarantined Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 self-start md:self-auto shadow-sm">
          <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
          <span className="whitespace-nowrap font-semibold">Active Quarantined Bags: <strong>3 Bags Isolated</strong></span>
        </div>
      </div>

      {/* 2. Clean Specialty Density Distribution with Balanced 2-Row Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scatter Plot */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {/* Row 1: Title and Baseline Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                Specialty Bulk Density Distribution (&rho; = kg/L)
              </h3>

              {/* Interactive (i) Info Icon with Popover */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}
                  onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Density explanation"
                >
                  <Info className="w-4 h-4" />
                </button>

                {showInfoTooltip && (
                  <div className="absolute left-0 top-6 z-30 w-72 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs space-y-1.5 animate-fadeIn">
                    <p className="font-bold text-emerald-400 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" /> Physics Baseline Audit
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Each scatter point represents an audited waste bag (Load-cell Weight vs 3D LiDAR Volume). Expected baseline: <strong>{activeRule.expectedMinDensity} ~ {activeRule.expectedMaxDensity} kg/L</strong>. Density below threshold indicates bulk packaging misclassification.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
              Expected: {activeRule.expectedMinDensity} ~ {activeRule.expectedMaxDensity} kg/L
            </div>
          </div>

          {/* Row 2: Specialty Selector Grid (100% Width Full Alignment - No Overflow) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100/80 rounded-lg border border-slate-200">
            {SPECIALTIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecialty(s.id)}
                className={`py-1.5 px-2 rounded-md text-[11px] font-bold transition-all text-center truncate ${
                  selectedSpecialty === s.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 20, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                <XAxis type="number" dataKey="volume" name="Volume" unit="L" stroke="#64748B" fontSize={11} domain={[0, 60]} />
                <YAxis type="number" dataKey="weight" name="Weight" unit="kg" stroke="#64748B" fontSize={11} domain={[0, 25]} />
                <ZAxis range={[50, 150]} />
                <Tooltip 
                  cursor={{ strokeDasharray: "3 3" }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-lg space-y-1">
                          <p className="font-bold text-slate-900">{data.label}</p>
                          <p className="text-slate-600">Weight: <strong className="text-slate-900">{data.weight} kg</strong></p>
                          <p className="text-slate-600">Volume (3D LiDAR): <strong className="text-slate-900">{data.volume} L</strong></p>
                          <p className="text-slate-600">Bulk Density: <strong className={data.density < activeRule.lowDensityThreshold ? "text-red-700" : "text-emerald-700"}>{data.density.toFixed(3)} kg/L</strong></p>
                          <p className={`text-[10px] uppercase font-mono font-bold mt-1 ${data.type === "NORMAL" ? "text-emerald-700" : "text-amber-700"}`}>
                            Finding: {data.type.replace(/_/g, " ")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={activeRule.lowDensityThreshold * 50} stroke="#D97706" strokeDasharray="4 4" label={{ value: `Packaging Threshold (< ${activeRule.lowDensityThreshold} kg/L)`, fill: "#D97706", fontSize: 10 }} />
                <Scatter name="Audited Bags" data={currentScatterPoints} fill="#059669" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Specialty Physics & Clinical Logic */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              {activeRule.specialty} Physical Baseline
            </h3>
            
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
              <span className="font-bold text-emerald-900">Normal Expected Range:</span>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {activeRule.expectedMinDensity} ~ {activeRule.expectedMaxDensity} kg/L
              </p>
              <p className="text-slate-700 text-[11px] leading-relaxed pt-1">
                {activeRule.clinicalExplanation}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong className="block mb-0.5">3D LiDAR Non-Destructive Volume Audit:</strong>
              Smart Cart calculates actual volume displacement, preventing false positives caused by partially filled (50% fill rate) bags without manual unsealing.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            <p className="text-[11px]">
              * RFID reader automatically pairs Specialty ID upon PSSA cart weigh-in.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Clearly Explained Non-Destructive Bag Quarantine Log (100% Australian English) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              Tier 2 Smart Cart Non-Destructive Bag Quarantine Log
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Corridor-level audit records collected by PSSA smart carts upon case completion. Bags failing physics baseline density are automatically quarantined without opening seals.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-lg border border-slate-200 self-start shrink-0">
            {["ALL", "ANOMALY", "LOW_DENSITY", "HIGH_DENSITY"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors whitespace-nowrap ${
                  filterType === f
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3.5 px-4">Bag ID / RFID</th>
                <th className="py-3.5 px-4">Origin Suite</th>
                <th className="py-3.5 px-4">Bin Stream</th>
                <th className="py-3.5 px-4">Gross Weight</th>
                <th className="py-3.5 px-4">3D Volume</th>
                <th className="py-3.5 px-4">Bulk Density</th>
                <th className="py-3.5 px-4">Audit Finding</th>
                <th className="py-3.5 px-4">Quarantine Status</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((bag) => (
                <tr 
                  key={bag.bagId} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedBag(bag)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <div>{bag.bagId}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{bag.rfidTagId}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{bag.theatreId}</span>
                    <span className="text-slate-500 ml-1.5">({bag.deptName})</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">{bag.binType}</td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">{formatWeightKg(bag.grossWeightKg)}</td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">{formatVolumeL(bag.measuredVolumeL)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                    <span className={bag.anomalyType === "LOW_DENSITY_MISCLASS" ? "text-amber-700" : bag.anomalyType === "HIGH_DENSITY_FLUID_RISK" ? "text-red-700" : "text-emerald-700"}>
                      {formatDensity(bag.bulkDensityKgL)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      bag.anomalyType === "LOW_DENSITY_MISCLASS"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : bag.anomalyType === "HIGH_DENSITY_FLUID_RISK"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      {bag.anomalyType === "LOW_DENSITY_MISCLASS" ? "LOW DENSITY (PLASTIC WRAP)" : bag.anomalyType === "HIGH_DENSITY_FLUID_RISK" ? "FLUID LEAK RISK" : "NORMAL DENSITY"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      bag.quarantineStatus === "QUARANTINED"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "text-slate-500"
                    }`}>
                      {bag.quarantineStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedBag(bag)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer Modal */}
      {selectedBag && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-500 font-mono">RFID Traceability Record</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedBag.bagId}</h3>
              </div>
              <button 
                onClick={() => setSelectedBag(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Origin Suite:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedBag.theatreId} ({selectedBag.deptName})</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">RFID Tag ID:</span>
                <p className="font-mono font-bold text-emerald-800 text-sm mt-0.5">{selectedBag.rfidTagId}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Gross Weight:</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{formatWeightKg(selectedBag.grossWeightKg)}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Volume (3D LiDAR):</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{formatVolumeL(selectedBag.measuredVolumeL)}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Measured Bulk Density:</span>
                <span className="font-mono font-bold text-sm text-amber-700">{formatDensity(selectedBag.bulkDensityKgL)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                <span className="text-slate-600">Est. Incineration Loss:</span>
                <span className="font-mono font-bold text-sm text-red-700">{formatCurrencyAUD(selectedBag.estimatedLossAUD)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBag(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  alert(`[IPC Automated Protocol] Non-destructive quarantine incident report generated for ${selectedBag.bagId}. Tagged to Infection Prevention Committee.`);
                  setSelectedBag(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" /> Dispatch IPC Incident Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
