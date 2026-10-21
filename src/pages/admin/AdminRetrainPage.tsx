import { useEffect, useState } from 'react';
import { BrainCircuit, Play, Loader2, CheckCircle2, Terminal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../lib/auth';
import { supabase, type TrainingJob } from '../../lib/supabase';

export function AdminRetrainPage() {
  const { session } = useAuth();
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [epochs, setEpochs] = useState(50);
  const [training, setTraining] = useState(false);
  const [activeJob, setActiveJob] = useState<TrainingJob | null>(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from('training_jobs').select('*').order('created_at', { ascending: false });
      setJobs((data as TrainingJob[]) ?? []);
      setLoading(false);
    })();
  }, [session]);

  const startTraining = async () => {
    if (!session) return;
    setTraining(true);

    // Create job
    const { data: job } = await supabase
      .from('training_jobs')
      .insert({
        status: 'running',
        epochs,
        log: [],
        started_by: session.user.id,
      })
      .select('*')
      .maybeSingle();

    if (!job) {
      setTraining(false);
      return;
    }

    const jobId = job.id;
    const log: { epoch: number; loss: number; accuracy: number }[] = [];
    let currentLoss = 0.95;
    let currentAcc = 0.50;

    // Simulate training epoch by epoch
    for (let epoch = 1; epoch <= epochs; epoch++) {
      await new Promise((r) => setTimeout(r, 80));
      // Loss decreases with diminishing returns + noise
      currentLoss = Math.max(0.23, currentLoss * 0.96 + (Math.random() - 0.5) * 0.01);
      currentAcc = Math.min(0.92, currentAcc + (0.92 - currentAcc) * 0.05 + (Math.random() - 0.5) * 0.005);
      log.push({ epoch, loss: +currentLoss.toFixed(4), accuracy: +currentAcc.toFixed(4) });

      // Update job every 5 epochs
      if (epoch % 5 === 0 || epoch === epochs) {
        await supabase.from('training_jobs').update({ log }).eq('id', jobId);
        setActiveJob({ ...(job as TrainingJob), log: [...log] });
      }
    }

    // Complete
    await supabase
      .from('training_jobs')
      .update({
        status: 'completed',
        final_loss: +currentLoss.toFixed(4),
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    const completed: TrainingJob = {
      ...(job as TrainingJob),
      status: 'completed',
      final_loss: +currentLoss.toFixed(4),
      log,
      completed_at: new Date().toISOString(),
    };
    setActiveJob(completed);
    setJobs([completed, ...jobs]);
    setTraining(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  const lossData = activeJob?.log?.map((l) => ({ epoch: l.epoch, loss: l.loss, accuracy: l.accuracy * 100 })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Model Retraining</h2>
      </div>

      {/* Training control */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900">Trigger New Training Run</h3>
        <p className="mt-1 text-sm text-slate-500">
          Retrain the hybrid RBM-CNN model on the current dataset. The simulation runs epoch-by-epoch with live logging.
        </p>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">Number of epochs</label>
            <input
              type="number"
              min={10}
              max={200}
              value={epochs}
              onChange={(e) => setEpochs(Math.max(10, Math.min(200, parseInt(e.target.value) || 50)))}
              className="input max-w-xs"
              disabled={training}
            />
          </div>
          <button onClick={startTraining} disabled={training} className="btn-primary">
            {training ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {training ? 'Training…' : 'Start training'}
          </button>
        </div>
      </div>

      {/* Live training */}
      {activeJob && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Terminal className="h-5 w-5 text-teal-600" />
              Training Log
            </h3>
            <span className={`badge ${
              activeJob.status === 'completed' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {activeJob.status === 'completed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {activeJob.status}
            </span>
          </div>

          {lossData.length > 0 && (
            <div className="mb-4" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#0d9488" strokeWidth={2} dot={false} name="Loss" />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={false} name="Accuracy %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-300">
            {activeJob.log?.map((l) => (
              <div key={l.epoch}>
                <span className="text-slate-500">[Epoch {l.epoch.toString().padStart(3, '0')}]</span>{' '}
                loss={l.loss.toFixed(4)}{' '}
                acc={(l.accuracy * 100).toFixed(2)}%
              </div>
            ))}
            {activeJob.status === 'completed' && (
              <div className="mt-1 text-teal-400">
                Training complete. Final loss: {activeJob.final_loss?.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job history */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Training History</h3>
        {jobs.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">
            No training jobs yet. Start a training run above.
          </div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-slate-900">{job.epochs} epochs</p>
                  <p className="text-xs text-slate-500">{new Date(job.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  {job.final_loss != null && (
                    <span className="text-sm text-slate-500">Final loss: {job.final_loss.toFixed(4)}</span>
                  )}
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
