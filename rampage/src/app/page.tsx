"use client"

import { motion } from "framer-motion"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { HeroGeometric } from "@/components/elegant-shape"
import {
  GitBranchIcon,
  MessageSquareIcon,
  AudioLinesIcon,
  FolderKanbanIcon,
  UsersIcon,
  BrainCircuitIcon,
  CodeIcon,
  ClockIcon,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    Icon: GitBranchIcon,
    name: "Git Repository Analysis",
    description: "Analyze repositories, summarize commit history, and get quick project overviews.",
    href: "/features/git-analysis",
    cta: "Learn more",
    background: <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl" />,
    className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: AudioLinesIcon,
    name: "Meeting Audio Analysis",
    description: "Upload meeting recordings for AI-powered transcription and summarization.",
    href: "/features/audio-analysis",
    cta: "Learn more",
    background: <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent rounded-xl" />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
  {
    Icon: MessageSquareIcon,
    name: "AI Chatbot Assistance",
    description: "Get instant answers to project-related questions with our intelligent chatbot.",
    href: "/features/ai-chatbot",
    cta: "Learn more",
    background: <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-xl" />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: FolderKanbanIcon,
    name: "Multi-Project Management",
    description: "Manage multiple projects with organized summaries, analytics, and insights.",
    href: "/features/project-management",
    cta: "Learn more",
    background: <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 to-transparent rounded-xl" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: UsersIcon,
    name: "Collaborative Platform",
    description: "Invite teammates to collaborate on projects and share insights seamlessly.",
    href: "/features/collaboration",
    cta: "Learn more",
    background: <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: BrainCircuitIcon,
    name: "AI-Powered Insights",
    description: "Extract meaningful insights from your code, meetings, and project data.",
    href: "/features/ai-insights",
    cta: "Learn more",
    background: <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-xl" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroGeometric 
        badge="AI-Powered Collaboration"
        title1="Simplify Development"
        title2="Enhance Collaboration"
      />

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500">
                Key Features
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful tools to streamline your development workflow and enhance team collaboration
            </p>
          </motion.div>
          
          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500">
                How It Works
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A simple process to enhance your development workflow with AI-powered insights
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <CodeIcon className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Input Repository</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Provide a Git repository URL to analyze your codebase and commit history
              </p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <BrainCircuitIcon className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI analyzes your code, generates summaries, and prepares insights
              </p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ClockIcon className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Collaborate & Improve</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share insights with your team and use AI-powered suggestions to improve your project
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Development Workflow?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already using GitBuddy to streamline their projects and enhance collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"/create"}>
              <motion.button
                className="px-6 py-3 rounded-lg bg-white text-orange-600 font-medium hover:shadow-lg hover:shadow-white/20 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                >
                Get Started for Free
              </motion.button>
                  </Link>
              <motion.button
                className="px-6 py-3 rounded-lg bg-transparent border border-white text-white font-medium hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule a Demo
              </motion.button>
            </div>
            <p className="text-white/60 mt-6">No credit card required. Free plan available.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold text-white mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-400">
                  GitBuddy
                </span>
              </h3>
              <p className="mb-4">AI-Powered Collaboration and Analysis Tool for developers.</p>
              <div className="flex space-x-4">
                <Link href="#" className="hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} GitBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

