import { Activity, Radio, Cpu, Wifi, Zap } from 'lucide-react';
import { Message, Role } from '../types';
import React, { useEffect } from 'react';

interface CoreProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
}

export const HoloCore: React.FC<CoreProps> = ({ state }) => {
  // Dynamic styles based on state
  let color = "border-holo shadow-[0_0_30px_rgba(255,140,0,0.3)]";
  let ringColor = "border-holo/30";
  let coreAnim = "animate-pulse-slow";
  let Icon = Zap;
  
  if (state === 'processing') {
    color = "border-white shadow-[0_0_50px_rgba(255,255,255,0.4)]";
    ringColor = "border-white/30";
    coreAnim = "animate-spin-slow duration-[1.5s]";
    Icon = Cpu;
  } else if (state === 'listening') {
    color = "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]";
    ringColor = "border-red-500/30";
    coreAnim = "animate-pulse-fast";
    Icon = Radio;
  } else if (state === 'speaking') {
    color = "border-success shadow-[0_0_60px_rgba(255,204,0,0.6)]";
    ringColor = "border-success/30";
    coreAnim = "animate-pulse duration-[400ms]";
    Icon = Activity;
  } else {
    // Idle
    Icon = Zap;
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mx-auto my-8 transition-all duration-700">
      
      {/* Decorative Rotating Rings */}
      <div className={`absolute inset-0 rounded-full border border-dashed ${ringColor} animate-spin-reverse`} style={{ animationDuration: '25s' }} />
      <div className={`absolute inset-6 rounded-full border border-dotted ${ringColor} animate-spin-slow opacity-60`} style={{ animationDuration: '12s' }} />
      <div className={`absolute inset-14 rounded-full border-2 ${ringColor} opacity-30 rotate-12`} />
      
      {/* Main Core */}
      <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${color} ${coreAnim} bg-black/90 backdrop-blur-2xl flex items-center justify-center relative z-10 transition-all duration-500`}>
        <div className="text-center relative">
           {/* Inner Glow */}
           <div className={`absolute inset-0 bg-current opacity-20 blur-2xl rounded-full ${state === 'speaking' ? 'animate-ping' : ''}`}></div>
           
           <Icon className={`w-12 h-12 relative z-20 mx-auto transition-colors duration-300 ${
             state === 'processing' ? 'text-white' :
             state === 'listening' ? 'text-red-500' :
             state === 'speaking' ? 'text-success' : 'text-holo'
           }`} />
           
           <p className="mt-3 text-[9px] font-mono tracking-[0.4em] uppercase opacity-90 text-white/90">
             {state.toUpperCase()}
           </p>
        </div>
      </div>

      {/* Sci-fi Crosshairs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-holo/15 to-transparent" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-holo/15 to-transparent" />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-holo/60" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-holo/60" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-holo/60" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-holo/60" />
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
    <div className="h-full flex flex-col font-mono text-sm border-l border-holo/10 bg-black/60 backdrop-blur-md">
      <div className="p-3 border-b border-holo/20 flex items-center justify-between bg-holo/10">
        <div className="flex items-center gap-2">
           <Wifi size={14} className="text-holo animate-pulse" />
           <span className="text-xs uppercase tracking-[0.2em] font-bold text-holo">Live Telemetry</span>
        </div>
        <span className="text-[10px] text-holo/60 font-bold">ORANGE_LINK_v3</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 font-bangla custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === Role.USER ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <span className="text-[10px] text-holo/40 mb-1 font-mono tracking-widest uppercase">
              {msg.role === Role.USER ? '>> CMD_IN' : '>> SYS_OUT'} [{new Date(msg.timestamp).toLocaleTimeString([], {hour12: false})}]
            </span>
            <div className={`max-w-[92%] p-3 rounded-none border-l-4 text-sm leading-relaxed shadow-xl backdrop-blur-sm ${
              msg.role === Role.USER 
                ? 'border-holo bg-holo/20 text-holo text-glow' 
                : msg.isError 
                  ? 'border-danger bg-danger/20 text-danger'
                  : 'border-white/50 text-slate-200 bg-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};