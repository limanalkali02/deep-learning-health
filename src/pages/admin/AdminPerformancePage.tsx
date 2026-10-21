import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target, Gauge } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { useAuth } from '../../lib/auth';
import { supabase, type ModelMetric } from '../../lib/supabase';

export function AdminPerformancePage() {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from('model_metrics').select('*').order('created_at', { ascending: false });
      setMetrics((data as ModelMetric[]) ?? []);
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

  if (metrics.length === 0) {
    return (
      <div className="card p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No benchmark data</h3>
        <p className="mt-2 text-sm text-slate-500">Model metrics will appear here once available.</p>
      </div>
    );
  }

  const barData = metrics.map((m) => ({
    name: m.model_name.length > 20 ? m.model_name.split(' ')[0] : m.model_name,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    Precision: +(m.precision * 100).toFixed(1),
    Recall: +(m.recall * 100).toFixed(1),
    'F1 Score': +(m.f1_score * 100).toFixed(1),
  }));

  const radarData = ['Accuracy', 'Precision', 'Recall', 'F1 Score'].map((metric) => {
    const row: Record<string, number | string> = { metric };
    metrics.forEach((m) => {
      const shortName = m.model_name.split(' ')[0];
      const val = metric === 'Accuracy' ? m.accuracy : metric === 'Precision' ? m.precision : metric === 'Recall' ? m.recall : m.f1_score;
      row[shortName] = +(val * 100).toFixed(1);
    });
    return row;
  });

  const lossData = metrics[0]?.training_loss?.map((loss, i) => {
    const row: Record<string, number> = { epoch: i + 1 };
    metrics.forEach((m) => {
      const shortName = m.model_name.split(' ')[0];
      row[shortName] = m.training_loss[i] ?? null;
    });
    return row;
  }) ?? [];

  const colors = ['#0d9488', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">System Performance & Benchmarks</h2>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m, i) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{m.model_name}</h3>
              {i === 0 && <span className="badge bg-teal-100 text-teal-700">Proposed</span>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">Accuracy</span>
                <span className="ml-auto font-semibold text-slate-900">{(m.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">F1</span>
                <span className="ml-auto font-semibold text-slate-900">{(m.f1_score * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">RMSE</span>
                <span className="ml-auto font-semibold text-slate-900">{m.rmse.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">MAE</span>
                <span className="ml-auto font-semibold text-slate-900">{m.mae.toFixed(3)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Metric Comparison (%)</h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Accuracy" fill={colors[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill={colors[1]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1 Score" fill={colors[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Radar Comparison</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} angle={90} domain={[70, 95]} />
                {metrics.map((m, i) => {
                  const shortName = m.model_name.split(' ')[0];
                  return (
                    <Radar key={m.id} name={m.model_name} dataKey={shortName} stroke={colors[i]} fill={colors[i]} fillOpacity={0.15} />
                  );
                })}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loss curve */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Training Loss Curve</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Epoch', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: '#94a3b8' } }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Loss', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {metrics.map((m, i) => {
                  const shortName = m.model_name.split(' ')[0];
                  return (
                    <Line key={m.id} type="monotone" dataKey={shortName} stroke={colors[i]} strokeWidth={2} dot={false} />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full table */}
      <div className="card overflow-hidden">
        <h3 className="border-b border-slate-100 p-5 text-lg font-semibold text-slate-900">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Accuracy</th>
                <th className="px-4 py-3 font-medium">Precision</th>
                <th className="px-4 py-3 font-medium">Recall</th>
                <th className="px-4 py-3 font-medium">F1 Score</th>
                <th className="px-4 py-3 font-medium">RMSE</th>
                <th className="px-4 py-3 font-medium">MAE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{m.model_name}</td>
                  <td className="px-4 py-3 text-slate-600">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-slate-600">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-slate-600">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-slate-600">{(m.f1_score * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-slate-600">{m.rmse.toFixed(3)}</td>
                  <td className="px-4 py-3 text-slate-600">{m.mae.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
