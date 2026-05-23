"use client";

import * as React from "react";
import { Edit2, Send, MessageSquare, Clock, Users } from "lucide-react";
import { type Campaign } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CampaignCardProps {
  campaign: Campaign;
  onToggle: (campaignId: string, active: boolean) => void;
  onEdit: (campaign: Campaign) => void;
  onSend: (campaign: Campaign) => void;
}

function formatDelay(hours: number): string {
  if (hours === 0) return "Immediately";
  if (hours < 24) return `After ${hours}h`;
  const days = Math.floor(hours / 24);
  const remaining = hours % 24;
  if (remaining === 0) return `After ${days}d`;
  return `After ${days}d ${remaining}h`;
}

export function CampaignCard({
  campaign,
  onToggle,
  onEdit,
  onSend,
}: CampaignCardProps) {
  const switchId = `campaign-active-${campaign.id}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {campaign.name}
            </h3>
            <Badge
              variant={campaign.trigger_type === "auto" ? "default" : "secondary"}
            >
              {campaign.trigger_type === "auto" ? "Auto" : "Manual"}
            </Badge>
            {!campaign.active && (
              <Badge variant="outline" className="text-slate-400">
                Inactive
              </Badge>
            )}
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Label
            htmlFor={switchId}
            className="text-xs text-slate-500 cursor-pointer select-none"
          >
            {campaign.active ? "Active" : "Paused"}
          </Label>
          <Switch
            id={switchId}
            checked={campaign.active}
            onCheckedChange={(checked) => onToggle(campaign.id, checked)}
          />
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {formatDelay(campaign.delay_hours)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {campaign.total_sent.toLocaleString()} sent
        </span>
      </div>

      {/* Message template preview */}
      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {campaign.message_template}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(campaign)}
          className="gap-1.5"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          size="sm"
          onClick={() => onSend(campaign)}
          disabled={!campaign.active}
          className="gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          Send Now
        </Button>
      </div>
    </div>
  );
}
