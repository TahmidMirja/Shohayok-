import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Settings, Power, Terminal, Shield, Cpu, Zap, AlertCircle } from 'lucide-react';
import { Message, Role, UserPreferences, DEFAULT_PREFERENCES } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { HoloCore, SystemLog } from './components/HolographicUI';
import * as Memory from './services/memoryService';
import * as Gemini from './services/geminiService';
import * as Voice from './utils/voiceUtils';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const prefs = Memory.getPreferences();
      setPreferences(prefs);
      const hist = Memory.getHistory();
      setMessages(hist);
    } catch (err) {
      console.error("Initial load failed", err);
    }
    
    const timer = setTimeout(() => setBootSequence(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (text: string = input) => {
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
        setTimeout(() => setStatus('idle'), Math.min(result.text.length * 60, 5000));
      } else {
        setStatus('idle');
      }

    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `Error: ${error.message || "Uplink Lost"}`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus('idle');
    }
  };

  const toggleListening = () => {
    if (status === 'listening') return;
    setStatus('listening');
    Voice.startListening(
      (text) => handleSend(text),
      () => setStatus('idle')
    );
  };

  if (bootSequence) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-holo font-mono">
        <Zap className="mb-4 w-12 h-12 animate-pulse" />
        <div className="w-64 h-[1px] bg-holo/10 overflow-hidden mb-4">
          <div className="h-full bg-holo animate-[loading_2s_linear]"></div>
        </div>
        <p className="text-[10px] tracking-[0.5em] uppercase">Initializing Tactical Link...</p>
        <style>{`@keyframes loading { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden bg-[#050300] text-holo relative select-none">
      <div className="bg-grid opacity-30" />
      <div className="bg-radial absolute inset-0 pointer-events-none" />

      {/* Header */}
      <header className="h-12 flex items-center justify-between px-6 border-b border-holo/10 bg-black/40 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
          <Shield size={16} className="text-holo animate-pulse" />
          <span className="font-mono font-black tracking-widest text-sm uppercase">Uplink: Online</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSettings(true)} className="hover:text-white p-1">
             <Settings size={18} />
          </button>
          <button onClick={() => { Memory.clearMemory(); setMessages([]); }} className="hover:text-danger p-1">
             <Power size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <div className="absolute top-10 text-center w-full">
            <h1 className="text-2xl font-mono font-black tracking-widest text-white mb-1 uppercase">{preferences.aiName}</h1>
            <p className="text-[10px] font-mono tracking-[0.3em] opacity-50 uppercase">{status}</p>
          </div>

          <HoloCore state={status} />

          <div className="w-full max-w-2xl px-6 py-4 bg-holo/5 border-y border-holo/10 text-center min-h-[80px] flex items-center justify-center">
            {lastMessage ? (
              <p className={`font-bangla text-lg md:text-2xl leading-relaxed ${lastMessage.isError ? 'text-danger' : 'text-white text-glow'}`}>
                {lastMessage.content}
              </p>
            ) : (
              <p className="text-holo/20 font-mono text-xs tracking-widest uppercase italic">Awaiting Directives...</p>
            )}
          </div>
        </div>

        <div className="h-[30vh] md:h-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-holo/10">
          <SystemLog messages={messages} />
        </div>
      </main>

      {/* Footer Input */}
      <footer className="p-4 bg-black/80 backdrop-blur-xl border-t border-holo/20 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button 
            onClick={toggleListening}
            className={`p-3 border transition-all ${status === 'listening' ? 'border-danger text-danger bg-danger/10 animate-pulse' : 'border-holo/20 text-holo hover:border-holo bg-white/5'}`}
          >
            <Mic size={20} />
          </button>

          <div className="flex-1 flex items-center bg-white/5 border border-holo/20 px-4 py-2 focus-within:border-holo transition-all group">
            <span className="text-holo/40 font-mono mr-3 group-focus-within:text-holo">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="System command..."
              className="flex-1 bg-transparent border-none outline-none text-white font-bangla placeholder-holo/20 text-sm md:text-base"
              disabled={status === 'processing' || status === 'listening'}
            />
          </div>

          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || status === 'processing'}
            className="p-3 bg-holo/10 border border-holo/30 text-holo hover:bg-holo hover:text-black transition-all disabled:opacity-20"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>

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
