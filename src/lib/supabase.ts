import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Role = 'patient' | 'provider' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface HealthProfile {
  id: string;
  user_id: string;
  age: number | null;
  gender: string | null;
  bmi: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  cholesterol: number | null;
  glucose: number | null;
  smoker: boolean;
  alcohol_intake: boolean;
  physical_activity: boolean;
  share_with_providers: boolean;
  anonymize_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureContribution {
  feature: string;
  value: number;
  direction: 'positive' | 'negative';
  display: string;
}

export interface RiskPrediction {
  id: string;
  user_id: string;
  profile_id: string;
  risk_score: number;
  risk_category: string;
  feature_contributions: FeatureContribution[];
  created_at: string;
}

export interface FacilityFeedback {
  id: string;
  user_id: string;
  facility_id: string;
  facility_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ModelMetric {
  id: string;
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  rmse: number;
  mae: number;
  training_loss: number[];
  created_at: string;
}

export interface TrainingJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  epochs: number;
  final_loss: number | null;
  log: { epoch: number; loss: number; accuracy: number }[];
  started_by: string | null;
  created_at: string;
  completed_at: string | null;
}
