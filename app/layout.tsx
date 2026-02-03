'use client';

import React from 'react';
import { Shield, Settings, Power, Cpu } from 'lucide-react';
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
        <title>Shohayok AI - Tactical Next.js System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&family=Hind+Siliguri:wght@400;600&display=swap" rel="stylesheet" />
        <style>{`
          body { background-color: #080400; color: #ff8c00; margin: 0; overflow: hidden; }
          .bg-grid {
            background-image: linear-gradient(rgba(255, 140, 0, 0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 140, 0, 0.04) 1px, transparent 1px);
            background-size: 50px 50px;
          }
          .text-glow { text-shadow: 0 0 12px rgba(255, 140, 0, 0.8); }
          .scanline::before {
            content: " "; display: block; position: absolute; inset: 0;
            background: linear-gradient(rgba(18, 10, 0, 0) 50%, rgba(0, 0, 0, 0.2) 50%),
                        linear-gradient(90deg, rgba(255, 100, 0, 0.02), rgba(255, 200, 0, 0.01));
            z-index: 10; background-size: 100% 2px, 3px 100%; pointer-events: none;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #110800; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #4d2a00; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff8c00; }
        `}</style>
      </head>
      <body className="scanline font-sans">
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#050300] text-holo relative select-none">
          <div className="bg-grid opacity-30 fixed inset-0 pointer-events-none" />
          <div className="bg-radial absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(255, 140, 0, 0.07) 0%, transparent 75%)' }} />
          
          <header className="h-14 flex items-center justify-between px-6 border-b border-holo/10 bg-black/40 backdrop-blur-md relative z-20">
            <div className="flex items-center gap-4">
              <Shield size={18} className="text-holo animate-pulse" />
              <div className="flex flex-col">
                <span className="font-mono font-black tracking-widest text-sm uppercase leading-none">OS: {preferences.aiName}_VERCEL</span>
                <span className="text-[9px] font-mono text-holo/40 uppercase tracking-tighter">Status: {status.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">
                 <span className="flex items-center gap-1"><Cpu size={12}/> VERCEL_NODE: ACTIVE</span>
              </div>
              <button onClick={onShowSettings} className="hover:text-white transition-all"><Settings size={20} /></button>
              <button onClick={onReset} className="hover:text-danger transition-all"><Power size={20} /></button>
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
