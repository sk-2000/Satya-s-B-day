import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Zap, Flame, Target } from "lucide-react";

interface Bullet {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  progress: number; // 0 to 1
  speed: number;
  length: number; // custom trace length
  color: string;
  caliber: "gold_tracer" | "obsidian_slug" | "harami_cluster";
  history: { x: number; y: number; alpha: number }[]; // Trail history for gradient fading
  life: number; // Lifespan indicator
}

interface BlastParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface TacticalCanvasProps {
  onShoot?: (caliber: string) => void;
  beatImpulse?: number; // visual amplifier from AudioEngine beats
}

export default function TacticalCanvas({ onShoot, beatImpulse = 0 }: TacticalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCaliber, setSelectedCaliber] = useState<"gold_tracer" | "obsidian_slug" | "harami_cluster">("gold_tracer");
  const [stats, setStats] = useState({ roundsFired: 12, precision: 98, blueprintSync: "CALIBRATED" });
  
  const bulletsRef = useRef<Bullet[]>([]);
  const blastParticlesRef = useRef<BlastParticle[]>([]);
  const frameCountRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });

  // Update canvas sizing responsively
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial size
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Capture mouse coordinates over visualizer
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Launch bullet toward click coordinates
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Choose start origin depending on visual perspective (e.g. from bottom corners like a gun turret/launcher)
    const isLeftOrigin = Math.random() > 0.5;
    const startX = isLeftOrigin ? 30 : (rect.width - 30);
    const startY = rect.height - 20;

    const dx = clickX - startX;
    const dy = clickY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Speed variables based on caliber
    let speed = 28;
    let traceLength = 22;
    if (selectedCaliber === "gold_tracer") {
      speed = 42; // Fast hyper-kinetic
      traceLength = 48; // Pronounced long tail requested
    } else if (selectedCaliber === "obsidian_slug") {
      speed = 22;
      traceLength = 15;
    } else if (selectedCaliber === "harami_cluster") {
      speed = 34;
      traceLength = 30;
    }

    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    const newBullet: Bullet = {
      id: Date.now() + Math.random(),
      x: startX,
      y: startY,
      startX,
      startY,
      targetX: clickX,
      targetY: clickY,
      vx,
      vy,
      progress: 0,
      speed,
      length: traceLength,
      color: selectedCaliber === "gold_tracer" ? "#FFD700" : selectedCaliber === "obsidian_slug" ? "#4A154B" : "#10B981",
      caliber: selectedCaliber,
      history: [],
      life: 1.0,
    };

    bulletsRef.current.push(newBullet);
    setStats((prev) => ({ ...prev, roundsFired: prev.roundsFired + 1 }));
    if (onShoot) onShoot(selectedCaliber);

    // Initial muzzle flash particles
    for (let i = 0; i < 15; i++) {
      const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 0.8;
      const force = Math.random() * 8 + 3;
      blastParticlesRef.current.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force,
        size: Math.random() * 4 + 2,
        color: selectedCaliber === "gold_tracer" ? "rgba(255, 215, 0, 0.9)" : "rgba(139, 92, 246, 0.8)",
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 30 + 15,
      });
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    let cancelId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateAndDraw = () => {
      frameCountRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Tactical Radar Rings & Reticles in background
      ctx.strokeStyle = "rgba(251, 191, 36, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 220, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Dynamic Grid Lines with slight pulse linked to onBeat
      const gridOpacity = Math.min(0.12, 0.04 + beatImpulse * 0.05);
      ctx.strokeStyle = `rgba(217, 119, 6, ${gridOpacity})`;
      const gridSize = 45;
      
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Active Reticle at Mouse Position
      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      if (mx > 0 && my > 0) {
        ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Crosshair
        ctx.moveTo(mx - 15, my); ctx.lineTo(mx + 15, my);
        ctx.moveTo(mx, my - 15); ctx.lineTo(mx, my + 15);
        ctx.stroke();
        // Outer dashed circle
        ctx.strokeStyle = "rgba(251, 191, 36, 0.25)";
        ctx.beginPath();
        ctx.arc(mx, my, 8 + Math.sin(frameCountRef.current * 0.08) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 1. UPDATE & DRAW BULLET TRACERS
      const bullets = bulletsRef.current;
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        
        // Push current coordinates to trail history
        b.history.push({ x: b.x, y: b.y, alpha: 1.0 });
        if (b.history.length > b.length) {
          b.history.shift();
        }

        // Apply velocities
        b.x += b.vx;
        b.y += b.vy;

        // Fictional physics gravity/air resistance factor on trails
        if (b.caliber === "harami_cluster") {
          // slight random jitter (the chaotic mischievous rogue bullet!)
          b.vx += (Math.random() - 0.5) * 1.5;
        }

        const distanceToTarget = Math.sqrt(Math.pow(b.targetX - b.x, 2) + Math.pow(b.targetY - b.y, 2));
        
        // Check if reached destination or gone bounds
        const isPastBoundary = b.x < -100 || b.x > canvas.width + 100 || b.y < -100 || b.y > canvas.height + 100;
        const reachedTarget = distanceToTarget < b.speed;

        if (reachedTarget || isPastBoundary) {
          // Explode! Create hit sparks and ambient particles
          const burstSize = b.caliber === "gold_tracer" ? 30 : 15;
          const rootColor = b.caliber === "gold_tracer" ? "rgba(251, 191, 36, 1)" : b.caliber === "obsidian_slug" ? "rgba(168, 85, 247, 1)" : "rgba(16, 185, 129, 1)";
          
          for (let p = 0; p < burstSize; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (b.caliber === "gold_tracer" ? 12 : 6) + 2;
            blastParticlesRef.current.push({
              x: b.x,
              y: b.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * (b.caliber === "gold_tracer" ? 5 : 3) + 1,
              color: rootColor,
              alpha: 1.0,
              life: 0,
              maxLife: Math.random() * 35 + 20,
            });
          }

          // Spawn rogue sub-projectiles if harami cluster
          if (b.caliber === "harami_cluster" && reachedTarget) {
            for (let c = 0; c < 3; c++) {
              const subAngle = Math.random() * Math.PI * 2;
              bulletsRef.current.push({
                id: Date.now() + Math.random(),
                x: b.x,
                y: b.y,
                startX: b.x,
                startY: b.y,
                targetX: b.x + Math.cos(subAngle) * 90,
                targetY: b.y + Math.sin(subAngle) * 90,
                vx: Math.cos(subAngle) * 15,
                vy: Math.sin(subAngle) * 15,
                progress: 0,
                speed: 15,
                length: 12,
                color: "#34D399",
                caliber: "harami_cluster",
                history: [],
                life: 0.7,
              });
            }
          }

          // Remove bullet from flight array
          bullets.splice(i, 1);
          continue;
        }

        // Draw the amazing fading gradient stroke tracer trail!
        if (b.history.length > 1) {
          ctx.beginPath();
          ctx.lineCap = "round";
          
          if (b.caliber === "gold_tracer") {
            // HIGH-INTENSITY "GOLD_TRACER" Caliber gradient stroke
            // The user requested a gradient stroke that fades over time with more intensity
            ctx.lineWidth = 4.5;
            
            // Create gradient from nose of projectile (bright gold/white) to tail (fading glowing amber/obsidian)
            const head = b.history[b.history.length - 1];
            const tail = b.history[0];
            const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
            
            grad.addColorStop(0, "rgba(255, 255, 255, 1)"); // Bright incandescent nucleus core
            grad.addColorStop(0.15, "rgba(251, 191, 36, 1)"); // Intense central gold (#FBBF24)
            grad.addColorStop(0.5, "rgba(217, 119, 6, 0.75)"); // Fading dark amber (#D97706)
            grad.addColorStop(0.85, "rgba(146, 64, 14, 0.3)"); // Deep fiery ochre tail
            grad.addColorStop(1, "rgba(0, 0, 0, 0)"); // Fades fully into obsidian darkness
            
            ctx.strokeStyle = grad;
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(head.x, head.y);
            ctx.stroke();

            // Draw extra glowing hot outer core sleeve (glowing aura)
            ctx.beginPath();
            ctx.lineWidth = 10;
            const glossGrad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
            glossGrad.addColorStop(0, "rgba(251, 191, 36, 0.4)"); 
            glossGrad.addColorStop(0.6, "rgba(217, 119, 6, 0.1)");
            glossGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.strokeStyle = glossGrad;
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(head.x, head.y);
            ctx.stroke();

            // Spray tiny continuous heat sparks in its wake
            if (frameCountRef.current % 2 === 0) {
              blastParticlesRef.current.push({
                x: b.x - b.vx * 0.4,
                y: b.y - b.vy * 0.4,
                vx: -b.vx * 0.15 + (Math.random() - 0.5) * 2,
                vy: -b.vy * 0.15 + (Math.random() - 0.5) * 2,
                size: Math.random() * 2 + 1,
                color: "rgba(251, 191, 36, 0.8)",
                alpha: 0.9,
                life: 0,
                maxLife: Math.random() * 15 + 5,
              });
            }

          } else if (b.caliber === "obsidian_slug") {
            // OBSIDIAN SLUG - thick deep shadow trace
            ctx.lineWidth = 3;
            const head = b.history[b.history.length - 1];
            const tail = b.history[0];
            const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
            grad.addColorStop(0, "rgba(168, 85, 247, 1)"); // Violet surge
            grad.addColorStop(0.4, "rgba(88, 28, 135, 0.7)"); // Indigo slug
            grad.addColorStop(1, "rgba(24, 24, 27, 0)"); // Fades into obsidian
            ctx.strokeStyle = grad;
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(head.x, head.y);
            ctx.stroke();

          } else {
            // HARAMI CLUSTER - emerald green trace
            ctx.lineWidth = 2.5;
            const head = b.history[b.history.length - 1];
            const tail = b.history[0];
            const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
            grad.addColorStop(0, "rgba(16, 185, 129, 1)"); // Emerald
            grad.addColorStop(0.5, "rgba(4, 120, 87, 0.5)"); // Jade
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.strokeStyle = grad;
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(head.x, head.y);
            ctx.stroke();
          }
        }
      }

      // 2. UPDATE & DRAW BURST/EXPLOSIVE SPARK PARTICLES
      const particles = blastParticlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        
        // Gentle kinetic drag (air friction) and gravity for realism
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vy += 0.04; // gravity drag downward

        p.alpha = 1.0 - (p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Draw individual spark particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // reset transparency for subsequent frames

      cancelId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      cancelAnimationFrame(cancelId);
    };
  }, [selectedCaliber, beatImpulse]);

  return (
    <div className="relative border border-amber-500/15 bg-zinc-950/80 rounded-2xl overflow-hidden p-6 shadow-2xl backdrop-blur-md">
      {/* Absolute overlay headers of technical metrics */}
      <div className="absolute top-5 left-5 z-20 flex gap-4 text-[11px] font-mono select-none pointer-events-none">
        <div>
          <span className="text-zinc-500 block">TACTICS PROTOCAL</span>
          <span className="text-amber-500 font-bold tracking-widest uppercase">SATYA DEFENSE V1.9</span>
        </div>
        <div className="h-8 w-[1px] bg-zinc-800"></div>
        <div>
          <span className="text-zinc-500 block">BLUEPRINT CALIBER</span>
          <span className="text-zinc-300 font-bold tracking-wider uppercase">{selectedCaliber.replace("_", " ")}</span>
        </div>
      </div>

      <div className="absolute top-5 right-5 z-20 hidden sm:flex gap-6 text-[10px] font-mono text-zinc-500 pointer-events-none">
        <div>
          <span className="text-zinc-400 font-semibold block">TRAIL INTENSITY:</span>
          <span className="text-amber-400">MAX_GRADIENT_BOOST</span>
        </div>
        <div>
          <span className="text-zinc-400 font-semibold block">TOTAL DISCHARGES:</span>
          <span className="text-amber-400 text-right font-bold">{stats.roundsFired}</span>
        </div>
      </div>

      {/* Grid Canvas Zone */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="relative h-96 w-full rounded-xl bg-zinc-950/90 border border-zinc-900 overflow-hidden cursor-crosshair group"
      >
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
        
        {/* Dynamic Watermark Center Grid */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 select-none pointer-events-none text-center p-4">
          <Target className="w-14 h-14 text-amber-500 mb-2 animate-pulse" />
          <h4 className="text-base font-mono tracking-widest text-amber-500 font-bold">MR. PANDIT TACTICAL SECTOR</h4>
          <p className="text-xs text-zinc-400 max-w-xs mt-1">CLICK ANYWHERE IN THIS GRID TO TEST LAUNCH DYNAMIC HIGH-INTENSITY TRACERS</p>
        </div>

        {/* Floating Gunner Pod Labels */}
        <div className="absolute bottom-3 left-4 text-[9px] font-mono text-zinc-600 uppercase pointer-events-none">
          LAUNCH POD ALPHA // PORT 30
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] font-mono text-zinc-600 uppercase pointer-events-none">
          LAUNCH POD BETA // STBD 90
        </div>
      </div>

      {/* Selector Desk */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-1 text-xs font-mono font-medium text-zinc-400">
          SELECT CALIBER AMMUNITION:
        </div>
        
        {/* Caliber Ammo Toggles */}
        <div className="md:col-span-3 grid grid-cols-3 gap-2">
          {/* Gold Tracer (User Special Request) */}
          <button
            id="toggle-gold-tracer"
            onClick={() => setSelectedCaliber("gold_tracer")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono rounded-lg transition-all border cursor-pointer ${
              selectedCaliber === "gold_tracer"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/5"
                : "bg-zinc-900/40 text-zinc-400 border-zinc-800/40 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>GOLD TRACER [MAX]</span>
          </button>

          {/* Obsidian Slug */}
          <button
            id="toggle-obsidian-slug"
            onClick={() => setSelectedCaliber("obsidian_slug")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono rounded-lg transition-all border cursor-pointer ${
              selectedCaliber === "obsidian_slug"
                ? "bg-purple-950/30 text-purple-400 border-purple-500/30"
                : "bg-zinc-900/40 text-zinc-400 border-zinc-800/40 hover:text-zinc-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>OBSIDIAN SLUG</span>
          </button>

          {/* Harami Cluster */}
          <button
            id="toggle-harami-cluster"
            onClick={() => setSelectedCaliber("harami_cluster")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono rounded-lg transition-all border cursor-pointer ${
              selectedCaliber === "harami_cluster"
                ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
                : "bg-zinc-900/40 text-zinc-400 border-zinc-800/40 hover:text-zinc-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>HARAMI SPLITTER</span>
          </button>
        </div>
      </div>
      
      {/* Spec details regarding intense gold caliber */}
      {selectedCaliber === "gold_tracer" && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[11px] text-zinc-400 font-mono text-center leading-relaxed">
          <span className="text-amber-400 font-bold">✨ MASTERMIND CALIBER TACTICAL INTENSITY PROTOCOL ACTIVATED:</span> Equipped with 4.5px thick, hand-crafted core trails that taper out over a 48-node dynamic queue. Emits luminous gold-leaf sparks and decays through pure linear-graded transparency into the dark obsidian environment. Absolutely badass.
        </div>
      )}
    </div>
  );
}
