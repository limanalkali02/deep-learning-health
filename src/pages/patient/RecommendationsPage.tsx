import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Star, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase, type HealthProfile, type FacilityFeedback } from '../../lib/supabase';
import { recommendFacilities, type Facility } from '../../lib/facilities';

export function RecommendationsPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [feedback, setFeedback] = useState<FacilityFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: p } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .maybeSingle();
      setProfile(p as HealthProfile | null);

      const { data: fb } = await supabase
        .from('facility_feedback')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setFeedback((fb as FacilityFeedback[]) ?? []);

      setLoading(false);
    })();
  }, [session]);

  const submitFeedback = async (facility: Facility) => {
    if (!session || rating === 0) return;
    setSubmitting(true);
    const { data } = await supabase
      .from('facility_feedback')
      .insert({
        user_id: session.user.id,
        facility_id: facility.id,
        facility_name: facility.name,
        rating,
        comment: comment || null,
      })
      .select('*')
      .maybeSingle();
    if (data) {
      setFeedback([data as FacilityFeedback, ...feedback]);
    }
    setActiveFeedback(null);
    setRating(0);
    setComment('');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card p-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No recommendations yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Complete your health profile to get personalized facility recommendations.
        </p>
        <Link to="/patient/profile" className="btn-primary mt-5">
          Complete your profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const recommendations = recommendFacilities(profile);
  const hasFeedback = (facilityId: string) => feedback.some((f) => f.facility_id === facilityId);
  const getFeedback = (facilityId: string) => feedback.find((f) => f.facility_id === facilityId);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white">
        <h2 className="text-xl font-bold">Personalized Facility Recommendations</h2>
        <p className="mt-1 text-sm text-teal-50">
          Collaborative filtering matches based on your clinical profile. Top 5 facilities ranked by match score.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          const f = rec.facility;
          const myFb = getFeedback(f.id);
          return (
            <div key={f.id} className="card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                {/* Rank + score */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                    #{idx + 1}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{rec.matchScore}%</div>
                    <div className="text-xs text-slate-500">match</div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{f.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="badge bg-slate-100 text-slate-600">{f.type}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {f.location}
                        </span>
                        {f.beds && <span>{f.beds} beds</span>}
                      </div>
                    </div>
                    {myFb && (
                      <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-amber-700">{myFb.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-slate-600">{f.description}</p>

                  {/* Specialties */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.specialties.map((s) => (
                      <span key={s} className="badge bg-teal-50 text-teal-700">{s}</span>
                    ))}
                  </div>

                  {/* XAI rationale */}
                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Why this match?</p>
                    <ul className="mt-2 space-y-1">
                      {rec.rationale.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Feedback */}
                  <div className="mt-4">
                    {hasFeedback(f.id) && activeFeedback !== f.id ? (
                      <div className="flex items-center gap-2 text-sm text-teal-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Feedback submitted
                        <button onClick={() => setActiveFeedback(f.id)} className="ml-2 text-teal-600 underline">
                          Update
                        </button>
                      </div>
                    ) : activeFeedback === f.id ? (
                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="mb-2 text-sm font-medium text-slate-700">Rate this facility</p>
                        <div className="mb-3 flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setRating(n)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star className={`h-6 w-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="input mb-3"
                          rows={2}
                          placeholder="Share your experience (optional)"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={rating === 0 || submitting}
                            onClick={() => submitFeedback(f)}
                            className="btn-primary"
                          >
                            <Send className="h-4 w-4" />
                            Submit feedback
                          </button>
                          <button type="button" onClick={() => setActiveFeedback(null)} className="btn-ghost">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setActiveFeedback(f.id); setRating(myFb?.rating ?? 0); setComment(myFb?.comment ?? ''); }}
                        className="btn-secondary"
                      >
                        <Star className="h-4 w-4" />
                        {hasFeedback(f.id) ? 'Update feedback' : 'Give feedback'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
