import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardData } from './types';
import NewConfigForm from './components/NewConfigForm';
import PM2Section from './components/PM2Section';
import SavedConfigs from './components/SavedConfigs';
import NetworkView from './components/NetworkView';
import ConsoleView from './components/ConsoleView';
import { io, Socket } from 'socket.io-client';
import DashboardFooter from './components/DashboardFooter';

const API_URL = "http://192.168.1.39:9010"

const App: React.FC = () => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [lastMessage, setLastMessage] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to your NestJS backend
    socketRef.current = io(API_URL);

    socketRef.current.on('connect', () => console.log("Connected to Terminal Stream"));

    // Listen for the live output from your spawn command
    socketRef.current.on('cmd-output', (chunk: string) => {
      // Update the state that flows into ConsoleView
      setLastMessage(chunk);
    });

    socketRef.current.on('refresh-data', () => {
      refreshData();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshData = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`);

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();

      // Basic validation to ensure we have the required fields
      if (json && typeof json === 'object' && 'pm2_procs' in json) {
        setData(json);
        setError(null);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (e) {
      console.error("Fetch failed:", e);
      setError(e instanceof Error ? e.message : "Connection lost");
      if (isInitial) showToast("Could not connect to backend", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData(true);
    const timer = setInterval(() => refreshData(), 60000);
    return () => clearInterval(timer);
  }, [refreshData]);

  // Keyboard shortcut for '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading State
  if (isLoading && !data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gh-bg text-gh-text font-mono gap-4">
        <div className="w-12 h-12 border-4 border-gh-accent border-t-transparent rounded-full animate-spin"></div>
        <span className="animate-pulse">Initializing CMD Hub...</span>
      </div>
    );
  }

  // Error State (if data fails to load initially)
  if (error && !data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gh-bg text-gh-danger font-mono p-4 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-xl font-bold mb-2">Backend Connection Failed</h2>
        <p className="text-gh-dim max-w-md mb-6">{error}</p>
        <button
          onClick={() => { setIsLoading(true); refreshData(true); }}
          className="bg-gh-card border border-gh-border px-6 py-2 rounded hover:border-gh-accent text-gh-text transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Safety check for data rendering
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gh-bg text-gh-text font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg border border-white/10 ${toast.type === 'success' ? 'bg-gh-success' : 'bg-gh-danger'
          } text-white animate-in fade-in slide-in-from-top-2`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gh-border bg-gh-bg/80 backdrop-blur-md px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span>🤖</span> CMD Hub
          </h1>
          <div className="relative w-full md:w-96 group">
            <input
              id="searchInput"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands, ports, or processes..."
              className="w-full bg-gh-inner border border-gh-border rounded-md px-4 py-1.5 text-sm focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-gh-dim bg-gh-card border border-gh-border rounded opacity-60 pointer-events-none group-focus-within:hidden">
              /
            </kbd>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* PM2 Section */}
        <section className="bg-gh-card border border-gh-border rounded-md p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gh-border pb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="text-gh-accent">🔹</span> PM2 Process Manager
            </h3>
            <span className="bg-gh-accent/10 text-gh-accent text-[11px] px-2 py-0.5 rounded-full font-bold">
              {data.pm2_procs?.length || 0} Processes
            </span>
          </div>
          <PM2Section processes={data.pm2_procs || []} searchQuery={search} socket={socketRef.current} portsInfo={data.ports_info} />
        </section>

        {/* Saved Configurations */}
        <section className="bg-gh-card border border-gh-border rounded-md p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gh-border pb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="text-pink-400">📋</span> Saved Configurations
            </h3>
          </div>
          <SavedConfigs commands={data.commands || {}} searchQuery={search} socket={socketRef.current} />
        </section>

        {/* New Configuration */}
        <section className="bg-gh-card border border-gh-border rounded-md p-6">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
            <span className="text-purple-400 font-bold">+</span> New Configuration
          </h3>
          <NewConfigForm refreshData={refreshData} />
        </section>

        <DashboardFooter lastMessage={lastMessage} portsInfo={data.ports_info} />
      </main>
    </div>
  );
};

export default App;