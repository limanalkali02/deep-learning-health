import type { HealthProfile, FeatureContribution } from './supabase';

// Simulated hybrid RBM-CNN risk model. Produces a CVD risk score (0-100)
// and SHAP-style per-feature contributions for XAI explanations.
export function predictRisk(profile: HealthProfile): {
  riskScore: number;
  riskCategory: string;
  contributions: FeatureContribution[];
} {
  const contributions: FeatureContribution[] = [];

  // Age contribution (baseline rises with age)
  const age = profile.age ?? 40;
  const ageContrib = Math.max(0, (age - 30) * 0.9);
  contributions.push({
    feature: 'age',
    value: +ageContrib.toFixed(2),
    direction: ageContrib > 0 ? 'positive' : 'negative',
    display: `Age (${age} yrs)`,
  });

  // BMI contribution
  const bmi = profile.bmi ?? 24;
  let bmiContrib = 0;
  if (bmi >= 30) bmiContrib = 14;
  else if (bmi >= 25) bmiContrib = 7;
  else if (bmi < 18.5) bmiContrib = 4;
  contributions.push({
    feature: 'bmi',
    value: +bmiContrib.toFixed(2),
    direction: bmiContrib > 0 ? 'positive' : 'negative',
    display: `BMI (${bmi})`,
  });

  // Systolic blood pressure
  const sbp = profile.systolic_bp ?? 120;
  let sbpContrib = 0;
  if (sbp >= 160) sbpContrib = 18;
  else if (sbp >= 140) sbpContrib = 12;
  else if (sbp >= 130) sbpContrib = 6;
  contributions.push({
    feature: 'systolic_bp',
    value: +sbpContrib.toFixed(2),
    direction: sbpContrib > 0 ? 'positive' : 'negative',
    display: `Systolic BP (${sbp} mmHg)`,
  });

  // Cholesterol
  const chol = profile.cholesterol ?? 180;
  let cholContrib = 0;
  if (chol >= 240) cholContrib = 13;
  else if (chol >= 200) cholContrib = 7;
  contributions.push({
    feature: 'cholesterol',
    value: +cholContrib.toFixed(2),
    direction: cholContrib > 0 ? 'positive' : 'negative',
    display: `Cholesterol (${chol} mg/dL)`,
  });

  // Glucose
  const glucose = profile.glucose ?? 95;
  let glucContrib = 0;
  if (glucose >= 126) glucContrib = 12;
  else if (glucose >= 100) glucContrib = 6;
  contributions.push({
    feature: 'glucose',
    value: +glucContrib.toFixed(2),
    direction: glucContrib > 0 ? 'positive' : 'negative',
    display: `Glucose (${glucose} mg/dL)`,
  });

  // Smoker
  if (profile.smoker) {
    contributions.push({
      feature: 'smoker',
      value: 10,
      direction: 'positive',
      display: 'Smoking status (current smoker)',
    });
  }

  // Alcohol
  if (profile.alcohol_intake) {
    contributions.push({
      feature: 'alcohol_intake',
      value: 5,
      direction: 'positive',
      display: 'Alcohol intake (regular)',
    });
  }

  // Physical activity (protective)
  if (profile.physical_activity) {
    contributions.push({
      feature: 'physical_activity',
      value: -8,
      direction: 'negative',
      display: 'Physical activity (active)',
    });
  }

  // Gender modifier (males slightly higher baseline)
  if (profile.gender === 'male') {
    contributions.push({
      feature: 'gender',
      value: 3,
      direction: 'positive',
      display: 'Gender (male)',
    });
  }

  const rawScore = contributions.reduce((sum, c) => sum + c.value, 0) + 8;
  const riskScore = Math.min(98, Math.max(2, Math.round(rawScore)));

  let riskCategory: string;
  if (riskScore >= 70) riskCategory = 'High Risk';
  else if (riskScore >= 40) riskCategory = 'Moderate Risk';
  else riskCategory = 'Low Risk';

  // Sort by absolute contribution descending
  contributions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return { riskScore, riskCategory, contributions };
}
