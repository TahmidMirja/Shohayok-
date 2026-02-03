import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Mic, Settings, Power, Shield, Cpu, Zap } from 'lucide-react';
import { Message, Role, UserPreferences, DEFAULT_PREFERENCES } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { HoloCore, SystemLog } from './components/HolographicUI';
import * as Memory from './services/memoryService';
import * as Gemini from './services/geminiService';
import * as Voice from './utils/voiceUtils';

const App: React.FC = () => {
  // State Management
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize App
  useEffect(() => {
    const init = () => {
      try {
        const prefs = Memory.getPreferences();
        setPreferences(prefs);
        const hist = Memory.getHistory();
        setMessages(hist);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        const timer = setTimeout(() => setBootSequence(false), 2000);
        return () => clearTimeout(timer);
      }
    };
    init();
  }, []);

  // Send Logic
  const handleSend = useCallback(async (text: string = input) => {
    const trimmed = text.trim();
    if (!trimmed || status === 'processing') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: trimmed,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus('processing');

    try {
      const result = await Gemini.sendMessageToGemini([...messages, userMsg], trimmed, preferences);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: result.text,
        timestamp: Date.now(),
        toolCalls: result.toolCalls
      };

      setMessages(prev => {
        const updated = [...prev, botMsg];
        Memory.saveHistory(updated);
        return updated;
      });

      if (result.text) {
        setStatus('speaking');
        if (preferences.voiceEnabled) Voice.speak(result.text);
        // Estimate speaking time or set a fixed duration
        const speakTime = Math.min(result.text.length * 65, 6000);
        setTimeout(() => setStatus('idle'), speakTime);
      } else {
        setStatus('idle');
      }

    } catch (error: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `Error: ${error.message || "Communication failure"}`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus('idle');
    }
  }, [input, messages, preferences, status]);

  const toggleListening = () => {
    if (status === 'listening') return;
    setStatus('listening');
    // Fix: Added missing error callback argument to satisfy Voice.startListening signature (Expected 3 arguments, but got 2)
    Voice.startListening(
      (text) => handleSend(text),
      () => setStatus('idle'),
      (error) => {
        const errorMsg: Message = {
          id: Date.now().toString(),
          role: Role.MODEL,
          content: `VOICE_FAULT: ${error}`,
          timestamp: Date.now(),
          isError: true
        };
        setMessages(prev => [...prev, errorMsg]);
        setStatus('idle');
      }
    );
  };

  // Loading Screen (Boot Sequence)
  if (bootSequence) {
    return (
      <div className="h-screen w-screen bg-[#080400] flex flex-col items-center justify-center text-holo font-mono">
        <div className="relative mb-8">
           <Zap className="w-16 h-16 animate-pulse" />
           <div className="absolute inset-0 bg-holo/20 blur-xl rounded-full animate-ping"></div>
        </div>
        <div className="w-64 h-[1px] bg-holo/10 overflow-hidden mb-4 relative">
          <div className="h-full bg-holo shadow-[0_0_10px_#ff8c00] animate-[loading_2s_ease-in-out]"></div>
        </div>
        <p className="text-[10px] tracking-[0.5em] uppercase opacity-80 animate-pulse">Establishing Tactical Link...</p>
        <style>{`@keyframes loading { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden bg-[#050300] text-holo relative select-none">
      <div className="bg-grid opacity-30 fixed inset-0 pointer-events-none" />
      <div className="bg-radial absolute inset-0 pointer-events-none" />

      {/* Top HUD */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-holo/10 bg-black/40 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
          <Shield size={18} className="text-holo animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono font-black tracking-widest text-sm uppercase leading-none">OS: AMBER_LINK</span>
            <span className="text-[9px] font-mono text-holo/40 uppercase tracking-tighter">Status: Nominal</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">
             <span className="flex items-center gap-1"><Cpu size={12}/> CPU_USAGE: 2.4%</span>
          </div>
          <button onClick={() => setShowSettings(true)} className="hover:text-white transition-colors">
             <Settings size={20} />
          </button>
          <button onClick={() => { Memory.clearMemory(); setMessages([]); }} className="hover:text-danger transition-colors">
             <Power size={20} />
          </button>
        </div>
      </header>

      {/* Core Interface */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="absolute top-10 text-center w-full pointer-events-none">
            <h1 className="text-3xl font-mono font-black tracking-widest text-white text-glow mb-1 uppercase">{preferences.aiName}</h1>
            <p className="text-[10px] font-mono tracking-[0.5em] opacity-40 uppercase">{status}</p>
          </div>

          <HoloCore state={status} />

          <div className="w-full max-w-3xl px-8 py-6 bg-holo/5 border-y border-holo/10 text-center min-h-[120px] flex items-center justify-center transition-all duration-500">
            {lastMessage ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <p className={`font-bangla text-xl md:text-3xl leading-relaxed ${lastMessage.isError ? 'text-danger' : 'text-white text-glow'}`}>
                  {lastMessage.content}
                </p>
              </div>
            ) : (
              <p className="text-holo/20 font-mono text-xs tracking-[0.4em] uppercase italic">System Standby... Awaiting Directive</p>
            )}
          </div>
        </div>

        {/* System Logs / History */}
        <div className="h-[35vh] md:h-full md:w-80 lg:w-[450px] border-t md:border-t-0 md:border-l border-holo/10 shadow-2xl">
          <SystemLog messages={messages} />
        </div>
      </main>

      {/* Command Input Area */}
      <footer className="p-6 bg-black/90 backdrop-blur-2xl border-t border-holo/20 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button 
            onClick={toggleListening}
            className={`p-4 border-2 transition-all transform hover:scale-105 ${status === 'listening' ? 'border-danger text-danger bg-danger/10 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-holo/30 text-holo hover:border-holo bg-white/5'}`}
          >
            <Mic size={24} />
          </button>

          <div className="flex-1 flex items-center bg-white/5 border-2 border-white/10 px-6 py-4 focus-within:border-holo/60 transition-all group shadow-inner">
            <span className="text-holo/60 font-mono mr-4 text-xl group-focus-within:text-holo animate-pulse">CMD></span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter system directive..."
              className="flex-1 bg-transparent border-none outline-none text-white font-bangla placeholder-holo/10 text-lg"
              disabled={status === 'processing' || status === 'listening'}
              autoFocus
            />
          </div>

          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || status === 'processing'}
            className="p-4 bg-holo/10 border-2 border-holo/40 text-holo hover:bg-holo hover:text-black transition-all disabled:opacity-20 shadow-lg"
          >
            <Send size={24} />
          </button>
        </div>
      </footer>

      {/* Settings UI */}
      {showSettings && (
        <SettingsPanel 
          preferences={preferences}
          onClose={() => setShowSettings(false)}
          onUpdate={(p) => { setPreferences(p); Memory.savePreferences(p); }}
          onClearMemory={() => { Memory.clearMemory(); setMessages([]); }}
        />
      )}
    </div>
  );
};

export default App;