"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface AgencySettingsFormProps {
  agencyName: string;
  agencyPrimaryColor: string;
  agencyDomain: string;
}

function AgencySettingsForm({
  agencyName: initialName,
  agencyPrimaryColor: initialColor,
  agencyDomain: initialDomain,
}: AgencySettingsFormProps) {
  const router = useRouter();
  const [agencyName, setAgencyName] = React.useState(initialName);
  const [agencyPrimaryColor, setAgencyPrimaryColor] = React.useState(initialColor);
  const [agencyDomain, setAgencyDomain] = React.useState(initialDomain);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: agencyName.trim() || null,
          agencyPrimaryColor: agencyPrimaryColor.trim() || "#4F46E5",
          agencyDomain: agencyDomain.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to save settings.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Agency settings saved successfully.
        </div>
      )}

      <div>
        <label
          htmlFor="agencyName"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Agency Name
        </label>
        <input
          id="agencyName"
          type="text"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          placeholder="Your agency brand name"
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Displayed to clients in their white-label dashboard.
        </p>
      </div>

      <div>
        <label
          htmlFor="agencyPrimaryColor"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Primary Brand Color
        </label>
        <div className="flex items-center gap-3">
          <input
            id="agencyPrimaryColor"
            type="color"
            value={agencyPrimaryColor}
            onChange={(e) => setAgencyPrimaryColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={agencyPrimaryColor}
            onChange={(e) => setAgencyPrimaryColor(e.target.value)}
            placeholder="#4F46E5"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Used as the accent color throughout your white-label portal.
        </p>
      </div>

      <div>
        <label
          htmlFor="agencyDomain"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Custom Domain
        </label>
        <input
          id="agencyDomain"
          type="text"
          value={agencyDomain}
          onChange={(e) => setAgencyDomain(e.target.value)}
          placeholder="reviews.youragency.com"
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Point a CNAME record to our servers, then enter the domain here.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

// The page itself is a client component that fetches initial data on mount.
// We keep it simple: load current values via the API, then render the form.
export default function AgencySettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [initialValues, setInitialValues] =
    React.useState<AgencySettingsFormProps>({
      agencyName: "",
      agencyPrimaryColor: "#4F46E5",
      agencyDomain: "",
    });

  React.useEffect(() => {
    fetch("/api/agency/settings")
      .then((r) => r.json())
      .then((data: { agency?: { agency_name?: string; agency_primary_color?: string; agency_domain?: string } }) => {
        const a = data.agency ?? {};
        setInitialValues({
          agencyName: a.agency_name ?? "",
          agencyPrimaryColor: a.agency_primary_color ?? "#4F46E5",
          agencyDomain: a.agency_domain ?? "",
        });
      })
      .catch(() => {
        // keep defaults
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Inline header — no separate Header component so we can add the back link */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/agency"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            aria-label="Back to Agency"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
            Agency Settings
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-900">
              White-Label Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how your agency appears to clients.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 max-w-xl animate-pulse">
              <div className="h-10 rounded-lg bg-slate-100" />
              <div className="h-10 rounded-lg bg-slate-100" />
              <div className="h-10 rounded-lg bg-slate-100" />
            </div>
          ) : (
            <AgencySettingsForm {...initialValues} />
          )}
        </div>
      </div>
    </div>
  );
}
