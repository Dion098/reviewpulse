"use client";

import * as React from "react";
import { Plus, Send, Users } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Campaign, Location, Contact } from "@/types";

const DELAY_OPTIONS = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "4", label: "4 hours" },
  { value: "8", label: "8 hours" },
  { value: "24", label: "24 hours (1 day)" },
  { value: "48", label: "48 hours (2 days)" },
];

const DEFAULT_TEMPLATE =
  "Hi {{customer_name}}, thanks for visiting {{business_name}}! We'd love your feedback — could you take 30 seconds to leave us a review? It means the world to us. 🙏";

interface CampaignForm {
  name: string;
  locationId: string;
  triggerType: "manual" | "auto";
  delayHours: string;
  messageTemplate: string;
}

const initialForm: CampaignForm = {
  name: "",
  locationId: "",
  triggerType: "manual",
  delayHours: "24",
  messageTemplate: DEFAULT_TEMPLATE,
};

interface SendNowState {
  campaign: Campaign | null;
  selectedContacts: string[];
  contacts: Contact[];
  loadingContacts: boolean;
  sending: boolean;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [newDialogOpen, setNewDialogOpen] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<Campaign | null>(null);
  const [form, setForm] = React.useState<CampaignForm>(initialForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const [sendNow, setSendNow] = React.useState<SendNowState>({
    campaign: null,
    selectedContacts: [],
    contacts: [],
    loadingContacts: false,
    sending: false,
  });

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cRes, lRes] = await Promise.all([
          fetch("/api/campaigns"),
          fetch("/api/locations"),
        ]);
        if (!cRes.ok) throw new Error("Failed to load campaigns");
        if (!lRes.ok) throw new Error("Failed to load locations");
        const [cData, lData] = await Promise.all([cRes.json(), lRes.json()]);
        setCampaigns(cData.campaigns ?? cData ?? []);
        setLocations(lData.locations ?? lData ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const locationById = React.useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations]
  );

  const activeCampaigns = campaigns.filter((c) => c.active).length;
  const totalSmsSent = campaigns.reduce((sum, c) => sum + c.total_sent, 0);

  const renderedPreview = React.useMemo(() => {
    const loc = locations.find((l) => l.id === form.locationId);
    return form.messageTemplate
      .replace(/{{customer_name}}/g, "Alex")
      .replace(/{{business_name}}/g, loc?.name ?? "Your Business");
  }, [form.messageTemplate, form.locationId, locations]);

  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name,
      locationId: campaign.location_id,
      triggerType: campaign.trigger_type,
      delayHours: String(campaign.delay_hours),
      messageTemplate: campaign.message_template,
    });
  };

  const handleCloseDialog = () => {
    setNewDialogOpen(false);
    setEditingCampaign(null);
    setForm(initialForm);
  };

  const handleCreateCampaign = async () => {
    if (!form.name.trim() || !form.locationId || !form.messageTemplate.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      if (editingCampaign) {
        // Update existing campaign
        const res = await fetch(`/api/campaigns/${editingCampaign.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            locationId: form.locationId,
            triggerType: form.triggerType,
            delayHours: parseInt(form.delayHours, 10),
            messageTemplate: form.messageTemplate.trim(),
          }),
        });
        if (!res.ok) throw new Error("Failed to update campaign");
        const { campaign } = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaign.id ? campaign : c))
        );
        handleCloseDialog();
        toast.success("Campaign updated");
      } else {
        const res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            locationId: form.locationId,
            triggerType: form.triggerType,
            delayHours: parseInt(form.delayHours, 10),
            messageTemplate: form.messageTemplate.trim(),
          }),
        });
        if (!res.ok) throw new Error("Failed to create campaign");
        const { campaign } = await res.json();
        setCampaigns((prev) => [campaign, ...prev]);
        handleCloseDialog();
        toast.success("Campaign created successfully");
      }
    } catch {
      toast.error(
        editingCampaign
          ? "Failed to update campaign. Please try again."
          : "Failed to create campaign. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (campaignId: string, active: boolean) => {
    setTogglingId(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, active } : c))
      );
      toast.success(active ? "Campaign activated" : "Campaign paused");
    } catch {
      toast.error("Failed to update campaign status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenSendNow = async (campaign: Campaign) => {
    setSendNow((s) => ({
      ...s,
      campaign,
      selectedContacts: [],
      loadingContacts: true,
    }));
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setSendNow((s) => ({
        ...s,
        contacts: data.contacts ?? data ?? [],
        loadingContacts: false,
      }));
    } catch {
      setSendNow((s) => ({ ...s, loadingContacts: false }));
      toast.error("Failed to load contacts");
    }
  };

  const handleSendNow = async () => {
    if (!sendNow.campaign) return;
    if (sendNow.selectedContacts.length === 0) {
      toast.error("Select at least one contact");
      return;
    }
    setSendNow((s) => ({ ...s, sending: true }));
    try {
      const res = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: sendNow.campaign.id,
          contactIds: sendNow.selectedContacts,
        }),
      });
      if (!res.ok) throw new Error("Failed to send campaign");
      const { sent } = await res.json();
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === sendNow.campaign!.id
            ? { ...c, total_sent: c.total_sent + sent }
            : c
        )
      );
      setSendNow((s) => ({ ...s, campaign: null }));
      toast.success(`Campaign sent to ${sent} contacts`);
    } catch {
      toast.error("Failed to send campaign");
    } finally {
      setSendNow((s) => ({ ...s, sending: false }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Campaigns"
        actions={
          <Button
            onClick={() => setNewDialogOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-6xl mx-auto w-full animate-fade-up">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Campaigns"
            value={campaigns.length}
            change=""
            changeType="neutral"
            icon={<Send className="h-5 w-5" />}
          />
          <StatsCard
            title="Active Campaigns"
            value={activeCampaigns}
            change={`${campaigns.length - activeCampaigns} paused`}
            changeType={activeCampaigns > 0 ? "positive" : "neutral"}
            icon={<Send className="h-5 w-5" />}
          />
          <StatsCard
            title="Total SMS Sent"
            value={totalSmsSent.toLocaleString()}
            change="all time"
            changeType="neutral"
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        {/* Campaigns list */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={<Send className="h-8 w-8" />}
            title="No campaigns yet"
            description="Create your first SMS campaign to start automatically requesting reviews from customers."
            action={{
              label: "Create Campaign",
              onClick: () => setNewDialogOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onToggle={handleToggleActive}
                onEdit={handleOpenEdit}
                onSend={handleOpenSendNow}
              />
            ))}
          </div>
        )}
      </div>

      {/* New / Edit Campaign Dialog */}
      <Dialog
        open={newDialogOpen || editingCampaign !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Edit Campaign" : "New Campaign"}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign
                ? "Update the details for this campaign."
                : "Set up an SMS campaign to request reviews from your customers."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="campaign-name">Campaign Name *</Label>
              <Input
                id="campaign-name"
                placeholder="e.g. Post-Visit Review Request"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-location">Location *</Label>
              <Select
                value={form.locationId}
                onValueChange={(v) => setForm((f) => ({ ...f, locationId: v }))}
              >
                <SelectTrigger id="campaign-location">
                  <SelectValue placeholder="Select a location" />
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

            <div className="space-y-1.5">
              <Label htmlFor="campaign-trigger">Trigger Type</Label>
              <Select
                value={form.triggerType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    triggerType: v as "manual" | "auto",
                  }))
                }
              >
                <SelectTrigger id="campaign-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual — send when you choose</SelectItem>
                  <SelectItem value="auto">Automatic — after service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-delay">Send Delay</Label>
              <Select
                value={form.delayHours}
                onValueChange={(v) => setForm((f) => ({ ...f, delayHours: v }))}
              >
                <SelectTrigger id="campaign-delay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELAY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-template">Message Template *</Label>
              <Textarea
                id="campaign-template"
                rows={4}
                value={form.messageTemplate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, messageTemplate: e.target.value }))
                }
                placeholder="Your message here…"
              />
              <p className="text-xs text-slate-500">
                Available variables:{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">
                  {"{{customer_name}}"}
                </code>{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">
                  {"{{business_name}}"}
                </code>
              </p>
            </div>

            {/* Preview */}
            <div className="space-y-1.5">
              <Label>Preview</Label>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-sm text-indigo-900 leading-relaxed">
                  {renderedPreview}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {form.messageTemplate.length} characters
              </p>
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
            <Button onClick={handleCreateCampaign} disabled={submitting}>
              {submitting
                ? editingCampaign
                  ? "Saving…"
                  : "Creating…"
                : editingCampaign
                ? "Save Changes"
                : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Now Dialog */}
      <Dialog
        open={sendNow.campaign !== null}
        onOpenChange={(open) =>
          !open && setSendNow((s) => ({ ...s, campaign: null }))
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Campaign Now</DialogTitle>
            <DialogDescription>
              Select the contacts to send &ldquo;{sendNow.campaign?.name}&rdquo;
              to.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {sendNow.loadingContacts ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : sendNow.contacts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No contacts found. Add contacts first.
              </p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                <label className="flex items-center gap-2 py-2 cursor-pointer hover:bg-slate-50 rounded px-2">
                  <input
                    type="checkbox"
                    checked={
                      sendNow.selectedContacts.length ===
                      sendNow.contacts.length
                    }
                    onChange={(e) =>
                      setSendNow((s) => ({
                        ...s,
                        selectedContacts: e.target.checked
                          ? s.contacts.map((c) => c.id)
                          : [],
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Select all ({sendNow.contacts.length})
                  </span>
                </label>
                <div className="border-t border-slate-100 my-1" />
                {sendNow.contacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-center gap-2 py-2 cursor-pointer hover:bg-slate-50 rounded px-2"
                  >
                    <input
                      type="checkbox"
                      checked={sendNow.selectedContacts.includes(contact.id)}
                      onChange={(e) =>
                        setSendNow((s) => ({
                          ...s,
                          selectedContacts: e.target.checked
                            ? [...s.selectedContacts, contact.id]
                            : s.selectedContacts.filter(
                                (id) => id !== contact.id
                              ),
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {contact.phone ?? contact.email ?? "—"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendNow((s) => ({ ...s, campaign: null }))}
              disabled={sendNow.sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNow}
              disabled={
                sendNow.sending ||
                sendNow.selectedContacts.length === 0 ||
                sendNow.loadingContacts
              }
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              {sendNow.sending
                ? "Sending…"
                : `Send to ${sendNow.selectedContacts.length} contact${
                    sendNow.selectedContacts.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
