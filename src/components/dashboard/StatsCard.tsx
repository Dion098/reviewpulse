import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  iconColor?: string;
  description?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  iconColor = "bg-indigo-500",
  description,
}: StatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Top accent gradient strip */}
      <div
        className={cn(
          "h-1 w-full rounded-t-2xl",
          changeType === "positive" &&
            "bg-gradient-to-r from-emerald-400 to-teal-400",
          changeType === "negative" &&
            "bg-gradient-to-r from-red-400 to-rose-400",
          changeType === "neutral" &&
            "bg-gradient-to-r from-indigo-400 to-violet-400"
        )}
      />

      <div className="p-6">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconColor
          )}
        >
          <span className="flex h-5 w-5 items-center justify-center text-white [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </span>
        </div>

        {/* Value */}
        <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        {/* Label */}
        <p className="mt-1 text-sm font-medium text-slate-500">{title}</p>

        {/* Change indicator */}
        <div className="mt-3 flex items-center gap-1.5">
          {changeType === "positive" && (
            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
          )}
          {changeType === "negative" && (
            <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-emerald-600",
              changeType === "negative" && "text-red-500",
              changeType === "neutral" && "text-slate-400"
            )}
          >
            {change}
          </span>
          {description && (
            <span className="text-xs text-slate-400">{description}</span>
          )}
        </div>
      </div>
    </div>
  );
}
