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
  Layers
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart 
} from "recharts";
import { 
  PERIOD_DATA_MAP 
} from "@/lib/mock-data";
import { formatCurrencyAUD, formatNumber } from "@/lib/utils";

export default function OverviewPage() {
  const [selectedPeriodKey, setSelectedPeriodKey] = useState("August 2026 (Live MTD)");

  const currentStats = PERIOD_DATA_MAP[selectedPeriodKey] || PERIOD_DATA_MAP["August 2026 (Live MTD)"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Interactive Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1">
            <span>Hospital Intelligence</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Executive Summary</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Executive Waste & ESG Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hospital-wide clinical segregation audit, budget leakage analysis, and Scope 3 carbon metrics.
          </p>
        </div>

        {/* Period Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs self-start md:self-auto shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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

      {/* 1. Key Performance Indicators (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Waste */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span className="font-medium">Total Waste Weight</span>
            <span className="flex items-center text-emerald-700 text-[11px] font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" /> {currentStats.weightChangePercent}% YoY
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {formatNumber(currentStats.totalWasteWeightKg)} <span className="text-sm font-medium text-slate-500">kg</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
            <span className="truncate">Period: {currentStats.reportingPeriod}</span>
            <span className="font-semibold text-slate-700 shrink-0 ml-1">12 OTs Audited</span>
          </div>
        </div>

        {/* Card 2: Biohazard Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span className="font-medium">Biohazard (Yellow Bin) Ratio</span>
            <span className="text-amber-700 font-mono text-[11px] font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">
              +{(currentStats.yellowBiohazardRatioPercent - currentStats.yellowTargetRatioPercent).toFixed(1)}% vs Target
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 tracking-tight font-mono flex items-baseline gap-2">
            {currentStats.yellowBiohazardRatioPercent}%
            <span className="text-xs font-normal text-slate-500">Target: {currentStats.yellowTargetRatioPercent}%</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${currentStats.yellowBiohazardRatioPercent}%` }} />
          </div>
        </div>

        {/* Card 3: Estimated Cost Loss */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span className="font-medium">Misclassification Cost Leak</span>
            <span className="flex items-center text-red-700 text-[11px] font-mono font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200 whitespace-nowrap">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" /> Budget Loss
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700 tracking-tight font-mono">
            {formatCurrencyAUD(currentStats.misclassificationCostLossAUD)}
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 flex items-center justify-between">
            <span>Incineration Surcharge:</span>
            <span className="font-mono font-semibold text-slate-700">$3.50/kg vs $0.35/kg</span>
          </div>
        </div>

        {/* Card 4: Scope 3 Carbon Saved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span className="font-medium">Scope 3 Carbon Abated</span>
            <span className="flex items-center text-emerald-700 text-[11px] font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
              <Leaf className="w-3 h-3 mr-0.5 shrink-0" /> ESG Metric
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">
            {currentStats.scope3CarbonSavedTonnes} <span className="text-sm font-medium text-slate-500">tCO₂-e</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 flex items-center justify-between">
            <span>SA Health Protocol:</span>
            <span className="font-semibold text-slate-700">Clean Diversion</span>
          </div>
        </div>
      </div>

      {/* 2. Main Analytics Section: Dual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trend Composed Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Monthly Waste Generation & Incineration Cost Trend
              </h3>
              <p className="text-xs text-slate-500">
                Monthly volume breakdown (kg, left axis) vs Monthly Total Disposal Invoices ($AUD, right axis)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span className="text-slate-700 font-medium whitespace-nowrap">Biohazard (kg)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-500" />
                <span className="text-slate-700 font-medium whitespace-nowrap">General (kg)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-emerald-600 rounded" />
                <span className="text-slate-700 font-medium whitespace-nowrap">Cost ($AUD)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={currentStats.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}t`} />
                <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="biohazardKg" name="Biohazard (kg)" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar yAxisId="left" dataKey="generalKg" name="General (kg)" fill="#0284C7" radius={[4, 4, 0, 0]} barSize={18} />
                <Line yAxisId="right" type="monotone" dataKey="totalCostAUD" name="Total Cost ($AUD)" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: "#059669" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Department Biohazard Ratio Ranking */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">
                Department Biohazard Rate
              </h3>
              <span className="text-[10px] text-slate-500 font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                Target &lt; 25%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Orthopaedics & Neurosurgery show highest cost leakage rates.
            </p>

            <div className="space-y-3">
              {currentStats.departmentRatio.slice(0, 6).map((item) => (
                <div key={item.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium truncate mr-2">{item.dept}</span>
                    <span className={`font-mono font-bold shrink-0 ${item.bioRatio > 45 ? "text-red-700" : item.bioRatio > 25 ? "text-amber-700" : "text-emerald-700"}`}>
                      {item.bioRatio}% <span className="text-slate-500 font-normal">({formatCurrencyAUD(item.costLossAUD)})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.bioRatio > 45 ? "bg-red-500" : item.bioRatio > 25 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${item.bioRatio}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Callout Box */}
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-slate-800">
              <span className="font-bold text-emerald-800">Clinical Prescription:</span> Orthopaedics drape polybag diversion protocol projected to save <strong className="text-slate-900">$18,400 AUD/quarter</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
