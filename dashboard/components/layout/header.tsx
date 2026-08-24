"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Bell
} from "lucide-react";
import { VisionInferenceEvent } from "@/types/vision";

export function Header() {
  const [eventsData, setEventsData] = useState<{
    total: number;
    misclassified: number;
    misclassRate: number;
    latestEvent: VisionInferenceEvent | null;
  }>({ total: 0, misclassified: 0, misclassRate: 0, latestEvent: null });

  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("August 2026 (Live MTD)");
  const [lastEventToast, setLastEventToast] = useState<VisionInferenceEvent | null>(null);

  // Poll /api/events every 3 seconds to receive edge vision events
  useEffect(() => {
    let lastSeenId = "";

    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setIsLiveConnected(true);
            setEventsData(json.stats);

            if (json.stats.latestEvent && json.stats.latestEvent.event_id !== lastSeenId) {
              lastSeenId = json.stats.latestEvent.event_id;
              setLastEventToast(json.stats.latestEvent);
            }
          }
        }
      } catch (err) {
        setIsLiveConnected(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Facility & Edge Vision Indicators */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium whitespace-nowrap">Tier 1 Edge Vision:</span>
          <span className="text-emerald-700 font-mono font-bold whitespace-nowrap">
            {isLiveConnected ? "OR_03 Stream Active" : "Standby"}
          </span>
        </div>

        {/* Live Event Toast Pill */}
        {lastEventToast && (
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border shadow-sm transition-all animate-fadeIn truncate ${
              lastEventToast.is_misclassified
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {lastEventToast.is_misclassified ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="truncate max-w-[280px] font-medium">
              {lastEventToast.theatre_id}: {lastEventToast.detected_category} (Conf: {(lastEventToast.confidence * 100).toFixed(0)}%)
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/60 shrink-0">
              {lastEventToast.is_misclassified ? "MISCLASSIFIED" : "CORRECT"}
            </span>
          </div>
        )}
      </div>

      {/* Right: Controls & Filters */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="August 2026 (Live MTD)">August 2026 (Live MTD)</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="Q2 2026 (Apr-Jun)">Q2 2026 (Apr-Jun)</option>
          </select>
        </div>

        {/* Live Synced Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
          <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="whitespace-nowrap font-medium">Synced: <strong className="text-slate-900">{eventsData.total}</strong> Drops</span>
        </div>
      </div>
    </header>
  );
}
