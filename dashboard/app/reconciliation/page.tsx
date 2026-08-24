"use client";

import { useState } from "react";
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  PackageMinus, 
  Sparkles, 
  Printer 
} from "lucide-react";
import { VENDOR_INVOICES } from "@/lib/mock-data";
import { formatCurrencyAUD, formatWeightKg } from "@/lib/utils";

const UNUSED_CPT_ITEMS = [
  { item: "60ml Luer Lock Syringes (CPT Pack #A)", unbundledWasteKg: 420.0, lossAUD: 1470, action: "De-bundle from standard Ortho pack" },
  { item: "Extra Medium Drape Sheet (CPT Pack #B)", unbundledWasteKg: 380.0, lossAUD: 1330, action: "Request supplier removal" },
  { item: "Sterile Skin Marker & Ruler (CPT Pack #C)", unbundledWasteKg: 190.0, lossAUD: 665, action: "Switch to modular add-on" },
  { item: "Plastic Kidney Dish (General Surgery Pack)", unbundledWasteKg: 240.0, lossAUD: 840, action: "Replace with reusable steel dish" },
];

export default function ReconciliationPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("[SA Health Green Theatres Report] PDF audit summary successfully generated for Royal Adelaide Hospital Q3 Audit.");
    }, 1200);
  };

  const totalVarianceAUD = VENDOR_INVOICES.reduce((sum, inv) => sum + inv.varianceAUD, 0);
  const totalOverbilledKg = VENDOR_INVOICES.reduce((sum, inv) => sum + (inv.invoicedWeightKg - inv.actualWeightKg), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1">
            <span>Hospital Administration</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Procurement & ESG</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Vendor Invoice Audit, De-bundling & Scope 3 ESG
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-verify contracted disposal bills against Tier 2 audited weight and generate government ESG reports.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all self-start md:self-auto disabled:opacity-50"
        >
          {isExporting ? <Printer className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
          <span className="whitespace-nowrap">{isExporting ? "Generating SA Health PDF..." : "Export Green Theatres ESG Report"}</span>
        </button>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span className="font-medium">Total Overbilled Discrepancy</span>
            <span className="text-amber-800 font-mono text-[11px] font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">
              Flagged (Cleanaway)
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 tracking-tight font-mono">
            {formatCurrencyAUD(totalVarianceAUD)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2">
            Audit delta between vendor invoice and smart cart real load-cell scale.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span className="font-medium">Unverified Invoiced Weight</span>
            <span className="text-red-800 font-mono text-[11px] font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200 whitespace-nowrap">
              +11.2% Overstatement
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700 tracking-tight font-mono">
            {formatWeightKg(totalOverbilledKg)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2">
            Direct grounds for vendor invoice deduction & contractual reconciliation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span className="font-medium">Procurement De-bundling Potential</span>
            <span className="text-emerald-800 font-mono text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
              CPT Pack Savings
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">
            {formatCurrencyAUD(4305)} <span className="text-xs font-normal text-slate-500">/mo</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2">
            4 redundant surgical pack components identified for supplier removal.
          </p>
        </div>
      </div>

      {/* 2. Vendor Invoice Reconciliation Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              Contracted Disposal Contractor Billing Audit (Cleanaway vs Daniels Health)
            </h3>
            <p className="text-xs text-slate-500">
              Audited using Tier 2 RFID Smart Cart digital weight ledger.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Contracted Vendor</th>
                <th className="py-3 px-4">Tier 2 Audited Weight</th>
                <th className="py-3 px-4">Vendor Invoiced Weight</th>
                <th className="py-3 px-4">Audited Amount</th>
                <th className="py-3 px-4">Invoiced Amount</th>
                <th className="py-3 px-4">Variance ($AUD)</th>
                <th className="py-3 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {VENDOR_INVOICES.map((inv, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">{inv.billingPeriod}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{inv.vendorName}</td>
                  <td className="py-3 px-4 font-mono whitespace-nowrap">{formatWeightKg(inv.actualWeightKg)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 whitespace-nowrap">{formatWeightKg(inv.invoicedWeightKg)}</td>
                  <td className="py-3 px-4 font-mono whitespace-nowrap">{formatCurrencyAUD(inv.calculatedAmountAUD)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{formatCurrencyAUD(inv.invoicedAmountAUD)}</td>
                  <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                    <span className={inv.varianceAUD > 500 ? "text-red-700" : "text-emerald-700"}>
                      +{formatCurrencyAUD(inv.varianceAUD)}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      inv.auditStatus === "FLAGGED_DISCREPANCY"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {inv.auditStatus === "FLAGGED_DISCREPANCY" ? "FLAGGED: OVERBILLING" : "VERIFIED ACCURATE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Procurement De-bundling Insights (CPT Surgery Packs) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PackageMinus className="w-4 h-4 text-amber-600 shrink-0" />
              Surgical Pack (CPT) Redundant Component De-bundling Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Components identified by Tier 1 Vision as discarded untouched directly from sterile packaging.
            </p>
          </div>
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
                <span className="text-slate-500 text-[11px]">Recommended Action:</span>
                <span className="text-amber-800 font-semibold text-[11px] truncate ml-1">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
