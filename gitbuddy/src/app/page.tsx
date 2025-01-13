"use client";
import { GitBranch, FileSearch, MessageSquare, Users, Clock, Zap, Shield, Brain, Upload, ArrowRight, Icon, Bot, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


const features = [
  {
    title: 'Git Repository Analysis',
    description: 'Deep insights into your codebase through commit history analysis and smart summaries.',
    icon: GitBranch,
  },
  {
    title: 'Meeting Intelligence',
    description: 'Upload meeting recordings for AI-powered summaries, action items, and key highlights.',
    icon: MessageSquare,
  },
  {
    title: 'Team Collaboration',
    description: 'Invite team members to collaborate and share insights across your organization.',
    icon: Users,
  },
  {
    title: 'Smart Search',
    description: 'Quickly find information across commits, code, and meeting summaries using RAG technology.',
    icon: FileSearch,
  },
];

const steps = [
  {
    title: 'Connect Repository',
    description: 'Simply paste your Git repository URL to get started.',
    icon: GitBranch,
  },
  {
    title: 'AI Analysis',
    description: 'Our AI analyzes commits, code changes, and uploaded meetings.',
    icon: Brain,
  },
  {
    title: 'Get Insights',
    description: 'Access detailed summaries, chat with your data, and share with your team.',
    icon: Zap,
  },
];

const testimonials = [
  {
    quote: "This tool has revolutionized how we understand our codebase history and track project progress through meetings.",
    author: "Sarah Chen",
    role: "Engineering Lead, TechCorp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    quote: "The meeting summaries save us hours of note-taking and help us never miss important decisions.",
    author: "Michael Rodriguez",
    role: "Product Manager, DevFlow",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
];

const faqs = [
  {
    question: 'How does the credit system work?',
    answer: 'You start with free credits to analyze repositories. Once exhausted, you can purchase additional credits based on your usage needs. You need one credit per file to analysis.',
  },
  {
    question: 'What types of repositories can I analyze?',
    answer: 'We support public and private repositories from major platforms like GitHub, GitLab, and Bitbucket. Simply provide the repository URL and necessary access credentials.',
  },
  {
    question: 'What meeting file formats are supported?',
    answer: 'We support most common audio  formats including MP3, MP4, WAV, and m4a. Transcripts in TXT or PDF format are also accepted.',
  },
  {
    question: 'How does team collaboration work?',
    answer: 'You can invite team members via Link . They will have access to repository insights and meeting summaries based on their assigned permissions.',
  },
];

export default function Home() {
  return (
    <div id='hero_section' className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 animate-fade-in">
              Understand Your Code & Meetings with GitBuddy
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform your Git repositories and meetings into actionable insights with our AI-powered analysis platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/create" className="inline-flex items-center px-8 py-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                Analyze Repository
                <GitBranch className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/meetings" className="inline-flex items-center px-8 py-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Upload Meeting
                <Upload className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/qa" className="inline-flex items-center px-8 py-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Ask QnA 
                <Bot className=" ml-3 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features1' className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to understand your code and meetings
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id='works'  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get started in three simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <ArrowRight className="absolute top-1/2 -right-4 w-8 h-8 text-gray-300 dark:text-gray-600 hidden md:block" />
              )}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id='pricing' className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Start free, upgrade as you grow
          </p>
        </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Free Tier</h3>
                <p className="text-4xl font-bold mb-6">200 <span className="text-lg text-gray-600">credits</span></p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-600 mr-2" />
                    <span>No limit on Repo's</span>
                  </li>
                  <li className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
                    <span>No limit on meeting Analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                    <span>Multiple team member</span>
                  </li>
                  <li className="flex items-center">
                   <div className='h-6'></div>
                  </li>
                </ul>
                <Link href="/sign-up" className="block text-center py-3 px-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  Get Started Free
                </Link>
                
              </div>
              
          
          {/* Add Pro and Enterprise pricing tiers here */}
            <div className="grid md gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Premium Tier</h3>
              <p className="text-4xl font-bold mb-6">Pay as you go</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                    <span>0.2 for 10 credits </span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-600 mr-2" />
                    <span>No limit on Repo's</span>
                  </li>
                  <li className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
                    <span>No limit on meeting Analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                    <span>Multiple team member</span>
                  </li>
                </ul>
                <Link href="/billing" className="block text-center py-3 px-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  Lets know the Insights
                </Link>
            </div>

        </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id='Blog' className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Trusted by developers and teams worldwide
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <Image
                  src={testimonial.image}
                  alt={`${testimonial.author}'s testimonial`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-lg italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Got questions? We've got answers
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              <summary className="flex justify-between items-center cursor-pointer p-6">
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <MessageSquare className="h-5 w-5 text-purple-500 transform group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6">
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-gray-800 dark:to-purple-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">Ready to Understand Your Code Better?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start analyzing your repositories and meetings today with free credits
            </p>
            <Link href="/sign-up" className="inline-flex items-center px-8 py-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">GitInsights AI</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Understanding code and meetings through AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features1" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">Pricing</Link></li>
                <li><Link href="#works" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li className="text-gray-600 dark:text-gray-300 hover:text-purple-500">About</li>
                <li> <Link href ="#Blog" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">Blog </Link></li>
                <li className="text-gray-600 dark:text-gray-300 hover:text-purple-500">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li className="text-gray-600 dark:text-gray-300 hover:text-purple-500">Privacy Policy</li>
                <li className="text-gray-600 dark:text-gray-300 hover:text-purple-500">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-300">
            <p>© 2024 GitInsights AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}




