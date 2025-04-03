"use client";

import { Pricing } from "@/components/pricing";

const demoPlans = [
  {
    name: "STARTER",
    price: "29",
    yearlyPrice: "23",
    period: "per month",
    features: [
      "Up to 5 repositories",
      "Basic commit analysis",
      "48-hour support response time",
      "Community support",
      "Limited AI chatbot access",
    ],
    description: "Perfect for individual developers and small projects",
    buttonText: "Start Free Trial",
    href: "/create",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "79",
    yearlyPrice: "63",
    period: "per month",
    features: [
      "Unlimited repositories",
      "Advanced commit and code analytics",
      "24-hour support response time",
      "Full AI chatbot access",
      "Team collaboration tools",
      "Meeting audio analysis",
      "Priority support",
    ],
    description: "Ideal for growing teams and collaborative projects",
    buttonText: "Get Started",
    href: "/create",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "199",
    yearlyPrice: "159",
    period: "per month",
    features: [
      "Everything in Professional",
      "Custom analytics dashboards",
      "Dedicated account manager",
      "1-hour support response time",
      "SSO authentication",
      "Advanced security features",
      "Custom integrations",
      "SLA agreement",
    ],
    description: "For large organizations with specific needs",
    buttonText: "Contact Sales",
    href: "/create",
    isPopular: false,
  },
];

export default function PricingBasic() {
  return (
    <div className="h-[800px] overflow-y-auto rounded-lg bg-orange-50/80 dark:bg-orange-900/20">
      <Pricing
        plans={demoPlans}
        title="Flexible Pricing for Every Developer"
        description="Choose a plan that fits your needs.\nAll plans include access to AI-powered Git analysis, collaboration tools, and dedicated support."
      />
    </div>
  );
}