"use client";

import { useState } from "react";
import Link from "next/link";

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

const faqs = [
  {
    question: "How does review filtering work?",
    answer:
      "After a job is complete, ReviewPulse sends your customer an SMS asking how their experience was. Customers who rate 4–5 stars are guided to leave a public Google review. Customers who rate 1–3 stars are directed to a private feedback form instead — so you hear about issues before they become public one-star reviews.",
  },
  {
    question: "Can I respond to reviews directly from ReviewPulse?",
    answer:
      "Yes. Our AI drafts a personalized response to every review using Claude. You can edit and approve it in one click, or let AutoRespond publish it automatically. We support Google Business Profile, Yelp, and TripAdvisor.",
  },
  {
    question: "How does the SMS automation work?",
    answer:
      "Connect your CRM, POS, or job management software via our integrations or Zapier. When a job is marked complete, ReviewPulse waits a configurable delay (default 2 hours) then sends a personalized SMS to the customer. All messaging is branded with your business name and fully compliant with TCPA regulations.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes — all plans include a 14-day free trial with no credit card required. You can test the full feature set including SMS sending, AI responses, and the dashboard. After 14 days you'll be prompted to choose a plan.",
  },
  {
    question: "Does this work with Google, Yelp, and Tripadvisor?",
    answer:
      "ReviewPulse supports Google Business Profile, Yelp, TripAdvisor, Facebook, and Houzz. You connect your listings during onboarding, and we pull in all your reviews to a single unified dashboard. Review request links are generated for whichever platforms matter most to your business.",
  },
];

const testimonials = [
  {
    name: "Maria G.",
    business: "Sunset Salon & Spa",
    initials: "MG",
    color: "bg-pink-500",
    quote:
      "We went from 4.1 to 4.8 stars in 90 days. Our phone won't stop ringing. ReviewPulse paid for itself in the first week.",
  },
  {
    name: "Derek T.",
    business: "Tri-State HVAC",
    initials: "DT",
    color: "bg-blue-500",
    quote:
      "I used to dread checking Google. Now I actually look forward to it. The AI responses are so good my customers think I wrote them myself.",
  },
  {
    name: "Sandra K.",
    business: "Clean Slate Cleaning Co.",
    initials: "SK",
    color: "bg-emerald-500",
    quote:
      "Managing 6 locations was a nightmare before ReviewPulse. Now I get a weekly digest and handle everything from one dashboard in under 20 minutes.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$99",
    period: "/mo",
    description: "Perfect for a single location getting started with reviews.",
    popular: false,
    features: [
      "1 location",
      "500 SMS per month",
      "AI response drafting",
      "Basic analytics dashboard",
      "Google & Yelp integration",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$199",
    period: "/mo",
    description: "For growing businesses that need more volume and insights.",
    popular: true,
    features: [
      "3 locations",
      "2,000 SMS per month",
      "AI response drafting",
      "Competitor tracking",
      "Advanced analytics",
      "Priority support",
      "Zapier & CRM integrations",
    ],
  },
  {
    name: "Agency",
    price: "$399",
    period: "/mo",
    description: "For agencies and enterprises managing many locations.",
    popular: false,
    features: [
      "Unlimited locations",
      "Unlimited SMS",
      "White-label dashboard",
      "Full API access",
      "Bulk campaign tools",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-medium text-gray-900 hover:text-indigo-600 transition-colors"
      >
        <span>{question}</span>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 text-gray-600 text-sm leading-relaxed">{answer}</div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* ───── NAVBAR ───── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <StarIcon className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold tracking-tight text-gray-900">
              ReviewPulse
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Login
            </Link>
          </nav>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 h-[600px] w-[600px] rounded-full bg-indigo-100 opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-purple-100 opacity-40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Trusted by 2,000+ local businesses
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-[1.05]">
              Turn Every Customer Into a{" "}
              <span className="text-indigo-600">5-Star Review</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              ReviewPulse automatically asks your customers for reviews after
              every job, filters the bad ones before they hit Google, and drafts
              AI responses — so you look amazing online without lifting a finger.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Start 14-Day Free Trial
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto rounded-xl border border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                See How It Works →
              </a>
            </div>

            {/* Social proof avatars */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {(
                  [
                    ["bg-pink-400", "M"],
                    ["bg-blue-400", "D"],
                    ["bg-amber-400", "S"],
                    ["bg-emerald-400", "J"],
                    ["bg-purple-400", "K"],
                  ] as [string, string][]
                ).map(([color, initial], i) => (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white`}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-500">Trusted by 2,000+ businesses</p>
              </div>
            </div>
          </div>

          {/* Hero mockup */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMS mockup */}
              <div className="rounded-2xl bg-gray-900 p-6 shadow-2xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400 font-mono">SMS Preview</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-tl-sm bg-gray-700 px-4 py-3 text-sm text-gray-100 max-w-xs">
                    Hi Sarah! Thanks for choosing{" "}
                    <span className="text-indigo-400 font-medium">Sunset Salon</span> today
                    ✨ How was your experience?
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">
                      😊 Great!
                    </button>
                    <button className="rounded-full bg-gray-600 px-4 py-2 text-xs font-semibold text-gray-200">
                      Could be better
                    </button>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-indigo-600 px-4 py-3 text-sm text-white max-w-xs">
                    Awesome! Mind leaving us a quick Google review? It means the world to
                    us 🙏
                  </div>
                  <div className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-indigo-600 max-w-xs flex items-center gap-2">
                    <span className="text-lg">⭐</span> Leave a Google Review →
                  </div>
                </div>
              </div>

              {/* Review result mockup */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    G
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Google Review</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-3.5 w-3.5 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  "Absolutely love Sunset Salon! Maria always knows exactly what I want.
                  The atmosphere is so relaxing and the results are always perfect. 10/10
                  would recommend!"
                </p>
                <p className="mt-3 text-xs text-gray-400">— Sarah K. · 2 min ago</p>
                <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
                  <span className="text-emerald-600 text-base">✓</span>
                  <span className="text-xs font-medium text-emerald-700">
                    Review captured & AI response drafted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── PROBLEM / SOLUTION ───── */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              The problem every local business faces
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                emoji: "😬",
                title: "Asking for reviews is awkward",
                body: "You just finished a great job, but asking the customer to leave a review feels pushy. So you don't ask — and you miss out on the social proof that drives new business.",
              },
              {
                emoji: "😰",
                title: "One bad review tanks your ranking",
                body: "A single unhappy customer can torpedo months of hard work. And once it's on Google, it's there forever — costing you clicks, calls, and customers.",
              },
              {
                emoji: "⏰",
                title: "Responding takes hours you don't have",
                body: "You know you should reply to every review, but crafting thoughtful responses for dozens of reviews every week is a full-time job on top of your actual job.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200"
              >
                <div className="text-4xl mb-4">{card.emoji}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold">
              ↓
            </div>
            <div className="rounded-2xl bg-indigo-600 text-white p-8 text-center max-w-2xl w-full shadow-xl shadow-indigo-200">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-2xl font-bold mb-2">ReviewPulse solves all three</h3>
              <p className="text-indigo-100 leading-relaxed">
                Automated SMS campaigns handle the asking. Smart filtering keeps bad
                reviews private. AI drafts every response in seconds. Set it up once,
                profit forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to dominate local search
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Four powerful features working together, so your reputation runs on
              autopilot.
            </p>
          </div>

          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 mb-4">
                  Feature 01
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Smart Review Filtering
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Happy customers go straight to Google. Unhappy customers go to a private
                  feedback form where you can make it right — before the damage is done.
                </p>
                <ul className="space-y-3">
                  {[
                    "4–5 star customers directed to Google, Yelp, or TripAdvisor",
                    "1–3 star customers sent to private feedback form",
                    "Instant alert when negative feedback is captured",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 border border-emerald-100 shadow-lg">
                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    How was your experience today?
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-10 w-10 cursor-pointer ${
                          star >= 4 ? "text-amber-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500 text-white p-4 text-center">
                    <p className="font-bold text-sm">⭐ Great experience!</p>
                    <p className="text-emerald-100 text-xs mt-1">
                      → Directed to Google Review page
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-100 p-4 text-center">
                    <p className="font-medium text-gray-700 text-sm">Could be better</p>
                    <p className="text-gray-400 text-xs mt-1">→ Private feedback form</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 mb-4">
                  Feature 02
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  AI Response Drafting
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  One click and our AI (powered by Claude) writes the perfect response —
                  professional, personalized, and on-brand. Edit it, approve it, or let
                  AutoRespond publish it automatically.
                </p>
                <ul className="space-y-3">
                  {[
                    "AI drafts responses tailored to each review's content",
                    "Match your brand voice with custom style guidelines",
                    "AutoRespond publishes instantly — no action needed",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:order-1 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 p-8 border border-purple-100 shadow-lg">
                <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-xs">
                      JM
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">John M.</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className="h-3 w-3 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    "Best HVAC company in the city! Came out same day, fixed the problem
                    fast, and didn't try to upsell me. Highly recommend."
                  </p>
                  <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-indigo-600 text-xs">✦</span>
                      <span className="text-xs font-semibold text-indigo-700">AI Draft</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Thank you so much, John! We're thrilled we could help quickly and
                      that you felt well taken care of — that's exactly what we strive for.
                      We appreciate the kind words!
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white">
                      Publish Response
                    </button>
                    <button className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
                  Feature 03
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Automated SMS Campaigns
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Set it and forget it. Connect your CRM or job software, define your
                  timing, and ReviewPulse handles the rest. Branded, TCPA-compliant
                  messages go out automatically after every completed job.
                </p>
                <ul className="space-y-3">
                  {[
                    "Connects to 40+ CRMs and job management tools",
                    "Configurable send delay (1 hour to 7 days post-job)",
                    "A/B test messages to maximize response rates",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-8 border border-blue-100 shadow-lg">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Campaign Builder
                  </p>
                  {[
                    { label: "Trigger", value: "Job marked complete", icon: "⚡" },
                    { label: "Wait", value: "2 hours", icon: "⏱" },
                    { label: "Send SMS", value: "Review request template A", icon: "💬" },
                    { label: "If 4–5 stars", value: "→ Google review link", icon: "⭐" },
                    { label: "If 1–3 stars", value: "→ Private feedback form", icon: "🔒" },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 p-3 shadow-sm"
                    >
                      <span className="text-lg w-8 text-center">{step.icon}</span>
                      <div>
                        <p className="text-xs text-gray-400">{step.label}</p>
                        <p className="text-sm font-medium text-gray-800">{step.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 mb-4">
                  Feature 04
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Multi-location Dashboard
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Manage 1 or 100 locations from a single command center. See review
                  volume, average rating, and response rate for every location at a glance.
                </p>
                <ul className="space-y-3">
                  {[
                    "Portfolio view across all locations and platforms",
                    "Leaderboard highlights top and bottom performers",
                    "Team roles and permissions per location",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:order-1 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-100 shadow-lg">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    All Locations
                  </p>
                  {[
                    { name: "Downtown", rating: 4.9, reviews: 312, trend: "↑" },
                    { name: "Westside", rating: 4.7, reviews: 198, trend: "↑" },
                    { name: "Airport", rating: 4.5, reviews: 145, trend: "→" },
                    { name: "Eastview", rating: 4.2, reviews: 89, trend: "↓" },
                  ].map((loc) => (
                    <div
                      key={loc.name}
                      className="flex items-center justify-between rounded-xl bg-white border border-gray-200 p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                          {loc.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                          <p className="text-xs text-gray-400">{loc.reviews} reviews</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-sm font-bold text-gray-900">
                            {loc.rating}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            loc.trend === "↑"
                              ? "text-emerald-500"
                              : loc.trend === "↓"
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        >
                          {loc.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF ───── */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Real results from real businesses
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Join 2,000+ local businesses that trust ReviewPulse to protect and grow
              their reputation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-base leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div
                    className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Every plan includes a 14-day free trial. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.popular
                    ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-amber-900">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className={`text-lg font-bold ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span
                      className={`text-4xl font-extrabold ${
                        plan.popular ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.popular ? "text-indigo-200" : "text-gray-500"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-sm ${
                      plan.popular ? "text-indigo-200" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          plan.popular ? "text-indigo-200" : "text-indigo-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-indigo-100" : "text-gray-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                    plan.popular
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="divide-y divide-gray-200 rounded-2xl bg-white border border-gray-200 px-8 shadow-sm">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA BANNER ───── */}
      <section className="py-24 bg-indigo-600">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Ready to dominate your local search?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Join 2,000+ businesses already using ReviewPulse. Start your free trial
            today — no credit card required.
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
              placeholder="Enter your email"
              className="flex-1 rounded-xl border-0 px-5 py-3.5 text-gray-900 placeholder-gray-400 shadow-sm ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-white text-sm outline-none"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap"
            >
              Get Started Free
            </button>
          </form>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <StarIcon className="h-6 w-6 text-indigo-400" />
                <span className="text-white font-bold text-lg">ReviewPulse</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered review management for local businesses. Turn customers into
                5-star advocates automatically.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} ReviewPulse, Inc. All rights reserved.
            </p>
            <p className="text-sm">Built with ❤️ for local business owners everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
