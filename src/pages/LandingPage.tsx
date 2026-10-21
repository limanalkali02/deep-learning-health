import { Link, Navigate } from 'react-router-dom';
import { Activity, HeartPulse, Stethoscope, ShieldCheck, ArrowRight, Brain, BarChart3 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function LandingPage() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (session && profile) {
    return <Navigate to={`/${profile.role}`} replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">HealthRec</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/signup" className="btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-blue-50" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-teal-100 text-teal-700 mb-6">Deep Learning Powered</span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-6xl">
              Personalized healthcare & wellness recommendations
            </h1>
            <p className="mt-6 text-lg text-slate-600 lg:text-xl">
              A hybrid RBM-CNN recommender system with explainable AI, delivering accurate CVD risk
              predictions and facility recommendations — supporting patients, providers, and administrators.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup" className="btn-primary text-base">
                Create an account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base">Sign in</Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Dataset records', value: '12,847' },
              { label: 'Model accuracy', value: '91.4%' },
              { label: 'Facilities indexed', value: '8' },
              { label: 'XAI features', value: '9' },
            ].map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <p className="text-2xl font-bold text-teal-600">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actors */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">Three roles, one system</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Each actor has a dedicated portal matching their use cases in the system architecture.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: HeartPulse,
              title: 'Patient',
              color: 'bg-teal-50 text-teal-600',
              desc: 'Register, provide health data, receive personalized recommendations, view XAI explanations, and give feedback.',
              useCases: ['Provide Health Data', 'Receive Recommendations', 'View Explanations', 'Give Feedback'],
            },
            {
              icon: Stethoscope,
              title: 'Healthcare Provider',
              color: 'bg-blue-50 text-blue-600',
              desc: 'Review patient recommendations, access clinical rationale, and configure system parameters.',
              useCases: ['Review Patient Recommendations', 'Access Clinical Rationale', 'Configure Parameters'],
            },
            {
              icon: ShieldCheck,
              title: 'System Administrator',
              color: 'bg-slate-100 text-slate-700',
              desc: 'Manage user accounts, monitor system performance, and trigger model retraining.',
              useCases: ['Manage User Accounts', 'Monitor Performance', 'Retrain Model'],
            },
          ].map((actor) => {
            const Icon = actor.icon;
            return (
              <div key={actor.title} className="card p-6 transition-all hover:shadow-md">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${actor.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{actor.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{actor.desc}</p>
                <ul className="mt-4 space-y-2">
                  {actor.useCases.map((uc) => (
                    <li key={uc} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="badge bg-blue-100 text-blue-700 mb-4">System Architecture</span>
              <h2 className="text-3xl font-bold text-slate-900">Hybrid RBM-CNN with explainable AI</h2>
              <p className="mt-4 text-slate-600">
                The system combines Restricted Boltzmann Machines for collaborative filtering with
                Convolutional Neural Networks for feature extraction. SHAP-style explanations make
                every recommendation interpretable.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: Brain, text: 'RBM extracts latent health features from patient profiles' },
                  { icon: Activity, text: 'CNN learns spatial patterns across clinical indicators' },
                  { icon: BarChart3, text: 'Benchmarked against Matrix Factorization and SVD' },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.text} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
                        <Icon className="h-4 w-4 text-teal-600" />
                      </div>
                      <p className="text-sm text-slate-700">{f.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card p-8">
              <div className="space-y-4">
                {['Input Layer (Patient Profile)', 'RBM Feature Extraction', 'CNN Pattern Learning', 'Hybrid Fusion', 'Recommendation + XAI Output'].map((layer, i) => (
                  <div key={layer} className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${
                      i === 4 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                      {layer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          HealthRec — Deep Learning Health Recommender System. Academic research project.
        </div>
      </footer>
    </div>
  );
}
