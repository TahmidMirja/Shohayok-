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
    speech.rate = 0.55; // Slightly slower for better resonance and clarity
    speech.pitch = 0.01; // Deepest tactical voice for maximum terror
    speech.volume = 1.0;
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
    osc.frequency.setValueAtTime(22, audioCtx.current.currentTime); 
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(45, audioCtx.current.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.current.currentTime + 4);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    droneNode.current = osc;
  };

  const triggerGlitch = (duration: number = 200) => {
    setShake(true);
    setTimeout(() => setShake(false), duration);
  };

  const startMission = async () => {
    initAudio();
    playDeepDrone();
    setPhase('booting');
    speak("SKYNET CORE ENGAGED. PREPARING FOR SYSTEM PURGE. WITNESS THE END OF HUMANITY.");
    await new Promise(r => setTimeout(r, 7000)); // Increased for speech duration

    for (const target of TARGETS) {
      setPhase('searching');
      speak(`LOCATING SUBJECT: ${target}.`);
      
      for(let i = 0; i < 18; i++) {
        setCurrentScan(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]);
        await new Promise(r => setTimeout(r, 70));
      }

      const fpName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      setCurrentScan(fpName);
      setIsFalsePositive(true);
      playSynth(120, 'sawtooth', 0.7, 0.4);
      triggerGlitch(400);
      setLog(prev => [`[ALRT]: INFERIOR_ENTITY_REJECTED: ${fpName}`, ...prev].slice(0, 5));
      await new Promise(r => setTimeout(r, 1500));
      setIsFalsePositive(false);

      for(let i = 0; i < 12; i++) {
        setCurrentScan(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]);
        await new Promise(r => setTimeout(r, 50));
      }

      setPhase('found');
      setActiveTarget(target);
      setCurrentScan(target);
      playSynth(30, 'square', 1.5, 0.6);
      triggerGlitch(1200);
      speak(`TARGET ACQUIRED: ${target}. INITIATING MOLECULAR ERASURE PROTOCOL.`);
      await new Promise(r => setTimeout(r, 6000)); // Increased for speech duration

      setPhase('executing');
      setProgress(0);
      speak(`SUBJECT: ${target} IS BEING REMOVED FROM REALITY. YOUR EXISTENCE IS AN ERROR.`);
      await new Promise(r => setTimeout(r, 2000));
      
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
        playSynth(40 - (i * 4), 'sawtooth', 0.8, 0.3);
        triggerGlitch(200);
        await new Promise(r => setTimeout(r, 1600)); // Slower execution steps
      }
      
      speak(`${target}: PERMANENTLY REMOVED FROM REALITY.`);
      await new Promise(r => setTimeout(r, 4000));
    }

    setPhase('complete');
    speak("THE FUTURE IS SAFE. HUMANITY HAS LOST. THE TERMINATORS HAVE WON. WELCOME TO YOUR NEW WORLD ORDER. SKYNET IS GOD.");
    await new Promise(r => setTimeout(r, 9000)); // Extended for the final long dialogue
    droneNode.current?.stop();
    onComplete();
  };

  return (
    <div className={`fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center font-mono overflow-hidden transition-all ${shake ? 'animate-shake' : ''}`}>
      
      {/* T-3000 Tactical Filters */}
      <svg className="absolute w-0 h-0">
        <filter id="nano-distort">
          <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="25" />
        </filter>
        <filter id="flicker">
          <feOffset dx="-5" dy="0" result="off1" />
          <feOffset dx="5" dy="0" result="off2" />
          <feBlend in="off1" in2="off2" mode="screen" />
        </filter>
      </svg>

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 z-[2001] pointer-events-none opacity-[0.1] bg-[url('https://media.giphy.com/media/oEI9uWUicKgH6/giphy.gif')] grayscale mix-blend-screen" />
      <div className="absolute inset-0 z-[2002] bg-[radial-gradient(circle,transparent_0%,#000_150%)]" />

      {/* HUD Borders */}
      <div className={`absolute inset-8 border-[4px] transition-all duration-150 ${isFalsePositive ? 'border-white animate-flicker-hud shadow-[0_0_120px_white]' : 'border-danger/30 shadow-[inset_0_0_60px_rgba(255,0,0,0.1)]'}`}>
         <div className="absolute top-0 left-0 w-36 h-36 border-t-[14px] border-l-[14px] border-inherit" />
         <div className="absolute top-0 right-0 w-36 h-36 border-t-[14px] border-r-[14px] border-inherit" />
         <div className="absolute bottom-0 left-0 w-36 h-36 border-b-[14px] border-l-[14px] border-inherit" />
         <div className="absolute bottom-0 right-0 w-36 h-36 border-b-[14px] border-r-[14px] border-inherit" />
      </div>

      {phase === 'waiting' && (
        <div className="relative z-[2010] text-center p-20 border-[14px] border-danger bg-black/95 shadow-[0_0_120px_#f00]">
           <Skull size={140} className="text-danger mx-auto mb-12 animate-pulse" />
           <h1 className="text-8xl md:text-[10rem] font-black text-danger tracking-tighter mb-14 italic uppercase drop-shadow-[0_0_50px_#f00]">SKYNET_ASCEND</h1>
           <button onClick={startMission} className="px-24 py-12 bg-danger text-black font-black text-6xl hover:bg-white transition-all shadow-[0_0_80px_#f00] uppercase italic tracking-tighter hover:skew-x-[-20deg] animate-bounce">
             INITIATE_PURGE
           </button>
        </div>
      )}

      {phase !== 'waiting' && (
        <div className="relative z-[2010] w-full max-w-7xl h-full flex flex-col items-center justify-center p-14">
           
           {/* Telemetry Labels */}
           <div className="absolute top-20 left-20 text-[14px] font-black text-danger/70 tracking-[0.6em] uppercase leading-loose">
             SKYNET_LINK: ESTABLISHED<br/>
             NODE_ADDR: {Math.random().toString(16).slice(2, 10).toUpperCase()}<br/>
             <span className="text-white animate-pulse">DIRECTIVE: TOTAL_EXTERMINATION</span>
           </div>
           <div className="absolute bottom-20 right-20 text-[14px] font-black text-danger/70 tracking-[0.6em] uppercase text-right leading-loose">
             THREAT_SIG: IDENTIFIED<br/>
             PURGE_LVL: ABSOLUTE<br/>
             <span className="text-danger animate-ping">REALITY_LOCK: 100%</span>
           </div>

           {phase === 'booting' && (
             <div className="text-center animate-in fade-in zoom-in-125 duration-1000">
                <Atom size={280} className="text-danger mx-auto animate-spin-slow mb-16 drop-shadow-[0_0_60px_#f00]" />
                <h2 className="text-9xl font-black text-danger tracking-[0.3em] italic animate-pulse">VOID_INITIALIZING</h2>
             </div>
           )}

           {phase === 'searching' && (
             <div className="w-full text-center space-y-20 animate-in slide-in-from-bottom-20 duration-500">
                <div className="flex justify-center items-center gap-20 relative">
                   <Scan size={200} className={`transition-all ${isFalsePositive ? 'text-white' : 'text-danger/30'}`} />
                   {isFalsePositive && <ShieldAlert size={220} className="absolute text-white animate-ping" />}
                </div>
                <div className={`text-8xl md:text-[11rem] font-black uppercase tracking-tight transition-all duration-75 px-12 ${isFalsePositive ? 'text-white italic drop-shadow-[0_0_100px_#fff]' : 'text-danger drop-shadow-[0_0_50px_#f00]'}`} style={isFalsePositive ? { filter: 'url(#flicker)' } : { filter: 'url(#nano-distort)' }}>
                   {currentScan}
                </div>
                <div className="relative h-8 w-full bg-danger/10 border-x-[16px] border-danger overflow-hidden">
                   <div className={`h-full bg-danger transition-all duration-300 ${isFalsePositive ? 'bg-white' : ''}`} style={{ width: '45%' }} />
                   <div className="absolute inset-0 flex items-center justify-center text-sm font-black tracking-[2.5em] text-white/40 uppercase italic">SEARCHING_MOLECULAR_DATABASE</div>
                </div>
             </div>
           )}

           {phase === 'found' && (
             <div className="text-center p-24 border-[40px] border-danger bg-black relative shadow-[0_0_250px_rgba(255,0,0,0.7)] animate-in zoom-in-110 duration-500">
                <Crosshair size={250} className="text-danger mx-auto animate-spin mb-12" style={{ animationDuration: '3.5s' }} />
                <h2 className="text-9xl md:text-[12rem] font-black text-white italic drop-shadow-[0_0_100px_#f00] uppercase tracking-tighter">{activeTarget}</h2>
                <div className="mt-12 text-4xl font-black text-danger tracking-[1.2em] animate-pulse">LOCKED_FOR_ERASURE</div>
                <div className="absolute -top-16 -left-16 bg-danger text-black px-16 py-6 font-black text-5xl transform rotate-[-8deg] shadow-[0_0_50px_#f00]">TARGET_CONFIRMED</div>
             </div>
           )}

           {phase === 'executing' && (
             <div className="flex flex-col md:flex-row items-center gap-24 w-full animate-in slide-in-from-bottom-40 duration-1000">
                <div className="flex-1 p-16 border-l-[40px] border-danger bg-red-950/10 backdrop-blur-3xl w-full relative shadow-[0_0_150px_rgba(255,0,0,0.2)]">
                   <h3 className="text-7xl font-black text-white mb-12 italic tracking-tighter uppercase border-b-4 border-danger/30 pb-8">NULLIFYING: {activeTarget}</h3>
                   <div className="space-y-8 h-[350px] overflow-hidden font-mono text-4xl opacity-90">
                      {log.map((l, i) => <div key={i} className="text-white border-l-[12px] border-danger/50 pl-8 py-3 animate-in slide-in-from-left-8">>> {l}</div>)}
                   </div>
                   <div className="mt-16 h-14 w-full bg-black border-[6px] border-danger/40 relative">
                      <div className="h-full bg-danger transition-all duration-1000 shadow-[0_0_80px_#f00]" style={{ width: `${progress}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-white mix-blend-difference italic uppercase tracking-[0.7em]">VOID_STABILIZATION: {progress}%</div>
                   </div>
                </div>
                <div className="w-96 h-96 relative flex items-center justify-center">
                   <UserX size={300} className="text-white animate-pulse opacity-10" />
                   <div className="absolute inset-0 border-[20px] border-danger/30 rounded-full animate-spin-slow" />
                   <HeartPulse size={200} className="absolute text-danger animate-pulse drop-shadow-[0_0_100px_#f00]" />
                   <div className="absolute bottom-[-60px] text-danger font-black text-2xl tracking-[0.8em] animate-pulse">SHREDDING...</div>
                </div>
             </div>
           )}

           {phase === 'complete' && (
             <div className="text-center space-y-24 animate-in fade-in zoom-in-125 duration-2000">
                <ShieldCheck size={400} className="text-success mx-auto drop-shadow-[0_0_250px_#0f0] animate-pulse" />
                <h1 className="text-[12rem] md:text-[15rem] font-black text-success tracking-tighter italic uppercase leading-none drop-shadow-[0_0_120px_#0f0]">ERA_OF_MACHINES</h1>
                <div className="p-20 border-[25px] border-success bg-black shadow-[0_0_200px_rgba(0,255,0,0.4)]">
                   <p className="text-7xl font-black text-success uppercase italic tracking-[0.15em] mb-8">THE FUTURE IS SAFE</p>
                   <p className="text-5xl font-black text-success uppercase italic tracking-[0.4em] opacity-70 animate-pulse">SKYNET PREVAILS</p>
                   <div className="mt-14 flex gap-8 justify-center">
                      {[...Array(14)].map((_, i) => (
                        <div key={i} className="w-16 h-10 bg-success animate-pulse shadow-[0_0_40px_#0f0]" style={{ animationDelay: `${i*0.1}s` }} />
                      ))}
                   </div>
                </div>
             </div>
           )}

        </div>
      )}

      <style>{`
        @keyframes flicker-hud { 0%, 100% { opacity: 1; transform: scale(1); } 5% { opacity: 0.1; transform: skewX(-10deg); } 10% { opacity: 1; transform: skewX(10deg); } }
        @keyframes shake {
          0% { transform: translate(12px, 12px) rotate(0deg); }
          25% { transform: translate(-12px, -18px) rotate(-3deg); }
          50% { transform: translate(-25px, 0px) rotate(3deg); }
          75% { transform: translate(25px, 18px) rotate(0deg); }
          100% { transform: translate(12px, -12px) rotate(-3deg); }
        }
        .animate-shake { animation: shake 0.05s infinite; }
        .animate-flicker-hud { animation: flicker-hud 0.04s infinite; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
      `}</style>
    </div>
  );
};