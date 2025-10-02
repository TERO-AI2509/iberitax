"use client";

import React from "react";
import { useAuthState } from "@/lib/client/authState";
import { goTo } from "@/lib/client/goTo";
import SessionBanner from "@/components/SessionBanner";

export default function SessionBannerClient() {
  const { status } = useAuthState();
  const showExpired = status === "expired";
  const showOffline = status === "offline";
  if (!showExpired && !showOffline) return null;

  return (
    <SessionBanner
      state={showOffline ? "offline" : "expired"}
      onLogin={() => goTo("/login")}
      onRetry={() => {}}
    />
  );
}
