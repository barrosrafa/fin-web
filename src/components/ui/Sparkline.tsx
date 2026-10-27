import React, { useId } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  positive?: boolean;
}

export function Sparkline({
  data,
  color,
  height = 36,
  width = 90,
  positive = true,
}: SparklineProps) {
  const rawId = useId();
  const gradientId = `sparkline-grad-${rawId.replace(/:/g, "")}`;

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const strokeColor = color || (positive ? "#00f5a0" : "#ff3b69");

  // Generate coordinates
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
