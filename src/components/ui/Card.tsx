import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glow?: "emerald" | "cyan" | "violet" | "crimson" | "none";
}

export function Card({
  children,
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
        {children}
      </div>
    </div>
  );
}
