"use client";
import { useEffect, useRef, useCallback } from "react";

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
  // Keep latest callback without re-subscribing socket listeners
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; });

  // Singleton WS per tab with heartbeat and backoff reconnect
  useEffect(() => {
    let tries = 0;
    let hb: any;
    let reconnectTimer: any;
    const ownerId = Math.random().toString(36).slice(2);

    const attachHandlers = (ws: WebSocket) => {
      const onOpen = () => {
        window.__USER_WS_READY = true;
        tries = 0;
        clearInterval(hb);
        hb = setInterval(() => {
          try { ws.send(JSON.stringify({ type: 'ping', ts: Date.now() })); } catch {}
        }, 25000);
        const initial = Array.isArray(channelOrChannels)
          ? (channelOrChannels.filter(Boolean) as string[])
          : (channelOrChannels ? [channelOrChannels] : []);
        for (const ch of initial) {
          try { ws.send(JSON.stringify({ type: 'subscribe', channel: ch })); window.__USER_WS_SUBS!.add(ch); } catch {}
        }
      };
      const onMessageEv = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as any);
          if (data?.type === 'pong' || data?.type === 'subscribed' || data?.type === 'unsubscribed') {
            console.debug('[WS-USER] control message', data);
            return;
          }
          console.debug('[WS-USER] incoming payload', data);
          onMessageRef.current(data);
        } catch (e) { console.warn('[WS-USER] parse error', e); }
      };
      const onClose = (ev: CloseEvent) => {
        window.__USER_WS_READY = false;
        clearInterval(hb);
        if ((window.__USER_WS as any)?.__ownerId === ownerId) {
          const jitter = Math.floor(Math.random() * 300);
          const delay = Math.min(1000 * Math.pow(2, tries++), 8000) + jitter;
          reconnectTimer = setTimeout(connect, delay);
        }
      };
      const onError = () => {};
      ws.addEventListener('open', onOpen);
      ws.addEventListener('message', onMessageEv);
      // ws.addEventListener('close', onClose);
      ws.addEventListener('error', onError);
      return () => {
        ws.removeEventListener('open', onOpen);
        ws.removeEventListener('message', onMessageEv);
        ws.removeEventListener('close', onClose);
        ws.removeEventListener('error', onError);
      };
    };

    const connect = () => {
      if (window.__USER_WS && (window.__USER_WS.readyState === WebSocket.OPEN || window.__USER_WS.readyState === WebSocket.CONNECTING)) return;
      const base = process.env.NEXT_PUBLIC_WS_SERVER_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws`;
      const ws = new WebSocket(base) as WebSocket & { __ownerId?: string };
      ws.__ownerId = ownerId;
      window.__USER_WS = ws;
      window.__USER_WS_READY = false;
      window.__USER_WS_SUBS = window.__USER_WS_SUBS ?? new Set<string>();
      detachRef.current = attachHandlers(ws);
    };

    const detachRef = { current: (() => {}) as () => void };
    connect();

    // Do not close socket on unmount; only detach listeners to avoid StrictMode/Firefox close storms
    return () => {
      clearInterval(hb);
      clearTimeout(reconnectTimer);
      try { detachRef.current(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resubscribe when channel changes without reconnecting
  const prevChRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const ws = window.__USER_WS;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      prevChRef.current = new Set(Array.isArray(channelOrChannels) ? channelOrChannels : (channelOrChannels ? [channelOrChannels] : []));
      return;
    }
    const nextSet = new Set(
      Array.isArray(channelOrChannels) ? channelOrChannels.filter(Boolean) as string[] : (channelOrChannels ? [channelOrChannels] : [])
    );
    const prevSet = prevChRef.current || new Set<string>();
    // Unsubscribe channels that are no longer present
    for (const ch of prevSet) {
      if (!nextSet.has(ch)) {
        try { ws.send(JSON.stringify({ type: 'unsubscribe', channel: ch })); window.__USER_WS_SUBS?.delete(ch); } catch {}
      }
    }
    // Subscribe new channels
    for (const ch of nextSet) {
      if (!prevSet.has(ch)) {
        try { ws.send(JSON.stringify({ type: 'subscribe', channel: ch })); window.__USER_WS_SUBS?.add(ch); } catch {}
      }
    }
    prevChRef.current = nextSet;
  }, [channelOrChannels]);

  // POST to API so the message persists; WS will broadcast it back
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
        console.error('[WS-USER] send failed', res.status, err);
        throw new Error(err?.error || `Send failed (${res.status})`);
      }
      try { console.debug('[WS-USER] sent message via API', { length: message.length }); } catch {}
    },
    []
  );

  // Optional raw WS send (not used for persistence)
  const sendMessageWS = useCallback(
    (message: string) => {
      const ws = window.__USER_WS;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ type: "message", message, channel: Array.isArray(channelOrChannels) ? channelOrChannels[0] : channelOrChannels }));
    },
    [channelOrChannels]
  );

  return { sendMessage, sendMessageWS };
}
