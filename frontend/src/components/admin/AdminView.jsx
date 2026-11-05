import React, { useState } from 'react';
import {
  Activity,
  Database,
  Layers,
  UploadCloud,
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import FileUploadZone from './FileUploadZone';
import UrlIngestForm from './UrlIngestForm';
import SourceList from './SourceList';

const AdminView = ({
  sources = [],
  fetchSources,
  onDeleteSource,
  isLoadingSources = false,
}) => {
  const [adminSection, setAdminSection] = useState('analytics'); // 'analytics' | 'knowledge'

  const totalChunks = sources.reduce((acc, curr) => acc + (curr.chunk_count || 0), 0);

  const navItems = [
    {
      id: 'analytics',
      label: 'Analytics & Telemetry',
      icon: Activity,
      badge: null,
      description: 'Live query telemetry & trends',
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: Database,
      badge: sources.length > 0 ? sources.length : null,
      description: 'PDF uploads & URL scraping',
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start pb-12 max-w-7xl mx-auto">
      {/* Left Admin Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="px-3 py-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Admin Portal
          </span>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Control Center
          </h2>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex flex-row lg:flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminSection(item.id)}
                className={`flex-1 lg:flex-initial flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-semibold block leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] hidden sm:block ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health Card at bottom of sidebar */}
        <div className="mt-6 pt-5 border-t border-slate-100 hidden lg:block">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-bold text-slate-700">NeonDB Serverless</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              pgvector extension active with 768-dim cosine distance indexing.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <section className="flex-1 w-full min-w-0">
        {adminSection === 'analytics' ? (
          <AnalyticsDashboard />
        ) : (
          <div className="space-y-8">
            {/* Header info card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Knowledge Base Management
                  </h1>
                  <p className="mt-1 text-sm text-slate-300">
                    Ingest, index, and manage document sources powering your strict RAG customer chatbot.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                  <div className="text-center">
                    <span className="block text-xl font-extrabold text-indigo-300">
                      {sources.length}
                    </span>
                    <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                      Sources
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <span className="block text-xl font-extrabold text-emerald-300">
                      {totalChunks}
                    </span>
                    <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                      Vectors
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Ingestion Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FileUploadZone onUploadSuccess={fetchSources} />
              <UrlIngestForm onUploadSuccess={fetchSources} />
            </div>

            {/* Indexed Sources Table */}
            <SourceList
              sources={sources}
              onDelete={onDeleteSource}
              isRefreshing={isLoadingSources}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminView;
