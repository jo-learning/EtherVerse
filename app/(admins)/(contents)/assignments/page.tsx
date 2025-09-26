"use client";
import { useEffect, useState } from 'react';
import { FaUserShield, FaUserPlus, FaUnlink, FaSync, FaSearch } from 'react-icons/fa';

interface Admin { id: string; email: string; name: string | null; role: 'ADMIN' | 'SUPERADMIN'; status: string; }
interface Assignment { id: string; userId: string; adminId: string; active: boolean; }
interface User { id: string; email: string; name: string | null; assignments?: { adminId: string; admin: Admin }[] }

export default function AssignmentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'all'|'assigned'|'unassigned'>('all');

  async function fetchUsers() {
    setLoading(true); setError(null);
    try {
      const qs = view==='assigned'? '?assigned=true' : view==='unassigned'? '?assigned=false' : '';
      const res = await fetch('/api/chat/users'+qs, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }
  async function fetchAdmins() {
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch {}
  }

  useEffect(()=>{ fetchUsers(); }, [view]);
  useEffect(()=>{ fetchAdmins(); }, []);

  async function assign(userId: string, adminId?: string) {
    setAssigning(userId); setError(null);
    try {
      const body: any = { userId };
      if (adminId) body.adminId = adminId;
      const res = await fetch('/api/chat/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to assign');
      await fetchUsers();
    } catch (e:any) { setError(e.message); }
    finally { setAssigning(null); }
  }

  const filtered = users.filter(u => (u.name||u.email).toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-4"><FaUserShield/> User Assignments</h1>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setView('all')} className={`px-3 py-1 rounded border ${view==='all'? 'bg-purple-600 text-white border-purple-600':'border-gray-300 dark:border-gray-600'}`}>All</button>
          <button onClick={()=>setView('assigned')} className={`px-3 py-1 rounded border ${view==='assigned'? 'bg-purple-600 text-white border-purple-600':'border-gray-300 dark:border-gray-600'}`}>Assigned</button>
          <button onClick={()=>setView('unassigned')} className={`px-3 py-1 rounded border ${view==='unassigned'? 'bg-purple-600 text-white border-purple-600':'border-gray-300 dark:border-gray-600'}`}>Unassigned</button>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-2 top-2.5 text-gray-400" />
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search user" className="pl-8 pr-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-1 text-sm text-purple-600"><FaSync className={loading? 'animate-spin':''}/>Refresh</button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
              <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Current Admin</th>
              <th className="py-2 px-4">Assign</th>
              <th className="py-2 px-4">Unassign</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="py-6 text-center text-gray-500">Loading...</td></tr>}
            {!loading && filtered.map(u => {
              const current = u.assignments?.[0]?.admin;
              return (
                <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4 font-medium">{u.name || '—'}</td>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">{current? (current.name || current.email): <span className="text-gray-400">None</span>}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-2">
                      {admins.filter(a=>a.status==='active').map(a => (
                        <button key={a.id} disabled={assigning===u.id} onClick={()=>assign(u.id, a.id)} className={`px-2 py-1 rounded text-xs border ${current?.id===a.id? 'bg-green-600 text-white border-green-600':'border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}>
                          <FaUserPlus className="inline mr-1" />{a.name || a.email}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <button disabled={assigning===u.id || !current} onClick={()=>assign(u.id)} className="px-2 py-1 rounded text-xs border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 flex items-center gap-1"><FaUnlink/>Unassign</button>
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length===0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
