import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  MessageSquare,
  Database,
  Layers,
  TrendingUp,
  Activity,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Clock,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { getAnalytics } from '../../services/api';

const AnalyticsDashboard = () => {
  const [data, setData] = useState({
    total_queries: 0,
    total_sources: 0,
    total_chunks: 0,
    pdf_sources: 0,
    url_sources: 0,
    avg_sources_cited: 0,
    avg_chunks_per_source: 0,
    chart_data: [],
    source_distribution: [],
    recent_queries: [],
    system_info: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const result = await getAnalytics();
      if (result) {
        setData({
          total_queries: result.total_queries ?? 0,
          total_sources: result.total_sources ?? 0,
          total_chunks: result.total_chunks ?? 0,
          pdf_sources: result.pdf_sources ?? 0,
          url_sources: result.url_sources ?? 0,
          avg_sources_cited: result.avg_sources_cited ?? 0,
          avg_chunks_per_source: result.avg_chunks_per_source ?? 0,
          chart_data: Array.isArray(result.chart_data) ? result.chart_data : [],
          source_distribution: Array.isArray(result.source_distribution)
            ? result.source_distribution
            : [],
          recent_queries: Array.isArray(result.recent_queries) ? result.recent_queries : [],
          system_info: result.system_info || {},
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const metricCards = [
    {
      title: 'Total Queries',
      value: data.total_queries,
      icon: MessageSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
      description: 'Conversational inquiries processed',
      pill: 'Telemetry',
    },
    {
      title: 'Knowledge Sources',
      value: data.total_sources,
      icon: Database,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 border-violet-100',
      description: `${data.pdf_sources} PDFs • ${data.url_sources} Web URLs`,
      pill: 'Indexed',
    },
    {
      title: 'Vector Chunks',
      value: data.total_chunks,
      icon: Layers,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
      description: `${(data.total_chunks * 768).toLocaleString()} vector float dimensions`,
      pill: 'pgvector',
    },
    {
      title: 'Avg Citation Density',
      value: `${data.avg_sources_cited}`,
      icon: ShieldCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100',
      description: 'Sources cited per grounded response',
      pill: 'Precision',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>Admin Telemetry & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time performance metrics, vector knowledge distribution, and recent query logs
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                  {card.pill}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? '...' : card.value}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs ${card.bgColor}`}
                >
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2 font-medium">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Chart: Query Activity (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Query Activity & Citations (Last 7 Days)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily chat volume and context citations processed
              </p>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              7-Day Trend
            </span>
          </div>

          <div className="h-64 w-full">
            {data.chart_data && data.chart_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chart_data}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="citationsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-800">
                            <p className="text-slate-400 font-mono text-[10px] mb-1">
                              {item.full_date || item.date}
                            </p>
                            <p className="text-indigo-300 font-semibold flex items-center justify-between gap-4">
                              <span>Queries:</span>
                              <span className="font-bold">{item.queries}</span>
                            </p>
                            <p className="text-cyan-300 font-semibold flex items-center justify-between gap-4 mt-0.5">
                              <span>Sources Cited:</span>
                              <span className="font-bold">{item.citations}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    name="Queries"
                    dataKey="queries"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#queriesGrad)"
                  />
                  <Area
                    type="monotone"
                    name="Citations"
                    dataKey="citations"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#citationsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Chart: Source Composition (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-violet-600" />
              <span>Vector Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chunks stored by source category
            </p>
          </div>

          <div className="h-64 w-full">
            {data.source_distribution && data.source_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.source_distribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-800">
                            <p className="font-bold text-slate-200 mb-1">{item.name}</p>
                            <p className="text-indigo-300">
                              Sources: <span className="font-bold">{item.sources}</span>
                            </p>
                            <p className="text-emerald-300">
                              Chunks: <span className="font-bold">{item.chunks}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="chunks" fill="#6366f1" radius={[6, 6, 0, 0]} name="Chunks" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No sources ingested yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Queries Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Live Customer Query Log</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
              Last {data.recent_queries.length} Inquiries
            </span>
          </div>
        </div>

        {data.recent_queries.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No queries logged in this session yet. Ask a question in Customer Chat to view live telemetry!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3">Inquiry Message</th>
                  <th className="px-6 py-3">Citations</th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_queries.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-800 max-w-md truncate">
                      {q.message}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {q.sources_cited} {q.sources_cited === 1 ? 'source' : 'sources'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(q.created_at)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Grounded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Architecture Specifications */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800">Model:</span>
          <span>{data.system_info?.generation_model || 'gemini-2.5-flash'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="font-semibold text-slate-800">Embedding:</span>
          <span>
            {data.system_info?.embedding_model || 'gemini-embedding-001'} (
            {data.system_info?.embedding_dimensions || 768} dims)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-800">Vector Engine:</span>
          <span>{data.system_info?.vector_db || 'NeonDB PostgreSQL (pgvector)'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
