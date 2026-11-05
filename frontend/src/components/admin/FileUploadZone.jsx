import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadPdf } from '../../services/api';

const FileUploadZone = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setSelectedFileName(file.name);
    setIsLoading(true);
    const toastId = toast.loading(`Ingesting "${file.name}"... Parsing & embedding...`);

    try {
      const result = await uploadPdf(file);
      toast.success(result.message || `"${file.name}" successfully indexed! (${result.chunk_count} chunks)`, {
        id: toastId,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('File upload error:', error);
      const detail = error.response?.data?.detail || 'Failed to parse and ingest PDF.';
      toast.error(`Error: ${detail}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
          : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50'
      } shadow-sm`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        id="pdf-upload-input"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <div className="w-14 h-14 mb-4 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
        {isLoading ? (
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        ) : (
          <UploadCloud className="w-7 h-7" />
        )}
      </div>

      <div className="text-center max-w-sm">
        <h3 className="text-base font-semibold text-slate-800">
          {isLoading ? 'Processing Document...' : 'Upload PDF Document'}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {isLoading
            ? `Extracting text, generating 768-dim embeddings: ${selectedFileName}`
            : 'Drag and drop your PDF here, or browse from your computer.'}
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="pdf-upload-input"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
            isLoading
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white cursor-pointer hover:shadow'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ingesting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Select PDF File
            </>
          )}
        </label>
      </div>

      <span className="mt-3 text-xs text-slate-400">Supported format: .pdf (Text extractable)</span>
    </div>
  );
};

export default FileUploadZone;

