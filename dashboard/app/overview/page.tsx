"use client";

import { useState, useEffect } from "react";
import { 
  Leaf, 
  ArrowDownRight, 
  ArrowUpRight, 
  Sparkles, 
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
  getPeriodData 
} from "@/lib/mock-data";
import { formatCurrencyAUD, formatNumber } from "@/lib/utils";

export default function OverviewPage() {
  const [selectedPeriodKey, setSelectedPeriodKey] = useState("August 2026 (Live MTD)");
  const [showAllDeptsModal, setShowAllDeptsModal] = useState(false);

  useEffect(() => {
    const handlePeriodChange = (e: any) => {
      if (e.detail) {
        setSelectedPeriodKey(e.detail);
      }
    };
    window.addEventListener("surgiwaste:periodChange", handlePeriodChange);
    return () => window.removeEventListener("surgiwaste:periodChange", handlePeriodChange);
  }, []);

  const currentStats = getPeriodData(selectedPeriodKey);
  const top3Depts = currentStats.departmentRatio.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1.5">
            <span>Executive Intelligence</span>
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

        {/* Active Scope Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium self-start md:self-auto">
          <span className="text-slate-500 font-normal">Active Scope:</span>
          <span className="font-bold text-slate-900 font-mono">{currentStats.reportingPeriod}</span>
        </div>
      </div>

      {/* 2. Top-Tier KPI Cards (Precision Edge Padding - No Pill Overflow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Waste */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full min-h-[160px] overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[105px]">
                Total Waste
              </span>
              <span className="inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ArrowDownRight className="w-3 h-3 shrink-0" /> -8.4% YoY
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {formatNumber(currentStats.totalWasteWeightKg)} <span className="text-base font-normal text-slate-500">kg</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 leading-normal">
            <span>Period: {currentStats.reportingPeriod}</span>
            <span className="font-semibold text-slate-700">12 OTs Audited</span>
          </div>
        </div>

        {/* Card 2: Biohazard Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full min-h-[160px] overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[105px]">
                Biohazard Ratio
              </span>
              <span className="inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                +{(currentStats.yellowBiohazardRatioPercent - currentStats.yellowTargetRatioPercent).toFixed(1)}% vs Cap
              </span>
            </div>
            <div className="text-3xl font-bold text-amber-700 tracking-tight font-mono flex items-baseline gap-2">
              {currentStats.yellowBiohazardRatioPercent}%
              <span className="text-xs font-normal text-slate-500 font-sans">Target: 25.0%</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${currentStats.yellowBiohazardRatioPercent}%` }} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
            <span>Clinical Target: &lt; 25.0% yellow bin ratio</span>
          </div>
        </div>

        {/* Card 3: Cost Loss */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full min-h-[160px] overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[105px]">
                Cost Leak Loss
              </span>
              <span className="inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-50 text-red-800 border border-red-200">
                <ArrowUpRight className="w-3 h-3 shrink-0" /> Budget Leak
              </span>
            </div>
            <div className="text-3xl font-bold text-red-700 tracking-tight font-mono">
              {formatCurrencyAUD(currentStats.misclassificationCostLossAUD)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 leading-normal">
            <span>Incineration Diff:</span>
            <span className="font-mono font-bold text-slate-800">$3.50 vs $0.35/kg</span>
          </div>
        </div>

        {/* Card 4: Scope 3 Carbon */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full min-h-[160px] overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[105px]">
                Scope 3 Carbon
              </span>
              <span className="inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Leaf className="w-3 h-3 mr-0.5 shrink-0" /> ESG Metric
              </span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 tracking-tight font-mono">
              {currentStats.scope3CarbonSavedTonnes} <span className="text-base font-normal text-slate-500">tCO₂-e</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 leading-normal">
            <span>Protocol:</span>
            <span className="font-semibold text-slate-800">Clean Packaging Diversion</span>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Sliced Time-Series Chart + Top 3 Department Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trend Sliced Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Waste Generation & Incineration Cost Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic time-series timeline ({currentStats.monthlyTrend[0]?.month} - {currentStats.monthlyTrend[currentStats.monthlyTrend.length - 1]?.month} 2026)
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
                <Bar yAxisId="left" dataKey="biohazardKg" name="Biohazard (kg)" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar yAxisId="left" dataKey="generalKg" name="General (kg)" fill="#0284C7" radius={[4, 4, 0, 0]} barSize={22} />
                <Line yAxisId="right" type="monotone" dataKey="totalCostAUD" name="Total Cost ($AUD)" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: "#059669" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Top 3 Department Focus */}
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

            {/* Progressive Disclosure Button */}
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

      {/* 4. Full Department Breakdown Modal */}
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
