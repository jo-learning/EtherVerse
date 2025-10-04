"use client";
import { useEffect, useRef, useCallback, useMemo } from "react";

declare global {
  interface Window {
    __ADMIN_WS?: WebSocket & { __ownerId?: string };
    __ADMIN_WS_READY?: boolean;
    __ADMIN_WS_SUBS?: Set<string>;
  }
}

export function useAdminWS(
  userId: string | null,
  postUserId: string | null,
  onMessage: (msg: any) => void
) {
  const channel = useMemo(() => (userId ? `user:${userId}` : null), [userId]);

  // Keep latest callback without re-subscribing socket listeners
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; });

  // Establish a singleton WS per tab, with reconnect and heartbeat
  useEffect(() => {
    let tries = 0;
    let hb: any;
    let reconnectTimer: any;
    const ownerId = Math.random().toString(36).slice(2);

  // Using standalone WS server; no priming needed

    const attachHandlers = (ws: WebSocket) => {
      const onOpen = () => {
        window.__ADMIN_WS_READY = true;
        tries = 0;
        clearInterval(hb);
        hb = setInterval(() => { try { ws.send(JSON.stringify({ type: 'ping', ts: Date.now() })); } catch {} }, 25000);
        // Subscribe current channel if available
        if (channel) {
          try { ws.send(JSON.stringify({ type: 'subscribe', channel })); window.__ADMIN_WS_SUBS!.add(channel); } catch {}
        }
      };
      const onMessageEv = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as any);
          console.log(data)
          if (data?.type === 'pong' || data?.type === 'subscribed' || data?.type === 'unsubscribed') {
            console.debug('[WS-ADMIN] control message', data);
            return;
          }
          console.debug('[WS-ADMIN] incoming payload', data);
          onMessageRef.current(data);
          
        } catch (e) { console.warn('[WS-ADMIN] parse error', e); }
      };
      const onClose = (ev: CloseEvent) => {
        window.__ADMIN_WS_READY = false;
        clearInterval(hb);
        // Only manage reconnect if this owner created it
        if ((window.__ADMIN_WS as any)?.__ownerId === ownerId) {
          const jitter = Math.floor(Math.random() * 300);
          const delay = Math.min(1000 * Math.pow(2, tries++), 8000) + jitter;
          reconnectTimer = setTimeout(connect, delay);
        }
      };
      const onError = () => {};
      ws.addEventListener('open', onOpen);
      ws.addEventListener('message', onMessageEv);      
      ws.addEventListener('close', onClose);
      ws.addEventListener('error', onError);
      return () => {
        ws.removeEventListener('open', onOpen);
        ws.removeEventListener('message', onMessageEv);
        ws.removeEventListener('close', onClose);
        ws.removeEventListener('error', onError);
      };
    };

    const connect = () => {
      if (window.__ADMIN_WS && (window.__ADMIN_WS.readyState === WebSocket.OPEN || window.__ADMIN_WS.readyState === WebSocket.CONNECTING)) {
        return; // already connected/connecting
      }
  const base = process.env.NEXT_PUBLIC_WS_SERVER_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws`;
  const ws = new WebSocket(base) as WebSocket & { __ownerId?: string };
      ws.__ownerId = ownerId;
      window.__ADMIN_WS = ws;
      window.__ADMIN_WS_READY = false;
      window.__ADMIN_WS_SUBS = window.__ADMIN_WS_SUBS ?? new Set<string>();
      detachRef.current = attachHandlers(ws);
    };

    const detachRef = { current: (() => {}) as () => void };
    connect();

    // Do not close socket on unmount (StrictMode), only detach listeners
    return () => {
      clearInterval(hb);
      clearTimeout(reconnectTimer);
      try { detachRef.current(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resubscribe when channel changes without reconnecting
  const prevChRef = useRef<string | null>(null);
  useEffect(() => {
    const ws = window.__ADMIN_WS;
    if (!ws || ws.readyState !== WebSocket.OPEN) { prevChRef.current = channel || null; return; }
    const prev = prevChRef.current;
    if (prev && prev !== channel) {
      try { ws.send(JSON.stringify({ type: 'unsubscribe', channel: prev })); window.__ADMIN_WS_SUBS?.delete(prev); } catch {}
    }
    if (channel && channel !== prev) {
      try { ws.send(JSON.stringify({ type: 'subscribe', channel })); window.__ADMIN_WS_SUBS?.add(channel); } catch {}
    }
    prevChRef.current = channel || null;
  }, [channel]);

  // Send via REST so it persists; WS will broadcast it back
  const sendMessage = useCallback(
    async (message: string) => {
      if (!postUserId || !message.trim()) return;
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: postUserId, message }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[WS-ADMIN] send failed', res.status, err);
        throw new Error(err?.error || `Send failed (${res.status})`);
        throw new Error(err?.error || `Send failed (${res.status})`);
      console.debug('[WS-ADMIN] sent message via API', { userId: postUserId, length: message.length });
      }
      try { console.debug('[WS-ADMIN] sent message via API for userId', postUserId); } catch {}
    },
    [postUserId]
  );

  return { sendMessage };
}