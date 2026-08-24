"use client";

import { useState } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  PackageX, 
  UserCheck, 
  Timer 
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
  getTheatreProfile 
} from "@/lib/mock-data";
import { formatCurrencyAUD } from "@/lib/utils";

export default function TheatresPage() {
  const [selectedTheatre, setSelectedTheatre] = useState("OT_03");

  const activeProfile = getTheatreProfile(selectedTheatre);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Interactive Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1">
            <span>Hospital Intelligence</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Theatre Operations</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Operating Theatre Clinical Segregation & Workflow Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify theatre-specific contamination patterns and isolate surgical phase bottlenecks (Setup vs Intra-op vs Breakdown).
          </p>
        </div>

        {/* Selected Theatre Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs self-start md:self-auto shadow-sm">
          <span className="text-slate-600 font-medium whitespace-nowrap">Selected Theatre Focus:</span>
          <select
            value={selectedTheatre}
            onChange={(e) => setSelectedTheatre(e.target.value)}
            className="bg-slate-50 text-emerald-800 font-mono font-bold px-2.5 py-1 rounded border border-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            {THEATRE_METRICS.map((t) => (
              <option key={t.theatreId} value={t.theatreId}>
                {t.theatreId} - {t.deptName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Theatre Quick Metadata Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-mono font-bold text-xs shrink-0">
            {activeProfile.theatreId}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 block">Department:</span>
            <p className="text-xs font-bold text-slate-900 truncate">{activeProfile.deptName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-4 pt-2 sm:pt-0">
          <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 block">Lead Clinician:</span>
            <p className="text-xs font-semibold text-slate-800 truncate">{activeProfile.surgeonInCharge}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4 pt-2 lg:pt-0">
          <Timer className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="text-[11px] text-slate-500 block">Avg Turnover Time:</span>
            <p className="text-xs font-mono font-bold text-amber-700">{activeProfile.avgTurnoverTimeMin} min</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4 pt-2 lg:pt-0">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <div>
            <span className="text-[11px] text-slate-500 block">Misclassification (SCI):</span>
            <p className="text-xs font-mono font-bold text-red-700">{activeProfile.sciPercentage}%</p>
          </div>
        </div>
      </div>

      {/* 2. Deep Dive Focus Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Surgical 3-Phase Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Phase Misclassification Ratio
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Surgical phase distribution for <strong className="text-slate-800">{activeProfile.theatreId}</strong>
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
                  <Tooltip 
                    formatter={(value) => [`${value}% of Misclassifications`, "Ratio"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-amber-700 font-mono">{activeProfile.phaseDistribution[0].value}%</span>
                <span className="text-[10px] text-slate-500 font-semibold">Phase 1 Setup</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs mt-1">
              {activeProfile.phaseDistribution.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-700">{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Hourly Timeline Stacked Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Hourly Waste Influx & Composition ({activeProfile.theatreId})
              </h3>
              <p className="text-xs text-slate-500">
                Time-series waste stream influx during operating day schedule (07:30 ~ 16:30).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span className="text-slate-700 font-medium whitespace-nowrap">Clean Plastic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span className="text-slate-700 font-medium whitespace-nowrap">Clean Paper</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-500" />
                <span className="text-slate-700 font-medium whitespace-nowrap">Biohazard</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
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

          {/* Action Callout */}
          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 min-w-0 mr-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate"><strong className="text-emerald-900">Operational Prescription:</strong> {activeProfile.clinicalPrescription}</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold shrink-0 whitespace-nowrap">
              Action Ready
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Misclassified Items Breakdown for this Theatre */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PackageX className="w-4 h-4 text-amber-600" />
              Top Misclassified Disposables in {activeProfile.theatreId} ({activeProfile.deptName})
            </h3>
            <p className="text-xs text-slate-500">
              High-frequency non-contaminated sterile packaging items routinely discarded into yellow biohazard bags.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeProfile.topMisclassifiedItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 truncate">{item.item}</span>
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

      {/* 4. Full 12-Theatre Operations Data Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              All Operating Theatres Segregation Index (SCI Table)
            </h3>
            <p className="text-xs text-slate-500">
              Live ranking of 12 active surgical suites based on contamination rate and misclassified volume. Click row to focus.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-4">Theatre ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Drops</th>
                <th className="py-3 px-4">Misclassified Rate (SCI %)</th>
                <th className="py-3 px-4">Monthly Weight</th>
                <th className="py-3 px-4">Dominant Phase</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {THEATRE_METRICS.map((t) => (
                <tr 
                  key={t.theatreId} 
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    t.theatreId === selectedTheatre ? "bg-emerald-50/60 font-medium" : ""
                  }`}
                  onClick={() => setSelectedTheatre(t.theatreId)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                    {t.theatreId === selectedTheatre && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
                    {t.theatreId}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{t.deptName}</td>
                  <td className="py-3 px-4 font-mono">{t.totalEvents}</td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 font-mono whitespace-nowrap">{t.totalWeightKg} kg</td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{t.dominantPhase}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      t.status === "CRITICAL"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : t.status === "WARNING"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedTheatre(t.theatreId)}
                      className="text-slate-500 hover:text-emerald-700 text-xs inline-flex items-center gap-1 font-semibold"
                    >
                      Focus <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
