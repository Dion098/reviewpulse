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
  Building2,
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
      { label: "Agency", href: "/dashboard/agency", icon: Building2 },
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
    <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-950 border-r border-white/5">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-white/5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500">
          <Star className="h-3.5 w-3.5 text-white" fill="white" />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">
          ReviewPulse
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
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
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-100",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-indigo-400" : "text-slate-600"
                        )}
                      />
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
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-300">
              {user.name}
            </p>
            <p className="truncate text-[10px] text-slate-600">{user.email}</p>
          </div>
          <Link
            href="/auth/logout"
            title="Log out"
            className="shrink-0 text-slate-600 transition-colors hover:text-slate-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="sr-only">Log out</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
