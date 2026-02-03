import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Settings, Power, Terminal, Shield, Cpu, AlertTriangle } from 'lucide-react';
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
    setTimeout(() => setBootSequence(false), 2500);
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
        // Reset status after a delay estimated by text length
        setTimeout(() => setStatus('idle'), Math.min(response.text.length * 50, 5000));
      } else {
        setStatus('idle');
      }

    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `WARNING: ${error.message || "Connection Failed"}.`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus('idle');
    } finally {
      setTimeout(() => inputRef.current?.focus(), 100);
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
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-holo font-mono">
        <div className="w-64 h-2 bg-gray-900 rounded-full overflow-hidden mb-4 border border-holo/30">
          <div className="h-full bg-holo animate-[width_2s_ease-out_forwards] w-full shadow-[0_0_15px_#00f3ff]" style={{width: '0%', animationName: 'loading'}}></div>
        </div>
        <div className="space-y-1 text-xs tracking-[0.2em] text-center opacity-80">
           <p className="animate-pulse">INITIALIZING CORE SYSTEMS...</p>
           <p className="delay-75">LOADING NEURAL INTERFACE...</p>
           <p className="delay-150 text-success">SECURE CONNECTION ESTABLISHED</p>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 0% }
            100% { width: 100% }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden bg-black text-holo relative`}>
      {/* Background Elements */}
      <div className="bg-grid opacity-30" />
      <div className="bg-radial absolute inset-0 pointer-events-none" />

      {/* Header HUD */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-holo/20 bg-holo/5 backdrop-blur-sm relative z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="text-holo animate-pulse-slow" size={20} />
            <span className="font-mono font-bold tracking-[0.2em] text-lg text-glow">SHOHAYOK OS</span>
          </div>
          <div className="hidden md:flex gap-4 ml-8 text-[10px] font-mono text-holo/60">
             <div className="flex items-center gap-1"><Cpu size={12}/> MEM: 24TB</div>
             <div className="flex items-center gap-1"><Terminal size={12}/> V.3.1.0</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleClearHistory} className="hover:text-danger transition-colors" title="Purge Memory">
             <Power size={18} />
          </button>
          <button onClick={() => setShowSettings(true)} className="hover:text-white transition-colors animate-spin-slow hover:animate-none">
             <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Interface */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
        
        {/* Left: Visualization Core */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          
          {/* Status Text */}
          <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
            <h2 className="text-3xl font-bold font-mono text-white text-glow tracking-wider uppercase mb-2">
              {preferences.aiName}
            </h2>
            <p className="text-sm font-mono text-holo/70 tracking-[0.3em] uppercase animate-pulse">
              {status === 'idle' ? 'SYSTEM ONLINE - AWAITING INPUT' : 
               status === 'listening' ? 'LISTENING TO AUDIO STREAM...' :
               status === 'processing' ? 'PROCESSING DATA...' : 'AUDIO OUTPUT ACTIVE'}
            </p>
          </div>

          <HoloCore state={status} />

          {/* Last Response Display (Heads Up) */}
          <div className="w-full max-w-2xl text-center min-h-[100px] flex items-center justify-center p-4">
            {messages.length > 0 ? (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="font-bangla text-lg md:text-2xl text-white drop-shadow-[0_0_5px_rgba(0,243,255,0.5)] leading-relaxed">
                    "{messages[messages.length - 1].role === Role.MODEL 
                      ? messages[messages.length - 1].content 
                      : messages[messages.length - 1].isError ? 'SYSTEM FAILURE' : 'Processing...'}"
                  </p>
               </div>
            ) : (
              <p className="text-holo/40 font-mono text-sm">INITIALIZING PROTOCOLS...</p>
            )}
          </div>
        </div>

        {/* Right: System Log (Chat History) */}
        <div className="h-[30vh] md:h-full md:w-96 border-t md:border-t-0 md:border-l border-holo/20 bg-black/60">
          <SystemLog messages={messages} />
        </div>

      </main>

      {/* Footer / Input Command Line */}
      <footer className="p-4 bg-black/80 backdrop-blur border-t border-holo/30 relative z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={toggleListening}
            className={`p-3 border border-holo/30 rounded-sm transition-all hover:bg-holo/10 ${status === 'listening' ? 'text-danger border-danger animate-pulse' : 'text-holo'}`}
          >
            <Mic size={20} />
          </button>

          <div className="flex-1 flex items-center bg-holo/5 border border-holo/30 rounded-sm px-4 py-2 hover:border-holo/60 transition-colors focus-within:bg-holo/10 focus-within:border-holo">
            <span className="text-holo/50 mr-2 font-mono">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ENTER COMMAND..."
              className="flex-1 bg-transparent border-none outline-none text-white font-bangla placeholder-holo/30"
              disabled={status === 'processing' || status === 'listening'}
              autoComplete="off"
            />
          </div>

          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 bg-holo/10 border border-holo/30 text-holo hover:bg-holo/20 hover:text-white hover:border-white transition-all rounded-sm disabled:opacity-50"
          >
            <Send size={20} />
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
