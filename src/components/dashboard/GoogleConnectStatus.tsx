"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";

interface GoogleConnectStatusProps {
  status: string | null;
}

export function GoogleConnectStatus({ status }: GoogleConnectStatusProps) {
  useEffect(() => {
    if (status === "connected") {
      toast.success("Google Business Profile connected successfully");
    } else if (status === "error") {
      toast.error("Failed to connect Google Business Profile. Please try again.");
    }
  }, [status]);

  return null;
}
