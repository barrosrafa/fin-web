
import { CmsText } from "@/components/content/Cms";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  innerClassName?: string;
  glow?: "emerald" | "cyan" | "violet" | "crimson" | "none";
}

export function Card({
  children,
  title,
  subtitle,
  className = "",
  innerClassName = "",
  glow = "none",
}: CardProps) {
  const glowStyles = {
    none: "",
    emerald: "hover:border-[rgba(0,245,160,0.3)] hover:shadow-[0_0_25px_rgba(0,245,160,0.12)]",
    cyan: "hover:border-[rgba(0,217,245,0.3)] hover:shadow-[0_0_25px_rgba(0,217,245,0.12)]",
    violet: "hover:border-[rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.12)]",
    crimson: "hover:border-[rgba(255,59,105,0.3)] hover:shadow-[0_0_25px_rgba(255,59,105,0.12)]",
  };

  return (
    <div
      className={`double-bezel relative transition-all duration-300 ${glowStyles[glow]} ${className}`}
    >
      <div className={`double-bezel-inner ${innerClassName}`}>
        <CmsText>{title && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white tracking-tight"><CmsText>{title}</CmsText></h3>
            <CmsText>{subtitle && <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{subtitle}</CmsText></p>}</CmsText>
          </div>
        )}</CmsText>
        <CmsText>{children}</CmsText>
      </div>
    </div>
  );
}
