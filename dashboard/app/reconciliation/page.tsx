"use client";

import { useState } from "react";
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  PackageMinus, 
  Sparkles, 
  Printer,
  Scale
} from "lucide-react";
import { VENDOR_INVOICES } from "@/lib/mock-data";
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
      alert("[SA Health Green Theatres Report] Verified ESG & Weight Reconciliation Summary successfully generated for Royal Adelaide Hospital Q3 Audit.");
    }, 1200);
  };

  const totalVarianceAUD = VENDOR_INVOICES.reduce((sum, inv) => sum + inv.varianceAUD, 0);
  const totalAuditedKg = VENDOR_INVOICES.reduce((sum, inv) => sum + inv.actualWeightKg, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-1">
            <span>Hospital Administration</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Procurement & ESG Governance</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Contract Weight Reconciliation, De-bundling & Verified ESG
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cross-verify contracted disposal bills against Tier 2 audited weight ledgers and optimize surgical pack procurement.
          </p>
        </div>

        {/* Export ESG Certificate */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all self-start md:self-auto disabled:opacity-50"
        >
          {isExporting ? <Printer className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
          <span className="whitespace-nowrap">{isExporting ? "Generating SA Health PDF..." : "Export Green Theatres ESG Report"}</span>
        </button>
      </div>

      {/* 2. Top Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Reconciliation Adjustment</span>
              <span className="text-emerald-800 font-mono text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                Audit Difference
              </span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 tracking-tight font-mono">
              {formatCurrencyAUD(totalVarianceAUD)}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
            Digital ledger variance between contracted invoices and load-cell certified weight.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Tier 2 Audited Weight</span>
              <span className="text-slate-800 font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                Certified Scale
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {formatWeightKg(totalAuditedKg)}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
            Load-cell smart cart audited baseline for quarterly contract alignment.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Procurement De-bundling Value</span>
              <span className="text-emerald-800 font-mono text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                CPT Pack Savings
              </span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 tracking-tight font-mono">
              {formatCurrencyAUD(4305)} <span className="text-sm font-normal text-slate-500">/mo</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
            4 redundant surgical pack components identified for supplier removal.
          </p>
        </div>
      </div>

      {/* 3. Contractor Weight Ledger Verification Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              Disposal Contractor Weight Reconciliation Ledger (Cleanaway & Daniels Health)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative balance sheet matching vendor invoiced metrics against internal Tier 2 RFID load-cell records.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3.5 px-4">Billing Period</th>
                <th className="py-3.5 px-4">Contracted Partner</th>
                <th className="py-3.5 px-4">Audited Weight</th>
                <th className="py-3.5 px-4">Invoiced Weight</th>
                <th className="py-3.5 px-4">Audited Amount</th>
                <th className="py-3.5 px-4">Invoiced Amount</th>
                <th className="py-3.5 px-4">Reconciliation Variance</th>
                <th className="py-3.5 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {VENDOR_INVOICES.map((inv, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{inv.billingPeriod}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{inv.vendorName}</td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">{formatWeightKg(inv.actualWeightKg)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{formatWeightKg(inv.invoicedWeightKg)}</td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">{formatCurrencyAUD(inv.calculatedAmountAUD)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{formatCurrencyAUD(inv.invoicedAmountAUD)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                    <span className={inv.varianceAUD > 500 ? "text-amber-700" : "text-emerald-700"}>
                      {formatCurrencyAUD(inv.varianceAUD)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      inv.auditStatus === "FLAGGED_DISCREPANCY"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      {inv.auditStatus === "FLAGGED_DISCREPANCY" ? "ADJUSTMENT PENDING" : "VERIFIED ALIGNED"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Procurement De-bundling Recommendations */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageMinus className="w-4 h-4 text-amber-600 shrink-0" />
              Surgical Pack (CPT) Redundant Component De-bundling Opportunities
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sterile items identified as discarded untouched directly from outer packaging. Recommended for supplier pack exclusion.
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
