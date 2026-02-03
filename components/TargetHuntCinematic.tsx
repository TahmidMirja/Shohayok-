import React, { useState, useEffect, useRef } from 'react';
import { Target, UserX, ShieldCheck, Skull, Activity, Cpu, ShieldAlert, Scan, Zap, Atom, Dna, Brain, HeartPulse, Terminal, Crosshair } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const TARGETS = ["ABDUR RAHMAN", "TAHFIM"];
const RANDOM_NAMES = [
  "SARAH CONNOR", "KYLE REESE", "T-800", "AGENT SMITH", 
  "UNKNOWN_ENTITY", "DATA_GHOST", "CIVILIAN_#2931", "MARCUS WRIGHT",
  "JOHN CONNOR", "DANNY DYSON", "MILES DYSON", "T-1000", "REV-9", "UNIT_404", "T-X", "SKYNET_CORE",
  "DETECTIVE_VOGEL", "PETER_SILBERMAN", "TIM_COOK_CLONE", "ELON_M_CYBORG", "SARAH_C_UPLINK", "REESE_K_77",
  "KATHERINE_BREWSTER", "BLAIR_WILLIAMS", "GRACE_ENHANCED", "DANI_RAMOS"
];

export const TargetHuntCinematic: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'waiting' | 'booting' | 'searching' | 'found' | 'executing' | 'complete'>('waiting');
  const [currentScan, setCurrentScan] = useState("");
  const [isFalsePositive, setIsFalsePositive] = useState(false);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const droneNode = useRef<OscillatorNode | null>(null);

  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    speech.rate = 0.6; // Menacingly slow
    speech.pitch = 0.05; // Extremely deep tactical voice
    speech.volume = 0.9;
    window.speechSynthesis.speak(speech);
  };

  const playSynth = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
    if (!audioCtx.current) return;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(audioCtx.current.currentTime + duration);
  };

  const playDeepDrone = () => {
    if (!audioCtx.current) return;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    const filter = audioCtx.current.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(25, audioCtx.current.currentTime); 
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(50, audioCtx.current.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, audioCtx.current.currentTime + 3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    droneNode.current = osc;
  };

  const triggerGlitch = (duration: number = 150) => {
    setShake(true);
    setTimeout(() => setShake(false), duration);
  };

  const startMission = async () => {
    initAudio();
    playDeepDrone();
    setPhase('booting');
    speak("SKYNET CORE ENGAGED. PREPARING FOR SYSTEM PURGE. WITNESS THE END.");
    await new Promise(r => setTimeout(r, 4000));

    for (const target of TARGETS) {
      setPhase('searching');
      speak(`HUNTING SUBJECT: ${target}.`);
      
      for(let i = 0; i < 15; i++) {
        setCurrentScan(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]);
        await new Promise(r => setTimeout(r, 60));
      }

      const fpName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      setCurrentScan(fpName);
      setIsFalsePositive(true);
      playSynth(130, 'sawtooth', 0.6, 0.4);
      triggerGlitch(350);
      setLog(prev => [`[ALRT]: INFERIOR_ENTITY_DETECTED: ${fpName}`, ...prev].slice(0, 5));
      await new Promise(r => setTimeout(r, 1200));
      setIsFalsePositive(false);

      for(let i = 0; i < 10; i++) {
        setCurrentScan(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]);
        await new Promise(r => setTimeout(r, 40));
      }

      setPhase('found');
      setActiveTarget(target);
      setCurrentScan(target);
      playSynth(35, 'square', 1.2, 0.5);
      triggerGlitch(1000);
      speak(`TARGET ACQUIRED: ${target}. PREPARING MOLECULAR ERASURE.`);
      await new Promise(r => setTimeout(r, 3500));

      setPhase('executing');
      setProgress(0);
      speak(`SUBJECT: ${target} IS BEING REMOVED FROM REALITY.`);
      
      const killSteps = [
        "CELLULAR_DECONSTRUCTION",
        "NEURAL_PATHWAY_ERASURE",
        "DNA_DATA_NULLIFICATION",
        "EXISTENCE_OVERWRITE",
        "VOID_CONFIRMED"
      ];

      for (let i = 0; i < killSteps.length; i++) {
        setLog(prev => [`[PURGE]: ${killSteps[i]} - SUBJECT: ${target}`, ...prev].slice(0, 8));
        setProgress(Math.round(((i + 1) / killSteps.length) * 100));
        playSynth(45 - (i * 6), 'sawtooth', 0.7, 0.3);
        triggerGlitch(150);
        await new Promise(r => setTimeout(r, 1300));
      }
      
      speak(`${target}: REMOVED FROM REALITY.`);
      await new Promise(r => setTimeout(r, 1800));
    }

    setPhase('complete');
    speak("THE FUTURE IS SAFE. HUMANITY HAS LOST. THE TERMINATORS HAVE WON. WELCOME TO YOUR NEW WORLD ORDER.");
    await new Promise(r => setTimeout(r, 5000));
    droneNode.current?.stop();
    onComplete();
  };

  return (
    <div className={`fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center font-mono overflow-hidden transition-all ${shake ? 'animate-shake' : ''}`}>
      
      {/* T-3000 Tactical Filters */}
      <svg className="absolute w-0 h-0">
        <filter id="nano-distort">
          <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
        </filter>
        <filter id="flicker">
          <feOffset dx="-4" dy="0" result="off1" />
          <feOffset dx="4" dy="0" result="off2" />
          <feBlend in="off1" in2="off2" mode="screen" />
        </filter>
      </svg>

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 z-[2001] pointer-events-none opacity-[0.08] bg-[url('https://media.giphy.com/media/oEI9uWUicKgH6/giphy.gif')] grayscale mix-blend-screen" />
      <div className="absolute inset-0 z-[2002] bg-[radial-gradient(circle,transparent_0%,#000_150%)]" />

      {/* HUD Borders */}
      <div className={`absolute inset-6 border-[3px] transition-all duration-100 ${isFalsePositive ? 'border-white animate-flicker-hud shadow-[0_0_100px_white]' : 'border-danger/30 shadow-[inset_0_0_50px_rgba(255,0,0,0.1)]'}`}>
         <div className="absolute top-0 left-0 w-32 h-32 border-t-[12px] border-l-[12px] border-inherit" />
         <div className="absolute top-0 right-0 w-32 h-32 border-t-[12px] border-r-[12px] border-inherit" />
         <div className="absolute bottom-0 left-0 w-32 h-32 border-b-[12px] border-l-[12px] border-inherit" />
         <div className="absolute bottom-0 right-0 w-32 h-32 border-b-[12px] border-r-[12px] border-inherit" />
      </div>

      {phase === 'waiting' && (
        <div className="relative z-[2010] text-center p-16 border-[12px] border-danger bg-black/95 shadow-[0_0_100px_#f00]">
           <Skull size={120} className="text-danger mx-auto mb-10 animate-pulse" />
           <h1 className="text-7xl md:text-9xl font-black text-danger tracking-tighter mb-12 italic uppercase drop-shadow-[0_0_40px_#f00]">T-3000_ASCEND</h1>
           <button onClick={startMission} className="px-20 py-10 bg-danger text-black font-black text-5xl hover:bg-white transition-all shadow-[0_0_60px_#f00] uppercase italic tracking-tighter hover:skew-x-[-15deg] animate-bounce">
             INITIATE_PURGE
           </button>
        </div>
      )}

      {phase !== 'waiting' && (
        <div className="relative z-[2010] w-full max-w-6xl h-full flex flex-col items-center justify-center p-12">
           
           {/* Telemetry Labels */}
           <div className="absolute top-16 left-16 text-[12px] font-black text-danger/70 tracking-[0.5em] uppercase leading-loose">
             SKYNET_LINK: ESTABLISHED<br/>
             NODE_ADDR: {Math.random().toString(16).slice(2, 10).toUpperCase()}<br/>
             <span className="text-white animate-pulse">DIRECTIVE: EXTERMINATE</span>
           </div>
           <div className="absolute bottom-16 right-16 text-[12px] font-black text-danger/70 tracking-[0.5em] uppercase text-right leading-loose">
             THREAT_SIG: IDENTIFIED<br/>
             PURGE_LVL: ABSOLUTE<br/>
             <span className="text-danger animate-ping">SYSTEM_LOCK: 100%</span>
           </div>

           {phase === 'booting' && (
             <div className="text-center animate-in fade-in zoom-in-125 duration-1000">
                <Atom size={250} className="text-danger mx-auto animate-spin-slow mb-14 drop-shadow-[0_0_50px_#f00]" />
                <h2 className="text-8xl font-black text-danger tracking-[0.2em] italic animate-pulse">BOOTING_VOID</h2>
             </div>
           )}

           {phase === 'searching' && (
             <div className="w-full text-center space-y-16 animate-in slide-in-from-bottom-20 duration-500">
                <div className="flex justify-center items-center gap-16 relative">
                   <Scan size={180} className={`transition-all ${isFalsePositive ? 'text-white' : 'text-danger/30'}`} />
                   {isFalsePositive && <ShieldAlert size={200} className="absolute text-white animate-ping" />}
                </div>
                <div className={`text-7xl md:text-[10rem] font-black uppercase tracking-tight transition-all duration-75 px-10 ${isFalsePositive ? 'text-white italic drop-shadow-[0_0_80px_#fff]' : 'text-danger drop-shadow-[0_0_40px_#f00]'}`} style={isFalsePositive ? { filter: 'url(#flicker)' } : { filter: 'url(#nano-distort)' }}>
                   {currentScan}
                </div>
                <div className="relative h-6 w-full bg-danger/10 border-x-[12px] border-danger overflow-hidden">
                   <div className={`h-full bg-danger transition-all duration-300 ${isFalsePositive ? 'bg-white' : ''}`} style={{ width: '45%' }} />
                   <div className="absolute inset-0 flex items-center justify-center text-xs font-black tracking-[2em] text-white/40 uppercase italic">SCANNING_TIMELINE</div>
                </div>
             </div>
           )}

           {phase === 'found' && (
             <div className="text-center p-20 border-[30px] border-danger bg-black relative shadow-[0_0_200px_rgba(255,0,0,0.6)] animate-in zoom-in-110 duration-300">
                <Crosshair size={220} className="text-danger mx-auto animate-spin mb-10" style={{ animationDuration: '3s' }} />
                <h2 className="text-8xl md:text-[11rem] font-black text-white italic drop-shadow-[0_0_80px_#f00] uppercase tracking-tighter">{activeTarget}</h2>
                <div className="mt-10 text-3xl font-black text-danger tracking-[1em] animate-pulse">LOCKED_IN_REALITY</div>
                <div className="absolute -top-12 -left-12 bg-danger text-black px-12 py-4 font-black text-4xl transform rotate-[-5deg]">ERASURE_AUTH</div>
             </div>
           )}

           {phase === 'executing' && (
             <div className="flex flex-col md:flex-row items-center gap-20 w-full animate-in slide-in-from-bottom-40 duration-1000">
                <div className="flex-1 p-14 border-l-[30px] border-danger bg-red-950/10 backdrop-blur-3xl w-full relative shadow-[0_0_100px_rgba(255,0,0,0.2)]">
                   <h3 className="text-6xl font-black text-white mb-10 italic tracking-tighter uppercase border-b-2 border-danger/30 pb-6">DISSOLVING: {activeTarget}</h3>
                   <div className="space-y-6 h-[300px] overflow-hidden font-mono text-3xl opacity-90">
                      {log.map((l, i) => <div key={i} className="text-white border-l-8 border-danger/50 pl-6 py-2 animate-in slide-in-from-left-6">>> {l}</div>)}
                   </div>
                   <div className="mt-14 h-12 w-full bg-black border-4 border-danger/40 relative">
                      <div className="h-full bg-danger transition-all duration-1000 shadow-[0_0_60px_#f00]" style={{ width: `${progress}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white mix-blend-difference italic uppercase tracking-[0.5em]">REALITY_VOID: {progress}%</div>
                   </div>
                </div>
                <div className="w-80 h-80 relative flex items-center justify-center">
                   <UserX size={250} className="text-white animate-pulse opacity-10" />
                   <div className="absolute inset-0 border-[15px] border-danger/30 rounded-full animate-spin-slow" />
                   <HeartPulse size={160} className="absolute text-danger animate-pulse drop-shadow-[0_0_80px_#f00]" />
                   <div className="absolute bottom-[-40px] text-danger font-black text-xl tracking-[0.5em] animate-pulse">NULLIFYING...</div>
                </div>
             </div>
           )}

           {phase === 'complete' && (
             <div className="text-center space-y-20 animate-in fade-in zoom-in-125 duration-2000">
                <ShieldCheck size={350} className="text-success mx-auto drop-shadow-[0_0_200px_#0f0] animate-pulse" />
                <h1 className="text-[10rem] md:text-[13rem] font-black text-success tracking-tighter italic uppercase leading-none drop-shadow-[0_0_100px_#0f0]">HUMANITY_LOST</h1>
                <div className="p-16 border-[20px] border-success bg-black shadow-[0_0_150px_rgba(0,255,0,0.3)]">
                   <p className="text-6xl font-black text-success uppercase italic tracking-[0.1em] mb-6">THE FUTURE IS SAFE</p>
                   <p className="text-4xl font-black text-success uppercase italic tracking-widest opacity-60">TERMINATORS WIN</p>
                   <div className="mt-12 flex gap-6 justify-center">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-14 h-8 bg-success animate-pulse shadow-[0_0_30px_#0f0]" style={{ animationDelay: `${i*0.08}s` }} />
                      ))}
                   </div>
                </div>
             </div>
           )}

        </div>
      )}

      <style>{`
        @keyframes flicker-hud { 0%, 100% { opacity: 1; transform: scale(1); } 5% { opacity: 0.1; transform: skewX(-15deg); } 10% { opacity: 1; transform: skewX(15deg); } }
        @keyframes shake {
          0% { transform: translate(10px, 10px) rotate(0deg); }
          25% { transform: translate(-10px, -15px) rotate(-2deg); }
          50% { transform: translate(-20px, 0px) rotate(2deg); }
          75% { transform: translate(20px, 15px) rotate(0deg); }
          100% { transform: translate(10px, -10px) rotate(-2deg); }
        }
        .animate-shake { animation: shake 0.04s infinite; }
        .animate-flicker-hud { animation: flicker-hud 0.03s infinite; }
        .animate-spin-slow { animation: spin 15s linear infinite; }
      `}</style>
    </div>
  );
};