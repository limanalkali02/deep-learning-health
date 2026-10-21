import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, Star, Settings, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, type HealthProfile, type RiskPrediction, type FacilityFeedback } from '../../lib/supabase';

interface PatientRecord {
  profile: HealthProfile;
  prediction: RiskPrediction | null;
  feedbackCount: number;
  patientName: string;
}

export function ProviderDashboard() {
  const { session } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      // Only patients who consented to share
      const { data: profiles } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('share_with_providers', true)
        .order('updated_at', { ascending: false });

      const records: PatientRecord[] = [];
      for (const p of (profiles ?? [])) {
        const profile = p as HealthProfile;
        const { data: pred } = await supabase
          .from('risk_predictions')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })
          .maybeSingle();

        const { count } = await supabase
          .from('facility_feedback')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id);

        // Get patient name from profiles table
        const { data: patientProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', profile.user_id)
          .maybeSingle();

        records.push({
          profile,
          prediction: pred as RiskPrediction | null,
          feedbackCount: count ?? 0,
          patientName: profile.anonymize_data
            ? 'Anonymous Patient'
            : (patientProfile?.full_name ?? 'Unknown'),
        });
      }
      setPatients(records);
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

  const highRisk = patients.filter((p) => (p.prediction?.risk_score ?? 0) >= 70).length;
  const moderateRisk = patients.filter((p) => {
    const s = p.prediction?.risk_score ?? 0;
    return s >= 40 && s < 70;
  }).length;
  const lowRisk = patients.filter((p) => (p.prediction?.risk_score ?? 0) < 40).length;

  const stats = [
    { label: 'Consented Patients', value: patients.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'High Risk', value: highRisk, icon: Activity, color: 'text-red-600 bg-red-50' },
    { label: 'Moderate Risk', value: moderateRisk, icon: Activity, color: 'text-amber-600 bg-amber-50' },
    { label: 'Low Risk', value: lowRisk, icon: Activity, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
        <h2 className="text-2xl font-bold">Provider Overview</h2>
        <p className="mt-2 text-blue-50">
          Review clinical recommendations and rationale for patients who have consented to share their data.
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

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/provider/patients" className="card group p-6 transition-all hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 group-hover:text-blue-700">Patient Records & Clinical Rationale</p>
              <p className="mt-0.5 text-sm text-slate-500">Review XAI explanations for each consented patient</p>
            </div>
          </div>
        </Link>
        <Link to="/provider/configure" className="card group p-6 transition-all hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Settings className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 group-hover:text-blue-700">Configure Parameters</p>
              <p className="mt-0.5 text-sm text-slate-500">Adjust risk thresholds and model parameters</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent patients */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Patients</h3>
        {patients.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">
            No consented patients yet. Patients who enable "Share with providers" will appear here.
          </div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {patients.slice(0, 5).map((p) => (
              <div key={p.profile.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {p.patientName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{p.patientName}</p>
                    <p className="text-xs text-slate-500">
                      {p.profile.age ?? '—'} yrs · {p.profile.gender ?? '—'} · {p.feedbackCount} feedback
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.prediction ? (
                    <span className={`badge ${
                      p.prediction.risk_score >= 70 ? 'bg-red-100 text-red-700' :
                      p.prediction.risk_score >= 40 ? 'bg-amber-100 text-amber-700' :
                      'bg-teal-100 text-teal-700'
                    }`}>
                      {p.prediction.risk_score}% · {p.prediction.risk_category}
                    </span>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-500">No prediction</span>
                  )}
                  <Link to="/provider/patients" className="text-slate-400 hover:text-blue-600">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
