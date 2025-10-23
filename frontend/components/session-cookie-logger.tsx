"use client";

import { useEffect } from "react";

export function SessionCookieLogger() {
  useEffect(() => {
    // Fire and forget: let server read cookies and session and persist
    fetch("/api/session/log", { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  return null;
}
