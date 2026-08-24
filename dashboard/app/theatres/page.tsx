"use client";

import { useState } from "react";
import { 
  Activity, 
  Clock, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  PackageX, 
  LayoutGrid, 
  SearchCode, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  Trash2,
  Boxes,
  Stethoscope,
  AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { 
  THEATRE_METRICS, 
  getTheatreProfile,
  REGULATORY_BIN_STREAMS
} from "@/lib/mock-data";
import { formatCurrencyAUD } from "@/lib/utils";

const SPECIALTY_SEGMENTS = [
  { id: "ALL", label: "All 12 Theatres", count: "12 OTs", desc: "Hospital-wide" },
  { id: "Orthopaedics", label: "Orthopaedics", count: "2 OTs", desc: "OT_02, OT_03" },
  { id: "Neurosurgery", label: "Neurosurgery", count: "1 OT", desc: "OT_04" },
  { id: "General Surgery", label: "General Surgery", count: "1 OT", desc: "OT_01" },
  { id: "Emergency", label: "Emergency Trauma", count: "1 OT", desc: "OT_12" },
  { id: "Ophthal_ENT", label: "Ophthal & ENT", count: "2 OTs", desc: "OT_08, OT_09" }
];

export default function TheatresPage() {
  const [activeTab, setActiveTab] = useState<"MATRIX" | "DETAIL">("MATRIX");
  const [selectedSpecialty, setSelectedSpecialty] = useState("ALL");
  const [selectedTheatre, setSelectedTheatre] = useState("OT_03");
  const [selectedBinStreamMode, setSelectedBinStreamMode] = useState<"ALL" | "YELLOW" | "WHITE" | "CLEAR">("ALL");

  const activeProfile = getTheatreProfile(selectedTheatre);

  const filteredTheatres = THEATRE_METRICS.filter((t) => {
    if (selectedSpecialty === "ALL") return true;
    if (selectedSpecialty === "Orthopaedics") return t.theatreId === "OT_02" || t.theatreId === "OT_03";
    if (selectedSpecialty === "Neurosurgery") return t.theatreId === "OT_04";
    if (selectedSpecialty === "General Surgery") return t.theatreId === "OT_01";
    if (selectedSpecialty === "Emergency") return t.theatreId === "OT_12";
    if (selectedSpecialty === "Ophthal_ENT") return t.theatreId === "OT_08" || t.theatreId === "OT_09";
    return true;
  });

  const handleSelectAndDrilldown = (theatreId: string) => {
    setSelectedTheatre(theatreId);
    setActiveTab("DETAIL");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* 1. Top Section & 2-Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1">
            <span>Hospital Operations</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Surgical Suites</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Operating Theatre Clinical Segregation & Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Specialty-level segregation index, AS/NZS 3816 bin footprint, and clinical phase workflow.
          </p>
        </div>

        {/* 2-Tab Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab("MATRIX")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "MATRIX"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All Theatres Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("DETAIL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "DETAIL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <SearchCode className="w-4 h-4 text-amber-600 shrink-0" />
            <span>OT Deep-Dive Focus ({selectedTheatre})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL THEATRES MATRIX */}
      {/* ========================================================================= */}
      {activeTab === "MATRIX" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Level 1: Enhanced Specialty Segmented Card Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                Select Surgical Specialty Category
              </span>
              <span className="text-[11px] text-slate-400 font-mono">12 Monitored Suites Total</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {SPECIALTY_SEGMENTS.map((seg) => {
                const isSelected = selectedSpecialty === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSpecialty(seg.id)}
                    className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-600"
                        }`}>
                          {seg.count}
                        </span>
                      </div>
                      <p className="font-bold text-xs mt-2 tracking-tight truncate">{seg.label}</p>
                    </div>
                    <p className={`text-[10px] mt-1 truncate ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                      {seg.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Filtered Suites</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{filteredTheatres.length} Theatres</p>
              <p className="text-[11px] text-slate-400 mt-1">Royal Adelaide Hospital</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Average Segregation Rate</span>
              <p className="text-2xl font-bold text-amber-700 font-mono mt-1">34.6% SCI</p>
              <p className="text-[11px] text-slate-400 mt-1">Clinical Target: &lt; 25.0%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">High Packaging Priority</span>
              <p className="text-2xl font-bold text-red-700 font-mono mt-1">OT_03 & OT_04</p>
              <p className="text-[11px] text-red-600 font-bold mt-1">Pre-incision Setup Peak</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Benchmark Compliance</span>
              <p className="text-2xl font-bold text-emerald-700 font-mono mt-1">OT_08 & OT_09</p>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">&lt; 15% Misclassification</p>
            </div>
          </div>

          {/* 12-Theatre Operations Data Grid */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Surgical Suites Segregation Matrix (SCI Table)
                </h3>
                <p className="text-xs text-slate-500">
                  Click any surgical suite row to inspect detailed clinical phase distribution and EMR sign-off timeline.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                    <th className="py-3.5 px-4">Theatre ID</th>
                    <th className="py-3.5 px-4">Specialty</th>
                    <th className="py-3.5 px-4">Total Drops</th>
                    <th className="py-3.5 px-4">Misclassified Rate (SCI %)</th>
                    <th className="py-3.5 px-4">Monthly Weight</th>
                    <th className="py-3.5 px-4">Dominant Phase</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTheatres.map((t) => (
                    <tr 
                      key={t.theatreId} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => handleSelectAndDrilldown(t.theatreId)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {t.theatreId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{t.deptName}</td>
                      <td className="py-3.5 px-4 font-mono">{t.totalEvents}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold whitespace-nowrap ${t.sciPercentage > 50 ? "text-red-700" : t.sciPercentage > 30 ? "text-amber-700" : "text-emerald-700"}`}>
                            {t.sciPercentage}%
                          </span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full ${t.sciPercentage > 50 ? "bg-red-500" : t.sciPercentage > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${t.sciPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">{t.totalWeightKg} kg</td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">{t.dominantPhase}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          t.status === "CRITICAL"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : t.status === "WARNING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAndDrilldown(t.theatreId);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OT DEEP-DIVE FOCUS */}
      {/* ========================================================================= */}
      {activeTab === "DETAIL" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Control Bar for Detail View */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("MATRIX")}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Back to All Theatres"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All OTs</span>
              </button>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-mono font-bold text-sm shrink-0">
                {activeProfile.theatreId}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{activeProfile.theatreId} — {activeProfile.deptName}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    activeProfile.sciPercentage > 50
                      ? "bg-red-50 text-red-700 border-red-200"
                      : activeProfile.sciPercentage > 30
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {activeProfile.sciPercentage}% Misclassification Rate
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lead Clinician: <strong>{activeProfile.surgeonInCharge}</strong> • Turnover: <strong>{activeProfile.avgTurnoverTimeMin} min</strong>
                </p>
              </div>
            </div>

            {/* Switch Focus Theatre Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Switch OT:</span>
              <select
                value={selectedTheatre}
                onChange={(e) => setSelectedTheatre(e.target.value)}
                className="bg-slate-50 text-slate-900 font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                {THEATRE_METRICS.map((t) => (
                  <option key={t.theatreId} value={t.theatreId}>
                    {t.theatreId} ({t.deptName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3-Bin Real-Time Problem Diagnostic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bin 1: Yellow Bin */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shrink-0" />
                  Yellow Bin (Clinical Biohazard)
                </span>
                <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                  Critical Leak Peak
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                382 <span className="text-xs font-normal text-slate-500">total drops</span>
              </div>
              <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                🔴 <strong>224 clean plastics misclassified (58.6%)</strong> during 07:30~08:30 setup. Incineration loss: <strong>$7,690 AUD</strong>.
              </p>
            </div>

            {/* Bin 2: White Bin */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0" />
                  White Bin (Clean Recyclables)
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  Low Utilization
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-800 font-mono">
                39 <span className="text-xs font-normal text-slate-500">diverted drops</span>
              </div>
              <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
                🟡 Only 10.2% of clean packaging utilized this bin. Move bin directly beside sterile table.
              </p>
            </div>

            {/* Bin 3: Clear Bin */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-400 inline-block shrink-0" />
                  Clear / Black Bin (General Dry)
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  Normal Stable
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono">
                54 <span className="text-xs font-normal text-slate-500">dry drops</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                🟢 Office & dry lunch waste properly segregated. No infectious contamination detected.
              </p>
            </div>
          </div>

          {/* Deep Dive Dual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1 Col: Surgical 3-Phase Donut Chart (No Center Text Collision!) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Surgical Phase Breakdown
                </h4>
                <p className="text-xs text-slate-500 mb-2">
                  Misclassification distribution across 3 clinical phases.
                </p>

                {/* Clean Donut Chart without Center Text Collision */}
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeProfile.phaseDistribution}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {activeProfile.phaseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}% of Misclassifications`, "Ratio"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Dedicated Phase List Items (Clear & Non-overlapping) */}
                <div className="space-y-2 text-xs mt-3">
                  {activeProfile.phaseDistribution.map((p) => (
                    <div key={p.name} className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="text-slate-800 font-bold">{p.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{p.value}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 pl-4">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 2 Cols: Hourly Stream Influx Timeline with 3-Bin Filter */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Hourly Waste Influx & Yellow Bin Misclassification Peak ({activeProfile.theatreId})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Units: <strong>Events / Hour (투기 횟수)</strong>. Red shaded area highlights clean packaging wrongly thrown into Yellow bin during 07:30 pre-op setup.
                    </p>
                  </div>

                  {/* 3-Bin Stream Mode Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start shrink-0">
                    {[
                      { id: "ALL", label: "All Streams" },
                      { id: "YELLOW", label: "Yellow Bin (Critical)" },
                      { id: "WHITE", label: "White Bin (Recycle)" }
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBinStreamMode(b.id as any)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          selectedBinStreamMode === b.id
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeProfile.hourlyStreamTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                      <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} label={{ value: "Events / hr", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94A3B8" }} />
                      <Tooltip />
                      {selectedBinStreamMode === "ALL" && (
                        <>
                          <Area type="monotone" dataKey="yellowBinDrops" stroke="#D97706" fill="#F59E0B" fillOpacity={0.4} name="Yellow Bin (Total Influx)" />
                          <Area type="monotone" dataKey="yellowMisclassDrops" stroke="#DC2626" fill="#EF4444" fillOpacity={0.8} name="Clean Plastic Misclassified in Yellow Bin (Budget Leak!)" />
                          <Area type="monotone" dataKey="whiteBinDrops" stroke="#059669" fill="#10B981" fillOpacity={0.5} name="White Bin (Clean Recyclables)" />
                        </>
                      )}
                      {selectedBinStreamMode === "YELLOW" && (
                        <>
                          <Area type="monotone" dataKey="yellowBinDrops" stroke="#D97706" fill="#F59E0B" fillOpacity={0.3} name="Yellow Bin Total Influx" />
                          <Area type="monotone" dataKey="yellowMisclassDrops" stroke="#DC2626" fill="#EF4444" fillOpacity={0.85} name="Misclassified Clean Packaging in Yellow Bin (Action Target)" />
                        </>
                      )}
                      {selectedBinStreamMode === "WHITE" && (
                        <Area type="monotone" dataKey="whiteBinDrops" stroke="#059669" fill="#10B981" fillOpacity={0.7} name="White Bin (Clean Recyclables Diverted)" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Prescription Callout */}
              <div className="mt-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 min-w-0 mr-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate"><strong className="text-emerald-900">Clinical Flow Prescription:</strong> {activeProfile.clinicalPrescription}</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold shrink-0 whitespace-nowrap">
                  Protocol Ready
                </span>
              </div>
            </div>
          </div>

          {/* Top 4 Misclassified Disposables */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PackageX className="w-4 h-4 text-amber-600" />
                  High-Frequency Misclassified Disposables in {activeProfile.theatreId}
                </h4>
                <p className="text-xs text-slate-500">
                  Itemized non-contaminated packaging frequently tossed into yellow biohazard bins during surgical workflow.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeProfile.topMisclassifiedItems.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">{item.item}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0 whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono pt-1">
                    <span>{item.discardedCount} units/mo</span>
                    <span className="text-red-700 font-bold">{formatCurrencyAUD(item.estLossAUD)} loss</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
