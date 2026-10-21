import { useState } from 'react';
import { Settings, Save, CheckCircle2, Sliders, Star, Brain } from 'lucide-react';

export function ProviderConfigurePage() {
  const [config, setConfig] = useState({
    highRiskThreshold: 70,
    moderateRiskThreshold: 40,
    latentFactors: 64,
    feedbackWeight: 0.3,
    minMatchScore: 50,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-900">Configure System Parameters</h2>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700 animate-fade-in">
          <CheckCircle2 className="h-5 w-5" />
          Configuration saved successfully.
        </div>
      )}

      {/* Risk thresholds */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Risk Thresholds</h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label">High risk threshold (%)</label>
            <input
              type="range"
              min={50}
              max={100}
              value={config.highRiskThreshold}
              onChange={(e) => setConfig({ ...config, highRiskThreshold: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="mt-1 text-sm font-medium text-slate-700">{config.highRiskThreshold}%</p>
          </div>
          <div>
            <label className="label">Moderate risk threshold (%)</label>
            <input
              type="range"
              min={10}
              max={60}
              value={config.moderateRiskThreshold}
              onChange={(e) => setConfig({ ...config, moderateRiskThreshold: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="mt-1 text-sm font-medium text-slate-700">{config.moderateRiskThreshold}%</p>
          </div>
        </div>
      </div>

      {/* Model parameters */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Brain className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-900">Model Parameters</h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label">Latent factors (RBM)</label>
            <input
              type="number"
              min={16}
              max={256}
              value={config.latentFactors}
              onChange={(e) => setConfig({ ...config, latentFactors: parseInt(e.target.value) })}
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">Number of hidden units in the RBM layer</p>
          </div>
          <div>
            <label className="label">Minimum match score (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={config.minMatchScore}
              onChange={(e) => setConfig({ ...config, minMatchScore: parseInt(e.target.value) })}
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">Facilities below this score are filtered out</p>
          </div>
        </div>
      </div>

      {/* Feedback weight */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900">Feedback Integration</h3>
        </div>
        <div>
          <label className="label">Feedback weight in collaborative filtering (0.0 – 1.0)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(config.feedbackWeight * 100)}
            onChange={(e) => setConfig({ ...config, feedbackWeight: parseInt(e.target.value) / 100 })}
            className="w-full accent-amber-500"
          />
          <p className="mt-1 text-sm font-medium text-slate-700">{config.feedbackWeight.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">
            How much patient ratings influence future recommendation rankings
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          <Save className="h-4 w-4" />
          Save configuration
        </button>
      </div>
    </div>
  );
}
