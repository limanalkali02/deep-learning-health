import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle2, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, type HealthProfile } from '../../lib/supabase';
import { predictRisk } from '../../lib/riskEngine';

export function HealthProfilePage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState<HealthProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    bmi: '',
    systolic_bp: '',
    diastolic_bp: '',
    cholesterol: '',
    glucose: '',
    smoker: false,
    alcohol_intake: false,
    physical_activity: false,
    share_with_providers: true,
    anonymize_data: false,
  });

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .maybeSingle();
      if (data) {
        setExisting(data as HealthProfile);
        const d = data as HealthProfile;
        setForm({
          age: d.age?.toString() ?? '',
          gender: d.gender ?? 'male',
          bmi: d.bmi?.toString() ?? '',
          systolic_bp: d.systolic_bp?.toString() ?? '',
          diastolic_bp: d.diastolic_bp?.toString() ?? '',
          cholesterol: d.cholesterol?.toString() ?? '',
          glucose: d.glucose?.toString() ?? '',
          smoker: d.smoker,
          alcohol_intake: d.alcohol_intake,
          physical_activity: d.physical_activity,
          share_with_providers: d.share_with_providers,
          anonymize_data: d.anonymize_data,
        });
      }
      setLoading(false);
    })();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    setSaved(false);

    const payload = {
      user_id: session.user.id,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender,
      bmi: form.bmi ? parseFloat(form.bmi) : null,
      systolic_bp: form.systolic_bp ? parseInt(form.systolic_bp) : null,
      diastolic_bp: form.diastolic_bp ? parseInt(form.diastolic_bp) : null,
      cholesterol: form.cholesterol ? parseFloat(form.cholesterol) : null,
      glucose: form.glucose ? parseFloat(form.glucose) : null,
      smoker: form.smoker,
      alcohol_intake: form.alcohol_intake,
      physical_activity: form.physical_activity,
      share_with_providers: form.share_with_providers,
      anonymize_data: form.anonymize_data,
      updated_at: new Date().toISOString(),
    };

    let profileId = existing?.id;

    if (existing) {
      const { data } = await supabase
        .from('health_profiles')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();
      if (data) profileId = data.id;
    } else {
      const { data } = await supabase
        .from('health_profiles')
        .insert(payload)
        .select('*')
        .maybeSingle();
      if (data) {
        profileId = data.id;
        setExisting(data as HealthProfile);
      }
    }

    // Generate risk prediction
    if (profileId) {
      const fullProfile = { ...payload, id: profileId } as HealthProfile;
      const { riskScore, riskCategory, contributions } = predictRisk(fullProfile);

      // Delete old predictions for this profile
      await supabase.from('risk_predictions').delete().eq('profile_id', profileId);

      await supabase.from('risk_predictions').insert({
        user_id: session.user.id,
        profile_id: profileId,
        risk_score: riskScore,
        risk_category: riskCategory,
        feature_contributions: contributions,
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/patient/risk'), 1200);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700 animate-fade-in">
          <CheckCircle2 className="h-5 w-5" />
          Profile saved. Redirecting to your risk assessment…
        </div>
      )}

      {/* Clinical data */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <User className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-900">Clinical Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">Age (years)</label>
            <input type="number" min={1} max={120} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input" placeholder="45" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label">BMI</label>
            <input type="number" step="0.1" value={form.bmi} onChange={(e) => setForm({ ...form, bmi: e.target.value })} className="input" placeholder="24.5" />
          </div>
          <div>
            <label className="label">Systolic BP (mmHg)</label>
            <input type="number" value={form.systolic_bp} onChange={(e) => setForm({ ...form, systolic_bp: e.target.value })} className="input" placeholder="120" />
          </div>
          <div>
            <label className="label">Diastolic BP (mmHg)</label>
            <input type="number" value={form.diastolic_bp} onChange={(e) => setForm({ ...form, diastolic_bp: e.target.value })} className="input" placeholder="80" />
          </div>
          <div>
            <label className="label">Cholesterol (mg/dL)</label>
            <input type="number" step="0.1" value={form.cholesterol} onChange={(e) => setForm({ ...form, cholesterol: e.target.value })} className="input" placeholder="180" />
          </div>
          <div>
            <label className="label">Glucose (mg/dL)</label>
            <input type="number" step="0.1" value={form.glucose} onChange={(e) => setForm({ ...form, glucose: e.target.value })} className="input" placeholder="95" />
          </div>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-900">Lifestyle Factors</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'smoker', label: 'Current smoker', desc: 'Do you currently smoke?' },
            { key: 'alcohol_intake', label: 'Regular alcohol intake', desc: 'Do you consume alcohol regularly?' },
            { key: 'physical_activity', label: 'Physically active', desc: 'Do you engage in regular physical activity?' },
          ].map((item) => (
            <label key={item.key} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, [item.key]: !form[item.key as keyof typeof form] })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form[item.key as keyof typeof form] ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form[item.key as keyof typeof form] ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-900">Privacy Management</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'share_with_providers', label: 'Share with healthcare providers', desc: 'Allow providers to view your recommendations and clinical rationale' },
            { key: 'anonymize_data', label: 'Anonymize my data', desc: 'Strip personally identifiable information from analytics' },
          ].map((item) => (
            <label key={item.key} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, [item.key]: !form[item.key as keyof typeof form] })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form[item.key as keyof typeof form] ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form[item.key as keyof typeof form] ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : existing ? 'Update profile' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}
