import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Layers,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendChatMessage } from '../../services/api';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedChunksIndex, setExpandedChunksIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    const userMessage = {
      role: 'user',
      content: query,
      sources: [],
      retrieved_chunks: [],
    };

    // Construct history payload from existing messages
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(query, historyPayload, 5);

      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        retrieved_chunks: response.retrieved_chunks || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const detail =
        error.response?.data?.detail ||
        'Failed to generate answer. Make sure the backend is active.';
      toast.error(detail);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, an error occurred: ${detail}`,
          sources: [],
          retrieved_chunks: [],
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChunks = (msgIndex) => {
    setExpandedChunksIndex((prev) => (prev === msgIndex ? null : msgIndex));
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-3.5 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              OmniRAG Customer Chat
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                Context-Aware
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Conversational Memory & Grounded Synthesis
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Clear Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40 flex flex-col">
        {messages.length === 0 ? (
          /* Premium Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              How can I help you today?
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md leading-relaxed">
              Ask questions grounded directly in your uploaded PDF documents and scraped web pages.
              Conversational memory preserves context across turns.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full text-left">
              <button
                onClick={() => {
                  setInput("What are the key takeaways from the indexed knowledge base?");
                  inputRef.current?.focus();
                }}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-indigo-300 text-xs text-slate-700 shadow-2xs transition group"
              >
                <span className="font-semibold block text-slate-800 group-hover:text-indigo-600 mb-1">
                  💡 Summarize Knowledge
                </span>
                Extract key findings and highlights
              </button>
              <button
                onClick={() => {
                  setInput("Explain the technical architecture and specifications.");
                  inputRef.current?.focus();
                }}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-indigo-300 text-xs text-slate-700 shadow-2xs transition group"
              >
                <span className="font-semibold block text-slate-800 group-hover:text-indigo-600 mb-1">
                  ⚙️ Technical Architecture
                </span>
                Review specifications and stack
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const hasSources = msg.sources && msg.sources.length > 0;
            const hasChunks = msg.retrieved_chunks && msg.retrieved_chunks.length > 0;
            const isChunksExpanded = expandedChunksIndex === index;

            return (
              <div
                key={index}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-indigo-600'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble & Metadata */}
                <div className="flex flex-col space-y-2 max-w-[85%] sm:max-w-[78%]">
                  <div
                    className={`p-4 text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm whitespace-pre-wrap'
                        : msg.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
                        : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 shadow-2xs'
                    }`}
                  >
                    {isUser || msg.isError ? (
                      msg.content
                    ) : (
                      <ReactMarkdown className="prose prose-slate max-w-none text-sm leading-relaxed break-words">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Sources Attribution Badges */}
                  {!isUser && hasSources && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                      <span className="font-semibold text-slate-600">Sources:</span>
                      {msg.sources.map((src, srcIdx) => {
                        const isPdf = src.type?.toLowerCase() === 'pdf';
                        return (
                          <span
                            key={srcIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/80 text-slate-700 font-medium text-[11px]"
                          >
                            {isPdf ? (
                              <FileText className="w-3 h-3 text-red-500" />
                            ) : (
                              <Globe className="w-3 h-3 text-indigo-500" />
                            )}
                            <span className="truncate max-w-[180px]" title={src.name}>
                              {src.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({src.type})
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Retrieved Context Transparency Accordion */}
                  {!isUser && hasChunks && (
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleChunks(index)}
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {isChunksExpanded ? 'Hide' : 'Inspect'} {msg.retrieved_chunks.length} Retrieved Context {msg.retrieved_chunks.length === 1 ? 'Chunk' : 'Chunks'}
                        </span>
                        {isChunksExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isChunksExpanded && (
                        <div className="mt-2 space-y-2 p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
                          {msg.retrieved_chunks.map((chunk, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 border-b border-slate-100 pb-1">
                                <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                                  {chunk.source}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-mono text-[10px]">
                                  Similarity: {(chunk.score * 100).toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-slate-600 font-mono text-[11px] leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                                {chunk.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Sleek Bouncing Dots Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-xl items-start">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-200/80 bg-white">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or follow up on previous context..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition disabled:opacity-60 shadow-inner"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 text-white shadow-xs transition disabled:cursor-not-allowed"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-[11px] text-slate-400">
            Answers are restricted strictly to context retrieved from your knowledge base. Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> to submit.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
