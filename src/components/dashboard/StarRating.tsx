import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}

const sizeMap = {
  sm: { star: "h-3 w-3", text: "text-xs" },
  md: { star: "h-4 w-4", text: "text-sm" },
  lg: { star: "h-5 w-5", text: "text-base" },
};

export function StarRating({
  rating,
  size = "md",
  showNumber = false,
}: StarRatingProps) {
  const { star, text } = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;

          return (
            <span key={i} className="relative inline-flex">
              {/* Background empty star */}
              <Star
                className={cn(star, "text-slate-200 fill-gray-200")}
                aria-hidden="true"
              />
              {/* Filled overlay */}
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? "50%" : "100%" }}
                >
                  <Star
                    className={cn(star, "text-yellow-400 fill-yellow-400")}
                    aria-hidden="true"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showNumber && (
        <span className={cn(text, "font-medium text-slate-700 ml-0.5")}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
