'use client';

import React, { useEffect, useMemo, useState } from 'react';

const COLORS = {
  purple: '#4b0082',
  background: '#0a1026',
  navy: '#172042',
  textWhite: '#ffffff',
  textGray: '#b0b8c1',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#f59e0b',
};

type KycItem = {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  submittedAt?: string;
  verifiedAt?: string | null;
  firstName?: string;
  lastName?: string;
  Email?: string;
  Brithdate?: string;
  Place?: string;
  country?: string | null;
  certificateType?: string | null;
  certificateNumber?: string | null;
  phone?: string | null;
  user?: { id: string; email?: string | null };
  [key: string]: any;
};

function fmtDate(v?: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

export default function KycManagerPage() {
  const [items, setItems] = useState<KycItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selected, setSelected] = useState<KycItem | null>(null);
  const [updating, setUpdating] = useState<'approve' | 'reject' | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status !== 'all') qs.set('status', status);
      if (q.trim()) qs.set('q', q.trim());
      const res = await fetch(`/api/admin/kyc?${qs.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => items, [items]);

  const onApproveReject = async (next: 'approved' | 'rejected') => {
    if (!selected?.userId) return;
    setUpdating(next === 'approved' ? 'approve' : 'reject');
    try {
      const res = await fetch(`/api/kyc/${encodeURIComponent(selected.userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        alert('Update failed');
        return;
      }
      await load();
      // update selected row view
      const updated = items.find(i => i.userId === selected.userId);
      setSelected(updated || null);
    } catch {
      alert('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: COLORS.background, color: COLORS.textWhite }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">KYC Manager</h1>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email, name, certificate number..."
            className="w-full md:flex-1 p-3 rounded-lg border"
            style={{ background: COLORS.navy, borderColor: COLORS.purple, color: COLORS.textWhite }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="p-3 rounded-lg border md:w-48"
            style={{ background: COLORS.navy, borderColor: COLORS.purple, color: COLORS.textWhite }}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={load}
            className="px-4 py-3 rounded-lg font-bold"
            style={{ background: COLORS.purple }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.purple }}>
          <table className="w-full text-sm">
            <thead style={{ background: COLORS.navy }}>
              <tr className="text-left">
                <th className="p-3">User</th>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Verified</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t hover:bg-black/20 cursor-pointer" style={{ borderColor: COLORS.purple }}>
                  <td className="p-3" onClick={() => setSelected(i)}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{i.user?.email || i.Email || '-'}</span>
                      <span className="text-xs text-gray-400">{i.userId}</span>
                    </div>
                  </td>
                  <td className="p-3" onClick={() => setSelected(i)}>
                    {i.firstName || '-'} {i.lastName || ''}
                  </td>
                  <td className="p-3" onClick={() => setSelected(i)}>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        background:
                          i.status === 'approved' ? COLORS.green :
                          i.status === 'rejected' ? COLORS.red : COLORS.yellow,
                        color: '#000',
                      }}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="p-3" onClick={() => setSelected(i)}>{fmtDate(i.submittedAt as any)}</td>
                  <td className="p-3" onClick={() => setSelected(i)}>{fmtDate(i.verifiedAt as any)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 rounded font-bold"
                        style={{ background: COLORS.green, color: '#000' }}
                        disabled={updating !== null}
                        onClick={() => { setSelected(i); onApproveReject('approved'); }}
                      >
                        {updating === 'approve' && selected?.userId === i.userId ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        className="px-3 py-2 rounded font-bold"
                        style={{ background: COLORS.red, color: '#fff' }}
                        disabled={updating !== null}
                        onClick={() => { setSelected(i); onApproveReject('rejected'); }}
                      >
                        {updating === 'reject' && selected?.userId === i.userId ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && !loading && (
                <tr>
                  <td className="p-6 text-center text-gray-400" colSpan={6}>No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail drawer */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 flex justify-end z-50" onClick={() => setSelected(null)}>
            <div
              className="w-full max-w-md h-full overflow-y-auto p-6"
              style={{ background: COLORS.navy }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">KYC Details</h2>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-400">User</div>
                  <div className="font-mono break-all">{selected.user?.email || selected.Email || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-gray-400">First Name</div>
                    <div>{selected.firstName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Last Name</div>
                    <div>{selected.lastName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Country</div>
                    <div>{selected.country || selected.Place || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Certificate Type</div>
                    <div>{selected.certificateType || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Certificate Number</div>
                    <div>{selected.certificateNumber || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Phone</div>
                    <div>{selected.phone || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Birthdate</div>
                    <div>{selected.Brithdate || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Submitted</div>
                    <div>{fmtDate(selected.submittedAt as any)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Verified</div>
                    <div>{fmtDate(selected.verifiedAt as any)}</div>
                  </div>
                </div>

                {/* Raw JSON fallback for any extra fields */}
                <div className="mt-4">
                  <div className="text-gray-400 mb-1">Raw</div>
                  <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selected, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    className="flex-1 px-4 py-3 rounded font-bold"
                    style={{ background: COLORS.green, color: '#000' }}
                    disabled={updating !== null}
                    onClick={() => onApproveReject('approved')}
                  >
                    {updating === 'approve' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    className="flex-1 px-4 py-3 rounded font-bold"
                    style={{ background: COLORS.red, color: '#fff' }}
                    disabled={updating !== null}
                    onClick={() => onApproveReject('rejected')}
                  >
                    {updating === 'reject' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}