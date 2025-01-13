"use client";
import { Bot, Upload, Code, Settings, ArrowRight, MessageSquare, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    title: 'AI-Powered Insights',
    description: 'Leverage advanced AI to gain valuable insights from your data.',
    icon: Bot,
  },
  {
    title: 'Easy Data Integration',
    description: 'Seamlessly connect and analyze data from multiple sources.',
    icon: Upload,
  },
  {
    title: 'Customizable Dashboards',
    description: 'Create personalized dashboards tailored to your specific needs.',
    icon: Settings,
  },
  {
    title: 'API Access',
    description: 'Integrate our powerful analytics into your own applications.',
    icon: Code,
  },
];

const steps = [
  {
    title: 'Connect Data',
    description: 'Link your data sources with our secure integration tools.',
    icon: Upload,
  },
  {
    title: 'Analyze',
    description: 'Let our AI process and analyze your data for insights.',
    icon: Bot,
  },
  {
    title: 'Visualize',
    description: 'Create stunning visualizations and interactive dashboards.',
    icon: Globe,
  },
];

const testimonials = [
  {
    quote: "The chatbot has transformed our customer support. It handles 80% of queries automatically!",
    author: "Sarah Chen",
    role: "Head of Support, TechCorp",
    // image: "https://sjc.microlink.io/aNwFed5cCIHPW8g3r-uI5BblPDBy1GrrdC_GCxsGGSrNs5ykj86E1Q_BuaAOF0Ch5hTDlCP2DO0niKSr25uVcQ.jpeg",
  },
  {
    quote: "Setup was incredibly easy. Our documentation is now interactive and accessible 24/7.",
    author: "Michael Rodriguez",
    role: "CTO, DevFlow",
    image: "/placeholder.svg?height=400&width=400",
  },
];

const faqs = [
  {
    question: 'How secure is my data on your platform?',
    answer: 'We use industry-standard encryption and security protocols to ensure your data is always protected. We are also compliant with major data protection regulations.',
  },
  {
    question: 'Can I integrate your platform with my existing tools?',
    answer: 'Yes! We offer a wide range of integrations with popular tools and platforms. Our API also allows for custom integrations if needed.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We provide 24/7 customer support via chat and email. Our enterprise plans also include dedicated support managers.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes, we offer a 14-day free trial on all our plans. No credit card required to start your trial.',
  },
];

export default function Home() {
  return (
    <div className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 animate-fade-in">
              Unlock the Power of Your Data
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform raw data into actionable insights with our AI-powered analytics platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/demo" className="btn-primary text-lg px-8 py-4">
                Get Started
              </Link>
              <Link href="/features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to make data-driven decisions
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get started with our platform in three simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <ArrowRight className="absolute top-1/2 -right-4 w-8 h-8 text-gray-300 dark:text-gray-600 hidden md:block" />
              )}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Trusted by data professionals worldwide
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
                  src={testimonial.image!}
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
                <MessageSquare className="h-5 w-5 text-blue-500 transform group-open:rotate-180 transition-transform" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-blue-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">Ready to Transform Your Data?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of companies using our platform to drive growth and innovation
            </p>
            <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-block">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">DataInsights AI</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Empowering businesses with AI-driven analytics
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Pricing</Link></li>
                <li><Link href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-300">
            <p>© 2024 DataInsights AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

