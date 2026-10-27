"use client";

import React from "react";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex items-center gap-1.5 p-1 rounded-full bg-[#0c1017] border border-white/5 w-fit ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 select-none ${
              isActive
                ? "bg-white/10 text-[#00f5a0] shadow-[0_0_15px_rgba(0,245,160,0.15)] border border-[rgba(0,245,160,0.3)]"
                : "text-[#64748b] hover:text-[#94a3b8] hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-[rgba(0,245,160,0.15)] text-[#00f5a0]"
                    : "bg-white/5 text-[#64748b]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
