"use client";

import { useState } from "react";
import { 
  Calendar, 
  Building2
} from "lucide-react";

export function Header() {
  const [selectedPeriod, setSelectedPeriod] = useState("August 2026 (Live MTD)");

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Facility Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-800 text-xs font-semibold">
          <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-slate-900 font-bold text-sm">Royal Adelaide Hospital</span>
          <span className="text-slate-400 font-normal">|</span>
          <span className="text-slate-500 font-medium text-xs">SA Health Operating Suite</span>
        </div>
      </div>

      {/* Right: Period Filter & Node Sync Indicator */}
      <div className="flex items-center gap-4 shrink-0">
        {/* System Sync Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="whitespace-nowrap font-semibold">12 OTs Live Synced</span>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="August 2026 (Live MTD)">August 2026 (Live MTD)</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="Q2 2026 (Apr-Jun)">Q2 2026 (Apr-Jun)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
