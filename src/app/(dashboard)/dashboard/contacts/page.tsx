"use client";

import * as React from "react";
import {
  Plus,
  Upload,
  Search,
  Send,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { Contact, Location } from "@/types";

interface ContactForm {
  name: string;
  phone: string;
  email: string;
}

const emptyForm: ContactForm = { name: "", phone: "", email: "" };
const PAGE_SIZE = 20;

export default function ContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");

  const [locations, setLocations] = React.useState<Location[]>([]);

  // Add contact dialog
  const [addOpen, setAddOpen] = React.useState(false);
  const [form, setForm] = React.useState<ContactForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  // Send request dialog
  const [sendTarget, setSendTarget] = React.useState<Contact | null>(null);
  const [sendLocationId, setSendLocationId] = React.useState("");
  const [sending, setSending] = React.useState(false);

  // CSV import
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importing, setImporting] = React.useState(false);

  const fetchContacts = React.useCallback(
    async (currentPage: number, currentSearch: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
        });
        if (currentSearch.trim()) params.set("search", currentSearch.trim());
        const res = await fetch(`/api/contacts?${params}`);
        if (!res.ok) throw new Error("Failed to load contacts");
        const data = await res.json();
        setContacts(data.contacts ?? data ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchContacts(page, search);
  }, [page, fetchContacts]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchContacts(1, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => setLocations(d.locations ?? d ?? []))
      .catch(() => {});
  }, []);

  const handleAddContact = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error("Phone or email is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create contact");
      const { contact } = await res.json();
      setContacts((prev) => [contact, ...prev]);
      setTotal((t) => t + 1);
      setAddOpen(false);
      setForm(emptyForm);
      toast.success("Contact added");
    } catch {
      toast.error("Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendRequest = async () => {
    if (!sendTarget || !sendLocationId) {
      toast.error("Select a location first");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/review-requests/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: sendTarget.id,
          locationId: sendLocationId,
        }),
      });
      if (!res.ok) throw new Error("Failed to send request");
      setSendTarget(null);
      setSendLocationId("");
      toast.success(`Review request sent to ${sendTarget.name}`);
    } catch {
      toast.error("Failed to send review request");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Delete contact "${contact.name}"? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete contact");
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      setTotal((t) => t - 1);
      toast.success("Contact deleted");
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  const handleCSVImport = async (file: File) => {
    setImporting(true);
    const text = await file.text();
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row");
      setImporting(false);
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const phoneIdx = headers.indexOf("phone");
    const emailIdx = headers.indexOf("email");

    if (nameIdx === -1) {
      toast.error("CSV must have a 'name' column");
      setImporting(false);
      return;
    }

    const rows = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        name: cols[nameIdx] ?? "",
        phone: phoneIdx >= 0 ? cols[phoneIdx] ?? null : null,
        email: emailIdx >= 0 ? cols[emailIdx] ?? null : null,
      };
    });

    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: rows }),
      });
      if (!res.ok) throw new Error("Import failed");
      const { imported } = await res.json();
      toast.success(`Imported ${imported} contacts`);
      fetchContacts(1, "");
    } catch {
      toast.error("CSV import failed");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sendPreview = React.useMemo(() => {
    const loc = locations.find((l) => l.id === sendLocationId);
    if (!sendTarget || !loc) return null;
    return `Hi ${sendTarget.name}, thanks for visiting ${loc.name}! We'd love your feedback — could you take 30 seconds to leave us a review? [link]`;
  }, [sendTarget, sendLocationId, locations]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Contacts"
        actions={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCSVImport(file);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="gap-1.5"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing…" : "Import CSV"}
            </Button>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-5 max-w-6xl mx-auto w-full animate-fade-up">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No contacts yet"
            description="Add contacts manually or import from a CSV file to start sending review requests."
            action={{
              label: "Add Contact",
              onClick: () => setAddOpen(true),
            }}
          />
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      Added
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <span className="font-medium text-slate-900">
                            {contact.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">
                        {contact.phone ? (
                          <Badge variant="secondary" className="font-normal">
                            {contact.phone}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                        {contact.email ? (
                          <span className="truncate max-w-[200px] block">
                            {contact.email}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 hidden lg:table-cell">
                        {formatDate(contact.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSendTarget(contact)}
                            className="gap-1 text-xs h-7 px-2"
                          >
                            <Send className="h-3 w-3" />
                            <span className="hidden sm:inline">Request</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContact(contact)}
                            className="gap-1 text-xs h-7 px-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-sm text-slate-700">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) { setAddOpen(false); setForm(emptyForm); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a customer to send review requests to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Full Name *</Label>
              <Input
                id="contact-name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Phone Number</Label>
              <Input
                id="contact-phone"
                type="tel"
                placeholder="+15555551234"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email Address</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setAddOpen(false); setForm(emptyForm); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={submitting}>
              {submitting ? "Adding…" : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Review Request Dialog */}
      <Dialog
        open={sendTarget !== null}
        onOpenChange={(open) => { if (!open) { setSendTarget(null); setSendLocationId(""); } }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Send Review Request</DialogTitle>
            <DialogDescription>
              Send an SMS review request to {sendTarget?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-location">Select Location *</Label>
              <Select
                value={sendLocationId}
                onValueChange={setSendLocationId}
              >
                <SelectTrigger id="req-location">
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sendPreview && (
              <div className="space-y-1.5">
                <Label>SMS Preview</Label>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    {sendPreview}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setSendTarget(null); setSendLocationId(""); }}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={sending || !sendLocationId}
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
