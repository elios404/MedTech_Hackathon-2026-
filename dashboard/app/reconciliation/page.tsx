"use client";

import { useState } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  PackageMinus, 
  Sparkles, 
  Printer,
  Building2,
  Award
} from "lucide-react";
import { SPECIALTY_DIVERSION_PERFORMANCE } from "@/lib/mock-data";
import { formatCurrencyAUD, formatWeightKg } from "@/lib/utils";

const UNUSED_CPT_ITEMS = [
  { item: "60ml Luer Lock Syringes (CPT Pack #A)", unbundledWasteKg: 420.0, lossAUD: 1470, action: "De-bundle from standard Ortho pack" },
  { item: "Extra Medium Drape Sheet (CPT Pack #B)", unbundledWasteKg: 380.0, lossAUD: 1330, action: "Request supplier packaging removal" },
  { item: "Sterile Skin Marker & Ruler (CPT Pack #C)", unbundledWasteKg: 190.0, lossAUD: 665, action: "Switch to modular on-demand add-on" },
  { item: "Plastic Kidney Dish (General Surgery Pack)", unbundledWasteKg: 240.0, lossAUD: 840, action: "Replace with reusable autoclavable dish" },
];

export default function ReconciliationPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("[SA Health Green Theatres Certified Report] Official Scope 3 Carbon & Specialty Waste Diversion Summary generated for Royal Adelaide Hospital.");
    }, 1200);
  };

  const totalDivertedKg = SPECIALTY_DIVERSION_PERFORMANCE.reduce((sum, s) => sum + s.cleanPlasticDivertedKg + s.paperDivertedKg, 0);
  const totalCostSavedAUD = SPECIALTY_DIVERSION_PERFORMANCE.reduce((sum, s) => sum + s.incinerationCostSavedAUD, 0);
  const totalCarbonAbatedTonnes = Number(SPECIALTY_DIVERSION_PERFORMANCE.reduce((sum, s) => sum + s.scope3CarbonAbatedTonnes, 0).toFixed(2));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1">
            <span>Hospital ESG Governance</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Specialty Performance & Procurement</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Specialty Waste Diversion, CPT De-bundling & Scope 3 ESG Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Department-by-department clinical diversion ledger calculating verified incineration savings and official SA Health Scope 3 certificates.
          </p>
        </div>

        {/* Export ESG Certificate */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all self-start md:self-auto disabled:opacity-50"
        >
          {isExporting ? <Printer className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
          <span className="whitespace-nowrap">{isExporting ? "Generating SA Health PDF..." : "Export Green Theatres ESG Certificate"}</span>
        </button>
      </div>

      {/* 2. Executive Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total Incineration Cost Avoided</span>
              <span className="text-emerald-800 font-mono text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                Net Savings
              </span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 tracking-tight font-mono">
              {formatCurrencyAUD(totalCostSavedAUD)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 border-t border-slate-100 pt-3 leading-normal">
            Savings achieved by diverting uncontaminated packaging from $3.50/kg incineration to $0.35/kg recycling.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Verified Clean Packaging Diverted</span>
              <span className="text-slate-800 font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                Plastic & Paper
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {formatWeightKg(totalDivertedKg)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 border-t border-slate-100 pt-3 leading-normal">
            Certified sterile HDPE/PP plastics and cartons diverted away from yellow clinical biohazard bins.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Scope 3 Carbon Abated</span>
              <span className="text-emerald-800 font-mono text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                <Leaf className="w-3 h-3 inline mr-1" /> ESG Verified
              </span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 tracking-tight font-mono">
              {totalCarbonAbatedTonnes} <span className="text-base font-normal text-slate-500">tCO₂-e</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 border-t border-slate-100 pt-3 leading-normal">
            Greenhouse gas emissions prevented based on Australian National Greenhouse Accounts factors.
          </p>
        </div>
      </div>

      {/* 3. Specialty-by-Specialty Diversion & ESG Performance Ledger */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              Specialty Waste Diversion & Cost Savings Performance Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Departmental audit accounting for diverted sterile packaging, avoided high-cost incineration fees, and carbon abatement credits.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3.5 px-4">Surgical Specialty</th>
                <th className="py-3.5 px-4">Assigned Suites</th>
                <th className="py-3.5 px-4">Total Weight</th>
                <th className="py-3.5 px-4">Plastic Diverted</th>
                <th className="py-3.5 px-4">Paper Diverted</th>
                <th className="py-3.5 px-4">Incineration Cost Saved</th>
                <th className="py-3.5 px-4">Carbon Abated</th>
                <th className="py-3.5 px-4">Compliance Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {SPECIALTY_DIVERSION_PERFORMANCE.map((spec, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {spec.specialtyName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {spec.assignedTheatres.join(", ")}
                  </td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">{formatWeightKg(spec.totalWasteGeneratedKg)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                    +{formatWeightKg(spec.cleanPlasticDivertedKg)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-700 whitespace-nowrap">
                    +{formatWeightKg(spec.paperDivertedKg)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrencyAUD(spec.incinerationCostSavedAUD)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-800 whitespace-nowrap">
                    {spec.scope3CarbonAbatedTonnes} tCO₂-e
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      spec.performanceTier === "EXCELLENT"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : spec.performanceTier === "ON_TRACK"
                        ? "bg-sky-50 text-sky-800 border-sky-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {spec.performanceTier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CPT Redundant Component De-bundling Opportunities */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageMinus className="w-4 h-4 text-amber-600 shrink-0" />
              Surgical Custom Procedure Tray (CPT) De-bundling Opportunities
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard pre-packaged pack items opened but discarded 100% untouched prior to incision. Recommended for supplier catalogue removal.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Est. Savings: $4,305 AUD / month
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNUSED_CPT_ITEMS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs text-slate-900 truncate">{item.item}</h4>
                <span className="font-mono font-bold text-xs text-emerald-700 shrink-0 whitespace-nowrap">
                  -{formatCurrencyAUD(item.lossAUD)}/mo
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Monthly Discarded Volume: <strong className="text-slate-900">{item.unbundledWasteKg} kg</strong> (100% Uncontaminated)
              </p>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Recommended Procurement Action:</span>
                <span className="text-emerald-800 font-bold text-[11px] truncate ml-1">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
