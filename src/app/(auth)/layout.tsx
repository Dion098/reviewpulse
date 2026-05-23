import Link from "next/link";
import { Quote } from "lucide-react";

function StarIcon() {
  return (
    <svg
      className="h-6 w-6 text-indigo-600"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side — form area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Logo top-left */}
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <StarIcon />
            <span className="text-base font-semibold text-slate-900 tracking-tight">
              ReviewPulse
            </span>
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-8">
          {children}
        </div>

        {/* Copyright bottom */}
        <div className="p-8">
          <p className="text-xs text-slate-400">© 2026 ReviewPulse</p>
        </div>
      </div>

      {/* Right side — dark testimonial panel (lg+ only) */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 flex-col bg-slate-950">
        <div className="flex-1 flex flex-col items-center justify-center px-12">
          {/* Quote icon */}
          <Quote size={32} className="text-indigo-400" />

          {/* Testimonial */}
          <blockquote className="text-xl font-medium text-white leading-relaxed mt-6 text-center max-w-sm">
            "We went from 4.1 to 4.8 stars in 90 days. Our phone won't stop
            ringing."
          </blockquote>

          {/* Attribution */}
          <p className="text-slate-400 text-sm mt-4">Maria G., Sunset Salon</p>

          {/* Divider */}
          <div className="w-12 h-px bg-white/20 mx-auto my-8" />

          {/* Stats row */}
          <div className="flex items-start justify-center gap-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">2,000+</p>
              <p className="text-xs text-slate-400 mt-1">Businesses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">4.7★</p>
              <p className="text-xs text-slate-400 mt-1">Avg rating gain</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">47</p>
              <p className="text-xs text-slate-400 mt-1">Reviews/mo avg</p>
            </div>
          </div>

          {/* Stars */}
          <p className="text-amber-400 text-xl mt-8 tracking-wide">★★★★★</p>
        </div>
      </div>
    </div>
  );
}
