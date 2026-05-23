"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Star,
  Send,
  MapPin,
  Users,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Reviews", href: "/dashboard/reviews", icon: Star },
      { label: "Campaigns", href: "/dashboard/campaigns", icon: Send },
    ],
  },
  {
    label: "Locations",
    items: [
      { label: "Locations", href: "/dashboard/locations", icon: MapPin },
      { label: "Contacts", href: "/dashboard/contacts", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
];

interface SidebarProps {
  currentPath: string;
  user: {
    name: string;
    email: string;
  };
}

export function Sidebar({ currentPath, user }: SidebarProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        {/* Gradient star icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-400">
          <Star className="h-4 w-4 text-white" fill="white" />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">
          ReviewPulse
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Section label */}
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-widest text-slate-600">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? currentPath === "/dashboard"
                    : currentPath.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                        isActive
                          ? "border-l-2 border-indigo-400 bg-indigo-500/20 pl-[10px] text-indigo-300"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-semibold text-white">
            {initials}
          </div>
          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          {/* Logout */}
          <Link
            href="/auth/logout"
            title="Log out"
            className="shrink-0 text-slate-500 transition-colors duration-150 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
