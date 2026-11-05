import React, { useState } from 'react';
import { Globe, Link2, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { ingestUrl } from '../../services/api';

const UrlIngestForm = ({ onUploadSuccess }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      toast.error('Please enter a valid website URL.');
      return;
    }

    try {
      new URL(cleanUrl);
    } catch {
      toast.error('Invalid URL format. Please include http:// or https://');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(`Scraping & embedding "${cleanUrl}"...`);

    try {
      const result = await ingestUrl(cleanUrl);
      toast.success(result.message || `URL successfully ingested! (${result.chunk_count} chunks)`, {
        id: toastId,
      });
      setUrl('');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('URL ingest error:', error);
      const detail = error.response?.data?.detail || 'Failed to scrape and ingest web page content.';
      toast.error(`Error: ${detail}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-800">Scrape & Index Web URL</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Extract clean article/documentation text from any public web page into your knowledge base.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/docs/article"
            disabled={isLoading}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-sm transition disabled:cursor-not-allowed min-w-[130px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Ingest URL
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UrlIngestForm;

