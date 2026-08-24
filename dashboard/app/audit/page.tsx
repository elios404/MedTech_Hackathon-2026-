"use client";

import { useState } from "react";
import { 
  Scale, 
  AlertOctagon, 
  ShieldAlert, 
  X, 
  FileText, 
  Layers,
  Sparkles
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
  ReferenceLine,
  ReferenceArea
} from "recharts";
import { 
  SMART_CART_AUDIT_LOGS, 
  BULK_DENSITY_SCATTER_DATA,
  SPECIALTY_DENSITY_RULES
} from "@/lib/mock-data";
import { Tier2BagAudit } from "@/types/waste";
import { formatCurrencyAUD, formatDensity, formatWeightKg, formatVolumeL } from "@/lib/utils";

const SPECIALTIES = [
  "All Specialties",
  "Orthopaedics",
  "Neurosurgery",
  "General Surgery",
  "Emergency Trauma",
  "Ophthalmology & ENT"
];

export default function AuditPage() {
  const [selectedBag, setSelectedBag] = useState<Tier2BagAudit | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All Specialties");
  const [filterType, setFilterType] = useState<string>("ALL");

  const activeRule = selectedSpecialty !== "All Specialties" && SPECIALTY_DENSITY_RULES[selectedSpecialty]
    ? SPECIALTY_DENSITY_RULES[selectedSpecialty]
    : SPECIALTY_DENSITY_RULES["Orthopaedics"];

  const filteredLogs = SMART_CART_AUDIT_LOGS.filter((b) => {
    if (filterType === "ALL") return true;
    if (filterType === "ANOMALY") return b.anomalyType !== "NORMAL";
    if (filterType === "LOW_DENSITY") return b.anomalyType === "LOW_DENSITY_MISCLASS";
    if (filterType === "HIGH_DENSITY") return b.anomalyType === "HIGH_DENSITY_FLUID_RISK";
    return true;
  });

  const scatterData = BULK_DENSITY_SCATTER_DATA.filter((p) => {
    if (selectedSpecialty === "All Specialties") return true;
    return p.specialty === selectedSpecialty;
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

      {/* 2. Specialty Selector & Dynamic Bulk Density Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scatter Plot */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
                Physical Bulk Density Distribution (&rho; = kg/L)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic normal density band adapting to surgical specialty physics.
              </p>
            </div>

            {/* Specialty Switcher */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs self-start">
              <span className="text-slate-500 font-medium">Specialty Focus:</span>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                <XAxis type="number" dataKey="volume" name="Volume" unit="L" stroke="#64748B" fontSize={11} domain={[0, 70]} />
                <YAxis type="number" dataKey="weight" name="Weight" unit="kg" stroke="#64748B" fontSize={11} domain={[0, 22]} />
                <ZAxis range={[50, 150]} />
                <Tooltip 
                  cursor={{ strokeDasharray: "3 3" }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-lg space-y-1">
                          <p className="font-bold text-slate-900">{data.label}</p>
                          <p className="text-slate-600">Specialty: <strong>{data.specialty}</strong></p>
                          <p className="text-slate-600">Weight: <strong className="text-slate-900">{data.weight} kg</strong></p>
                          <p className="text-slate-600">Volume: <strong className="text-slate-900">{data.volume} L</strong></p>
                          <p className="text-slate-600">Density: <strong className="text-emerald-700">{data.density.toFixed(3)} kg/L</strong></p>
                          <p className="text-[10px] uppercase font-mono font-bold text-amber-700 mt-1">{data.type}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Dynamic Boundary Line */}
                <ReferenceLine y={4.0} stroke="#D97706" strokeDasharray="4 4" label={{ value: `Packaging Misclassification Threshold (< ${activeRule.lowDensityThreshold} kg/L)`, fill: "#D97706", fontSize: 10 }} />
                <Scatter name="Waste Bags" data={scatterData} fill="#059669" />
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
              <strong className="block mb-0.5">3D LiDAR Volume Measurement:</strong>
              Smart Cart calculates actual displacement volume, avoiding false positives caused by partially filled (50% fill rate) bags.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            <p className="text-[11px]">
              * RFID reader automatically pairs Specialty ID upon PSSA cart weigh-in.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Audit Log Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Smart Cart Real-Time Weigh-in Logs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any bag to view RFID chain-of-custody and isolation drawer.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
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
                <th className="py-3.5 px-4">Volume</th>
                <th className="py-3.5 px-4">Bulk Density</th>
                <th className="py-3.5 px-4">Anomaly Flag</th>
                <th className="py-3.5 px-4">Status</th>
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
                        ? "bg-red-100 text-red-800"
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
