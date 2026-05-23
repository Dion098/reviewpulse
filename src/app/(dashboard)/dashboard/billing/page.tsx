import { redirect } from "next/navigation";
import { Check, ExternalLink, Zap, Building2, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

interface PlanDef {
  id: Plan;
  name: string;
  price: string;
  period: string;
  description: string;
  smsLimit: number;
  features: string[];
  priceId: string;
  icon: React.ElementType;
  highlighted: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with the basics",
    smsLimit: 50,
    priceId: "",
    icon: Zap,
    highlighted: false,
    features: [
      "1 location",
      "50 SMS / month",
      "AI response drafts",
      "Review dashboard",
      "Email support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For growing local businesses",
    smsLimit: 500,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? "price_starter",
    icon: Building2,
    highlighted: false,
    features: [
      "3 locations",
      "500 SMS / month",
      "AI response drafts",
      "Campaign automation",
      "CSV contact import",
      "Priority email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$99",
    period: "/month",
    description: "For serious reputation management",
    smsLimit: 2000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH ?? "price_growth",
    icon: Rocket,
    highlighted: true,
    features: [
      "10 locations",
      "2,000 SMS / month",
      "AI response drafts",
      "Campaign automation",
      "CSV contact import",
      "Google review sync",
      "Weekly email digest",
      "Priority support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$249",
    period: "/month",
    description: "Manage multiple clients",
    smsLimit: 10000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY ?? "price_agency",
    icon: Building2,
    highlighted: false,
    features: [
      "Unlimited locations",
      "10,000 SMS / month",
      "All Growth features",
      "Team member access",
      "White-label reports",
      "Dedicated account manager",
    ],
  },
];

async function BillingContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  const currentPlan = (org?.plan ?? "free") as Plan;
  const smsUsed = org?.sms_count_month ?? 0;
  const smsLimit = org?.sms_limit_month ?? 50;
  const smsPercent = Math.min(100, Math.round((smsUsed / Math.max(smsLimit, 1)) * 100));

  const currentPlanDef = PLANS.find((p) => p.id === currentPlan) ?? PLANS[0];
  const isOnPaidPlan = currentPlan !== "free";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">

      {/* Current Plan Card */}
      <Card
        className={cn(
          "border-2",
          isOnPaidPlan ? "border-indigo-500" : "border-slate-200"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">
                  {currentPlanDef.name} Plan
                </CardTitle>
                <Badge variant={isOnPaidPlan ? "default" : "secondary"}>
                  Current
                </Badge>
              </div>
              <CardDescription>{currentPlanDef.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {currentPlanDef.price}
                <span className="text-sm font-normal text-slate-500">
                  {currentPlanDef.period}
                </span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SMS Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">SMS used this month</span>
              <span className="font-medium text-slate-900">
                {smsUsed.toLocaleString()} / {smsLimit.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  smsPercent >= 90
                    ? "bg-red-500"
                    : smsPercent >= 70
                    ? "bg-yellow-500"
                    : "bg-indigo-600"
                )}
                style={{ width: `${smsPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {smsLimit - smsUsed > 0
                ? `${(smsLimit - smsUsed).toLocaleString()} SMS remaining this month`
                : "SMS limit reached — upgrade for more"}
            </p>
          </div>

          <Separator />

          <div className="flex items-center gap-3 flex-wrap">
            {isOnPaidPlan ? (
              <ManageBillingButton />
            ) : (
              <UpgradeButton priceId={PLANS[1].priceId} label="Upgrade to Starter" />
            )}
            <a
              href="https://dashboard.stripe.com/invoices"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <ExternalLink className="h-4 w-4" />
              View invoices in Stripe
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison Table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Compare Plans
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            const isDowngrade =
              PLANS.findIndex((p) => p.id === plan.id) <
              PLANS.findIndex((p) => p.id === currentPlan);

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-xl border p-5 flex flex-col",
                  plan.highlighted
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white",
                  isCurrent && "ring-2 ring-indigo-400"
                )}
              >
                {plan.highlighted && (
                  <div className="mb-2">
                    <Badge variant="default" className="text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      plan.highlighted ? "text-indigo-600" : "text-slate-500"
                    )}
                  />
                  <span className="font-semibold text-slate-900">
                    {plan.name}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{plan.description}</p>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <div className="rounded-md bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-600">
                      Current Plan
                    </div>
                  ) : isDowngrade ? (
                    <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-center text-xs text-slate-400">
                      Downgrade via support
                    </div>
                  ) : (
                    <UpgradeButton
                      priceId={plan.priceId}
                      label={`Upgrade to ${plan.name}`}
                      variant={plan.highlighted ? "default" : "outline"}
                      small
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Client components for Stripe redirects

function UpgradeButton({
  priceId,
  label,
  variant = "default",
  small = false,
}: {
  priceId: string;
  label: string;
  variant?: "default" | "outline";
  small?: boolean;
}) {
  return (
    <form action="/api/billing/checkout" method="POST">
      <input type="hidden" name="priceId" value={priceId} />
      <Button
        type="submit"
        variant={variant}
        size={small ? "sm" : "default"}
        className="w-full"
      >
        {label}
      </Button>
    </form>
  );
}

function ManageBillingButton() {
  return (
    <form action="/api/billing/portal" method="POST">
      <Button type="submit" variant="outline">
        Manage Billing
      </Button>
    </form>
  );
}

export default async function BillingPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Billing" />
      <BillingContent />
    </div>
  );
}
