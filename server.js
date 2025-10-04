/* eslint-disable no-console */
// Standalone WebSocket server with channel subscribe/unsubscribe and secure HTTP broadcast
// Usage:
//   WS_PORT=4001 WS_BROADCAST_SECRET=your-secret node server.js
// Clients connect to ws://<host>:<port>
// Next.js API routes POST to http://<host>:<port>/broadcast with header x-ws-secret

const http = require('http');
const { WebSocketServer } = require('ws');
const url = require('url');

const PORT = Number(process.env.WS_PORT || 4001);
const BROADCAST_SECRET = process.env.WS_BROADCAST_SECRET || '';

/** @type {Map<string, Set<import('ws')>>} */
const channels = new Map();

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '', true);

  // Simple health check
  if (req.method === 'GET' && parsed.pathname === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Secure broadcast endpoint
  if (req.method === 'POST' && parsed.pathname === '/broadcast') {
    const secret = req.headers['x-ws-secret'] || '';
    // if (!BROADCAST_SECRET || secret !== BROADCAST_SECRET) {
    //   res.statusCode = 401;
    //   res.end('Unauthorized');
    //   return;
    // }
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        // Prevent DoS
        req.socket.destroy();
      }
    });
    req.on('end', () => {
      try {
        const { channel, payload } = JSON.parse(body || '{}');
        // console.log("is this working fine")
        if (!channel || typeof channel !== 'string') {
          res.statusCode = 400;
          res.end('channel required');
          return;
        }
        const delivered = broadcast(channel, payload);
        // console.log(channel)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, delivered }));
      } catch (e) {
        res.statusCode = 400;
        res.end('Bad JSON');
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

const wss = new WebSocketServer({ server });
let CONN_ID = 0;

function subscribe(ws, channel) {
//     if (ws.subs && ws.subs.has(channel)) {
//       console.log("this is working111")
//       console.log(channels)
//     // Duplicate subscribe; ignore to avoid flapping logs
//     return;
//   }
  let set = channels.get(channel);
  if (!set) {
    set = new Set();
    channels.set(channel, set);
    // console.log(channels)
  }
  set.add(ws);
  ws.subs = ws.subs || new Set();
  ws.subs.add(channel);
  try { ws.send(JSON.stringify({ type: 'subscribed', channel })); } catch {}
  console.log(`[WS #${ws._id}] Subscribed to ${channel}`);
}

function unsubscribe(ws, channel) {
  if (!ws.subs || !ws.subs.has(channel)) return; // Unknown/untracked subscription
  const set = channels.get(channel);
  if (set) {
    set.delete(ws);
    if (set.size === 0) channels.delete(channel);
  }
  ws.subs.delete(channel);
  try { ws.send(JSON.stringify({ type: 'unsubscribed', channel })); } catch {}
  console.log(`[WS #${ws._id}] Unsubscribed from ${channel}`);
}

function broadcast(channel, payload) {
  const set = channels.get(channel);
//   console.log("this is working ")
//   console.log(set)
  if (!set || set.size === 0) return 0;
  let data;
  try { data = JSON.stringify(payload); } catch (e) { console.warn('[WS] broadcast JSON error', e); return 0; }
  let delivered = 0;
  let dead = 0;
//   console.log(data)
  for (const ws of set) {
    //   console.log(`this is working fine fine ${channel}`)
    if (ws.readyState !== 1) { dead++; continue; }
    try { ws.send(data); delivered++; } catch (e) { dead++; try { ws.terminate?.(); } catch {} }
  }
  if (dead) console.log(`[WS] Broadcast to ${channel}: delivered ${delivered}, dead ${dead}`);
  return delivered;
}

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.subs = new Set();
  ws._id = ++CONN_ID;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (buf) => {
    let msg;
    try { msg = JSON.parse(buf.toString('utf8')); } catch { return; }
    // console.log(msg);
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

  ws.on('close', (code, reason) => {
    const r = reason?.toString() || '';
    const subCount = ws.subs ? ws.subs.size : 0;
    console.log(`[WS #${ws._id}] Client closed`, code, r, `subs=${subCount}`);
    // Clean up without echoing unsubscribed to avoid client-side noise after close
    if (ws.subs) {
      for (const ch of Array.from(ws.subs)) {
        const set = channels.get(ch);
        if (set) {
          set.delete(ws);
          if (set.size === 0) channels.delete(ch);
        }
        // do not send 'unsubscribed' after close
        ws.subs.delete(ch);
      }
    }
  });

  ws.on('error', (err) => {
    console.warn('[WS] Client error', err?.message || err);
  });
});

// Heartbeat (server pings; browser will auto-pong)
const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) { try { ws.terminate(); } catch {} continue; }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  }
}, 30000);

wss.on('close', () => clearInterval(interval));

server.listen(PORT, () => {
  console.log(`[WS] Server listening on port ${PORT}`);
});
