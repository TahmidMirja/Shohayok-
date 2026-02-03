'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RootLayout } from './app/layout';
import { Page } from './app/page';
import { SettingsPanel } from './components/SettingsPanel';
import { Message, UserPreferences, DEFAULT_PREFERENCES } from './types';
import * as Memory from './services/memoryService';
import { Zap } from 'lucide-react';
import { TargetHuntCinematic } from './components/TargetHuntCinematic';

const Root: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [bootPhase, setBootPhase] = useState<'loading' | 'hunting' | 'ready'>('loading');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefs = Memory.getPreferences();
    setPreferences(prefs);
    const hist = Memory.getHistory();
    setMessages(hist);
    
    const timer = setTimeout(() => setBootPhase('hunting'), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleReset = () => {
    if (confirm("Purge system memory and reset link?")) {
      Memory.clearMemory();
      setMessages([]);
    }
  };

  if (!mounted) return null;

  if (bootPhase === 'loading') {
    return (
      <div className="h-screen w-screen bg-[#080400] flex flex-col items-center justify-center text-holo font-mono">
        <div className="relative mb-8">
           <Zap className="w-16 h-16 animate-pulse" />
           <div className="absolute inset-0 bg-holo/20 blur-xl rounded-full animate-ping"></div>
        </div>
        <div className="w-64 h-[1px] bg-holo/10 overflow-hidden mb-4 relative">
          <div className="h-full bg-holo shadow-[0_0_10px_#ff8c00] animate-[loading_2s_ease-in-out]"></div>
        </div>
        <p className="text-[10px] tracking-[0.5em] uppercase opacity-80 animate-pulse font-bold">Booting VERCEL_GEN OS...</p>
        <style>{`@keyframes loading { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  if (bootPhase === 'hunting') {
    return <TargetHuntCinematic onComplete={() => setBootPhase('ready')} />;
  }

  return (
    <RootLayout 
      preferences={preferences} 
      status={status}
      onShowSettings={() => setShowSettings(true)}
      onReset={handleReset}
    >
      <Page 
        preferences={preferences}
        messages={messages}
        setMessages={setMessages}
        status={status}
        setStatus={setStatus}
      />

      {showSettings && (
        <SettingsPanel 
          preferences={preferences}
          onClose={() => setShowSettings(false)}
          onUpdate={(p) => { setPreferences(p); Memory.savePreferences(p); }}
          onClearMemory={() => { Memory.clearMemory(); setMessages([]); }}
        />
      )}
    </RootLayout>
  );
};

// Check if we are in the browser before rendering
if (typeof window !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>
    );
  }
}