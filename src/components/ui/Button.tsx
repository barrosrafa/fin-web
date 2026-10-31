
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "cyan" | "violet" | "outline";
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  icon,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-[rgba(0,245,160,0.4)] text-[#f0f4f8]",
    secondary:
      "bg-[#131926] hover:bg-[#1a2234] border-white/5 hover:border-white/20 text-[#f0f4f8]",
    outline:
      "bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-[#f0f4f8]",
    ghost:
      "bg-transparent hover:bg-white/5 border-transparent text-[#94a3b8] hover:text-[#f0f4f8]",
    cyan:
      "bg-[rgba(0,217,245,0.08)] hover:bg-[rgba(0,217,245,0.15)] border-[rgba(0,217,245,0.3)] text-[#00d9f5]",
    violet:
      "bg-[rgba(168,85,247,0.08)] hover:bg-[rgba(168,85,247,0.15)] border-[rgba(168,85,247,0.3)] text-[#a855f7]",
  };

  const defaultIcon = (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );

  const content = (
    <>
      <span className="tracking-wide"><CmsText>{children}</CmsText></span>
      <span className="btn-nested-icon"><CmsText>{icon || defaultIcon}</CmsText></span>
    </>
  );

  if (href) {
    return (
      <CmsElement feature="ui.components/ui/Button.Link.1"><Link
        href={href}
        className={`btn-nested ${variantStyles[variant]} ${className}`}
      >
        <CmsText>{content}</CmsText>
      </Link></CmsElement>
    );
  }

  return (
    <CmsElement feature="ui.components/ui/Button.button.2"><button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-nested ${variantStyles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <CmsText>{content}</CmsText>
    </button></CmsElement>
  );
}
