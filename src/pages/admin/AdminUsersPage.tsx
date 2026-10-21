import { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, HeartPulse, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, type Profile, type Role } from '../../lib/supabase';

export function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers((data as Profile[]) ?? []);
      setLoading(false);
    })();
  }, [session]);

  const updateRole = async (userId: string, role: Role) => {
    setUpdating(userId);
    const { data } = await supabase.from('profiles').update({ role }).eq('id', userId).select('*').maybeSingle();
    if (data) {
      setUsers(users.map((u) => (u.id === userId ? data as Profile : u)));
    }
    setUpdating(null);
  };

  const filtered = users.filter(
    (u) => u.email.toLowerCase().includes(search.toLowerCase()) || (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  const roleIcon: Record<Role, React.ComponentType<{ className?: string }>> = {
    patient: HeartPulse,
    provider: Stethoscope,
    admin: ShieldCheck,
  };
  const roleColor: Record<Role, string> = {
    patient: 'bg-teal-100 text-teal-700',
    provider: 'bg-blue-100 text-blue-700',
    admin: 'bg-slate-200 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Manage User Accounts</h2>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
          placeholder="Search by name or email…"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Current Role</th>
                <th className="px-4 py-3 font-medium">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const Icon = roleIcon[u.role];
                return (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                          {u.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <span className="font-medium text-slate-900">{u.full_name ?? 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleColor[u.role]}`}>
                        <Icon className="mr-1 h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(['patient', 'provider', 'admin'] as Role[]).map((r) => (
                          <button
                            key={r}
                            disabled={updating === u.id || u.role === r}
                            onClick={() => updateRole(u.id, r)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-100 ${
                              u.role === r
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {u.role === r && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">No users found.</div>
        )}
      </div>
    </div>
  );
}
