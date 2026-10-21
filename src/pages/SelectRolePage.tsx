import { Navigate, useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { Role } from '../lib/supabase';

export function SelectRolePage() {
  const { session, profile, loading, setRole } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role) return <Navigate to={`/${profile.role}`} replace />;

  const choose = async (role: Role) => {
    await setRole(role);
    navigate(`/${role}`);
  };

  const roles = [
    {
      role: 'patient' as Role,
      icon: HeartPulse,
      title: 'Patient',
      desc: 'Provide health data, receive personalized recommendations, view XAI explanations, and give feedback.',
      color: 'from-teal-500 to-teal-600',
    },
    {
      role: 'provider' as Role,
      icon: Stethoscope,
      title: 'Healthcare Provider',
      desc: 'Review patient recommendations, access clinical rationale, and configure system parameters.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      role: 'admin' as Role,
      icon: ShieldCheck,
      title: 'System Administrator',
      desc: 'Manage user accounts, monitor system performance, and trigger model retraining.',
      color: 'from-slate-600 to-slate-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Choose your role</h1>
          <p className="mt-3 text-slate-600">
            Select how you'll use the system. You can switch roles later from your dashboard.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.role}
                onClick={() => choose(r.role)}
                className="card group p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${r.color}`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{r.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal-600 transition-transform group-hover:translate-x-1">
                  Continue as {r.title}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
