import React, { useEffect, useState } from 'react';
import { Activity, Radio, Cpu, Wifi, Zap } from 'lucide-react';
import { Message, Role } from '../types';

interface CoreProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
}

export const HoloCore: React.FC<CoreProps> = ({ state }) => {
  // Dynamic styles based on state
  let color = "border-holo shadow-[0_0_30px_rgba(0,243,255,0.3)]";
  let ringColor = "border-holo/30";
  let coreAnim = "animate-pulse-slow";
  let Icon = Zap;
  
  if (state === 'processing') {
    color = "border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.5)]";
    ringColor = "border-amber-400/30";
    coreAnim = "animate-spin-slow duration-[2s]"; // Faster spin
    Icon = Cpu;
  } else if (state === 'listening') {
    color = "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]";
    ringColor = "border-red-500/30";
    coreAnim = "animate-pulse-fast";
    Icon = Radio;
  } else if (state === 'speaking') {
    color = "border-success shadow-[0_0_60px_rgba(0,255,157,0.6)]";
    ringColor = "border-success/30";
    coreAnim = "animate-pulse duration-[500ms]";
    Icon = Activity;
  } else {
    // Idle
    Icon = Zap;
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mx-auto my-8 transition-all duration-700">
      
      {/* Decorative Rotating Rings */}
      <div className={`absolute inset-0 rounded-full border border-dashed ${ringColor} animate-spin-reverse`} style={{ animationDuration: '20s' }} />
      <div className={`absolute inset-4 rounded-full border border-dotted ${ringColor} animate-spin-slow opacity-70`} style={{ animationDuration: '10s' }} />
      <div className={`absolute inset-12 rounded-full border-2 ${ringColor} opacity-40 rotate-45`} />
      
      {/* Main Core */}
      <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${color} ${coreAnim} bg-black/80 backdrop-blur-xl flex items-center justify-center relative z-10 transition-all duration-500`}>
        <div className="text-center relative">
           {/* Inner Glow */}
           <div className={`absolute inset-0 bg-current opacity-20 blur-xl rounded-full ${state === 'speaking' ? 'animate-ping' : ''}`}></div>
           
           <Icon className={`w-12 h-12 relative z-20 mx-auto transition-colors duration-300 ${
             state === 'processing' ? 'text-amber-400' :
             state === 'listening' ? 'text-red-500' :
             state === 'speaking' ? 'text-success' : 'text-holo'
           }`} />
           
           <p className="mt-3 text-[10px] font-mono tracking-[0.3em] uppercase opacity-80 text-white">
             {state.toUpperCase()}
           </p>
        </div>
      </div>

      {/* Sci-fi Crosshairs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-holo/20 to-transparent" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-holo/20 to-transparent" />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-holo/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-holo/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-holo/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-holo/50" />
    </div>
  );
};

interface LogProps {
  messages: Message[];
}

export const SystemLog: React.FC<LogProps> = ({ messages }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col font-mono text-sm border-l border-holo/20 bg-black/40 backdrop-blur-sm">
      <div className="p-2 border-b border-holo/20 flex items-center justify-between bg-holo/5">
        <div className="flex items-center gap-2">
           <Wifi size={14} className="text-holo animate-pulse" />
           <span className="text-xs uppercase tracking-widest text-holo/90">System Log</span>
        </div>
        <span className="text-[10px] text-holo/40">SECURE_CONN</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-bangla custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === Role.USER ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <span className="text-[9px] text-slate-500 mb-1 font-mono tracking-wider">
              {msg.role === Role.USER ? '>> USER_INPUT' : '>> SYSTEM_RESPONSE'} [{new Date(msg.timestamp).toLocaleTimeString([], {hour12: false})}]
            </span>
            <div className={`max-w-[90%] p-3 rounded-sm border-l-2 text-sm leading-relaxed shadow-lg ${
              msg.role === Role.USER 
                ? 'border-holo bg-holo/10 text-holo' 
                : msg.isError 
                  ? 'border-danger bg-danger/10 text-danger'
                  : 'border-white/40 text-slate-300 bg-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
