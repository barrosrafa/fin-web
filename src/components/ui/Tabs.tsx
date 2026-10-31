"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  ariaLabel = "Abas de navegação analítica",
}: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let targetIndex: number | null = null;
    if (e.key === "ArrowRight") {
      targetIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      targetIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = tabs.length - 1;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      const targetTab = tabs[targetIndex];
      onChange(targetTab.id);
      const targetElement = document.getElementById(`tab-${targetTab.id}`);
      targetElement?.focus();
    }
  };

  return (
    <CmsElement><div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-1.5 p-1 rounded-full bg-[#0c1017] border border-white/5 w-fit max-w-full overflow-x-auto scrollbar-none ${className}`}
    >
      <CmsText>{tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <CmsElement feature="ui.components/ui/Tabs.button.2" key={tab.id}><button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#00f5a0] ${
              isActive
                ? "bg-white/10 text-[#00f5a0] shadow-[0_0_15px_rgba(0,245,160,0.15)] border border-[rgba(0,245,160,0.3)]"
                : "text-[#64748b] hover:text-[#94a3b8] hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <CmsText>{tab.label}</CmsText>
            <CmsText>{tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-[rgba(0,245,160,0.15)] text-[#00f5a0]"
                    : "bg-white/5 text-[#64748b]"
                }`}
              >
                <CmsText>{tab.count}</CmsText>
              </span>
            )}</CmsText>
          </button></CmsElement>
        );
      })}</CmsText>
    </div></CmsElement>
  );
}
