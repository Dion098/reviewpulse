"use client";

import * as React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";

interface RatingChartDataPoint {
  month: string;
  avgRating: number;
  reviewCount: number;
}

interface RatingChartProps {
  data: RatingChartDataPoint[];
}

function CustomTooltip(props: TooltipContentProps<number, string>) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700 mb-1">{String(label ?? "")}</p>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: String(entry.color ?? "") }}
          />
          <span className="text-slate-500">{String(entry.name ?? "")}:</span>
          <span className="font-medium text-slate-800">
            {entry.dataKey === "avgRating"
              ? Number(entry.value).toFixed(1)
              : String(entry.value ?? "")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RatingChart({ data }: RatingChartProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Reviews Over Time
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Monthly review count and average rating
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          {/* Left axis: review count */}
          <YAxis
            yAxisId="count"
            orientation="left"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={32}
          />
          {/* Right axis: avg rating (0–5) */}
          <YAxis
            yAxisId="rating"
            orientation="right"
            domain={[0, 5]}
            tickCount={6}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={(p) => <CustomTooltip {...(p as TooltipContentProps<number, string>)} />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
          <Bar
            yAxisId="count"
            dataKey="reviewCount"
            name="Reviews"
            fill="#e0e7ff"
            stroke="#6366f1"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
          <Line
            yAxisId="rating"
            type="monotone"
            dataKey="avgRating"
            name="Avg Rating"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
