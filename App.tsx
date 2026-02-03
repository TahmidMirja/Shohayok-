import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Settings, Power, Terminal, Shield, Cpu, Zap } from 'lucide-react';
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
    const prefs = Memory.getPreferences();
    setPreferences(prefs);
    const hist = Memory.getHistory();
    setMessages(hist);
    
    // Boot Sequence Effect
    setTimeout(() => setBootSequence(false), 2200);
  }, []);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || status === 'processing') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStatus('processing');

    try {
      const response = await Gemini.sendMessageToGemini(newMessages, text, preferences);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: response.text,
        timestamp: Date.now(),
        toolCalls: response.toolCalls
      };

      const updatedHistory = [...newMessages, botMsg];
      setMessages(updatedHistory);
      Memory.saveHistory(updatedHistory);

      if (response.text) {
        setStatus('speaking');
        if (preferences.voiceEnabled) {
          Voice.speak(response.text);
        }
        setTimeout(() => setStatus('idle'), Math.min(response.text.length * 60, 6000));
      } else {
        setStatus('idle');
      }

    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `CRITICAL ERROR: ${error.message || "UPLINK_FAILURE"}`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus('idle');
    } finally {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  const toggleListening = () => {
    if (status === 'listening') return;
    setStatus('listening');
    Voice.startListening(
      (text) => {
        handleSend(text);
      },
      () => {
        if (status === 'listening') setStatus('idle');
      }
    );
  };

  const handleClearHistory = () => {
    Memory.clearMemory();
    setMessages([]);
  };

  if (bootSequence) {
    return (
      <div className="h-screen w-screen bg-[#080400] flex flex-col items-center justify-center text-holo font-mono relative overflow-hidden">
        <div className="bg-grid opacity-20" />
        <div className="relative z-10 flex flex-col items-center">
            <Zap className="mb-8 w-16 h-16 text-holo animate-pulse" />
            <div className="w-80 h-1 bg-holo/10 rounded-full overflow-hidden mb-6 border border-holo/20">
              <div className="h-full bg-holo shadow-[0_0_20px_#ff8c00]" style={{width: '0%', animation: 'loading 2s ease-in-out forwards'}}></div>
            </div>
            <div className="space-y-2 text-[10px] tracking-[0.4em] text-center font-bold">
               <p className="animate-pulse">MOUNTING TACTICAL_INTERFACES...</p>
               <p className="opacity-60">SYNCHRONIZING NEURAL_BUFFERS...</p>
               <p className="text-success glow-text">ORANGE_LINK ESTABLISHED</p>
            </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 0% }
            100% { width: 100% }
          }
          .glow-text { text-shadow: 0 0 10px #ffcc00; }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden bg-[#080400] text-holo relative`}>
      {/* Background Elements */}
      <div className="bg-grid opacity-40" />
      <div className="bg-radial absolute inset-0 pointer-events-none" />

      {/* Header HUD */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-holo/20 bg-holo/5 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Shield className="text-holo animate-pulse-slow" size={22} />
            <span className="font-mono font-black tracking-[0.3em] text-xl text-glow uppercase">Tactical AI</span>
          </div>
          <div className="hidden lg:flex gap-6 ml-10 text-[11px] font-mono text-holo/50 uppercase font-bold tracking-widest">
             <div className="flex items-center gap-2 border-r border-holo/20 pr-6"><Cpu size={14}/> CORE: NOMINAL</div>
             <div className="flex items-center gap-2"><Terminal size={14}/> OS: Ver_3.2-AMBER</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={handleClearHistory} className="hover:text-white transition-all transform hover:scale-110" title="Flush Cache">
             <Power size={20} />
          </button>
          <button onClick={() => setShowSettings(true)} className="hover:text-white transition-all animate-spin-slow hover:animate-none">
             <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Interface */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
        
        {/* Left: Visualization Core */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          
          {/* Status HUD Text */}
          <div className="absolute top-10 left-0 right-0 text-center pointer-events-none z-0">
            <h2 className="text-4xl font-black font-mono text-white text-glow tracking-[0.1em] uppercase mb-3 opacity-90">
              {preferences.aiName}
            </h2>
            <div className="flex items-center justify-center gap-4">
                <div className="h-[2px] w-12 bg-holo/20"></div>
                <p className="text-[11px] font-mono text-holo/80 tracking-[0.5em] uppercase font-bold">
                  {status === 'idle' ? 'STANDBY_MODE_ACTIVE' : 
                   status === 'listening' ? 'CAPTURING_AUDIO_WAVES' :
                   status === 'processing' ? 'PARSING_COMMANDS' : 'RELAYING_RESPONSE'}
                </p>
                <div className="h-[2px] w-12 bg-holo/20"></div>
            </div>
          </div>

          <HoloCore state={status} />

          {/* Last Response Display */}
          <div className="w-full max-w-3xl text-center min-h-[120px] flex items-center justify-center p-6 bg-holo/5 border-y border-holo/10 backdrop-blur-sm mt-4">
            {messages.length > 0 ? (
               <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <p className="font-bangla text-xl md:text-3xl text-white text-glow leading-relaxed font-medium">
                    {messages[messages.length - 1].role === Role.MODEL 
                      ? messages[messages.length - 1].content 
                      : messages[messages.length - 1].isError ? 'COMM_LINK_DOWN' : 'INTERPRETING...'}
                  </p>
               </div>
            ) : (
              <p className="text-holo/30 font-mono text-sm tracking-[0.2em]">INITIALIZING SUBSYSTEMS...</p>
            )}
          </div>
        </div>

        {/* Right: System Log */}
        <div className="h-[35vh] md:h-full md:w-[400px] border-t md:border-t-0 md:border-l border-holo/20 shadow-2xl">
          <SystemLog messages={messages} />
        </div>

      </main>

      {/* Footer / Input HUD */}
      <footer className="p-6 bg-[#0a0500]/95 backdrop-blur-xl border-t-2 border-holo/20 relative z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <button 
            onClick={toggleListening}
            className={`p-4 border-2 transition-all transform hover:scale-105 ${status === 'listening' ? 'text-danger border-danger animate-pulse bg-danger/10' : 'text-holo border-holo/40 hover:border-holo bg-holo/5'}`}
          >
            <Mic size={24} />
          </button>

          <div className="flex-1 flex items-center bg-white/5 border-2 border-white/10 px-6 py-3 hover:border-holo/50 transition-all focus-within:border-holo focus-within:bg-white/10 group shadow-inner">
            <span className="text-holo font-mono font-bold mr-4 text-lg group-focus-within:animate-pulse">CMD></span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ENTER SYSTEM DIRECTIVE..."
              className="flex-1 bg-transparent border-none outline-none text-white font-bangla text-lg placeholder-holo/20 tracking-wide"
              disabled={status === 'processing' || status === 'listening'}
              autoComplete="off"
            />
          </div>

          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-4 bg-holo/10 border-2 border-holo/40 text-holo hover:bg-holo hover:text-black transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(255,140,0,0.1)]"
          >
            <Send size={24} />
          </button>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel 
          preferences={preferences}
          onClose={() => setShowSettings(false)}
          onUpdate={(newPrefs) => {
            setPreferences(newPrefs);
            Memory.savePreferences(newPrefs);
          }}
          onClearMemory={handleClearHistory}
        />
      )}
    </div>
  );
};

export default App;