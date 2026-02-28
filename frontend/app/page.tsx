"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  LayoutGrid,
  BrainCircuit,
  Search,
  ScanText,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-500" size={24} />
            <span className="text-lg font-bold tracking-tight">Libro</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          {/* Hero Gradient Background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />

          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              Welcome to Book <br className="hidden md:block" /> Management
              System!
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed">
              A professional, minimal platform to organize your collection and
              explore your personal library with AI-powered intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all bg-blue-600 text-white hover:bg-blue-500 h-11 px-8 active:scale-95 shadow-lg shadow-blue-600/20"
              >
                Get Started for Free
              </Link>
              <button className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-semibold border border-white/10 bg-transparent hover:bg-white/5 h-11 px-8 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">
                Powerful Features for Modern Readers
              </h2>
              <p className="text-neutral-400 text-lg">
                Everything you need to manage and interact with your personal
                library.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group relative rounded-lg border border-white/10 bg-[#121212] p-8 transition-all hover:bg-white/5 hover:border-blue-500/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <LayoutGrid size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Organize Collections
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Categorize your books by genre, author, or custom tags. Keep
                  your physical and digital shelves perfectly synchronized.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-lg border border-white/10 bg-[#121212] p-8 transition-all hover:bg-white/5 hover:border-blue-500/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <BrainCircuit size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  AI RAG System
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Leverage local Ollama integration to build a
                  Retrieval-Augmented Generation system that answers complex
                  questions based on your library.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-lg border border-white/10 bg-[#121212] p-8 transition-all hover:bg-white/5 hover:border-blue-500/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Search size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Universal Search
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Instant search across your entire database. Find any title,
                  ISBN, or author name in milliseconds with our optimized
                  engine.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group relative rounded-lg border border-white/10 bg-[#121212] p-8 transition-all hover:bg-white/5 hover:border-blue-500/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <ScanText size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  OCR PDF Processing
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Automatically convert scanned PDF images to searchable text
                  using Tesseract, creating a rich text base for your local AI
                  models.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group relative rounded-lg border border-white/10 bg-[#121212] p-8 transition-all hover:bg-white/5 hover:border-blue-500/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Detailed Analytics
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Gain insights into your reading habits and collection growth
                  over time with high-contrast data visualizations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white/5 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6 text-white">
              Ready to start your digital library?
            </h2>
            <p className="text-neutral-400 mb-10">
              Join readers and librarians who have transformed their collection
              management with AI intelligence.
            </p>
            <div className="flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all bg-white text-black hover:bg-neutral-200 h-12 px-10 active:scale-95"
              >
                Get Started Now
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-[#0a0a0a] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
          <div>© 2026 Libro Management System. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
