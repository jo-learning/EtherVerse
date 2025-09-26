import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
// Use runtime require for values to avoid ESM/type-only import issues in Next.js TS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wsAny: any = require('ws');
const WebSocketServerCtor: any = wsAny.WebSocketServer || wsAny.Server; // support both names

type ChatSockets = {
  wss: any;
  channels: Map<string, Set<any>>;
  broadcast: (channel: string, payload: any) => void;
};

declare global {
  // eslint-disable-next-line no-var
  var __chatSockets: ChatSockets | undefined;
}

function initWSS(server: HTTPServer) {
  if (global.__chatSockets) return global.__chatSockets;

  console.log('[WS] Initializing WebSocket server');

  const wss = new WebSocketServerCtor({ noServer: true });
  const channels = new Map<string, Set<any>>();
  // Track a heartbeat to detect broken connections (and keep some proxies from idling out)
  const HEARTBEAT_MS = 30000; // 30s

  const broadcast = (channel: string, payload: any) => {
    const subs = channels.get(channel);
    if (!subs) {
      // Still log to know broadcast happened without subscribers
      console.log(`[WS] Broadcast to ${channel} with 0 subscribers`, payload?.type ?? '');
      return;
    }
    console.log(`[WS] Broadcast to ${channel} (${subs.size} subs)`, payload?.type ?? '');
    const data = JSON.stringify(payload);
    for (const sock of subs) {
      if (sock.readyState === 1 /* OPEN */) {
        try { sock.send(data); } catch (e) { console.warn('[WS] send error', e); }
      }
    }
  };

  function subscribe(sock: any, channel: string) {
    let set = channels.get(channel);
    if (!set) { set = new Set(); channels.set(channel, set); }
    set.add(sock);
    // record on socket to allow unsubscribe
    if (!sock.__subs) sock.__subs = new Set<string>();
    sock.__subs.add(channel);
    sock.on('close', () => {
      set!.delete(sock);
      if (set!.size === 0) channels.delete(channel);
    });
  }
  function unsubscribe(sock: any, channel: string) {
    const set = channels.get(channel);
    if (set) {
      set.delete(sock);
      if (set.size === 0) channels.delete(channel);
    }
    if (sock.__subs) sock.__subs.delete(channel);
  }

  wss.on('connection', (sock: any, req: any) => {
    console.log('[WS] Client connected from', req?.socket?.remoteAddress);
    // heartbeat flags per socket
    sock.isAlive = true;
    sock.on('pong', () => { sock.isAlive = true; });
    sock.on('message', (buf: any) => {
      try {
        const msg = JSON.parse(buf.toString());
        if (msg?.type === 'subscribe' && typeof msg.channel === 'string') {
          subscribe(sock, msg.channel);
          console.log('[WS] Subscribed to', msg.channel);
          sock.send(JSON.stringify({ type: 'subscribed', channel: msg.channel }));
        } else if (msg?.type === 'unsubscribe' && typeof msg.channel === 'string') {
          unsubscribe(sock, msg.channel);
          console.log('[WS] Unsubscribed from', msg.channel);
          sock.send(JSON.stringify({ type: 'unsubscribed', channel: msg.channel }));
        } else if (msg?.type === 'ping') {
          // optional app-level ping
          sock.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
        }
      } catch (e) { console.warn('[WS] message parse error', e); }
    });
    sock.on('close', (code: number, reason: Buffer) => {
      // cleanup all recorded subs
      if (sock.__subs) {
        for (const ch of sock.__subs) {
          const set = channels.get(ch);
          if (set) {
            set.delete(sock);
            if (set.size === 0) channels.delete(ch);
          }
        }
      }
      const text = (() => { try { return reason?.toString(); } catch { return ''; } })();
      console.log('[WS] Client closed', code, text);
    });
    sock.on('error', (e: any) => console.warn('[WS] Client error', e));
  });

  // Server heartbeat interval
  const interval = setInterval(() => {
    // @ts-ignore - wss.clients exists on ws server
    for (const sock of wss.clients as Set<any>) {
      if (sock.isAlive === false) {
        console.log('[WS] Terminating dead socket');
        try { sock.terminate(); } catch {}
        continue;
      }
      sock.isAlive = false;
      try { sock.ping(); } catch {}
    }
  }, HEARTBEAT_MS);

  // Attach upgrade handler
  (server as any).on('upgrade', (req: any, socket: any, head: any) => {
    const url: string = req.url || '';
    if (url === '/api/ws' || url.startsWith('/api/ws?')) {
      console.log('[WS] HTTP upgrade for', url);
      wss.handleUpgrade(req, socket, head, (client: any) => {
        wss.emit('connection', client, req);
      });
    }
  });

  const store: ChatSockets = { wss, channels, broadcast };
  global.__chatSockets = store;
  // expose broadcast globally for route handlers
  (global as any).chatBroadcast = broadcast;
  // Ensure heartbeat cleared on process exit (dev only)
  try {
    process.on('exit', () => clearInterval(interval));
  } catch {}
  return store;
}

// Disable body parser for this route to avoid interfering with upgrade
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize once per server
  const server: HTTPServer | undefined = (res.socket as any)?.server;
  if (!server) {
    res.status(500).json({ error: 'No server' });
    return;
  }
  initWSS(server);
  // Keep simple response for HTTP
  if (req.method === 'GET') {
    console.log('[WS] Health check GET');
    res.status(200).json({ ok: true });
  } else {
    res.status(405).end();
  }
}
