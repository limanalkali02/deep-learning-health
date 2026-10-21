import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, BrainCircuit, Activity, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, type Profile, type TrainingJob } from '../../lib/supabase';

export function AdminDashboard() {
  const { session } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [providerCount, setProviderCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: profiles } = await supabase.from('profiles').select('role');
      const all = (profiles as Profile[]) ?? [];
      setUserCount(all.length);
      setPatientCount(all.filter((p) => p.role === 'patient').length);
      setProviderCount(all.filter((p) => p.role === 'provider').length);
      setAdminCount(all.filter((p) => p.role === 'admin').length);

      const { data: jobData } = await supabase
        .from('training_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setJobs((jobData as TrainingJob[]) ?? []);

      setLoading(false);
    })();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-slate-700 bg-slate-100' },
    { label: 'Patients', value: patientCount, icon: Activity, color: 'text-teal-600 bg-teal-50' },
    { label: 'Providers', value: providerCount, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Admins', value: adminCount, icon: Users, color: 'text-slate-600 bg-slate-100' },
  ];

  const actions = [
    { to: '/admin/users', label: 'Manage User Accounts', desc: 'View and assign user roles', icon: Users },
    { to: '/admin/performance', label: 'System Performance', desc: 'Benchmark charts and model metrics', icon: BarChart3 },
    { to: '/admin/retrain', label: 'Model Retraining', desc: 'Trigger and monitor training jobs', icon: BrainCircuit },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-8 text-white">
        <h2 className="text-2xl font-bold">System Administration</h2>
        <p className="mt-2 text-slate-300">
          Manage users, monitor model performance, and trigger retraining for the RBM-CNN recommender.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to} className="card group p-5 transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 group-hover:text-teal-700">{a.label}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{a.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent training jobs */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent Training Jobs</h3>
          <Link to="/admin/retrain" className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">
            No training jobs yet. Trigger a retraining run from the Model Retraining page.
          </div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{job.epochs} epochs</p>
                    <p className="text-xs text-slate-500">
                      {new Date(job.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {job.final_loss != null && <span className="text-sm text-slate-500">Loss: {job.final_loss.toFixed(4)}</span>}
                  <span className={`badge ${
                    job.status === 'completed' ? 'bg-teal-100 text-teal-700' :
                    job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
