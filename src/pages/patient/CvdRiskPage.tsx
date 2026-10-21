import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useAuth } from '../../lib/auth';
import { supabase, type HealthProfile, type RiskPrediction } from '../../lib/supabase';

export function CvdRiskPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
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

  if (!profile || !prediction) {
    return (
      <div className="card p-12 text-center">
        <Activity className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No risk assessment yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Complete your health profile to generate a CVD risk prediction with XAI explanations.
        </p>
        <Link to="/patient/profile" className="btn-primary mt-5">
          Complete your profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const score = prediction.risk_score;
  const category = prediction.risk_category;
  const gaugeColor = score >= 70 ? '#dc2626' : score >= 40 ? '#f59e0b' : '#0d9488';
  const gaugeBg = score >= 70 ? 'from-red-500 to-red-600' : score >= 40 ? 'from-amber-500 to-amber-600' : 'from-teal-500 to-teal-600';

  const chartData = prediction.feature_contributions.map((c) => ({
    name: c.display,
    contribution: c.value,
    direction: c.direction,
  }));

  return (
    <div className="space-y-6">
      {/* Risk gauge */}
      <div className="card overflow-hidden">
        <div className={`bg-gradient-to-br ${gaugeBg} p-8 text-white`}>
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">Cardiovascular Disease Risk</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-6xl font-bold">{score}</span>
              <span className="mb-2 text-2xl font-semibold">%</span>
            </div>
            <span className="mt-3 rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm">
              {category}
            </span>
          </div>
        </div>
        <div className="p-6">
          {/* Gauge bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{ width: `${score}%`, backgroundColor: gaugeColor }}
            />
            <div className="absolute inset-y-0" style={{ left: '40%', width: '1px', background: '#cbd5e1' }} />
            <div className="absolute inset-y-0" style={{ left: '70%', width: '1px', background: '#cbd5e1' }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Low (0-39%)</span>
            <span>Moderate (40-69%)</span>
            <span>High (70-100%)</span>
          </div>
        </div>
      </div>

      {/* High risk alert */}
      {score >= 70 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">High risk detected</p>
            <p className="mt-1 text-sm text-red-700">
              Your CVD risk score is elevated. We recommend consulting a healthcare provider. Visit the
              recommendations page for facility matches suited to your profile.
            </p>
            <Link to="/patient/recommendations" className="mt-2 inline-block text-sm font-medium text-red-700 underline">
              View recommendations →
            </Link>
          </div>
        </div>
      )}

      {/* XAI explanation */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Info className="h-5 w-5 text-teal-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">XAI Feature Importance</h3>
            <p className="text-sm text-slate-500">SHAP-style explanation of what drove your risk score</p>
          </div>
        </div>

        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={180} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number) => [`${v > 0 ? '+' : ''}${v} points`, 'Contribution']}
              />
              <ReferenceLine x={0} stroke="#cbd5e1" />
              <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.direction === 'positive' ? '#ef4444' : '#0d9488'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-500" /> Increases risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-teal-500" /> Reduces risk
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Clinical Summary</h3>
        <p className="text-sm text-slate-600">
          The hybrid RBM-CNN model analyzed your health profile and computed a risk score of{' '}
          <span className="font-semibold text-slate-900">{score}%</span> ({category}). The top contributing
          factors are shown above. Positive (red) bars increase your risk, while negative (teal) bars are protective.
        </p>
      </div>
    </div>
  );
}
