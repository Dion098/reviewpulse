import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            iconColor
          )}
        >
          <span className="flex h-4 w-4 items-center justify-center text-white [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-1.5">
        {changeType === "positive" && (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        )}
        {changeType === "negative" && (
          <TrendingDown className="h-3.5 w-3.5 text-red-400 shrink-0" />
        )}
        {changeType === "neutral" && (
          <Minus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
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
  );
}
