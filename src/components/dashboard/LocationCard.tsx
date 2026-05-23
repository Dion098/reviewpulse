"use client";

import * as React from "react";
import {
  MapPin,
  Star,
  MessageSquare,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { type Location } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/dashboard/StarRating";

interface LocationCardProps {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onSync?: (location: Location) => void;
  syncing?: boolean;
}

export function LocationCard({ location, onEdit, onDelete, onSync, syncing }: LocationCardProps) {
  const googleConnected = Boolean(location.google_place_id);
  const twilioConnected = Boolean(location.twilio_phone_number);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {location.name}
          </h3>
          {location.address && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="truncate">{location.address}</span>
            </div>
          )}
        </div>

        {/* Google review link */}
        {location.google_review_url && (
          <a
            href={location.google_review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
            title="View on Google"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Star className="h-3.5 w-3.5 text-yellow-400" fill="#facc15" />
            <span className="text-xs font-medium text-slate-500">Avg Rating</span>
          </div>
          <StarRating rating={location.avg_rating} size="sm" showNumber />
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-slate-500">Reviews</span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {location.total_reviews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Connection status */}
      <div className="mt-3 flex flex-wrap gap-2">
        <ConnectionBadge label="Google" connected={googleConnected} />
        <ConnectionBadge
          label={
            twilioConnected ? location.twilio_phone_number! : "Twilio SMS"
          }
          connected={twilioConnected}
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(location)}
          className="gap-1.5"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </Button>
        {onSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSync(location)}
            disabled={syncing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Reviews"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(location)}
          className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function ConnectionBadge({
  label,
  connected,
}: {
  label: string;
  connected: boolean;
}) {
  return (
    <Badge
      variant={connected ? "success" : "secondary"}
      className="gap-1 font-normal"
    >
      {connected ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {label}
    </Badge>
  );
}
