'use client';

import React from 'react';
import { Shield, Settings, Power, Cpu, Target, Crosshair } from 'lucide-react';
import { UserPreferences } from '../types';

interface RootLayoutProps {
  children: React.ReactNode;
  preferences: UserPreferences;
  status: string;
  onShowSettings: () => void;
  onReset: () => void;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ 
  children, 
  preferences, 
  status, 
  onShowSettings, 
  onReset 
}) => {
  return (
    <html lang="bn">
      <head>
        <title>T-3000 Tactical Interface | {preferences.aiName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Rajdhani:wght@500;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        <style>{`
          body { background-color: #050200; color: #ff5500; margin: 0; overflow: hidden; font-family: 'Rajdhani', sans-serif; }
          .bg-grid {
            background-image: radial-gradient(circle, rgba(255, 85, 0, 0.1) 1px, transparent 1px);
            background-size: 30px 30px;
          }
          .t3000-border { border: 1px solid rgba(255, 85, 0, 0.3); position: relative; }
          .t3000-border::before { content: ""; position: absolute; top: -2px; left: -2px; width: 10px; height: 10px; border-top: 2px solid #ff5500; border-left: 2px solid #ff5500; }
          .t3000-border::after { content: ""; position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; border-bottom: 2px solid #ff5500; border-right: 2px solid #ff5500; }
          
          .scan-line {
            width: 100%; height: 2px; background: rgba(255, 85, 0, 0.2);
            position: absolute; top: 0; left: 0; z-index: 5;
            animation: scan 4s linear infinite;
          }
          @keyframes scan { 0% { top: 0% } 100% { top: 100% } }

          .text-glow-red { text-shadow: 0 0 10px rgba(255, 68, 0, 0.8), 0 0 20px rgba(255, 68, 0, 0.4); }
          
          .hud-bracket { position: absolute; width: 40px; height: 40px; border: 1px solid rgba(255, 85, 0, 0.5); }
          .top-left { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
          .top-right { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
          .bottom-left { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
          .bottom-right { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }

          .liquid-metal {
            background: linear-gradient(135deg, #1a0a00 0%, #331100 50%, #1a0a00 100%);
            box-shadow: inset 0 0 30px rgba(255, 85, 0, 0.2);
          }
        `}</style>
      </head>
      <body className="font-sans antialiased">
        {/* HUD Elements */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="hud-bracket top-left animate-pulse" />
          <div className="hud-bracket top-right animate-pulse" />
          <div className="hud-bracket bottom-left animate-pulse" />
          <div className="hud-bracket bottom-right animate-pulse" />
          <div className="scan-line opacity-30" />
          
          {/* Scrolling Data Lines */}
          <div className="absolute top-24 left-6 text-[8px] font-mono text-holo/40 flex flex-col gap-1 opacity-50">
            <span>0x3F_INIT_CORE...</span>
            <span>MEM_ADDR: 0x00FF21</span>
            <span>OS_VER: T3000.v9</span>
            <span className="animate-pulse text-holo">LINK_ESTABLISHED</span>
          </div>
          
          <div className="absolute bottom-32 right-6 text-[8px] font-mono text-holo/40 flex flex-col gap-1 opacity-50 text-right">
             <span>LOC_LAT: 23.8103N</span>
             <span>LOC_LON: 90.4125E</span>
             <span>SAT_LINK: 4/12</span>
          </div>
        </div>

        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#050200] text-holo relative select-none">
          <div className="bg-grid opacity-20 fixed inset-0 pointer-events-none" />
          
          <header className="h-14 flex items-center justify-between px-6 border-b border-holo/20 bg-black/80 backdrop-blur-xl relative z-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Target size={22} className="text-danger animate-spin-slow" />
                <Crosshair size={12} className="absolute inset-0 m-auto text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black tracking-widest text-sm uppercase leading-none italic">SKYNET_LINK: {preferences.aiName}</span>
                <span className="text-[9px] font-mono text-danger uppercase tracking-tighter font-bold">{status === 'idle' ? 'AWAITING_TARGET' : 'EXECUTING_PROTOCOL'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-holo/60">
                 <span className="flex items-center gap-1"><Cpu size={12}/> CORE_LOAD: 12.4%</span>
              </div>
              <button onClick={onShowSettings} className="hover:text-white transition-all hover:scale-110 active:scale-90"><Settings size={20} /></button>
              <button onClick={onReset} className="hover:text-danger transition-all hover:scale-110 active:scale-90"><Power size={20} /></button>
            </div>
          </header>

          <main className="flex-1 relative z-10 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
};
