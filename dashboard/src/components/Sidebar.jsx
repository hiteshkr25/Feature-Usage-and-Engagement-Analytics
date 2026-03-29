import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, LayoutGrid, Clock, Sparkles, Activity } from "lucide-react";

const nav = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/features", label: "Features", icon: BarChart3 },
  { to: "/sessions", label: "Sessions", icon: Clock },
  { to: "/ai-insights", label: "AI Insights", icon: Sparkles },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-20 lg:w-60 border-r border-border bg-surface/70 backdrop-blur">
      <div className="flex h-full flex-col">
        <div className="px-4 pt-5 pb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo1 to-purple1 flex items-center justify-center shadow-glow">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-bold tracking-wide">ENGAGEMENT</div>
            <div className="text-xs text-white/60 mt-0.5">Analytics</div>
          </div>
        </div>

        <nav className="flex-1 px-2 pb-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-xl px-3 py-3 transition",
                  "text-white/70 hover:text-white",
                  isActive
                    ? "bg-gradient-to-r from-indigo1/20 to-purple1/20 border border-indigo1/30 shadow-glow"
                    : "border border-transparent hover:border-border",
                ].join(" ")
              }
            >
              {(() => {
                const Icon = item.icon;
                return <Icon className="h-5 w-5" />;
              })()}
              <span className="hidden lg:block text-sm font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 hidden lg:block text-xs text-white/60">
          <div className="rounded-xl border border-border bg-surface/50 p-3">
            Track features with a simple SDK script.
          </div>
        </div>
      </div>
    </aside>
  );
}

