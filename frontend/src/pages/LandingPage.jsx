import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Upload,
  Search,
  Brain,
  Layers,
  FileCheck2,
  FileText,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Zap,
  Users,
  Database
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { documentService } from '../services/documentService';

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalChunks: 0,
    totalSubjects: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await documentService.getSystemStats();
        if (res?.data?.stats) {
          setStats(res.data.stats);
        }
      } catch {
        // Keep initial values
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-primary-50/40 via-white to-slate-50">
        {/* Decorative backdrop gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-primary-200/30 via-accent-100/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>P2P Resource Sharing + RAG Document Assistant</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Your Academic Knowledge,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              One Intelligent Hub.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Discover notes, PYQs and study resources shared by students — then use AI to understand your documents faster.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/resources">
              <Button size="lg" variant="primary" icon={ArrowRight} className="w-full sm:w-auto">
                Explore Resources
              </Button>
            </Link>
            <Link to="/upload">
              <Button size="lg" variant="outline" icon={Upload} className="w-full sm:w-auto bg-white/80">
                Upload a Resource
              </Button>
            </Link>
          </div>

          {/* Real Statistics Strip */}
          <div className="grid grid-cols-3 max-w-2xl mx-auto mb-16 divide-x divide-slate-200 border-y border-slate-200/80 py-4 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalDocuments}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Resources Shared</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-600">{stats.totalSubjects}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Academic Subjects</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalChunks}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Indexed Chunks</p>
            </div>
          </div>

          {/* Realistic Product Preview Visual (PDF viewer on left, AI assistant on right) */}
          <div className="relative max-w-5xl mx-auto rounded-3xl bg-slate-950 p-2 sm:p-4 shadow-2xl shadow-primary-900/10 border border-slate-800 text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">
                  academic-knowledge-hub.edu / documents / dbms-normalization.pdf
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono">
                  ● Vector Search Active
                </span>
              </div>
            </div>

            {/* Split Screen Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3">
              {/* Left: PDF Viewer mockup */}
              <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-xs mb-4">
                    <span className="font-semibold text-slate-200">Database Management Systems — Chapter 4</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px]">Page 12 of 48</span>
                  </div>

                  <div className="space-y-3 font-serif text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <h4 className="font-sans font-bold text-white text-base">4.3 Third Normal Form (3NF) & Dependencies</h4>
                    <p className="bg-primary-950/40 p-2.5 rounded-lg border-l-2 border-primary-500 text-primary-200 text-xs">
                      [Highlighted Source Section]: A relation schema R is in Third Normal Form (3NF) if, for every functional dependency X → A that holds over R, either X is a superkey of R, or A is a prime attribute (member of some candidate key).
                    </p>
                    <p className="text-slate-400 text-xs">
                      Normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity. It decomposes tables to eliminate update anomalies.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Zoom: 100%</span>
                  <span>Extracted with page-aware chunking</span>
                </div>
              </div>

              {/* Right: AI Assistant mockup */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-accent-600 to-primary-600 flex items-center justify-center text-white">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Gemini Academic Assistant</span>
                    </div>
                    <span className="text-[10px] bg-accent-50 text-accent-700 px-2 py-0.5 rounded-full font-semibold border border-accent-200">
                      RAG Verified
                    </span>
                  </div>

                  {/* Question */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Student Question</p>
                    <p className="text-xs font-medium text-slate-900">
                      &ldquo;Explain normalization in simple terms.&rdquo;
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500">AI Response (Grounded in PDF)</p>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      Normalization is the process of organizing data in a database to eliminate anomalies and reduce redundancy. In simple terms, it divides large tables into smaller, well-structured tables while preserving relationships.
                    </p>
                  </div>

                  {/* Sources */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Retrieved Sources
                    </p>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                        <Bookmark className="w-3 h-3 text-primary-500" />
                        Page 12
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                        <Bookmark className="w-3 h-3 text-primary-500" />
                        Page 13
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-400 border border-slate-200 truncate">
                    Ask another question about this PDF...
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">
              Engineered For Modern College Students
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Six Core Superpowers in One Platform
            </h3>
            <p className="text-slate-600 text-base mt-3">
              Combines peer-to-peer resource sharing with enterprise-grade semantic search and retrieval-augmented generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-primary-300 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 mb-6">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Share Academic Resources</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload lecture notes, previous year question papers, lab manuals, and assignments to empower your fellow students.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-primary-300 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Discover Resources</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Browse verified materials submitted by your department peers filtered by subject, semester, and academic resource category.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-primary-300 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Smart Search</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instantly search across document titles, descriptions, and subject taxonomies to find exactly what you need for exam prep.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-primary-300 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center text-accent-600 mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">AI Document Q&A</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask specific questions about complex PDFs and get educational, structured explanations without reading through hundreds of pages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-primary-300 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Semantic Retrieval</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Powered by Gemini embeddings and MongoDB Atlas Vector Search to retrieve only the most semantically relevant document chunks.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-primary-300 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-6">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Source-Grounded Answers</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zero hallucinated facts. Every AI answer includes exact page references that jump the interactive PDF viewer directly to the source.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">
              Simple 4-Step Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From PDF Upload to Verified Understanding
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative">
              <span className="w-10 h-10 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                01
              </span>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Upload</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit academic notes, question papers or manuals with subject, semester, and resource metadata.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative">
              <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                02
              </span>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Process</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The document is extracted page-by-page, chunked with semantic overlap, and vectorized into MongoDB Atlas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative">
              <span className="w-10 h-10 rounded-2xl bg-accent-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                03
              </span>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Ask</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pose exam questions or request conceptual breakdowns in the AI document assistant side-panel.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                04
              </span>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Learn</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive grounded answers with clickable source page citations that jump straight to the source paragraph.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RAG SHOWCASE SECTION */}
      <section id="rag-showcase" className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
              Under The Hood Architecture
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
              The Real RAG Document Intelligence Flow
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              Not a generic chat wrapper. We employ strict document-isolated vector retrieval with cosine similarity and Gemini grounding.
            </p>
          </div>

          {/* Visual flow horizontal chain */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium">
            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-center">
              <FileText className="w-5 h-5 text-primary-400 mx-auto mb-1" />
              <span>PDF Document</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-center">
              <FileCheck2 className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <span>Text Extraction</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-center">
              <Layers className="w-5 h-5 text-accent-400 mx-auto mb-1" />
              <span>Page Chunking</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <span>Gemini Embeddings</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-center">
              <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span>Vector Search</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-center">
              <Brain className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <span>Gemini Generation</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="px-4 py-3 rounded-2xl bg-primary-950 border border-primary-500 text-center text-primary-200">
              <Bookmark className="w-5 h-5 text-primary-400 mx-auto mb-1" />
              <span>Cited Answer</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RESOURCE CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">
              Comprehensive Course Support
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Organized by Resource Category
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              to="/resources?type=NOTES"
              className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Lecture Notes</h4>
              <p className="text-xs text-slate-500 mt-1">Class notes & slides</p>
            </Link>

            <Link
              to="/resources?type=PYQ"
              className="p-6 rounded-2xl bg-amber-50/70 border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Previous Year PYQs</h4>
              <p className="text-xs text-slate-500 mt-1">Past university exams</p>
            </Link>

            <Link
              to="/resources?type=LAB_MANUAL"
              className="p-6 rounded-2xl bg-cyan-50/70 border border-cyan-100 hover:border-cyan-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Lab Manuals</h4>
              <p className="text-xs text-slate-500 mt-1">Practicals & experiments</p>
            </Link>

            <Link
              to="/resources?type=ASSIGNMENT"
              className="p-6 rounded-2xl bg-violet-50/70 border border-violet-100 hover:border-violet-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Assignments</h4>
              <p className="text-xs text-slate-500 mt-1">Tutorials & solutions</p>
            </Link>

            <Link
              to="/resources?type=STUDY_MATERIAL"
              className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Study Material</h4>
              <p className="text-xs text-slate-500 mt-1">Reference guides & sheets</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. AI ASSISTANT SHOWCASE */}
      <section id="ai-assistant" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                Grounded Document Intelligence
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Never Read Through 300-Page Slides Again
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our RAG system isolates query vectors strictly to the document you are studying. It extracts the most relevant paragraphs and feeds them to Gemini with an academic system prompt preventing false claims or hallucinated citations.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    <strong className="text-slate-900">Direct Page Jumps:</strong> Click any cited page button to immediately position the PDF viewer on that exact page.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    <strong className="text-slate-900">Zero Hallucinations:</strong> The assistant refuses to speculate if the information is not explicitly in the retrieved document chunks.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    <strong className="text-slate-900">Student Tailored Explanations:</strong> Built to clarify exam concepts, algorithms, theorems, and definitions clearly and concisely.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/resources">
                  <Button variant="primary" icon={ArrowRight}>
                    Try AI Assistant on Sample Notes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Real-Time Grounding Example</h4>
                  <p className="text-[11px] text-slate-500">Operating Systems — Process Scheduling</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800">
                <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Student Query:</span>
                &ldquo;What is the main difference between Preemptive and Non-Preemptive SJF?&rdquo;
              </div>

              <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100 text-xs text-slate-800 space-y-2">
                <span className="font-bold text-primary-700 block text-[10px] uppercase">Grounded Response:</span>
                <p className="leading-relaxed">
                  In Non-Preemptive Shortest Job First (SJF), once the CPU has been allocated to a process, the process keeps the CPU until it releases it. In Preemptive SJF (Shortest Remaining Time First), if a new process arrives with CPU burst length less than remaining time of current executing process, the CPU is preempted.
                </p>
                <div className="pt-2 border-t border-primary-200/60 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">Citations:</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-primary-200 text-primary-700 font-bold text-[10px]">Page 34</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-primary-200 text-primary-700 font-bold text-[10px]">Page 36</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BENEFITS SECTION */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">
              Why Students Love The Hub
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Built By Students, For Students
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Users className="w-8 h-8 text-primary-600 mb-4" />
              <h4 className="text-base font-bold text-slate-900 mb-2">Crowdsourced Excellence</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access authentic notes, handwritten diagrams, and verified test papers uploaded by top-ranking students.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Zap className="w-8 h-8 text-accent-600 mb-4" />
              <h4 className="text-base font-bold text-slate-900 mb-2">10x Faster Exam Revision</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instead of searching through endless folders, prompt the AI to find key algorithms and formulas instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mb-4" />
              <h4 className="text-base font-bold text-slate-900 mb-2">Safe & Free for Everyone</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No paywalls, no shady download locks. Download any PDF immediately or read it online in the viewer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-20 bg-gradient-to-tr from-slate-950 via-slate-900 to-primary-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Start Learning Smarter
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join your peers today. Upload your notes to help others and unlock the power of grounded AI document assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="primary" icon={ArrowRight}>
                Create Free Account
              </Button>
            </Link>
            <Link to="/resources">
              <Button size="lg" variant="outline" className="text-white border-slate-700 hover:bg-slate-800 bg-transparent">
                Browse Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
