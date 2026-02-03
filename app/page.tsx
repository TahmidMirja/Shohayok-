'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Send, Mic } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

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
        const speakTime = Math.min(result.text.length * 65, 6000);
        setTimeout(() => setStatus('idle'), speakTime);
      } else {
        setStatus('idle');
      }

    } catch (error: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `UPLINK_FAILURE: ${error.message || "Unknown Connection Loss"}`,
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
    Voice.startListening(
      (text) => handleSend(text),
      () => setStatus('idle')
    );
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-10 text-center w-full pointer-events-none">
          <h1 className="text-3xl font-mono font-black tracking-widest text-white text-glow mb-1 uppercase">
            {preferences.aiName}
          </h1>
          <p className="text-[10px] font-mono tracking-[0.5em] opacity-40 uppercase">
            {status}
          </p>
        </div>

        <HoloCore state={status} />

        <div className="w-full max-w-3xl px-8 py-6 bg-holo/5 border-y border-holo/10 text-center min-h-[120px] flex items-center justify-center">
          {lastMessage ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
              <p className={`font-bangla text-xl md:text-3xl leading-relaxed ${lastMessage.isError ? 'text-danger' : 'text-white text-glow'}`}>
                {lastMessage.content}
              </p>
            </div>
          ) : (
            <p className="text-holo/20 font-mono text-xs tracking-[0.4em] uppercase italic">System Hydrated. Waiting for Command...</p>
          )}
        </div>
      </div>

      <div className="h-[35vh] md:h-full md:w-80 lg:w-[450px] border-t md:border-t-0 md:border-l border-holo/10 shadow-2xl">
        <SystemLog messages={messages} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/90 backdrop-blur-2xl border-t border-holo/20 z-30">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button 
            onClick={toggleListening}
            className={`p-4 border-2 transition-all transform hover:scale-105 ${status === 'listening' ? 'border-danger text-danger bg-danger/10 animate-pulse' : 'border-holo/30 text-holo hover:border-holo bg-white/5'}`}
          >
            <Mic size={24} />
          </button>

          <div className="flex-1 flex items-center bg-white/5 border-2 border-white/10 px-6 py-4 focus-within:border-holo/60 transition-all group shadow-inner">
            <span className="text-holo/60 font-mono mr-4 text-xl group-focus-within:text-holo">CMD></span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Deploy system command..."
              className="flex-1 bg-transparent border-none outline-none text-white font-bangla placeholder-holo/10 text-lg"
              disabled={status === 'processing' || status === 'listening'}
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
      </div>
    </div>
  );
};
