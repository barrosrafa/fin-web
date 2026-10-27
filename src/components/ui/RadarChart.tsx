import React from "react";

export interface RadarDataPoint {
  axis: string;
  value: number; // 0 to 100
  weight?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  color?: string;
  fillOpacity?: number;
  labelColor?: string;
}

export function RadarChart({
  data,
  size = 320,
  color = "#00f5a0",
  fillOpacity = 0.2,
}: RadarChartProps) {
  if (!data || data.length < 3) return null;

  const center = size / 2;
  const radius = center - 45;
  const totalAxes = data.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Polygon points
  const points = data.map((d, i) => {
    const r = (Math.min(100, Math.max(0, d.value)) / 100) * radius;
    const angle = i * angleSlice - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, ...d };
  });

  const polygonPath = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background concentric polygons */}
        {levels.map((lvl) => {
          const lvlPoints = data
            .map((_, i) => {
              const r = lvl * radius;
              const angle = i * angleSlice - Math.PI / 2;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");

          return (
            <polygon
              key={`level-${lvl}`}
              points={lvlPoints}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis radial spokes */}
        {data.map((d, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          // Label position
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <g key={`axis-${d.axis}`}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={1}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#94a3b8"
                fontSize={10}
                fontWeight={600}
                className="tracking-wider uppercase select-none"
              >
                {d.axis}
              </text>
            </g>
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPath}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points (Glowing vertices) */}
        {points.map((p, idx) => (
          <g key={`vertex-${idx}`}>
            <circle cx={p.x} cy={p.y} r={4} fill={color} />
            <circle
              cx={p.x}
              cy={p.y}
              r={7}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.4}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
