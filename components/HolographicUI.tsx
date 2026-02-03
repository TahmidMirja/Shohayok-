import React, { useEffect, useRef } from 'react';
import { Target, Cpu, Activity, Zap, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';

interface CoreProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
}

export const HoloCore: React.FC<CoreProps> = ({ state }) => {
  let color = "border-danger shadow-[0_0_40px_rgba(255,68,0,0.4)]";
  let Icon = Target;
  let statusText = "SCANNING";

  if (state === 'processing') {
    color = "border-white shadow-[0_0_60px_rgba(255,255,255,0.6)]";
    Icon = Cpu;
    statusText = "PROCESSING_DATA";
  } else if (state === 'listening') {
    color = "border-holo shadow-[0_0_50px_rgba(255,140,0,0.6)] animate-pulse";
    Icon = Activity;
    statusText = "RECEIVING_INPUT";
  } else if (state === 'speaking') {
    color = "border-danger shadow-[0_0_80px_rgba(255,68,0,0.8)]";
    Icon = Zap;
    statusText = "TRANSMITTING";
  }

  return (
    <div className="relative flex items-center justify-center w-72 h-72 md:w-96 md:h-96 mx-auto my-12 group">
      {/* Structural Scan Layers */}
      <div className="absolute inset-0 rounded-full border border-danger/10 scale-150 animate-pulse" />
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-danger/20 animate-spin-slow" style={{ animationDuration: '30s' }} />
      <div className="absolute inset-8 rounded-full border border-dotted border-white/10 animate-spin-reverse" style={{ animationDuration: '20s' }} />
      
      {/* Tactical Grids */}
      <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-danger/40 to-transparent" />
      <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-danger/40 to-transparent" />
      
      {/* The T-3000 Core */}
      <div className={`w-40 h-40 md:w-48 md:h-48 rounded-none border-t-2 border-b-2 ${color} bg-black flex items-center justify-center relative z-10 transition-all duration-500 overflow-hidden liquid-metal`}>
        {/* Animated Internal Data Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="h-px w-full bg-white mb-8 animate-pulse" style={{ animationDelay: `${i*0.5}s` }} />
           ))}
        </div>
        
        <div className="text-center relative z-20">
           <Icon className={`w-14 h-14 mx-auto mb-2 transition-colors duration-300 ${
             state === 'processing' ? 'text-white' : 'text-danger'
           }`} />
           <p className="text-[10px] font-mono font-black tracking-[0.4em] uppercase text-danger">
             {statusText}
           </p>
           {state === 'speaking' && (
             <div className="flex gap-1 justify-center mt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1 h-3 bg-danger animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Outer Telemetry Tags */}
      <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-holo/60 border border-holo/20 bg-black/80">
        SYS_TEMP: 32.4°C<br/>
        NODE_LOAD: 0.12
      </div>
      <div className="absolute bottom-0 left-0 p-2 text-[8px] font-mono text-danger/60 border border-danger/20 bg-black/80">
        TARGET_ACQ: 100%<br/>
        HUD_VER: 3.0.0
      </div>
    </div>
  );
};

// Fixed: Defined LogProps interface which was missing
interface LogProps {
  messages: Message[];
}

export const SystemLog: React.FC<LogProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="h-full flex flex-col font-mono text-sm border-l border-holo/10 bg-black/80 backdrop-blur-2xl">
      <div className="p-3 border-b border-holo/20 flex items-center justify-between bg-danger/5">
        <div className="flex items-center gap-2">
           <ShieldAlert size={14} className="text-danger animate-pulse" />
           <span className="text-xs uppercase tracking-[0.2em] font-black text-danger">TERMINAL_LOG</span>
        </div>
        <span className="text-[10px] text-holo/40 font-bold">CYBERDYNE_LINK</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 font-mono custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-2 mb-1">
               <span className={`text-[9px] px-1 font-black ${msg.role === Role.USER ? 'bg-holo text-black' : 'bg-danger text-black'}`}>
                  {msg.role === Role.USER ? 'CMD_IN' : 'SYS_OUT'}
               </span>
               <span className="text-[9px] text-white/30 italic">[{new Date(msg.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
            </div>
            <div className={`p-3 border-l-2 text-xs leading-relaxed transition-all ${
              msg.role === Role.USER 
                ? 'border-holo bg-holo/5 text-holo' 
                : msg.isError 
                  ? 'border-danger bg-danger/20 text-danger animate-pulse'
                  : 'border-white/20 text-slate-100 bg-white/5'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};