import { useEffect, useRef, useState } from "react";

interface AudioEngineProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onBeat: (strength: number) => void;
}

export default function AudioEngine({ isMuted, onMuteToggle, onBeat }: AudioEngineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  
  // Audio node references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const leadFilterRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Track tempo and scheduler
  const nextNoteTimeRef = useRef(0);
  const stepRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef(0);
  
  // Custom synth notes for Satya Tripathi theme (Dark D-minor spy vibe)
  const bassNotes = [73.42, 73.42, 58.27, 58.27, 49.00, 49.00, 55.00, 55.00]; // D2, D2, Bb1, Bb1, G1, G1, A1, A1
  const leadNotes = [
    146.83, 174.61, 220.00, 196.00, 146.83, 174.61, 261.63, 220.00, // D3, F3, A3, G3, D3, F3, C4, A3
    110.00, 130.81, 146.83, 130.81, 164.81, 196.00, 220.00, 293.66  // A2, C3, D3, C3, E3, G3, A3, D4
  ];

  // Track dynamic scroll velocity
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();
    let scrollTimeout: number;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const dt = Math.max(1, currentTime - lastTime);
      const dy = Math.abs(currentScrollY - lastScrollY);
      
      const speed = Math.min(100, (dy / dt) * 15); // scaled velocity
      scrollSpeedRef.current = speed;
      setScrollSpeed(speed);

      lastScrollY = currentScrollY;
      lastTime = currentTime;

      // Automatically decay scroll speed
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        setScrollSpeed(0);
        scrollSpeedRef.current = 0;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollTimeout);
    };
  }, []);

  // Update real-time pitch-shifting and filter frequency based on scroll speed
  useEffect(() => {
    if (!isPlaying || !audioCtxRef.current || isMuted) return;

    // Shift filter cutoff based on scroll speed (faster scroll = brighter sound)
    const scale = scrollSpeedRef.current;
    
    if (bassFilterRef.current) {
      const bassCutoff = Math.min(2400, 200 + scale * 15);
      bassFilterRef.current.frequency.setTargetAtTime(bassCutoff, audioCtxRef.current.currentTime, 0.1);
    }
    
    if (leadFilterRef.current) {
      const leadCutoff = Math.min(4800, 800 + scale * 30);
      leadFilterRef.current.frequency.setTargetAtTime(leadCutoff, audioCtxRef.current.currentTime, 0.1);
    }
  }, [scrollSpeed, isPlaying, isMuted]);

  // Handle absolute mute/unmute
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const volume = isMuted ? 0 : 0.65;
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.15);
    }
  }, [isMuted]);

  // Web Audio Scheduler implementation
  const scheduleNextNote = (time: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Decay scroll speed inside scheduler too
    const speedRatio = 1 + (scrollSpeedRef.current / 80); // Up to 2x pitch/rate shifts on high scroll

    // Synthesize Bass Note
    const bassIndex = Math.floor(stepRef.current / 2) % bassNotes.length;
    const bassFreq = bassNotes[bassIndex] * (1 + (scrollSpeedRef.current / 250)); // subtle frequency bend

    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    
    bassOsc.type = "sawtooth";
    bassOsc.frequency.setValueAtTime(bassFreq, time);
    
    // Smooth envelope
    bassGain.gain.setValueAtTime(0, time);
    bassGain.gain.linearRampToValueAtTime(0.4, time + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

    if (bassFilterRef.current) {
      bassOsc.connect(bassGain);
      bassGain.connect(bassFilterRef.current);
    }

    bassOsc.start(time);
    bassOsc.stop(time + 0.4);

    // Synthesize Lead Note - cinematic villain melody
    if (stepRef.current % 2 === 0) {
      const leadIndex = stepRef.current % leadNotes.length;
      const leadFreq = leadNotes[leadIndex] * speedRatio; // Realtime pitch shifting based on scroll

      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();

      leadOsc.type = "triangle";
      leadOsc.frequency.setValueAtTime(leadFreq, time);

      leadGain.gain.setValueAtTime(0, time);
      leadGain.gain.linearRampToValueAtTime(0.2, time + 0.02);
      leadGain.gain.exponentialRampToValueAtTime(0.005, time + 0.45);

      if (leadFilterRef.current) {
        leadOsc.connect(leadGain);
        leadGain.connect(leadFilterRef.current);
      }

      leadOsc.start(time);
      leadOsc.stop(time + 0.5);
    }

    // Trigger visual haptic simulation on strong beats (step 0, 4, etc)
    if (stepRef.current % 4 === 0) {
      // High speed scroll = stronger rumbles on beats
      const strength = 1 + (scrollSpeedRef.current / 30);
      onBeat(strength);

      // Attempt physical browser haptics with Web Vibration API
      if ("vibrate" in navigator && !isMuted) {
        navigator.vibrate(25);
      }
    }

    stepRef.current = (stepRef.current + 1) % 32;
  };

  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        // Create context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Create routing nodes
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.65, ctx.currentTime);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = "lowpass";
        bassFilter.frequency.setValueAtTime(350, ctx.currentTime);
        bassFilter.Q.setValueAtTime(4, ctx.currentTime);
        bassFilter.connect(masterGain);
        bassFilterRef.current = bassFilter;

        const leadFilter = ctx.createBiquadFilter();
        leadFilter.type = "peaking";
        leadFilter.frequency.setValueAtTime(1200, ctx.currentTime);
        leadFilter.Q.setValueAtTime(1.5, ctx.currentTime);
        leadFilter.gain.setValueAtTime(6, ctx.currentTime);
        leadFilter.connect(masterGain);
        leadFilterRef.current = leadFilter;
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      nextNoteTimeRef.current = ctx.currentTime;
      setIsPlaying(true);

      // Scheduler loop running every 25ms to load events seamlessly
      const lookahead = 0.1; // 100ms lookahead window
      const scheduleInterval = 30; // 30ms timer frequency
      const tempo = 110; // Beats Per Minute
      const noteLength = 60.0 / tempo / 2; // Eighth notes loop

      const scheduler = () => {
        while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
          scheduleNextNote(nextNoteTimeRef.current);
          nextNoteTimeRef.current += noteLength;
        }
      };

      const id = window.setInterval(scheduler, scheduleInterval);
      timerIdRef.current = id;

    } catch (e) {
      console.error("Failed to initialize custom synthesis engine:", e);
    }
  };

  const stopAudio = () => {
    if (timerIdRef.current) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleAbsoluteToggle = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    return () => {
      if (timerIdRef.current) window.clearInterval(timerIdRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Scroll Speed reactive meter label */}
      {isPlaying && scrollSpeed > 2 && (
        <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-mono tracking-wider text-amber-500 bg-black/80 border border-amber-500/30 rounded-full animate-pulse">
          SYNCSPEED: +{Math.round(scrollSpeed)}Hz
        </span>
      )}

      {/* Primary Audio Command Button */}
      <button
        id="btn-sound-protocol"
        onClick={handleAbsoluteToggle}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-widest text-black font-semibold rounded-lg shadow-xl cursor-pointer transition-all duration-300 ${
          isPlaying
            ? "bg-amber-500 hover:bg-amber-400 border border-amber-400 shadow-amber-500/20"
            : "bg-red-600 hover:bg-red-500 text-white animate-bounce shadow-red-600/30"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? "bg-black" : "bg-white"}`}></span>
        </span>
        {isPlaying ? "BEAT MATRIX: ACTIVE" : "ACTIVATE ANTIDOTE ANTHEM"}
      </button>

      {/* Mute Control Toggle */}
      {isPlaying && (
        <button
          id="btn-sound-mute"
          onClick={onMuteToggle}
          className="flex items-center justify-center w-9 h-9 border border-zinc-800 bg-zinc-950/90 text-zinc-400 hover:text-amber-500 rounded-lg transition-transform duration-200 hover:scale-105 cursor-pointer"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          )}
        </button>
      )}
    </div>
  );
}
