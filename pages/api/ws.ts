import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';

// Use runtime require to avoid ESM/type-only import issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wsAny: any = require('ws');
const WebSocketServerCtor: any = wsAny.WebSocketServer || wsAny.Server;

type WS = any;

type ChatSockets = {
  wss: any;
  channels: Map<string, Set<WS>>;
  broadcast: (channel: string, payload: any) => void;
  subscribe: (sock: WS, channel: string) => void;
  unsubscribe: (sock: WS, channel: string) => void;
};

declare global {
  // eslint-disable-next-line no-var
  var __chatSockets: ChatSockets | undefined;
}

function initWSS(server: HTTPServer): ChatSockets {
  if (global.__chatSockets) return global.__chatSockets;

  

  const wss = new WebSocketServerCtor({ noServer: true });
  const channels = new Map<string, Set<WS>>();

  const subscribe = (sock: WS, channel: string) => {
    let set = channels.get(channel);
    if (!set) {
      set = new Set();
      channels.set(channel, set);
    }
    set.add(sock);
    try { sock.send(JSON.stringify({ type: 'subscribed', channel })); } catch {}
    
  };

  const unsubscribe = (sock: WS, channel: string) => {
    const set = channels.get(channel);
    if (!set) return;
    set.delete(sock);
    if (set.size === 0) channels.delete(channel);
    try { sock.send(JSON.stringify({ type: 'unsubscribed', channel })); } catch {}
    
  };

  const broadcast = (channel: string, payload: any) => {
    const set = channels.get(channel);
    if (!set || set.size === 0) return;
    let data: string;
    try { data = JSON.stringify(payload); } catch (e) { console.warn('[WS] broadcast JSON error', e); return; }
    let delivered = 0;
    let dead = 0;
    for (const sock of set) {
      if (sock.readyState !== 1) { dead++; continue; }
      try { sock.send(data); delivered++; } catch (e) { dead++; try { sock.terminate?.(); } catch {} }
    }
    
  };

  // Per-connection handlers
  wss.on('connection', (ws: WS, req: any) => {
    // @ts-ignore
    ws.isAlive = true;
    ws.subs = new Set<string>();

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (buf: Buffer) => {
      let msg: any;
      try { msg = JSON.parse(buf.toString('utf8')); } catch { return; }
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'ping') {
        try { ws.send(JSON.stringify({ type: 'pong', ts: Date.now() })); } catch {}
        return;
      }
      if (msg.type === 'subscribe' && typeof msg.channel === 'string') {
        ws.subs.add(msg.channel);
        subscribe(ws, msg.channel);
        return;
      }
      if (msg.type === 'unsubscribe' && typeof msg.channel === 'string') {
        ws.subs.delete(msg.channel);
        unsubscribe(ws, msg.channel);
        return;
      }
    });

    ws.on('close', (code: number, reason: Buffer) => {
      const r = reason?.toString() || '';
      
      for (const ch of ws.subs ?? []) unsubscribe(ws, ch);
    });

    ws.on('error', (err: any) => {
      console.warn('[WS] Client error', err?.message || err);
    });
  });

  // Heartbeat (browser replies to ping automatically)
  const interval = setInterval(() => {
    for (const ws of wss.clients) {
      // @ts-ignore
      if (ws.isAlive === false) { try { ws.terminate(); } catch {} continue; }
      // @ts-ignore
      ws.isAlive = false;
      try { ws.ping(); } catch {}
    }
  }, 30000);
  wss.on('close', () => clearInterval(interval));

  // Attach HTTP upgrade once
  const nodeServer: any = server;
  if (!nodeServer.__wsUpgradeAttached) {
    nodeServer.on('upgrade', (req: any, socket: any, head: any) => {
      if (!req.url?.startsWith?.('/api/ws')) return;
      
      wss.handleUpgrade(req, socket, head, (ws: WS) => {
        wss.emit('connection', ws, req);
        
      });
    });
    nodeServer.__wsUpgradeAttached = true;
  }

  const bundle: ChatSockets = { wss, channels, broadcast, subscribe, unsubscribe };
  global.__chatSockets = bundle;
  // expose broadcast for other API routes
  (global as any).chatBroadcast = (ch: string, payload: any) => broadcast(ch, payload);

  return bundle;
}

// Disable body parser to allow upgrade
export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = (res.socket as any)?.server as HTTPServer | undefined;
  if (!server) return res.status(500).json({ error: 'No server' });
  initWSS(server);
  if (req.method === 'GET') return res.status(200).json({ ok: true });
  return res.status(405).end();
}
