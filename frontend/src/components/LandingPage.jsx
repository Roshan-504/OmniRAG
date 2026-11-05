import React from 'react';
import {
  BrainCircuit,
  Database,
  Zap,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Layers,
  Cpu,
  FileText,
  Globe,
} from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  const features = [
    {
      icon: Database,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      title: 'Serverless Vector DB',
      description:
        'Powered by NeonDB & pgvector for sub-millisecond similarity search across 768-dimensional embeddings.',
      badge: 'NeonDB & pgvector',
    },
    {
      icon: BrainCircuit,
      iconBg: 'bg-violet-50 text-violet-600 border-violet-100',
      title: 'Anti-Hallucination',
      description:
        'Strict RAG pipelines ensure answers are generated ONLY from ingested context with explicit source citation.',
      badge: 'Gemini 2.5 Flash',
    },
    {
      icon: Zap,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      title: 'Multi-Source Ingestion',
      description:
        'Drag-and-drop PDFs or paste URLs for automated scraping, SPA rendering with Jina Reader, and semantic chunking.',
      badge: 'PDF & Web SPAs',
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      title: 'Session Memory',
      description:
        'Context-aware conversational state maintains the flow of complex technical queries across multi-turn interactions.',
      badge: 'Context-Aware',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white pt-6 sm:pt-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-pink-200/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold tracking-wide mb-8 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multimodal Knowledge Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Enterprise-Grade Knowledge Retrieval with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              OmniRAG
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload documents, scrape websites, and instantly chat with your data using{' '}
            <span className="font-semibold text-slate-800">Gemini 2.5 Flash</span> and vector-based semantic search.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
            >
              <span>Launch Chatbot</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-2xs hover:border-slate-400 transition-all duration-150"
            >
              <span>Manage Knowledge Base</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Tech stack pills */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-500" />
              Gemini 2.5 Flash
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              NeonDB pgvector
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-500" />
              PDF Extraction
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-500" />
              Jina Reader SPA Scraping
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid: Bento Box Style */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-600 mb-2">
              Architecture & Capabilities
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Precision and Zero Hallucination
            </p>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Every query is embedded with asymmetric vector projection, retrieved using cosine distance in PostgreSQL, and synthesized with conversational memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="relative p-8 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-2xs ${feature.iconBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                    <span>Learn how it works</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to ground your AI in your own data?
          </h2>
          <p className="mt-3 text-slate-300 text-sm max-w-xl mx-auto">
            Get started in seconds by uploading a PDF document or indexing your documentation URL.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition hover:scale-[1.02]"
            >
              Ingest Your First Document
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition"
            >
              Open Chatbot
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>OmniRAG Knowledge System</span>
          </div>
          <p>© 2026 OmniRAG. Built with FastAPI, NeonDB, pgvector & Gemini 2.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

