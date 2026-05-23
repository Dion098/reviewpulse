import * as React from "react";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 shadow-sm">
      {/* Title area */}
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right side: actions + notification bell */}
      <div className="flex items-center gap-3 shrink-0">
        {actions}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-600"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Animated unread dot */}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        </button>
      </div>
    </header>
  );
}
