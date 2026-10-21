import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, HeartPulse, TrendingUp, Building2, Star, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, type HealthProfile, type RiskPrediction, type FacilityFeedback } from '../../lib/supabase';

export function PatientDashboard() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: p } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .maybeSingle();
      setProfile(p as HealthProfile | null);

      if (p) {
        const { data: pred } = await supabase
          .from('risk_predictions')
          .select('*')
          .eq('profile_id', p.id)
          .order('created_at', { ascending: false })
          .maybeSingle();
        setPrediction(pred as RiskPrediction | null);
      }

      const { count } = await supabase
        .from('facility_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      setFeedbackCount(count ?? 0);

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
    {
      label: 'Health Profile',
      value: profile ? 'Complete' : 'Not set',
      icon: HeartPulse,
      color: profile ? 'text-teal-600 bg-teal-50' : 'text-slate-400 bg-slate-100',
    },
    {
      label: 'CVD Risk Score',
      value: prediction ? `${prediction.risk_score}%` : '—',
      icon: Activity,
      color: prediction
        ? prediction.risk_score >= 70
          ? 'text-red-600 bg-red-50'
          : prediction.risk_score >= 40
            ? 'text-amber-600 bg-amber-50'
            : 'text-teal-600 bg-teal-50'
        : 'text-slate-400 bg-slate-100',
    },
    {
      label: 'Risk Category',
      value: prediction?.risk_category ?? '—',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Feedback Given',
      value: `${feedbackCount}`,
      icon: Star,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  const actions = [
    { to: '/patient/profile', label: 'Update Health Profile', desc: 'Enter your clinical and lifestyle data', icon: HeartPulse },
    { to: '/patient/risk', label: 'View CVD Risk', desc: 'See your risk score and XAI explanation', icon: Activity },
    { to: '/patient/recommendations', label: 'Facility Recommendations', desc: 'Get personalized facility matches', icon: Building2 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-2 text-teal-50">
          {profile
            ? 'Your health profile is set up. Explore your recommendations below.'
            : 'Start by completing your health profile to unlock personalized recommendations.'}
        </p>
        {!profile && (
          <Link to="/patient/profile" className="btn-secondary mt-5">
            Complete your profile
          </Link>
        )}
      </div>

      {/* Stats */}
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

      {/* Quick actions */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.to} to={a.to} className="card group p-5 transition-all hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
                    <Icon className="h-5 w-5 text-teal-600" />
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
      </div>

      {/* Risk alert */}
      {prediction && prediction.risk_score >= 70 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">High cardiovascular risk detected</p>
            <p className="mt-1 text-sm text-red-700">
              Your risk score is {prediction.risk_score}%. Please consult a healthcare provider and review your recommendations.
            </p>
            <Link to="/patient/risk" className="mt-2 inline-block text-sm font-medium text-red-700 underline">
              View detailed explanation →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
