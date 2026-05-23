"use client";

import * as React from "react";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { LocationCard } from "@/components/dashboard/LocationCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Location } from "@/types";

interface LocationForm {
  name: string;
  address: string;
  googlePlaceId: string;
  googleReviewUrl: string;
  twilioPhoneNumber: string;
}

const emptyForm: LocationForm = {
  name: "",
  address: "",
  googlePlaceId: "",
  googleReviewUrl: "",
  twilioPhoneNumber: "",
};

export default function LocationsPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Location | null>(null);

  const [form, setForm] = React.useState<LocationForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/locations");
        if (!res.ok) throw new Error("Failed to load locations");
        const data = await res.json();
        setLocations(data.locations ?? data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load locations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOpenEdit = (location: Location) => {
    setEditTarget(location);
    setForm({
      name: location.name,
      address: location.address ?? "",
      googlePlaceId: location.google_place_id ?? "",
      googleReviewUrl: location.google_review_url ?? "",
      twilioPhoneNumber: location.twilio_phone_number ?? "",
    });
  };

  const handleCloseDialog = () => {
    setAddOpen(false);
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Business name is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        googlePlaceId: form.googlePlaceId.trim() || null,
        googleReviewUrl: form.googleReviewUrl.trim() || null,
        twilioPhoneNumber: form.twilioPhoneNumber.trim() || null,
      };

      if (editTarget) {
        const res = await fetch(`/api/locations/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update location");
        const { location } = await res.json();
        setLocations((prev) =>
          prev.map((l) => (l.id === editTarget.id ? location : l))
        );
        toast.success("Location updated");
      } else {
        const res = await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create location");
        const { location } = await res.json();
        setLocations((prev) => [location, ...prev]);
        toast.success("Location added");
      }
      handleCloseDialog();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save location"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/locations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete location");
      setLocations((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Location deleted");
    } catch {
      toast.error("Failed to delete location");
    } finally {
      setDeleting(false);
    }
  };

  const handleSync = async (location: Location) => {
    setSyncingId(location.id);
    toast.loading("Syncing reviews…", { id: `sync-${location.id}` });
    try {
      const res = await fetch(`/api/locations/${location.id}/sync`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Sync failed");
      toast.success("Reviews sync queued", { id: `sync-${location.id}` });
    } catch {
      toast.error("Failed to sync reviews", { id: `sync-${location.id}` });
    } finally {
      setSyncingId(null);
    }
  };

  const formOpen = addOpen || editTarget !== null;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Locations"
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-5 max-w-6xl mx-auto w-full animate-fade-up">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : locations.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-8 w-8" />}
            title="No locations yet"
            description="Add your first business location to start tracking reviews and sending campaigns."
            action={{
              label: "Add Location",
              onClick: () => setAddOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onEdit={handleOpenEdit}
                onDelete={setDeleteTarget}
                onSync={handleSync}
                syncing={syncingId === location.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Location" : "Add Location"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update the details for this location."
                : "Enter your business location details to get started."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="loc-name">Business Name *</Label>
              <Input
                id="loc-name"
                placeholder="e.g. Downtown Dental"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-address">Address</Label>
              <Input
                id="loc-address"
                placeholder="123 Main St, City, State"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-place-id">
                Google Place ID
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                  (from Google Maps URL)
                </span>
              </Label>
              <Input
                id="loc-place-id"
                placeholder="ChIJ..."
                value={form.googlePlaceId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, googlePlaceId: e.target.value }))
                }
              />
              <p className="text-xs text-slate-500">
                Find it in the Google Maps URL after{" "}
                <code className="bg-slate-100 px-1 rounded">place_id=</code>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-review-url">Google Review URL</Label>
              <Input
                id="loc-review-url"
                placeholder="https://g.page/r/..."
                value={form.googleReviewUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, googleReviewUrl: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-twilio">Twilio Phone Number</Label>
              <Input
                id="loc-twilio"
                placeholder="+15555551234"
                value={form.twilioPhoneNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, twilioPhoneNumber: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? editTarget
                  ? "Saving…"
                  : "Adding…"
                : editTarget
                ? "Save Changes"
                : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This will also delete all
              associated reviews and campaigns. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting…" : "Delete Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
