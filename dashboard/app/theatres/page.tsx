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
  CheckCircle2,
  Trash2,
  Boxes
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

const SPECIALTY_FILTERS = [
  { id: "ALL", label: "All 12 Theatres" },
  { id: "Orthopaedics", label: "Orthopaedics (OT_02, 03)" },
  { id: "Neurosurgery", label: "Neurosurgery (OT_04)" },
  { id: "General Surgery", label: "General Surgery (OT_01)" },
  { id: "Emergency", label: "Emergency Trauma (OT_12)" },
  { id: "Ophthal_ENT", label: "Ophthalmology & ENT (OT_08, 09)" }
];

export default function TheatresPage() {
  const [activeTab, setActiveTab] = useState<"MATRIX" | "DETAIL">("MATRIX");
  const [selectedSpecialty, setSelectedSpecialty] = useState("ALL");
  const [selectedTheatre, setSelectedTheatre] = useState("OT_03");

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
      {/* TAB 1: ALL THEATRES MATRIX (with Specialty Filter Bar) */}
      {/* ========================================================================= */}
      {activeTab === "MATRIX" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Level 1: Specialty Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0 mr-1">
              Specialty Filter:
            </span>
            {SPECIALTY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedSpecialty(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedSpecialty === f.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
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
                    {activeProfile.sciPercentage}% Misclassification
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

          {/* EMR Surgical Count & PSSA Transport Governance Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AS/NZS 3816 & Surgical Count Governance Protocol
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  All clinical waste remains inside the theatre until final instrument/swab count is officially signed off.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono shrink-0 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Surgical Count Verified:</span>
                <strong className="text-emerald-800">{activeProfile.emrTimeline.countSignedOffTime}</strong>
              </div>
              <span className="text-slate-300">→</span>
              <div>
                <span className="text-slate-400 block text-[10px]">PSSA Smart Cart Scan:</span>
                <strong className="text-slate-900">{activeProfile.emrTimeline.pssaCollectionTime}</strong>
              </div>
            </div>
          </div>

          {/* Deep Dive Dual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1 Col: Surgical 3-Phase Donut Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Surgical Phase Breakdown
                </h4>
                <p className="text-xs text-slate-500 mb-2">
                  Misclassification distribution across 3 clinical phases.
                </p>

                <div className="h-52 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeProfile.phaseDistribution}
                        innerRadius={55}
                        outerRadius={80}
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-amber-700 font-mono">{activeProfile.phaseDistribution[0].value}%</span>
                    <span className="text-[10px] text-slate-500 font-bold">Phase 1 Setup</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs mt-2">
                  {activeProfile.phaseDistribution.map((p) => (
                    <div key={p.name} className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-slate-700 font-medium">{p.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 2 Cols: Hourly Influx Timeline Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Hourly Waste Influx & Composition ({activeProfile.theatreId})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeProfile.theatreGroupType === "HIGH_PACKAGING"
                        ? "Sterile packaging surge occurring during pre-incision setup (07:30~09:00)."
                        : activeProfile.theatreGroupType === "RAPID_TURNOVER"
                        ? "Post-operative co-mingling surge during rapid turnover cleanup (15:30~17:00)."
                        : "Stable baseline with low packaging misclassification."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                      <span className="text-slate-700 font-medium">Clean Plastic</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                      <span className="text-slate-700 font-medium">Paper/Box</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-red-500" />
                      <span className="text-slate-700 font-medium">Biohazard</span>
                    </div>
                  </div>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeProfile.hourlyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                      <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="cleanPlastics" stackId="1" stroke="#059669" fill="#10B981" fillOpacity={0.5} name="Clean Plastics (Recyclable)" />
                      <Area type="monotone" dataKey="paperBox" stackId="1" stroke="#D97706" fill="#F59E0B" fillOpacity={0.5} name="Clean Paper / Boxes" />
                      <Area type="monotone" dataKey="biohazard" stackId="1" stroke="#DC2626" fill="#EF4444" fillOpacity={0.5} name="True Biohazard" />
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

          {/* Top 4 Misclassified Disposables for this OT */}
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
