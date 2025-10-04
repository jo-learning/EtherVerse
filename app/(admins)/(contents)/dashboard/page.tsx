"use client";
import { useEffect, useState } from "react";
import { FaUser, FaComments, FaChartBar } from "react-icons/fa";

type DashStats = {
  scope: 'global' | 'assigned';
  stats: { users: number; admins?: number; chats: number; assignments?: number };
  recent: { users: Array<{ id: string; email: string; name: string | null; createdAt: string; userId: number }>; chats: Array<{ id: string; userId: string; who: string; message: string; createdAt: string; adminId?: string | null }> };
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true; setLoading(true); setError(null);
    (async () => {
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load dashboard');
        const json = await res.json();
        if (!alive) return;
        setData(json);
        console.log(json);
      } catch (e: any) { if (alive) setError(e.message); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700 dark:text-purple-400 flex items-center gap-2">
        <FaChartBar /> Admin Dashboard
      </h1>
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
              <FaUser size={32} className="text-purple-600 mb-2" />
              <div className="text-2xl font-bold">{data.stats.users}</div>
              <div className="text-gray-500 dark:text-gray-400">{data.scope === 'global' ? 'Total Users' : 'Assigned Users'}</div>
            </div>
            {data.stats.admins !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
                <FaUser size={32} className="text-purple-600 mb-2" />
                <div className="text-2xl font-bold">{data.stats.admins}</div>
                <div className="text-gray-500 dark:text-gray-400">Admins</div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
              <FaComments size={32} className="text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{data.stats.chats}</div>
              <div className="text-gray-500 dark:text-gray-400">Chats</div>
            </div>
            {data.stats.assignments !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
                <FaUser size={32} className="text-purple-600 mb-2" />
                <div className="text-2xl font-bold">{data.stats.assignments}</div>
                <div className="text-gray-500 dark:text-gray-400">Active Assignments</div>
              </div>
            )}
          </div>

          {/* Recent lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">Recent Users</h2>
              <ul className="space-y-2">
                {data.recent.users.map(u => (
                  <li key={u.id} className="text-sm flex items-center justify-between">
                    <span>{u.userId}</span>
                    <span className="text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleString()}</span>
                  </li>
                ))}
                {!data.recent.users.length && <li className="text-sm text-gray-500">No recent users</li>}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">Recent Chats</h2>
              <ul className="space-y-2">
                {data.recent.chats.map(c => (
                  <li key={c.id} className="text-sm">
                    <span className="font-semibold">[{c.who}]</span> {c.message}
                    <span className="ml-2 text-gray-500 dark:text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                  </li>
                ))}
                {!data.recent.chats.length && <li className="text-sm text-gray-500">No recent chats</li>}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
