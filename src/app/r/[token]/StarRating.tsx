'use client';

import { useState } from 'react';

interface Props {
  token: string;
  googleReviewUrl: string | null;
}

type Step = 'rating' | 'google' | 'feedback' | 'thankyou';

export default function StarRating({ token, googleReviewUrl }: Props) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState<Step>('rating');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submitRating(rating: number) {
    setSelected(rating);
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/review-requests/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      const data = await res.json() as { action?: string; redirect?: string };

      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      if (data.action === 'google') {
        setStep('google');
        // Redirect automatically after a short delay
        if (data.redirect) {
          setTimeout(() => {
            window.location.href = data.redirect!;
          }, 1500);
        }
      } else if (data.action === 'feedback') {
        setStep('feedback');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitFeedback() {
    if (!feedback.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/review-requests/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedback.trim() }),
      });

      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setStep('thankyou');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'google') {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
        <p className="text-gray-600 text-lg leading-relaxed max-w-xs">
          We&apos;re so glad you had a great experience. Tap the button below to share your review on Google.
        </p>
        {googleReviewUrl && (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#4285F4] hover:bg-[#3367d6] active:bg-[#2851a3] text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg transition-colors w-full max-w-xs justify-center"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Write a Google Review
          </a>
        )}
        <p className="text-sm text-gray-400">Redirecting you automatically&hellip;</p>
      </div>
    );
  }

  if (step === 'feedback') {
    return (
      <div className="flex flex-col gap-5 w-full animate-in fade-in duration-500">
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-3xl ${star <= selected ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </span>
            ))}
          </div>
          <h2 className="text-xl font-bold text-gray-900">We appreciate your honesty</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tell us what we can do better so we can improve your experience.
          </p>
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience with us..."
          rows={5}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400"
          disabled={loading}
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={submitFeedback}
          disabled={loading || !feedback.trim()}
          className="w-full bg-gray-900 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-300 text-white font-semibold text-lg py-4 rounded-2xl transition-colors"
        >
          {loading ? 'Sending...' : 'Submit Feedback'}
        </button>
      </div>
    );
  }

  if (step === 'thankyou') {
    return (
      <div className="flex flex-col items-center gap-5 text-center animate-in fade-in duration-500">
        <div className="text-6xl">🙏</div>
        <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
        <p className="text-gray-500 text-lg leading-relaxed max-w-xs">
          We appreciate your feedback. It helps us get better every day.
        </p>
      </div>
    );
  }

  // Default: star selection
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-gray-500 text-base">Tap a star to rate your experience</p>

      <div
        className="flex gap-2"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onClick={() => submitRating(star)}
            disabled={loading}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            className={`text-6xl sm:text-7xl transition-transform active:scale-90 leading-none disabled:opacity-50 ${
              star <= (hovered || selected) ? 'text-yellow-400' : 'text-gray-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-gray-400 text-sm animate-pulse">Saving your rating...</p>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
