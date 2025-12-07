"use client";
import { useCallback } from "react";

export function useAdminWS(
  postUserId: string | null
) {
  // Send via REST so it persists; WS will broadcast it back
  const sendMessage = useCallback(
    async (message: string, type: 'text' | 'image' = 'text') => {
      if (!postUserId || !message.trim()) return;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: postUserId, message, type }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[WS-ADMIN] send failed', res.status, err);
        throw new Error(err?.error || `Send failed (${res.status})`);
      }
      // Rely on the server POST handler to broadcast the message back via WS
      console.debug('[WS-ADMIN] sent message via API for userId', postUserId);
    },
    [postUserId]
  );

  return { sendMessage };
}