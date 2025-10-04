"use client";
import { useEffect, useMemo, useRef, useCallback } from "react";

declare global {
  interface Window {
    __USER_WS?: WebSocket & { __ownerId?: string };
    __USER_WS_READY?: boolean;
    __USER_WS_SUBS?: Set<string>;
  }
}

export function useUserWS(
  channelOrChannels: string | string[] | null,
  onMessage: (msg: any) => void
) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const channels = useMemo(() => {
    if (!channelOrChannels) return new Set<string>();
    return new Set(Array.isArray(channelOrChannels) ? channelOrChannels : [channelOrChannels]);
  }, [channelOrChannels]);

  // Singleton socket per tab, heartbeat, no close on unmount
  useEffect(() => {
    let closed = false;

    const connect = () => {
      if (window.__USER_WS && (window.__USER_WS.readyState === WebSocket.OPEN || window.__USER_WS.readyState === WebSocket.CONNECTING)) {
        return window.__USER_WS;
      }
      const wsProto = location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_SERVER_URL || `${wsProto}://${location.host}/api/ws`}`);
      window.__USER_WS = ws;
      window.__USER_WS_READY = false;
      window.__USER_WS_SUBS = window.__USER_WS_SUBS ?? new Set();

      ws.addEventListener("open", () => {
        console.debug("[WS-USER] open");
        window.__USER_WS_READY = true;
        // subscribe current channels
        for (const ch of channels) {
          try {
            ws.send(JSON.stringify({ type: "subscribe", channel: ch }));
            window.__USER_WS_SUBS!.add(ch);
          } catch {}
        }
      });

      ws.addEventListener("message", (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data?.type === "pong" || data?.type === "subscribed" || data?.type === "unsubscribed") {
            console.debug("[WS-USER] control", data);
            return;
          }
          console.debug("[WS-USER] incoming", data);
          onMessageRef.current?.(data);
        } catch (e) {
          console.warn("[WS-USER] parse error", e);
        }
      });

      ws.addEventListener("close", (e) => {
        console.debug("[WS-USER] closed", e.code, e.reason);
        window.__USER_WS_READY = false;
        if (!closed) {
          setTimeout(connect, 1500 + Math.random() * 1000);
        }
      });

      ws.addEventListener("error", (e) => console.warn("[WS-USER] error", e));

      const ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        }
      }, 30000);
      ws.addEventListener("close", () => clearInterval(ping));

      return ws;
    };

    connect();
    return () => {
      closed = true;
      // do not close socket to avoid 1005/1006 in StrictMode
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // singleton

  // Diff-based resubscribe without reconnecting
  const prevChRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const ws = window.__USER_WS;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const prev = prevChRef.current;
    // unsubscribe removed
    for (const oldCh of prev) {
      if (!channels.has(oldCh)) {
        try {
          ws.send(JSON.stringify({ type: "unsubscribe", channel: oldCh }));
          window.__USER_WS_SUBS?.delete(oldCh);
        } catch {}
      }
    }
    // subscribe new
    for (const ch of channels) {
      if (!prev.has(ch)) {
        try {
          ws.send(JSON.stringify({ type: "subscribe", channel: ch }));
          window.__USER_WS_SUBS?.add(ch);
        } catch {}
      }
    }
    prevChRef.current = new Set(channels);
  }, [channels]);

  // Persist via REST; WS will echo it back
  const sendMessage = useCallback(
    async (message: string, extra?: Record<string, any>) => {
      if (!message.trim()) return;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, ...(extra || {}) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn("[WS-USER] sendMessage failed", res.status, err);
        throw new Error(err?.error || `Send failed (${res.status})`);
      }
    },
    []
  );

  // Optional direct WS send (only if your WS server persists)
  const sendMessageWS = useCallback(
    (message: string, extra?: Record<string, any>) => {
      const ws = window.__USER_WS;
      if (!ws || ws.readyState !== WebSocket.OPEN || !message.trim()) return;
      ws.send(JSON.stringify({ type: "message", message, ...(extra || {}) }));
    },
    []
  );

  return { sendMessage, sendMessageWS };
}
