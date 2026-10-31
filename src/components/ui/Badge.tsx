
import { CmsText } from "@/components/content/Cms";
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "emerald" | "crimson" | "cyan" | "violet" | "amber" | "neutral" | "indigo" | "outline";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}: BadgeProps) {
  const variantClasses: Record<string, string> = {
    emerald: "badge-neon-emerald",
    crimson: "badge-neon-crimson",
    cyan: "badge-neon-cyan",
    violet: "badge-neon-violet",
    indigo: "bg-[rgba(99,102,241,0.08)] text-[#818cf8] border border-[rgba(99,102,241,0.3)] shadow-[0_0_12px_rgba(99,102,241,0.1)]",
    amber: "bg-[rgba(245,158,11,0.08)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] shadow-[0_0_12px_rgba(245,158,11,0.1)]",
    neutral: "bg-white/[0.04] text-[#94a3b8] border border-white/10",
    outline: "bg-white/[0.04] text-[#94a3b8] border border-white/10",
  };

  const dotColors: Record<string, string> = {
    emerald: "bg-[#00f5a0]",
    crimson: "bg-[#ff3b69]",
    cyan: "bg-[#00d9f5]",
    violet: "bg-[#a855f7]",
    indigo: "bg-[#818cf8]",
    amber: "bg-[#f59e0b]",
    neutral: "bg-[#94a3b8]",
    outline: "bg-[#94a3b8]",
  };

  return (
    <span className={`badge-neon ${variantClasses[variant]} ${className}`}>
      <CmsText>{dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`}
        />
      )}</CmsText>
      <CmsText>{children}</CmsText>
    </span>
  );
}
