import React, { useState } from 'react';
import { FileText, Globe, Trash2, Database, Calendar, Layers, ExternalLink, Loader2 } from 'lucide-react';

const SourceList = ({ sources = [], onDelete, isRefreshing = false }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = async (sourceId) => {
    if (deletingId) return;
    setDeletingId(sourceId);
    try {
      await onDelete(sourceId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Indexed Knowledge Sources</h3>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
            {sources.length} {sources.length === 1 ? 'Source' : 'Sources'}
          </span>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {sources.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Database className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-medium text-slate-700">No sources indexed yet</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Upload a PDF document or scrape a URL using the controls above to populate your knowledge base.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3.5">Source</th>
                <th scope="col" className="px-6 py-3.5">Type</th>
                <th scope="col" className="px-6 py-3.5">Chunks</th>
                <th scope="col" className="px-6 py-3.5">Indexed At</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((source) => {
                const isPdf = source.source_type?.toLowerCase() === 'pdf';
                const isUrl = source.source_type?.toLowerCase() === 'url';
                const isItemDeleting = deletingId === source.id;

                return (
                  <tr
                    key={source.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-xs md:max-w-md truncate">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isPdf
                              ? 'bg-red-50 text-red-600'
                              : 'bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          {isPdf ? <FileText className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <span className="block truncate text-slate-800 font-medium" title={source.name_or_url}>
                            {source.name_or_url}
                          </span>
                          {isUrl && (
                            <a
                              href={source.name_or_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              <span>Open URL</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${
                          isPdf
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-sky-50 text-sky-700 border border-sky-200/60'
                        }`}
                      >
                        {source.source_type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{source.chunk_count || 0}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(source.created_at)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(source.id)}
                        disabled={isItemDeleting}
                        title="Delete Source & Chunks"
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isItemDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SourceList;

