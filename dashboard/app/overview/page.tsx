"use client";

import { useState } from "react";
import { 
  DollarSign, 
  TrendingDown, 
  Leaf, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  X
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { 
  PERIOD_DATA_MAP 
} from "@/lib/mock-data";
import { formatCurrencyAUD, formatNumber } from "@/lib/utils";

export default function OverviewPage() {
  const [selectedPeriodKey, setSelectedPeriodKey] = useState("August 2026 (Live MTD)");
  const [showAllDeptsModal, setShowAllDeptsModal] = useState(false);

  const currentStats = PERIOD_DATA_MAP[selectedPeriodKey] || PERIOD_DATA_MAP["August 2026 (Live MTD)"];
  const top3Depts = currentStats.departmentRatio.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* 1. Page Header with Clean Hierarchy */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1.5">
            <span>Hospital Executive Intelligence</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Macro Overview</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Executive Waste & ESG Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hospital-wide clinical segregation compliance, cost leak diagnosis, and Scope 3 carbon metrics.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-lg text-xs self-start md:self-auto shadow-sm">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-600 font-medium whitespace-nowrap">Audit Period:</span>
          <select
            value={selectedPeriodKey}
            onChange={(e) => setSelectedPeriodKey(e.target.value)}
            className="bg-slate-50 text-emerald-800 font-mono font-bold px-2.5 py-1 rounded border border-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            {Object.keys(PERIOD_DATA_MAP).map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top-Tier KPI Cards (5-Second Rule: 4 High-Impact Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Waste Weight */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total Waste Generated</span>
              <span className="flex items-center text-emerald-700 text-xs font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" /> {currentStats.weightChangePercent}% YoY
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {formatNumber(currentStats.totalWasteWeightKg)} <span className="text-base font-medium text-slate-500">kg</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Period: {currentStats.reportingPeriod}</span>
            <span className="font-semibold text-slate-700">12 OTs Audited</span>
          </div>
        </div>

        {/* Card 2: Biohazard Ratio */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Biohazard Ratio</span>
              <span className="text-amber-800 font-mono text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                +{(currentStats.yellowBiohazardRatioPercent - currentStats.yellowTargetRatioPercent).toFixed(1)}% vs Cap
              </span>
            </div>
            <div className="text-3xl font-bold text-amber-700 tracking-tight font-mono flex items-baseline gap-2">
              {currentStats.yellowBiohazardRatioPercent}%
              <span className="text-xs font-normal text-slate-500">Target: {currentStats.yellowTargetRatioPercent}%</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${currentStats.yellowBiohazardRatioPercent}%` }} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Clinical Target: &lt; 25.0% yellow bin ratio</span>
          </div>
        </div>

        {/* Card 3: Cost Leakage */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Misclassification Cost Loss</span>
              <span className="flex items-center text-red-700 text-xs font-mono font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200 whitespace-nowrap">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" /> Budget Leak
              </span>
            </div>
            <div className="text-3xl font-bold text-red-700 tracking-tight font-mono">
              {formatCurrencyAUD(currentStats.misclassificationCostLossAUD)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Incineration Diff:</span>
            <span className="font-mono font-bold text-slate-800">$3.50 vs $0.35/kg</span>
          </div>
        </div>

        {/* Card 4: Scope 3 Carbon Saved */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Scope 3 Carbon Abated</span>
              <span className="flex items-center text-emerald-700 text-xs font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                <Leaf className="w-3.5 h-3.5 mr-0.5 shrink-0" /> ESG Metric
              </span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 tracking-tight font-mono">
              {currentStats.scope3CarbonSavedTonnes} <span className="text-base font-medium text-slate-500">tCO₂-e</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Protocol:</span>
            <span className="font-semibold text-slate-800">Clean Packaging Diversion</span>
          </div>
        </div>
      </div>

      {/* 3. Analytics Section (Monthly Trend + Progressive Disclosure Top 3 Depts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trend Composed Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Waste Generation & Incineration Cost Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly volume breakdown (kg, left axis) vs Monthly Total Disposal Invoices ($AUD, right axis)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-slate-700 font-medium">Biohazard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500" />
                <span className="text-slate-700 font-medium">General</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-600 rounded" />
                <span className="text-slate-700 font-medium">Cost ($AUD)</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={currentStats.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}t`} />
                <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="biohazardKg" name="Biohazard (kg)" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="generalKg" name="General (kg)" fill="#0284C7" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="totalCostAUD" name="Total Cost ($AUD)" stroke="#059669" strokeWidth={2.5} dot={{ r: 3.5, fill: "#059669" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Top 3 Department Focus with Progressive Disclosure Modal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">
                Top Cost Leak Departments
              </h3>
              <span className="text-[10px] text-slate-500 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded">
                Target &lt; 25%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              High-priority surgical specialties with highest packaging misclassification rates.
            </p>

            {/* Top 3 Department Cards */}
            <div className="space-y-4">
              {top3Depts.map((item, idx) => (
                <div key={item.dept} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-900 font-bold">{item.dept}</span>
                    </div>
                    <span className={`font-mono font-bold ${item.bioRatio > 45 ? "text-red-700" : "text-amber-700"}`}>
                      {item.bioRatio}% <span className="text-slate-500 font-normal">({formatCurrencyAUD(item.costLossAUD)})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.bioRatio > 45 ? "bg-red-500" : "bg-amber-500"}`}
                      style={{ width: `${item.bioRatio}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Progressive Disclosure Trigger Button */}
            <button
              onClick={() => setShowAllDeptsModal(true)}
              className="mt-4 w-full py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View All 8 Departments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actionable Clinical Insight Box */}
          <div className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-slate-800 leading-relaxed">
              <span className="font-bold text-emerald-900">Executive Prescription:</span> Orthopaedics packaging diversion protocol projected to save <strong className="text-slate-900">$18,400 AUD/quarter</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Full Department Breakdown Modal (Progressive Disclosure) */}
      {showAllDeptsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-500 font-mono">Hospital Clinical Audits</span>
                <h3 className="text-lg font-bold text-slate-900">All 8 Surgical Departments Segregation Index</h3>
              </div>
              <button 
                onClick={() => setShowAllDeptsModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {currentStats.departmentRatio.map((item, idx) => (
                <div key={item.dept} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{idx + 1}. {item.dept}</span>
                    <span className={`font-mono font-bold ${item.bioRatio > 45 ? "text-red-700" : item.bioRatio > 25 ? "text-amber-700" : "text-emerald-700"}`}>
                      {item.bioRatio}% Biohazard <span className="text-slate-500 font-normal">({formatCurrencyAUD(item.costLossAUD)} loss / {formatNumber(item.totalKg)} kg)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.bioRatio > 45 ? "bg-red-500" : item.bioRatio > 25 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${item.bioRatio}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAllDeptsModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
