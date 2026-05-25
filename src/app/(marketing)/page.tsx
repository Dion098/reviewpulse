"use client";

import { useState } from "react";
import Link from "next/link";

// ─── SVG Icon Components ──────────────────────────────────────────────────────

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Feature icon: Smart Review Filtering — funnel/filter shape
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

// Feature icon: AI Response Drafting — sparkle/wand
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.1l-6.2 4.2 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

// Feature icon: Automated SMS Campaigns — message/broadcast
function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// Feature icon: White-Label Dashboard — layers/brand
function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface FAQ {
  question: string;
  answer: string;
}

interface Testimonial {
  name: string;
  title: string;
  company: string;
  initials: string;
  quote: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  popular: boolean;
  features: string[];
}

const faqs: FAQ[] = [
  {
    question: "How does review filtering work?",
    answer:
      "After a job is complete, ReviewPulse sends your client's customer an SMS asking how their experience was. Customers who rate 4–5 stars are guided to leave a public Google review. Customers who rate 1–3 stars are directed to a private feedback form instead — so you hear about issues before they become public one-star reviews.",
  },
  {
    question: "Can I respond to reviews directly from ReviewPulse?",
    answer:
      "Yes. Our AI drafts a personalised response to every review using Claude. You can edit and approve it in one click, or let AutoRespond publish it automatically. We support Google Business Profile, Yelp, and TripAdvisor.",
  },
  {
    question: "How does the SMS automation work?",
    answer:
      "Connect your CRM, POS, or job management software via our integrations or Zapier. When a job is marked complete, ReviewPulse waits a configurable delay (default 2 hours) then sends a personalised SMS to the customer. All messaging is branded with your client's business name.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes — all plans include a 14-day free trial with no credit card required. You can test the full feature set including SMS sending, AI responses, and the dashboard. After 14 days you will be prompted to choose a plan.",
  },
  {
    question: "Does this work with Google, Yelp, and Tripadvisor?",
    answer:
      "ReviewPulse supports Google Business Profile, Yelp, TripAdvisor, Facebook, and Houzz. You connect your listings during onboarding, and we pull in all reviews to a single unified dashboard. Review request links are generated for whichever platforms matter most to your clients.",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "James Whitfield",
    title: "Founder",
    company: "Whitfield Digital Agency",
    initials: "JW",
    quote:
      "ReviewPulse added a recurring revenue line to our agency within the first month. The white-label setup was seamless — clients think it is our own product.",
  },
  {
    name: "Rachel Osei",
    title: "Head of Client Success",
    company: "Apex Growth Partners",
    initials: "RO",
    quote:
      "We manage 47 client locations through a single dashboard. The AI responses alone save our team hours every week. It is genuinely impressive technology.",
  },
  {
    name: "Tom Barker",
    title: "Managing Director",
    company: "Barker & Co. Marketing",
    initials: "TB",
    quote:
      "The platform looks completely bespoke to our brand. Our clients have no idea it is ReviewPulse under the hood, and the results speak for themselves.",
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "£79",
    period: "/mo",
    description: "For agencies onboarding their first review management clients.",
    popular: false,
    features: [
      "Up to 5 client locations",
      "500 SMS per month",
      "AI response drafting",
      "Basic analytics dashboard",
      "Google and Yelp integration",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "£149",
    period: "/mo",
    description: "For growing agencies scaling their review management offering.",
    popular: false,
    features: [
      "Up to 20 client locations",
      "2,000 SMS per month",
      "AI response drafting",
      "Competitor tracking",
      "Advanced analytics",
      "Priority support",
      "Zapier and CRM integrations",
    ],
  },
  {
    name: "Agency",
    price: "£349",
    period: "/mo",
    description: "For established agencies running review management at scale.",
    popular: true,
    features: [
      "Unlimited client locations",
      "Unlimited SMS",
      "Full white-label dashboard",
      "Full API access",
      "Bulk campaign tools",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
];

const features = [
  {
    id: "01",
    Icon: FilterIcon,
    accentClass: "text-emerald-400",
    badgeClass: "bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800",
    title: "Smart Review Filtering",
    description:
      "Happy customers are guided to leave public reviews. Unhappy customers go to a private feedback form — so you resolve issues before they appear on Google.",
    bullets: [
      "4–5 star customers directed to Google, Yelp, or TripAdvisor",
      "1–3 star customers routed to a private resolution form",
      "Instant alert when negative feedback is captured",
    ],
    bulletAccent: "text-emerald-400",
    mockup: (
      <div className="rounded-xl bg-slate-900 border border-slate-700/60 p-6 shadow-xl">
        <p className="text-xs font-medium text-slate-400 tracking-wide uppercase mb-5">Rating capture</p>
        <div className="mb-5">
          <p className="text-sm text-slate-300 mb-3">How was your experience today?</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-8 w-8 rounded-md flex items-center justify-center ${s >= 4 ? "bg-amber-400/20 border border-amber-400/40" : "bg-slate-800 border border-slate-700"}`}
              >
                <StarIcon className={`h-4 w-4 ${s >= 4 ? "text-amber-400" : "text-slate-600"}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 rounded-lg bg-emerald-950/60 border border-emerald-800/50 px-4 py-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-300">4–5 stars</p>
              <p className="text-xs text-slate-400 mt-0.5">Directed to public review platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 border border-slate-700/50 px-4 py-3">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400">1–3 stars</p>
              <p className="text-xs text-slate-500 mt-0.5">Routed to private feedback form</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "02",
    Icon: SparkleIcon,
    accentClass: "text-violet-400",
    badgeClass: "bg-violet-950 text-violet-400 ring-1 ring-violet-800",
    title: "AI Response Drafting",
    description:
      "One click and Claude writes the perfect response — professional, personalised, and on-brand. Edit it, approve it, or let AutoRespond publish it automatically.",
    bullets: [
      "Responses tailored to each review's content and sentiment",
      "Match your client's brand voice with custom style guidelines",
      "AutoRespond publishes instantly with zero manual action",
    ],
    bulletAccent: "text-violet-400",
    mockup: (
      <div className="rounded-xl bg-slate-900 border border-slate-700/60 p-6 shadow-xl">
        <div className="rounded-lg bg-slate-800 border border-slate-700/60 p-4 mb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-7 w-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-[10px] font-bold">JM</div>
            <div>
              <p className="text-xs font-semibold text-slate-200">John M.</p>
              <div className="flex gap-0.5 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-2.5 w-2.5 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            "Came out same day, fixed the problem fast. Best HVAC company in the city."
          </p>
        </div>
        <div className="rounded-lg bg-violet-950/50 border border-violet-800/40 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">AI Draft</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Thank you so much, John! We are glad we could help quickly — that is exactly what we strive for. We appreciate you taking the time to share this.
          </p>
          <div className="flex gap-2 mt-3.5">
            <button className="flex-1 rounded-md bg-violet-600 py-1.5 text-[11px] font-semibold text-white">
              Publish
            </button>
            <button className="rounded-md border border-slate-600 px-3 py-1.5 text-[11px] font-medium text-slate-400">
              Edit
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "03",
    Icon: MessageIcon,
    accentClass: "text-sky-400",
    badgeClass: "bg-sky-950 text-sky-400 ring-1 ring-sky-800",
    title: "Automated SMS Campaigns",
    description:
      "Set it and forget it. Connect your clients' CRM or job software, define the timing, and ReviewPulse handles the rest — branded messages sent after every completed job.",
    bullets: [
      "Connects to 40+ CRMs and job management tools via Zapier",
      "Configurable send delay from 1 hour to 7 days post-job",
      "A/B test message variants to maximise response rates",
    ],
    bulletAccent: "text-sky-400",
    mockup: (
      <div className="rounded-xl bg-slate-900 border border-slate-700/60 p-6 shadow-xl">
        <p className="text-xs font-medium text-slate-400 tracking-wide uppercase mb-4">Campaign flow</p>
        <div className="space-y-2">
          {[
            { label: "Trigger", value: "Job marked complete", dot: "bg-sky-400" },
            { label: "Wait", value: "2 hours", dot: "bg-slate-500" },
            { label: "Send SMS", value: "Review request template", dot: "bg-sky-400" },
            { label: "If 4–5 stars", value: "Public review link", dot: "bg-emerald-400" },
            { label: "If 1–3 stars", value: "Private feedback form", dot: "bg-slate-500" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-800/60 border border-slate-700/50 px-3.5 py-2.5">
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${step.dot}`} />
              <div className="flex items-center justify-between w-full min-w-0">
                <p className="text-[11px] text-slate-500 shrink-0 mr-3">{step.label}</p>
                <p className="text-xs font-medium text-slate-300 text-right truncate">{step.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "04",
    Icon: LayersIcon,
    accentClass: "text-amber-400",
    badgeClass: "bg-amber-950 text-amber-400 ring-1 ring-amber-800",
    title: "White-Label Dashboard",
    description:
      "Deploy ReviewPulse under your own brand. Your logo, your colours, your domain. Clients see a seamless extension of your agency — not a third-party tool.",
    bullets: [
      "Full custom branding with your logo, colours, and domain",
      "Client-facing portal with configurable permission levels",
      "Portfolio view across all client locations and platforms",
    ],
    bulletAccent: "text-amber-400",
    mockup: (
      <div className="rounded-xl bg-slate-900 border border-slate-700/60 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Client locations</p>
          <div className="h-5 w-16 rounded bg-slate-700/60" />
        </div>
        <div className="space-y-2">
          {[
            { name: "Manchester", rating: "4.9", reviews: "312", up: true },
            { name: "Birmingham", rating: "4.7", reviews: "198", up: true },
            { name: "Leeds", rating: "4.5", reviews: "145", up: null },
            { name: "Bristol", rating: "4.2", reviews: "89", up: false },
          ].map((loc) => (
            <div key={loc.name} className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-slate-700/50 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-[10px] font-bold">
                  {loc.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{loc.name}</p>
                  <p className="text-[10px] text-slate-500">{loc.reviews} reviews</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-3 w-3 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">{loc.rating}</span>
                </div>
                <span className={`text-[10px] font-bold ${loc.up === true ? "text-emerald-400" : loc.up === false ? "text-red-400" : "text-slate-500"}`}>
                  {loc.up === true ? "+" : loc.up === false ? "-" : "~"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ─── FAQ Item Component ───────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-slate-200 hover:text-white transition-colors group"
      >
        <span>{question}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300 transition-all duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 text-slate-400 text-sm leading-relaxed pr-8">{answer}</div>
      )}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="bg-white text-gray-900 font-sans antialiased">

      {/* ─── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-semibold tracking-tight text-white">
              ReviewPulse
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#agencies" className="hover:text-white transition-colors">
              For Agencies
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
          </nav>
          <Link
            href="/signup"
            className="rounded-md bg-indigo-600 px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-slate-950 pt-24 pb-28 lg:pt-32 lg:pb-36"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        {/* Subtle glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-4 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
              <span className="h-1 w-1 rounded-full bg-indigo-400" />
              White-label review management for agencies
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
              The white-label review platform{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                agencies trust
              </span>
            </h1>

            <p className="mt-6 text-base text-slate-400 leading-relaxed max-w-2xl mx-auto sm:text-lg">
              Give your agency a new revenue stream. Automated SMS review requests, AI
              responses, and a fully branded dashboard your clients will love.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-950/50"
              >
                Start Free Trial
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
              >
                View Demo
              </a>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              14-day free trial. No credit card required.
            </p>
          </div>

          {/* Hero product mockup */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SMS preview card */}
              <div className="rounded-xl bg-slate-900 border border-slate-700/60 p-5 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="h-2 w-2 rounded-full bg-red-500/70" />
                  <div className="h-2 w-2 rounded-full bg-amber-500/70" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">SMS Preview</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-tl-md bg-slate-800 border border-slate-700/60 px-4 py-3 text-xs text-slate-300 max-w-xs leading-relaxed">
                    Hi Sarah — thanks for choosing{" "}
                    <span className="text-indigo-400 font-medium">Apex Plumbing</span>.
                    How was your experience today?
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full bg-emerald-900/60 border border-emerald-700/50 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-300">
                      Excellent
                    </button>
                    <button className="rounded-full bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-[11px] font-medium text-slate-400">
                      Could improve
                    </button>
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-indigo-700/30 border border-indigo-600/30 px-4 py-3 text-xs text-indigo-200 max-w-xs leading-relaxed">
                    Brilliant — would you mind leaving a quick Google review? It only takes 30 seconds.
                  </div>
                  <div className="rounded-lg bg-slate-800 border border-slate-700/60 px-4 py-2.5 text-xs font-medium text-indigo-400 max-w-xs flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                    Leave a Google Review
                    <ArrowRightIcon className="h-3 w-3 ml-auto" />
                  </div>
                </div>
              </div>

              {/* Review captured card */}
              <div className="rounded-xl bg-slate-900 border border-slate-700/60 p-5 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                    G
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 text-xs">Google Review</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-3 w-3 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-[10px] text-slate-500">2 min ago</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "Absolutely outstanding service. The team were professional, on time,
                  and the work was immaculate. Would not hesitate to recommend."
                </p>
                <p className="mt-2 text-[11px] text-slate-500">— Sarah K.</p>
                <div className="mt-4 rounded-lg bg-emerald-950/60 border border-emerald-800/40 px-3.5 py-2.5 flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium text-emerald-300">
                    Review captured — AI response drafted
                  </span>
                </div>
                <div className="mt-2 rounded-lg bg-slate-800/60 border border-slate-700/40 px-3.5 py-2.5">
                  <p className="text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-wider">AI Response</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Thank you so much, Sarah! We are delighted to hear you had such a
                    positive experience...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGO BAR / TRUST ────────────────────────────────────────────────── */}
      <section className="bg-slate-950 border-t border-slate-800/50 py-10">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-center text-[11px] text-slate-600 font-semibold uppercase tracking-widest mb-8">
            Trusted by agencies across the UK
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-40">
            {["Whitfield Digital", "Apex Growth", "Barker & Co.", "Northstar Media", "Vanta Agency"].map((name) => (
              <span key={name} className="text-sm font-semibold text-slate-300 tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
              Platform
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Four capabilities. One coherent platform.
            </h2>
            <p className="mt-4 text-slate-500 text-base leading-relaxed">
              Built for agencies that want to deliver exceptional results for their
              clients without adding complexity to their operations.
            </p>
          </div>

          <div className="space-y-28">
            {features.map((feature, idx) => (
              <div
                key={feature.id}
                className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
              >
                <div className={idx % 2 !== 0 ? "lg:order-2" : ""}>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-5 ${feature.badgeClass}`}>
                    Feature {feature.id}
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-base leading-relaxed mb-7">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <CheckIcon className={`h-4 w-4 shrink-0 mt-0.5 ${feature.bulletAccent}`} />
                        <span className="text-slate-600 text-sm">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={idx % 2 !== 0 ? "lg:order-1" : ""}>
                  {feature.mockup}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR AGENCIES ────────────────────────────────────────────────────── */}
      <section id="agencies" className="py-24 bg-slate-950" style={{
        backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
                For Agencies
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-6">
                A new revenue stream with zero additional headcount
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                White-label ReviewPulse under your own brand and resell it as a
                proprietary product. Set your own margin, own the client relationship,
                and deliver measurable results — without building anything yourself.
              </p>
              <ul className="space-y-4">
                {[
                  "Deploy your branded dashboard in under 30 minutes",
                  "Your logo, your domain, your pricing — fully yours",
                  "Dedicated agency onboarding and account management",
                  "Volume discounts as your client base grows",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Talk to our agency team
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Average agency margin", value: "60–80%", sub: "on resold subscriptions" },
                { label: "Setup time", value: "< 30 min", sub: "from signup to live" },
                { label: "Client retention", value: "High", sub: "sticky, recurring revenue" },
                { label: "Support model", value: "Dedicated", sub: "agency account manager" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-slate-900 border border-slate-700/60 p-5">
                  <p className="text-2xl font-extrabold text-white mb-1">{stat.value}</p>
                  <p className="text-[11px] font-semibold text-slate-300 mb-0.5">{stat.label}</p>
                  <p className="text-[11px] text-slate-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              What agency founders say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm flex flex-col"
              >
                <div className="flex gap-0.5 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-3.5 w-3.5 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">
                      {t.title}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-slate-500 text-base">
              Every plan includes a 14-day free trial. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.popular
                    ? "bg-slate-950 border border-indigo-500/40 shadow-2xl shadow-indigo-950/30 ring-1 ring-indigo-500/20"
                    : "bg-white border border-slate-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg shadow-indigo-900/40">
                    Most Popular
                  </div>
                )}
                <div className="mb-7">
                  <h3
                    className={`text-sm font-semibold tracking-tight ${
                      plan.popular ? "text-slate-200" : "text-slate-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span
                      className={`text-4xl font-extrabold tracking-tight ${
                        plan.popular ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.popular ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`mt-2.5 text-xs leading-relaxed ${
                      plan.popular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon
                        className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                          plan.popular ? "text-indigo-400" : "text-indigo-500"
                        }`}
                      />
                      <span
                        className={`text-xs leading-relaxed ${
                          plan.popular ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">
            All prices exclude VAT. Annual billing available at a 20% discount.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-950" style={{
        backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}>
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-700/60 px-8 shadow-xl">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-2xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Ready to add review management to your agency?
          </h2>
          <p className="text-slate-500 text-base mb-10 leading-relaxed">
            Start your free trial today. No credit card required, no long-term
            commitment. Set up your branded dashboard in under 30 minutes.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              if (email)
                window.location.href = `/signup?email=${encodeURIComponent(email)}`;
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your work email"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors whitespace-nowrap"
            >
              Get Started Free
            </button>
          </form>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-800/60 text-slate-500 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <LogoMark className="h-5 w-5 text-indigo-400" />
                <span className="text-white font-semibold text-sm tracking-tight">ReviewPulse</span>
              </div>
              <p className="text-xs leading-relaxed">
                White-label review management for digital agencies. Powered by AI.
                Built for scale.
              </p>
            </div>
            <div>
              <h4 className="text-slate-300 font-semibold text-xs mb-5 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-300 font-semibold text-xs mb-5 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-300 font-semibold text-xs mb-5 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">
              {new Date().getFullYear()} ReviewPulse Ltd. All rights reserved. Registered in England and Wales.
            </p>
            <p className="text-xs">Made for agencies who want to grow.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
