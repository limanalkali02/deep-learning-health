import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Users, Activity, Star, FileText } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, type HealthProfile, type RiskPrediction, type FacilityFeedback } from '../../lib/supabase';

interface PatientRecord {
  profile: HealthProfile;
  prediction: RiskPrediction | null;
  feedback: FacilityFeedback[];
  patientName: string;
  patientEmail: string;
}

export function ProviderPatientsPage() {
  const { session } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
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

        const { data: fb } = await supabase
          .from('facility_feedback')
          .select('*')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false });

        const { data: patientProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', profile.user_id)
          .maybeSingle();

        records.push({
          profile,
          prediction: pred as RiskPrediction | null,
          feedback: (fb as FacilityFeedback[]) ?? [],
          patientName: profile.anonymize_data ? 'Anonymous Patient' : (patientProfile?.full_name ?? 'Unknown'),
          patientEmail: profile.anonymize_data ? '—' : (patientProfile?.email ?? '—'),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-900">Patient Records & Clinical Rationale</h2>
      </div>

      {patients.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No consented patients</h3>
          <p className="mt-2 text-sm text-slate-500">
            Patients who enable "Share with healthcare providers" in their privacy settings will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((rec) => {
            const isOpen = expanded === rec.profile.id;
            const pred = rec.prediction;
            return (
              <div key={rec.profile.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : rec.profile.id)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {rec.patientName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{rec.patientName}</p>
                      <p className="text-xs text-slate-500">
                        {rec.profile.age ?? '—'} yrs · {rec.profile.gender ?? '—'} · BMI {rec.profile.bmi ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pred ? (
                      <span className={`badge ${
                        pred.risk_score >= 70 ? 'bg-red-100 text-red-700' :
                        pred.risk_score >= 40 ? 'bg-amber-100 text-amber-700' :
                        'bg-teal-100 text-teal-700'
                      }`}>
                        {pred.risk_score}% · {pred.risk_category}
                      </span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-500">No prediction</span>
                    )}
                    {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 p-5 animate-fade-in">
                    {/* Clinical data */}
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <FileText className="h-4 w-4 text-blue-600" />
                          Clinical Profile
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            ['Systolic BP', `${rec.profile.systolic_bp ?? '—'} mmHg`],
                            ['Diastolic BP', `${rec.profile.diastolic_bp ?? '—'} mmHg`],
                            ['Cholesterol', `${rec.profile.cholesterol ?? '—'} mg/dL`],
                            ['Glucose', `${rec.profile.glucose ?? '—'} mg/dL`],
                            ['Smoker', rec.profile.smoker ? 'Yes' : 'No'],
                            ['Alcohol', rec.profile.alcohol_intake ? 'Yes' : 'No'],
                            ['Physically active', rec.profile.physical_activity ? 'Yes' : 'No'],
                            ['Anonymized', rec.profile.anonymize_data ? 'Yes' : 'No'],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                              <span className="text-slate-500">{k}</span>
                              <span className="font-medium text-slate-900">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clinical rationale */}
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Activity className="h-4 w-4 text-teal-600" />
                          Clinical Rationale (XAI)
                        </h4>
                        {pred ? (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600">
                              Risk score: <span className="font-semibold text-slate-900">{pred.risk_score}%</span> ({pred.risk_category})
                            </p>
                            <div className="space-y-1.5">
                              {pred.feature_contributions.slice(0, 6).map((c) => (
                                <div key={c.feature} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                                  <span className="text-sm text-slate-600">{c.display}</span>
                                  <span className={`text-sm font-semibold ${c.direction === 'positive' ? 'text-red-600' : 'text-teal-600'}`}>
                                    {c.value > 0 ? '+' : ''}{c.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No risk prediction available.</p>
                        )}
                      </div>
                    </div>

                    {/* Patient feedback */}
                    <div className="mt-5">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Star className="h-4 w-4 text-amber-500" />
                        Patient Feedback ({rec.feedback.length})
                      </h4>
                      {rec.feedback.length === 0 ? (
                        <p className="text-sm text-slate-500">No feedback submitted yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {rec.feedback.map((f) => (
                            <div key={f.id} className="rounded-lg border border-slate-100 p-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-900">{f.facility_name}</p>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <Star key={n} className={`h-3.5 w-3.5 ${n <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </div>
                              {f.comment && <p className="mt-1 text-sm text-slate-600">"{f.comment}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
