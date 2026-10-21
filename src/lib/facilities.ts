import type { HealthProfile } from './supabase';

export interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  specialties: string[];
  beds?: number;
}

// Real healthcare facilities from Borno and Gombe States, Nigeria
export const FACILITIES: Facility[] = [
  {
    id: 'fth-gombe',
    name: 'Federal Teaching Hospital, Gombe (FTH)',
    type: 'Tertiary',
    location: 'Gombe, Gombe State',
    description:
      'Apex tertiary healthcare and research institution in the state, offering advanced specialty care including cardiology, oncology, and intensive care.',
    specialties: ['Cardiology', 'Oncology', 'Intensive Care', 'Surgery', 'Internal Medicine'],
  },
  {
    id: 'state-specialist-gombe',
    name: 'State Specialist Hospital, Gombe',
    type: 'Secondary / Tertiary',
    location: 'Gombe metropolis, Gombe State',
    description:
      'Major secondary and tertiary-level state hospital catering to general and specialized medical needs for the Gombe metropolis.',
    specialties: ['General Medicine', 'Cardiology', 'Pediatrics', 'Maternity', 'Emergency'],
  },
  {
    id: 'general-hospital-biu',
    name: 'General Hospital Biu',
    type: 'Secondary',
    location: 'Yola Road, Biu, Borno State',
    description:
      'Major secondary health facility with a state-of-the-art Phase 2 facility upgraded in collaboration with WHO. 125-bed capacity, emergency services, and a stabilization center for malnourished children.',
    specialties: ['Emergency', 'Maternity', 'Pediatrics', 'Malnutrition Care', 'General Medicine'],
    beds: 125,
  },
  {
    id: 'snakebite-research',
    name: 'Snakebite Treatment & Research Hospital',
    type: 'Specialist',
    location: 'Gombe State',
    description:
      'Critical regional center for snakebite treatments and anti-venom production, recently upgraded and expanded by the state government.',
    specialties: ['Toxicology', 'Emergency', 'Anti-venom Production', 'Research'],
  },
  {
    id: 'cottage-hospital-hina',
    name: 'Cottage Hospital Hina',
    type: 'Secondary',
    location: 'Biu Road, Yamaltu/Deba LGA, Gombe State',
    description:
      '40-bed secondary healthcare facility offering emergency, maternity, and infectious disease services along the Biu Road corridor.',
    specialties: ['Emergency', 'Maternity', 'Infectious Disease', 'General Medicine'],
    beds: 40,
  },
  {
    id: 'salam-medical',
    name: 'Salam Medical Center',
    type: 'Private',
    location: 'Dan Gusau Street, Yalanguruza Quarters, Gombe',
    description:
      'Private medical center along the Biu Road in Gombe providing outpatient and general practice services.',
    specialties: ['General Practice', 'Outpatient', 'Diagnostics', 'Family Medicine'],
  },
  {
    id: 'garubula-sabo-phc',
    name: 'Garubula Sabo Primary Health Care Center',
    type: 'Primary',
    location: 'Borno State',
    description:
      'Primary health care center providing grassroots and maternal healthcare services for local communities.',
    specialties: ['Maternal Health', 'Child Welfare', 'Vaccination', 'Primary Care'],
  },
  {
    id: 'mch-nassarawo',
    name: 'MCH Nassarawo (Primary Healthcare)',
    type: 'Primary',
    location: 'Gombe State',
    description:
      'Mother and child health primary healthcare center, part of Gombe State\u2019s network of over 200 primary health centers.',
    specialties: ['Maternal Health', 'Child Welfare', 'Antenatal Care', 'Primary Care'],
  },
];

// Collaborative filtering-style recommendation: scores each facility against
// the patient's clinical profile. Returns top matches with match scores and
// per-facility XAI attribution.
export function recommendFacilities(profile: HealthProfile): {
  facility: Facility;
  matchScore: number;
  rationale: string[];
}[] {
  const scored = FACILITIES.map((facility) => {
    let score = 50;
    const rationale: string[] = [];

    const risk = computeRiskLevel(profile);

    // High CVD risk → tertiary/cardiology facilities
    if (risk === 'high') {
      if (facility.specialties.includes('Cardiology')) {
        score += 25;
        rationale.push('High CVD risk profile favors cardiology-capable facilities');
      }
      if (facility.type === 'Tertiary') {
        score += 15;
        rationale.push('Tertiary care recommended for elevated risk');
      }
    }

    // Elevated cholesterol/glucose → specialist/general hospitals
    if ((profile.cholesterol ?? 0) >= 200 || (profile.glucose ?? 0) >= 100) {
      if (facility.specialties.includes('Internal Medicine') || facility.specialties.includes('General Medicine')) {
        score += 12;
        rationale.push('Metabolic indicators (cholesterol/glucose) favor internal medicine');
      }
    }

    // Smoker or alcohol → emergency/specialist
    if (profile.smoker || profile.alcohol_intake) {
      if (facility.specialties.includes('Emergency') || facility.specialties.includes('Toxicology')) {
        score += 10;
        rationale.push('Lifestyle factors (smoking/alcohol) favor emergency-ready facilities');
      }
    }

    // Maternal / child needs
    if (profile.gender === 'female' && (profile.age ?? 0) > 18 && (profile.age ?? 0) < 45) {
      if (facility.specialties.includes('Maternity') || facility.specialties.includes('Maternal Health')) {
        score += 14;
        rationale.push('Maternal health services relevant to demographic profile');
      }
    }

    // Low risk / preventive → primary care
    if (risk === 'low') {
      if (facility.type === 'Primary') {
        score += 18;
        rationale.push('Low risk profile well-served by primary healthcare');
      }
    }

    // Physical activity (preventive wellness)
    if (profile.physical_activity && facility.specialties.includes('Family Medicine')) {
      score += 8;
      rationale.push('Active lifestyle aligns with preventive/family medicine');
    }

    score = Math.min(99, Math.max(20, Math.round(score)));
    return { facility, matchScore: score, rationale };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 5);
}

function computeRiskLevel(profile: HealthProfile): 'low' | 'moderate' | 'high' {
  const age = profile.age ?? 40;
  const sbp = profile.systolic_bp ?? 120;
  const chol = profile.cholesterol ?? 180;
  let score = 0;
  if (age > 55) score += 2;
  if (sbp >= 140) score += 2;
  if (chol >= 200) score += 2;
  if (profile.smoker) score += 2;
  if ((profile.bmi ?? 24) >= 30) score += 1;
  if (profile.gender === 'male') score += 1;
  if (score >= 5) return 'high';
  if (score >= 2) return 'moderate';
  return 'low';
}
