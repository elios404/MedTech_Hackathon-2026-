"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  Scale, 
  FileSpreadsheet, 
  ShieldCheck, 
  Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Executive Overview",
    subtext: "Cost Leak & Scope 3 KPIs",
    href: "/overview",
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: "Theatre Operations",
    subtext: "Clinical Phase & Flow",
    href: "/theatres",
    icon: Activity,
    badge: "12 OTs"
  },
  {
    name: "Smart Cart Audit",
    subtext: "Bulk Density & Anomaly",
    href: "/audit",
    icon: Scale,
    badge: "4 Flagged"
  },
  {
    name: "Procurement & ESG",
    subtext: "Contract & CPT De-bundle",
    href: "/reconciliation",
    icon: FileSpreadsheet,
    badge: null
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0">
          <Leaf className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
            SurgiWaste AI
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-semibold">
              SaaS
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 truncate">Hospital Waste Intelligence</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Intelligence Views
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/overview");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-3 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <div className="min-w-0">
                  <div className={cn("truncate", isActive ? "text-emerald-950 font-bold" : "text-slate-800 font-medium")}>{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">{item.subtext}</div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold shrink-0 ml-1 whitespace-nowrap",
                    item.badge === "12 OTs"
                      ? "bg-slate-100 text-slate-700 border border-slate-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Australian Regulatory Compliance Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
        <div className="flex items-center gap-2 text-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-[11px] text-slate-900">AS/NZS 3816 Standard</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 pl-6 leading-relaxed">
          Clinical & Biohazard Waste Protocol Compliance Engine v2.4
        </p>
      </div>
    </aside>
  );
}
