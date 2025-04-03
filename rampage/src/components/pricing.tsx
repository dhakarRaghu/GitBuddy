"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Flexible Pricing for Every Developer",
  description = "Choose a plan that fits your needs.\nAll plans include access to AI-powered Git analysis, collaboration tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  // const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#F97316", "#EC4899", "#6B7280", "#9CA3AF"], // Orange-pink palette to match CreateProject
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container py-24 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
      <div className="text-center space-y-4 mb-12">
        <h2 className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text text-5xl font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-light whitespace-pre-line max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
          Annual billing{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
            (Save 20%)
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              // isDesktop
              {
                y: plan.isPopular ? -20 : 0,
                opacity: 1,
                x: index === 2 ? -30 : index === 0 ? 30 : 0,
                scale: index === 0 || index === 2 ? 0.94 : 1.0,
              }
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4 + index * 0.2,
              opacity: { duration: 0.5 },
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
            className={cn(
              "rounded-xl border-[1px] p-6 bg-white dark:bg-gray-800/90 text-center lg:flex lg:flex-col lg:justify-center relative",
              plan.isPopular
                ? "border-orange-500 border-2" // Changed from emerald to orange
                : "border-gray-200 dark:border-gray-700",
              "flex flex-col",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2
                ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-pink-500 py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                <Star className="text-white h-4 w-4 fill-current" />
                <span className="text-white ml-1 font-sans font-semibold">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-400">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 gap-2 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-orange-500 mt-1 flex-shrink-0" /> {/* Changed from emerald to orange */}
                    <span className="text-left text-gray-700 dark:text-gray-300 font-light">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-4 border-gray-200 dark:border-gray-700" />

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-orange-500 hover:ring-offset-1 hover:bg-gradient-to-r from-orange-500 to-pink-500 hover:text-white",
                  plan.isPopular
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent" // Changed from emerald to gradient
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                )}
              >
                {plan.buttonText}
              </Link>
              <p className="mt-6 text-xs leading-5 text-gray-500 dark:text-gray-400 font-light">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}