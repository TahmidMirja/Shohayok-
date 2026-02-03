'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Send, Mic, ShieldAlert, WifiOff, Activity, RefreshCw } from 'lucide-react';
import { Message, Role, UserPreferences } from '../types';
import { HoloCore, SystemLog } from '../components/HolographicUI';
import * as Gemini from '../services/geminiService';
import * as Voice from '../utils/voiceUtils';
import * as Memory from '../services/memoryService';

interface PageProps {
  preferences: UserPreferences;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  setStatus: (s: 'idle' | 'listening' | 'processing' | 'speaking') => void;
}

export const Page: React.FC<PageProps> = ({ 
  preferences, 
  messages, 
  setMessages, 
  status, 
  setStatus 
}) => {
  const [input, setInput] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(async (text: string = input) => {
    const trimmed = text.trim();
    if (!trimmed || status === 'processing') return;

    setErrorStatus(null);
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
        const speakTime = Math.min(result.text.length * 70, 8000);
        setTimeout(() => setStatus('idle'), speakTime);
      } else {
        setStatus('idle');
      }

    } catch (error: any) {
      setErrorStatus(error.message);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `CRITICAL_FAULT: ${error.message}`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus('idle');
    }
  }, [input, messages, preferences, status, setMessages, setStatus]);

  const toggleListening = () => {
    if (status === 'listening') return;
    setStatus('listening');
    setErrorStatus(null);
    
    Voice.startListening(
      (text) => handleSend(text),
      () => setStatus('idle'),
      (error) => {
        setErrorStatus(error);
        const errorMsg: Message = {
          id: Date.now().toString(),
          role: Role.MODEL,
          content: error,
          timestamp: Date.now(),
          isError: true
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    );
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden relative">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <HoloCore state={status} />

        <div className={`w-full max-w-4xl px-12 py-8 bg-black/60 border-y-2 text-center min-h-[160px] flex flex-col items-center justify-center backdrop-blur-md relative transition-colors duration-500 ${errorStatus ? 'border-danger shadow-[inset_0_0_30px_rgba(255,68,0,0.1)]' : 'border-danger/30'}`}>
           <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-danger" />
           <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-right-2 border-danger" />
           
           {errorStatus && (
             <div className="mb-4 flex items-center gap-2 text-danger font-black text-xs animate-pulse">
                <WifiOff size={16} />
                <span>UPLINK_UNSTABLE: {errorStatus.includes('network') ? 'CHECK_CONNECTION' : 'HARDWARE_FAULT'}</span>
             </div>
           )}

           {lastMessage ? (
            <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
              <p className={`font-mono text-2xl md:text-4xl leading-relaxed tracking-tight ${lastMessage.isError ? 'text-danger' : 'text-slate-100 text-glow-red'}`}>
                {lastMessage.content}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30 italic font-mono uppercase tracking-[0.4em] text-xs">
              <ShieldAlert size={20} className="animate-pulse" />
              <span>AWAITING_UPLINK_COMMAND</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[30vh] md:h-full md:w-80 lg:w-[480px] border-t md:border-t-0 md:border-l border-danger/20 shadow-2xl">
        <SystemLog messages={messages} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <button 
            onClick={toggleListening}
            title="ভয়েস কমান্ড"
            className={`p-5 border-2 transition-all transform hover:scale-110 active:rotate-12 ${status === 'listening' ? 'border-holo text-holo bg-holo/10 animate-pulse shadow-[0_0_20px_rgba(255,140,0,0.4)]' : 'border-danger/40 text-danger hover:border-danger bg-danger/5 shadow-[0_0_15px_rgba(255,68,0,0.1)]'}`}
          >
            {status === 'listening' ? <Activity size={28} /> : <Mic size={28} />}
          </button>

          <div className="flex-1 flex items-center bg-black/90 border-2 border-danger/30 px-8 py-5 focus-within:border-danger transition-all group t3000-border shadow-[inset_0_0_20px_rgba(255,68,0,0.1)]">
            <span className="text-danger/60 font-mono mr-5 text-2xl font-black italic animate-pulse">CMD_</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={errorStatus ? "NETWORK FAULT - USE KEYBOARD..." : "ENTER DIRECTIVE..."}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-white/5 text-xl tracking-wider uppercase"
              disabled={status === 'processing' || status === 'listening'}
            />
          </div>

          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || status === 'processing'}
            className="p-5 bg-danger/10 border-2 border-danger/50 text-danger hover:bg-danger hover:text-black transition-all disabled:opacity-20 shadow-[0_0_15px_rgba(255,68,0,0.2)] font-black uppercase tracking-widest"
          >
            <Send size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};
