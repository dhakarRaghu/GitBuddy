"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Github, Chrome, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { motion } from "framer-motion"; // For animations

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: "/create", // Redirect after successful login
      });
    } catch (error) {
      console.error("OAuth sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="GitBuddy Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <Link
            href="/"
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-teal-500 transition-colors duration-200 hover:from-orange-600 hover:to-teal-600"
          >
            GitBuddy
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <ModeToggle />
          <Link
            href="/about"
            className="px-4 font-semibold text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-orange-500 dark:hover:text-teal-400"
          >
            About Us
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex w-full max-w-5xl items-center justify-between gap-8">
          {/* Left: Branding Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 flex flex-col items-start"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full"></div>
              <div className="w-8 h-2 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full"></div>
              <div className="w-4 h-2 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight transition-colors duration-200 hover:text-orange-500 dark:hover:text-teal-400">
              GitBuddy
            </h1>
            <h2 className="text-3xl md:text-4xl font-light text-gray-600 dark:text-gray-400 mt-2 transition-opacity duration-200 hover:opacity-90">
              Visualize and Analyze Your GitHub Repositories
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-teal-500 mt-4 mb-6 transition-all duration-200 hover:bg-orange-600"></div>
            <Link href="/">
              <Button
                variant="outline"
                className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-teal-500 hover:text-white font-semibold px-6 py-2 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Right: Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200 hover:text-orange-500 dark:hover:text-teal-400">
              Sign In to GitBuddy
            </h3>
            <div className="space-y-4">
              {/* GitHub */}
              <Button
                variant="outline"
                className="w-full bg-orange-500 dark:bg-teal-600 text-white border-orange-500 dark:border-teal-600 rounded-md transition-all duration-300 hover:bg-orange-600 dark:hover:bg-teal-500 hover:scale-105 hover:shadow-md disabled:opacity-70"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading}
                aria-label="Continue with GitHub"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin transition-transform duration-200" />
                ) : (
                  <Github className="mr-2 h-4 w-4 transition-transform duration-200 hover:scale-110" />
                )}
                Continue with GitHub
              </Button>

              {/* Google */}
              <Button
                variant="outline"
                className="w-full bg-orange-500 dark:bg-teal-600 text-white border-orange-500 dark:border-teal-600 rounded-md transition-all duration-300 hover:bg-orange-600 dark:hover:bg-teal-500 hover:scale-105 hover:shadow-md disabled:opacity-70"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
                aria-label="Continue with Google"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin transition-transform duration-200" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4 transition-transform duration-200 hover:scale-110" />
                )}
                Continue with Google
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="text-orange-500 dark:text-teal-400 transition-colors duration-200 hover:text-orange-600 dark:hover:text-teal-300"
              >
                Terms & Conditions
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex gap-4">
          <Link
            href="/terms"
            className="transition-colors duration-200 hover:text-orange-500 dark:hover:text-teal-400"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy"
            className="transition-colors duration-200 hover:text-orange-500 dark:hover:text-teal-400"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex gap-4">
          <Link
            href="https://www.linkedin.com/in/raghvendra1853/"
            className="transition-colors duration-200 hover:text-orange-500 dark:hover:text-teal-400"
          >
            LinkedIn
          </Link>
          <Link
            href="https://x.com/Raghvendra56595"
            className="transition-colors duration-200 hover:text-orange-500 dark:hover:text-teal-400"
          >
            Twitter
          </Link>
        </div>
      </footer>
    </div>
  );
}