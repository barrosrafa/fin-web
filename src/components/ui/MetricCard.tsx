
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Sparkline } from "./Sparkline";
import { formatPercent } from "@/lib/formatters";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  sparkline?: number[];
  badgeText?: string;
  glow?: "emerald" | "cyan" | "violet" | "crimson" | "none";
}

export function MetricCard({
  title,
  value,
  change,
  subtitle,
  sparkline,
  badgeText,
  glow = "none",
}: MetricCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <CmsElement feature="ui.components/ui/MetricCard.Card.1"><Card glow={glow}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
          <CmsText>{title}</CmsText>
        </span>
        <CmsText>{badgeText ? (
          <Badge variant="cyan"><CmsText>{badgeText}</CmsText></Badge>
        ) : change !== undefined ? (
          <Badge variant={isPositive ? "emerald" : "crimson"} dot>
            <CmsText>{formatPercent(change)}</CmsText>
          </Badge>
        ) : null}</CmsText>
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-2xl font-bold tracking-tight text-[#f0f4f8] mono-nums">
            <CmsText>{value}</CmsText>
          </div>
          <CmsText>{subtitle && (
            <div className="text-xs text-[#94a3b8] mt-1 font-medium">
              <CmsText>{subtitle}</CmsText>
            </div>
          )}</CmsText>
        </div>

        <CmsText>{sparkline && (
          <div className="self-end">
            <Sparkline data={sparkline} positive={isPositive} width={80} height={32} />
          </div>
        )}</CmsText>
      </div>
    </Card></CmsElement>
  );
}
