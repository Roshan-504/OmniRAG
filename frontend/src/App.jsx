import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { getSources, deleteSource } from './services/api';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import ChatWindow from './components/chat/ChatWindow';
import AdminView from './components/admin/AdminView';

function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'chat' | 'admin'
  const [sources, setSources] = useState([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  const fetchSources = useCallback(async () => {
    setIsLoadingSources(true);
    try {
      const data = await getSources();
      setSources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setIsLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Refetch sources when user navigates to the admin view
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      fetchSources();
    }
  };

  const handleDeleteSource = async (sourceId) => {
    try {
      await deleteSource(sourceId);
      toast.success('Document source and its associated chunks deleted.');
      fetchSources();
    } catch (error) {
      console.error('Delete error:', error);
      const detail = error.response?.data?.detail || 'Failed to delete source.';
      toast.error(`Error: ${detail}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '13px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />

      {/* Floating Glassmorphism Global Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* 1. Landing Page Entry View (Unmounted once user enters Chat or Admin) */}
      {activeTab === 'landing' && (
        <LandingPage onNavigate={handleTabChange} />
      )}

      {/* 2. Main App Views - Preserved in DOM */}
      {activeTab !== 'landing' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Customer Chatbot View */}
          <div className={activeTab === 'chat' ? 'block h-full' : 'hidden'}>
            <ChatWindow />
          </div>

          {/* Admin Analytics & Knowledge Base Management View */}
          <div className={activeTab === 'admin' ? 'block h-full' : 'hidden'}>
            <AdminView
              sources={sources}
              fetchSources={fetchSources}
              onDeleteSource={handleDeleteSource}
              isLoadingSources={isLoadingSources}
            />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
