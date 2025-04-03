"use client"

import type React from "react"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  className?: string
  children: React.ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>{children}</div>
}

interface BentoCardProps {
  Icon: React.ComponentType<{ className?: string }>
  name: string
  description: string
  href: string
  cta: string
  background?: React.ReactNode
  className?: string
}

export function BentoCard({ Icon, name, description, href, cta, background, className }: BentoCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 },
      }}
    >
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          </motion.div>
          <motion.div initial={{ x: 10, opacity: 0 }} whileHover={{ x: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
            <Link
              href={href}
              className="text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
            >
              {cta} →
            </Link>
          </motion.div>
        </div>
        <h3 className="mb-2 font-bold text-xl text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {background}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
    </motion.div>
  )
}

