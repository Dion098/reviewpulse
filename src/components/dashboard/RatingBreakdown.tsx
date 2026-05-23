import * as React from "react";
import { cn } from "@/lib/utils";

interface BreakdownItem {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  percentage: number;
}

interface RatingBreakdownProps {
  breakdown: BreakdownItem[];
}

function starColor(stars: number): string {
  if (stars >= 4) return "bg-green-500";
  if (stars === 3) return "bg-yellow-400";
  return "bg-red-400";
}

export function RatingBreakdown({ breakdown }: RatingBreakdownProps) {
  // Sort 5 → 1 for display
  const sorted = [...breakdown].sort((a, b) => b.stars - a.stars);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Rating Breakdown
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Distribution of star ratings
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map((item) => (
          <div key={item.stars} className="flex items-center gap-3">
            {/* Star label */}
            <div className="flex w-8 shrink-0 items-center justify-end gap-0.5">
              <span className="text-sm font-medium text-slate-700">
                {item.stars}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 text-yellow-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Bar track */}
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  starColor(item.stars)
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            {/* Count + percentage */}
            <div className="flex w-20 shrink-0 items-center justify-end gap-1.5">
              <span className="text-sm font-medium text-slate-700">
                {item.count}
              </span>
              <span className="text-xs text-slate-400">
                ({item.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
