/*
# Health Recommender System — Core Schema

## Overview
Multi-tenant schema for a deep-learning-powered health recommender system with three actor roles:
Patient, Healthcare Provider, and System Administrator. Each user has a role; patients own their
health profiles, risk predictions, and facility feedback. Providers review consented patient data.
Admins manage users, monitor performance, and trigger model retraining.

## Tables

1. `profiles` — extends auth.users with role + display info
   - id (uuid, PK, FK to auth.users)
   - email (text)
   - full_name (text)
   - role (text: 'patient' | 'provider' | 'admin')
   - created_at (timestamptz)

2. `health_profiles` — patient clinical + lifestyle data
   - id (uuid PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - age, gender, bmi, systolic_bp, diastolic_bp, cholesterol, glucose
   - smoker, alcohol_intake, physical_activity (booleans)
   - share_with_providers, anonymize_data (privacy toggles)
   - created_at, updated_at

3. `risk_predictions` — CVD risk score + XAI feature contributions
   - id (uuid PK)
   - user_id (uuid, owner)
   - profile_id (uuid FK)
   - risk_score (numeric 0-100)
   - risk_category (text)
   - feature_contributions (jsonb) — SHAP-style per-feature weights
   - created_at

4. `facility_feedback` — patient ratings + comments on recommended facilities
   - id (uuid PK)
   - user_id (uuid, owner)
   - facility_id (text) — slug identifying the facility
   - facility_name (text)
   - rating (int 1-5)
   - comment (text)
   - created_at

5. `model_metrics` — benchmark results for RBM-CNN vs Matrix Factorization vs SVD
   - id (uuid PK)
   - model_name (text)
   - accuracy, precision, recall, f1_score, rmse, mae (numeric)
   - training_loss (jsonb) — loss curve points
   - created_at

6. `training_jobs` — admin-triggered retraining jobs
   - id (uuid PK)
   - status (text: 'queued' | 'running' | 'completed' | 'failed')
   - epochs (int)
   - final_loss (numeric)
   - log (jsonb) — step-by-step training log
   - started_by (uuid)
   - created_at, completed_at

## Security (RLS)
- profiles: each user reads/updates own row; admins read all (via service role in edge functions)
- health_profiles: owner-scoped CRUD; providers can SELECT rows where share_with_providers = true
- risk_predictions: owner-scoped; providers can SELECT for consented patients
- facility_feedback: owner-scoped CRUD; providers read for consented patients
- model_metrics: readable by all authenticated users (shared benchmark data)
- training_jobs: readable by all authenticated; only admins insert (enforced client-side)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','provider','admin')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Health profiles
CREATE TABLE IF NOT EXISTS health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  age int,
  gender text,
  bmi numeric,
  systolic_bp int,
  diastolic_bp int,
  cholesterol numeric,
  glucose numeric,
  smoker boolean DEFAULT false,
  alcohol_intake boolean DEFAULT false,
  physical_activity boolean DEFAULT false,
  share_with_providers boolean DEFAULT true,
  anonymize_data boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_health_profile" ON health_profiles;
CREATE POLICY "select_own_health_profile" ON health_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR share_with_providers = true);
DROP POLICY IF EXISTS "insert_own_health_profile" ON health_profiles;
CREATE POLICY "insert_own_health_profile" ON health_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_health_profile" ON health_profiles;
CREATE POLICY "update_own_health_profile" ON health_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_health_profile" ON health_profiles;
CREATE POLICY "delete_own_health_profile" ON health_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Risk predictions
CREATE TABLE IF NOT EXISTS risk_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES health_profiles(id) ON DELETE CASCADE,
  risk_score numeric NOT NULL,
  risk_category text NOT NULL,
  feature_contributions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_predictions" ON risk_predictions;
CREATE POLICY "select_own_predictions" ON risk_predictions FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM health_profiles hp
      WHERE hp.id = risk_predictions.profile_id
        AND hp.share_with_providers = true
    )
  );
DROP POLICY IF EXISTS "insert_own_predictions" ON risk_predictions;
CREATE POLICY "insert_own_predictions" ON risk_predictions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_predictions" ON risk_predictions;
CREATE POLICY "delete_own_predictions" ON risk_predictions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Facility feedback
CREATE TABLE IF NOT EXISTS facility_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE facility_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_feedback" ON facility_feedback;
CREATE POLICY "select_own_feedback" ON facility_feedback FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM health_profiles hp
      WHERE hp.user_id = facility_feedback.user_id
        AND hp.share_with_providers = true
    )
  );
DROP POLICY IF EXISTS "insert_own_feedback" ON facility_feedback;
CREATE POLICY "insert_own_feedback" ON facility_feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_feedback" ON facility_feedback;
CREATE POLICY "delete_own_feedback" ON facility_feedback FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Model metrics (shared benchmark data)
CREATE TABLE IF NOT EXISTS model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  accuracy numeric,
  precision numeric,
  recall numeric,
  f1_score numeric,
  rmse numeric,
  mae numeric,
  training_loss jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE model_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_model_metrics" ON model_metrics;
CREATE POLICY "read_model_metrics" ON model_metrics FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_model_metrics" ON model_metrics;
CREATE POLICY "insert_model_metrics" ON model_metrics FOR INSERT
  TO authenticated WITH CHECK (true);

-- Training jobs
CREATE TABLE IF NOT EXISTS training_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed')),
  epochs int NOT NULL DEFAULT 50,
  final_loss numeric,
  log jsonb DEFAULT '[]'::jsonb,
  started_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_training_jobs" ON training_jobs;
CREATE POLICY "read_training_jobs" ON training_jobs FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_training_jobs" ON training_jobs;
CREATE POLICY "insert_training_jobs" ON training_jobs FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_training_jobs" ON training_jobs;
CREATE POLICY "update_training_jobs" ON training_jobs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_health_profiles_user ON health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_user ON risk_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_facility_feedback_user ON facility_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_created ON training_jobs(created_at desc);
