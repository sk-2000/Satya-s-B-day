/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, MouseEvent, FormEvent } from "react";
import { 
  Skull, 
  Flame, 
  Zap, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Crosshair, 
  Award, 
  Crown, 
  Target, 
  Scissors, 
  Shield, 
  Coffee, 
  Terminal, 
  Send, 
  Smartphone, 
  CheckCircle, 
  Info,
  ChevronRight,
  User,
  AlertTriangle
} from "lucide-react";
import AudioEngine from "./components/AudioEngine";
import { StyleElement, SyndicateTribute, Particle, PlanStep } from "./types";

export default function App() {
  // Sound Protocol integration
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [lastBeatTime, setLastBeatTime] = useState(0);
  const [beatPulse, setBeatPulse] = useState(false);
  const [beatStrength, setBeatStrength] = useState(1);

  // Ammunition Customization States
  const [ammoCaliber, setAmmoCaliber] = useState<"9mm" | "45acp" | "gold_tracer" | "bloody_rail">("gold_tracer");
  const [firerate, setFirerate] = useState<"manual" | "rapid" | "mayhem">("rapid");
  const [bloodySplatterIntensity, setBloodySplatterIntensity] = useState<number>(3); // 1-5 scale
  const [hasVibrateCapability, setHasVibrateCapability] = useState(false);

  // Isometric Interaction
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>("beard");
  const [isometricRotation, setIsometricRotation] = useState<number>(-45); // rotateZ
  const [isometricTilt, setIsometricTilt] = useState<number>(60); // rotateX
  const [isHovered3D, setIsHovered3D] = useState(false);

  // Tribute Form State
  const [tributeName, setTributeName] = useState("");
  const [tributeCategory, setTributeCategory] = useState("Underworld Ally");
  const [giftOffer, setGiftOffer] = useState("");
  const [tributeMessage, setTributeMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestResponse, setLatestResponse] = useState<NonNullable<SyndicateTribute["response"]> | null>(null);

  // Tribute List local state
  const [tributes, setTributes] = useState<SyndicateTribute[]>([
    {
      id: "preset-1",
      name: "Rocky Bhai",
      category: "Cigar Syndicate Baron",
      tributeMessage: "Satya, your beard is the only thing sharper than my golden hammer. Keep the master plan running in the North, Mr Pandit. Happy Birthday!",
      giftOffer: "A solid gold beard brush with ruby embeddings",
      timestamp: "Today, 18:42",
      response: {
        text: "Hahaha, Rocky! Solid gold? Now that's what I call tribute. Your hammer matches my plan, but tell your crew to keep their shipments clean. My beard stays flawless.",
        syndicateTier: "Elite Baron Partner",
        loyaltyScore: 98,
        verdict: "Pass free through port authority."
      }
    },
    {
      id: "preset-2",
      name: "Munna Bhaiya",
      category: "Henchman Cadet",
      tributeMessage: "Pandit ji, badhai ho! Next time you are in Mirzapur, tell me. We need some advice on beard hygiene and hostile takeovers.",
      giftOffer: "A case of hand-crafted local brass pistols",
      timestamp: "Today, 18:15",
      response: {
        text: "Munna, you talk too much and calibrate too little. A clean beard is a clean kill. I'll take the pistols, but you stick to the backseats. The master plan relies on smart minds, not loud mouths.",
        syndicateTier: "Fringe Suspect",
        loyaltyScore: 72,
        verdict: "Send him back to grooming camp."
      }
    }
  ]);

  // Master Plan progression details
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([
    {
      id: 1,
      phase: "Phase I",
      title: "Beard Calibration & Priming",
      description: "Achieved the absolute premium beard density and masculine sharp contour line. Standardized natural oils and premium waxes to guarantee a badass elite look.",
      status: "Completed",
      vibeText: "Calibration level: 100% Badass"
    },
    {
      id: 2,
      phase: "Phase II",
      title: "Syndicate Blueprint Rollout",
      description: "Established local underground dominance, code-named 'Mr Pandit', taking over regional coffee reserves & styling studios. No secondary backends needed when you operate with street intelligence.",
      status: "Completed",
      vibeText: "Tactical positioning: Locked and Loaded"
    },
    {
      id: 3,
      phase: "Phase III",
      title: "Global Birthday Satya Hegemony",
      description: "Launch this dynamic 3D ammunition-fueled aesthetic experience. Deploy live Web Audio pitch-shifting algorithms to capture scrolling velocity and blast users with sensory adrenaline.",
      status: "In-Progress",
      vibeText: "Currently Active. Brace for recoil."
    },
    {
      id: 4,
      phase: "Phase IV",
      title: "Absolute Immortal Legend Status",
      description: "Sustaining a peak, elite healthy lifestyle while keeping the witty, lovable, mischievous 'Harami' rogue energy fully charged. Continuous plotting of high-end business takeovers.",
      status: "Locked",
      vibeText: "Unlocks on next sunrise."
    }
  ]);

  // Refs for bullet & bloody canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bulletParticlesRef = useRef<any[]>([]);
  const bloodSplattersRef = useRef<any[]>([]);
  const sparkParticlesRef = useRef<any[]>([]);
  const lastTimeRef = useRef<number>(0);
  const scrollIntensityCounter = useRef<number>(0);
  
  // Custom audio beat receiver (to flash visual elements)
  const handleAudioBeat = (strength: number) => {
    setLastBeatTime(Date.now());
    setBeatStrength(strength);
    setBeatPulse(true);
    setTimeout(() => setBeatPulse(false), 180);

    // Whenever a strong synthesized audio beat occurs, randomly fire a background round!
    if (strength > 1.2 && canvasRef.current) {
      triggerAmmunitionFire(
        Math.random() * canvasRef.current.width, 
        canvasRef.current.height, 
        Math.random() * canvasRef.current.width, 
        Math.random() * (canvasRef.current.height * 0.5)
      );
    }
  };

  // Check vibration support
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
      setHasVibrateCapability(true);
    }
  }, []);

  // Canvas Ammunition Combat Loop Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle Resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Main particle generator & update loop
    let animationId: number;
    
    // Automatically spray ammunition if using rapid or mayhem
    let automaticFireTimer = 0;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Draw dark semi-clear background for subtle tracer trails
      ctx.fillStyle = "rgba(4, 4, 4, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Automatic Gunfire Spawning based on firerate setting
      automaticFireTimer += dt;
      const spawnInterval = firerate === "mayhem" ? 180 : firerate === "rapid" ? 450 : 2500;
      if (automaticFireTimer > spawnInterval) {
        automaticFireTimer = 0;
        
        // Random bottom turret firing upwards towards crosshair orbits
        const originX = Math.random() * canvas.width;
        const originY = canvas.height;
        const targetX = Math.random() * canvas.width;
        const targetY = Math.random() * (canvas.height * 0.6); // fire towards top half

        triggerAmmunitionFire(originX, originY, targetX, targetY);
      }

      // 1. Update & Draw Bullets (Tracers)
      const bullets = bulletParticlesRef.current;
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        
        // Initialize history queue if missing
        if (!b.history) {
          b.history = [];
        }
        
        // Store current position for trailing coordinates
        b.history.push({ x: b.x, y: b.y });
        
        // Max nodes defines how long the visible tracer tail is
        const maxNodes = b.type === "gold_tracer" ? 28 : 12;
        if (b.history.length > maxNodes) {
          b.history.shift();
        }

        // Render gradient-stroke fading path for smooth continuity
        if (b.history.length > 1) {
          ctx.beginPath();
          ctx.lineCap = "round";
          
          const head = b.history[b.history.length - 1];
          const tail = b.history[0];
          
          // Generate customized linear gradient following head to tail flow
          const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
          
          if (b.type === "gold_tracer") {
            // Ultra pronounced and high-intensity "gold_tracer" caliber
            ctx.lineWidth = 6.0; // Significant thickness boost
            grad.addColorStop(0, "rgba(255, 255, 255, 1.0)"); // Highly luminous nuclear white head
            grad.addColorStop(0.12, "rgba(251, 191, 36, 1.0)"); // Central intense luxury gold
            grad.addColorStop(0.45, "rgba(217, 119, 6, 0.75)"); // Tapering fiery amber
            grad.addColorStop(0.85, "rgba(146, 64, 14, 0.25)"); // Decaying embers ochre
            grad.addColorStop(1, "rgba(0, 0, 0, 0)"); // Fading completely into obsidian background
            ctx.strokeStyle = grad;
            
            // Powerful golden halo neon bloom
            ctx.shadowBlur = 18;
            ctx.shadowColor = "rgba(251, 191, 36, 0.85)";
          } else if (b.type === "bloody_rail") {
            ctx.lineWidth = 4.5;
            grad.addColorStop(0, "rgba(255, 100, 100, 1.0)");
            grad.addColorStop(0.15, "rgba(239, 68, 68, 1.0)");
            grad.addColorStop(0.55, "rgba(136, 19, 19, 0.65)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.strokeStyle = grad;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(239, 68, 68, 0.75)";
          } else if (b.type === "45acp") {
            ctx.lineWidth = 2.8;
            grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
            grad.addColorStop(0.5, "rgba(209, 213, 219, 0.45)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.strokeStyle = grad;
            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(209, 213, 219, 0.35)";
          } else {
            ctx.lineWidth = 2.0;
            grad.addColorStop(0, "rgba(252, 211, 77, 0.85)");
            grad.addColorStop(0.5, "rgba(245, 158, 11, 0.4)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.strokeStyle = grad;
            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(252, 211, 77, 0.35)";
          }
          
          ctx.moveTo(tail.x, tail.y);
          ctx.lineTo(head.x, head.y);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        } else {
          // Fallback single line segment
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.vx * 0.4, b.y - b.vy * 0.4);
          ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }

        // Release tiny continuous heat sparks in flight for high-intensity calibers
        if (b.type === "gold_tracer" && Math.random() > 0.4) {
          sparkParticlesRef.current.push({
            x: b.x - b.vx * 0.3,
            y: b.y - b.vy * 0.3,
            vx: -b.vx * 0.15 + (Math.random() - 0.5) * 2,
            vy: -b.vy * 0.15 + (Math.random() - 0.5) * 2,
            size: Math.random() * 2 + 1,
            alpha: 0.85,
            decay: 0.045 + Math.random() * 0.05
          });
        }

        // Update positions
        b.x += b.vx * (dt / 16);
        b.y += b.vy * (dt / 16);

        // Check if bullet reached target or out of bounds
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distToTarget < 12 || b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
          // Detonate! Create Blood splatters and Golden Sparks at hit point
          spawnCollisionBurst(b.targetX, b.targetY, b.type);
          bullets.splice(i, 1);
        }
      }

      // 2. Update & Draw Blood Splatters (Bloody adventure!)
      const splatters = bloodSplattersRef.current;
      for (let i = splatters.length - 1; i >= 0; i--) {
        const s = splatters[i];
        
        // Draw splash droplet
        ctx.beginPath();
        ctx.fillStyle = s.color;
        // make it drip or flow downwards slightly
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // If it slides on windshield effect, add vertical streak
        if (s.velocity || s.slideSpeed > 0) {
          ctx.beginPath();
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.radius * 0.8;
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x, s.y + s.streakHeight);
          ctx.stroke();

          s.y += s.slideSpeed * (dt / 16);
          s.streakHeight += 0.08 * (dt / 16);
        }

        s.alpha -= s.decay * (dt / 16);
        
        // Gravity affect
        s.y += s.gravity * (dt / 16);
        s.x += s.vx * (dt / 16);

        if (s.alpha <= 0.01 || s.y > canvas.height) {
          splatters.splice(i, 1);
        }
      }

      // 3. Update & Draw Gold / Steel Kinetic Sparks
      const sparks = sparkParticlesRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${sp.alpha})`;
        ctx.fill();

        sp.x += sp.vx * (dt / 16);
        sp.y += sp.vy * (dt / 16);
        sp.vy += 0.12 * (dt / 16); // spark gravity drift
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0) {
          sparks.splice(i, 1);
        }
      }

      // Draw dynamic subtle crosshair orbiting cursor or center
      drawMuzzleAimIndicator(ctx, canvas);

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [ammoCaliber, firerate, bloodySplatterIntensity]);

  // Method to manually launch ammunition towards target coordinate
  const triggerAmmunitionFire = (ox: number, oy: number, tx: number, ty: number) => {
    const dx = tx - ox;
    const dy = ty - oy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Bullet velocity based on ammo selection
    let speed = 25;
    if (ammoCaliber === "bloody_rail") speed = 40;
    else if (ammoCaliber === "gold_tracer") speed = 32;

    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    bulletParticlesRef.current.push({
      x: ox,
      y: oy,
      vx,
      vy,
      targetX: tx,
      targetY: ty,
      type: ammoCaliber
    });

    // Provide sensory click simulation (Haptic Simulation)
    if (hasVibrateCapability && !isAudioMuted) {
      window.navigator.vibrate([15]);
    }
  };

  // Helper to detonate bullets on canvas targets
  const spawnCollisionBurst = (x: number, y: number, type: string) => {
    // 1. Generate Crimson/Blood splatters ("Bloody & adventurous requirement")
    const numSplatters = 3 + Math.floor(Math.random() * bloodySplatterIntensity * 4);
    for (let i = 0; i < numSplatters; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      const rad = 2 + Math.random() * (2 + bloodySplatterIntensity);
      
      // Sophisticated bloody shades: Deep vermillion, oxidised blood obsidian, crimson lacquer
      const bloodColors = [
        "rgba(136, 19, 19, 0.95)", // deep maroon
        "rgba(185, 28, 28, 0.85)", // crimson
        "rgba(220, 38, 38, 0.75)", // scarlet
        "rgba(88, 11, 11, 1)"      // coagulated obsidian red
      ];
      
      bloodSplattersRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5, // slightly upwards explosion
        radius: rad,
        gravity: 0.08 + Math.random() * 0.1,
        slideSpeed: Math.random() > 0.45 ? (0.2 + Math.random() * 0.5) : 0, // drip downward
        streakHeight: 0,
        decay: 0.005 + Math.random() * 0.015,
        alpha: 1,
        color: bloodColors[Math.floor(Math.random() * bloodColors.length)]
      });
    }

    // 2. Generate Golden/amber firework sparks
    const numSparks = 8 + Math.floor(Math.random() * 12);
    for (let i = 0; i < numSparks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      sparkParticlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02
      });
    }
  };

  // Draw HUD aim metrics in background canvas
  const drawMuzzleAimIndicator = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const t = Date.now() * 0.0015;
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.18; // Orbit the hero title
    
    ctx.strokeStyle = "rgba(245, 158, 11, 0.15)";
    ctx.lineWidth = 1;

    // Outer Target Rings orbiting
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80 + Math.sin(t) * 15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
    ctx.font = "8px monospace";
    ctx.fillText("AMMO PREPARATION: OK", centerX - 55, centerY - 100);
    ctx.fillText("RADAR SENSORS PROTOCOL: STABLE", centerX - 75, centerY + 110);
  };

  // Click handler to shoot ammunition on command
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Origin: bottom side centers
    const side = Math.random() > 0.5 ? 0 : rect.width;
    triggerAmmunitionFire(side, rect.height, clickX, clickY);

    // Physical vibration
    if (hasVibrateCapability && !isAudioMuted) {
      window.navigator.vibrate([20, 10, 20]);
    }
  };

  // Fully compiled details on Satya's signature style elements 
  const styleElements: StyleElement[] = useMemo(() => [
    {
      id: "beard",
      name: "Coolest Beard in Town",
      icon: "🧔",
      description: "A meticulously groomed, sharp-contoured dark beard giving off absolute boss and mastermind command. Keeps enemies on their toes and admirers stunned.",
      blueprintCode: "BLUEPRINT // CONT-99",
      status: "Waxed & Magnetized",
      secretVibe: "Harami Level: Infinite. Shines gold under cinematic spotlights.",
      position: { x: 0, y: 0, z: 40 }
    },
    {
      id: "walther",
      name: "Syndicate Walther Blueprint",
      icon: "🔫",
      description: "Satya's tactical custom-stamped sidearm loaded with simulated golden tracers. Symbolizes his sharp leadership and 'villain style' master planning.",
      blueprintCode: "TACTICAL // PPK-380",
      status: "Armed & Golden Traced",
      secretVibe: "Automatic muzzle sparks synchronized with scrolling-pitch audio engine.",
      position: { x: -60, y: -60, z: 24 }
    },
    {
      id: "glasses",
      name: "Midnight Obsidian Shades",
      icon: "🕶️",
      description: "Frameless aerodynamic sunglasses made of dark composite basalt. Allows zero glare, fully masking Satya's clever brain logic and tactical glance.",
      blueprintCode: "GLASS // SPECTRE-7",
      status: "Calibrated & Polarized",
      secretVibe: "Confers +100 intimidation, blocking standard user scrutiny.",
      position: { x: 60, y: -60, z: 24 }
    },
    {
      id: "cigars",
      name: "Elite Cuban Reserves & Espresso",
      icon: "☕",
      description: "Finest quality long-filler tobacco leaves paired with strong ristretto espresso shots. The ultimate combustion mixture for drafting Satya's master plans.",
      blueprintCode: "COMBUST // BEAN-55",
      status: "Optimal Temperature",
      secretVibe: "Wreaks premium sophisticated aroma and activates high-end witty sarcasms.",
      position: { x: 0, y: 60, z: 12 }
    }
  ], []);

  const activeStyleItem = styleElements.find(item => item.id === selectedStyleId) || styleElements[0];

  // Submit Tribute form and fetch simulated / live response from Express / Gemini tribute endpoint
  const handleTributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tributeName.trim() || !tributeMessage.trim()) return;

    setIsSubmitting(true);
    setLatestResponse(null);

    try {
      const response = await fetch("/api/tribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tributeName,
          category: tributeCategory,
          giftOffer,
          tributeMessage
        })
      });

      if (!response.ok) {
        throw new Error("Syndicate desk transmission failed.");
      }

      const data = await response.json();
      
      // Update states
      const newTributeEntry: SyndicateTribute = {
        id: `tribute-${Date.now()}`,
        name: tributeName,
        category: tributeCategory,
        tributeMessage,
        giftOffer: giftOffer || "Unyielding respect",
        timestamp: "Just Now",
        response: {
          text: data.text,
          syndicateTier: data.syndicateTier,
          loyaltyScore: data.loyaltyScore,
          verdict: data.verdict
        }
      };

      setTributes(prev => [newTributeEntry, ...prev]);
      setLatestResponse(newTributeEntry.response || null);
      
      // Reset input fields but keep name for vanity
      setTributeMessage("");
      setGiftOffer("");

      // physical trigger haptic pulse!
      if (hasVibrateCapability && !isAudioMuted) {
        window.navigator.vibrate([100, 50, 200]);
      }

    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackResponse = {
        text: `"${tributeName}, your message bypassed security. The Mastermind says: I am processing your tribute. Your gift is acceptable, but my beard expects premium tribute. Continue surveillance."`,
        syndicateTier: "Auxiliary Agent",
        loyaltyScore: 85,
        verdict: "Status approved under provisional security clearance."
      };
      const fallbackEntry: SyndicateTribute = {
        id: `tribute-fb-${Date.now()}`,
        name: tributeName,
        category: tributeCategory,
        tributeMessage,
        giftOffer: giftOffer || "Respect & Loyalty",
        timestamp: "Just Now",
        response: fallbackResponse
      };
      setTributes(prev => [fallbackEntry, ...prev]);
      setLatestResponse(fallbackResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to customized target section elegantly without page jumps
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      
      {/* Background Interactive Combat Zone Shooting Canvas */}
      <div 
        className="fixed inset-0 z-0 pointer-events-auto cursor-crosshair opacity-75"
        onClick={handleCanvasClick}
      />
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none" 
      />

      {/* Dynamic Gold-Accent Screen Overlay Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-radial-gradient-vignette opacity-70" style={{
        background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.92) 100%)"
      }} />

      {/* Fixed top Header Navigation */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-amber-500/45 text-amber-500 font-bold tracking-widest text-lg shadow-lg">
            S
          </div>
          <div>
            <div className="text-sm font-black font-mono tracking-widest text-amber-500">MR. PANDIT'S COURIER</div>
            <div className="text-[10px] font-mono text-zinc-500 tracking-wider">VERSION // SATYA-2026</div>
          </div>
        </div>

        {/* Seamless Navigation Desk */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-widest">
          <button 
            onClick={() => scrollToSection("landing-deck")} 
            className="text-zinc-400 hover:text-amber-500 transition-colors uppercase cursor-pointer"
          >
            01. Dossier
          </button>
          <button 
            onClick={() => scrollToSection("arsenal-deck")} 
            className="text-zinc-400 hover:text-amber-500 transition-colors uppercase cursor-pointer"
          >
            02. 3D Blueprint
          </button>
          <button 
            onClick={() => scrollToSection("plan-timeline")} 
            className="text-zinc-400 hover:text-amber-500 transition-colors uppercase cursor-pointer"
          >
            03. The Plan
          </button>
          <button 
            onClick={() => scrollToSection("syndicate-tribute-desk")} 
            className="text-zinc-400 hover:text-amber-500 transition-colors uppercase cursor-pointer"
          >
            04. Submit Tribute
          </button>
        </nav>

        {/* Action button header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => scrollToSection("syndicate-tribute-desk")}
            className="px-4 py-1.5 text-[11px] font-mono tracking-widest bg-zinc-900 border border-amber-500/50 hover:bg-amber-500 hover:text-black hover:border-amber-400 text-amber-500 rounded-md transition-all cursor-pointer"
          >
            GENERATE ROAST
          </button>
        </div>
      </header>

      {/* Floating Tactical Weaponry Hub & Calibration */}
      <div className="hidden lg:flex fixed left-6 top-1/3 z-30 flex-col gap-3 p-4 bg-zinc-950/90 border border-zinc-800/80 rounded-xl max-w-[200px] shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-1">
          <Skull className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-300">AMMO SELECTOR</span>
        </div>
        
        {/* Caliber Radio list */}
        {[
          { id: "gold_tracer", label: "Gold Tracers (Heavy)" },
          { id: "bloody_rail", label: "Bloody Rail Charge" },
          { id: "45acp", label: ".45 ACP Hollow" },
          { id: "9mm", label: "9mm Standard" }
        ].map((caliber) => (
          <button
            key={caliber.id}
            onClick={() => setAmmoCaliber(caliber.id as any)}
            className={`w-full text-left px-2.5 py-1.5 rounded text-[10px] font-mono transition-all flex items-center justify-between border ${
              ammoCaliber === caliber.id
                ? "bg-amber-500/10 border-amber-500 text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            <span>{caliber.label}</span>
            {ammoCaliber === caliber.id && <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />}
          </button>
        ))}

        <div className="text-[9px] font-mono text-zinc-600 mt-2 border-t border-zinc-900 pt-2 leading-relaxed">
          *Click anywhere on screen to execute localized bullet bursts. Spreads custom crimson drops.
        </div>
      </div>

      <main className="relative z-10">

        {/* HERO SECTION: Happy Birthday Title Card */}
        <section 
          id="landing-deck" 
          className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 py-16 text-center border-b border-zinc-900/40"
        >
          {/* Subtle gold grid grid-lines */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Villain syndicate tag */}
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full text-[10.5px] font-mono tracking-[0.2em] mb-8 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>THE BIRTHDAY GANGSTER BLUEPRINT // ACTIVE</span>
            </div>

            {/* Premium Giant Cinematic Typography Heading */}
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white drop-shadow-2xl">
              HAPPY BIRTHDAY
              <span className="block mt-2 font-display uppercase font-extrabold italic bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] text-glow">
                SATYA
              </span>
              <span className="block mt-1 text-xl md:text-3xl font-mono font-medium tracking-normal text-zinc-400">
                aka <span className="text-amber-500 select-all font-mono">Mr Pandit</span>
              </span>
            </h1>

            {/* The Mastermind plan subheader as requested */}
            <p className="mt-8 text-base md:text-xl text-zinc-400 font-mono max-w-2xl leading-relaxed tracking-wide">
              "The man with the master plan and the coolest beard in town."
            </p>

            {/* Aesthetic Badass Villain Taglines */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-12 w-full max-w-3xl">
              {[
                { label: "PERSONALITY", value: "BADASS / HARAMI", color: "text-red-500", border: "border-red-950/50" },
                { label: "FACIAL HAIR", value: "COOLEST BEARD", color: "text-amber-500", border: "border-amber-950/50" },
                { label: "MINDSET", value: "CLEVER MASTERMIND", color: "text-emerald-500", border: "border-emerald-950/50" },
                { label: "AMMO DISPENSER", value: "GOLDEN TRACER", color: "text-yellow-500", border: "border-yellow-950/50" },
                { label: "INTELLIGENCE", value: "SMART & ROGUE", color: "text-violet-500", border: "border-violet-950/50" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center justify-center p-3.5 rounded-lg bg-zinc-950/80 border ${item.border} backdrop-blur-sm group hover:scale-[1.03] transition-all`}
                >
                  <span className="text-[9px] font-mono text-zinc-500 tracking-widest">{item.label}</span>
                  <span className={`mt-1 text-[11px] font-mono font-black ${item.color} tracking-wider text-center`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive Combat trigger instructions */}
            <div className="mt-14 p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 max-w-md text-left flex items-start gap-3 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-red-950/50 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0 select-none font-bold animate-pulse text-xs">
                ☠️
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-amber-400">MILITARY HARAMI BLUEPRINT</div>
                <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-relaxed">
                  The audio synthesis engine tracks your scrolling movement. <strong className="text-white">Scroll down</strong> to shift tempo & raise real-time synth pitches. <strong className="text-white">Click anywhere</strong> to spray tactical fire support.
                </p>
              </div>
            </div>

            {/* Scroll Down Call-To-Action */}
            <div className="mt-16 animate-bounce">
              <button 
                onClick={() => scrollToSection("arsenal-deck")}
                className="flex flex-col items-center gap-2 text-zinc-500 hover:text-amber-500 text-[10px] font-mono tracking-[0.3em] font-bold cursor-pointer"
              >
                <span>ENTER THE BLUEPRINT BOARD</span>
                <span className="text-[12px]">▼</span>
              </button>
            </div>

          </div>
        </section>


        {/* SECTION 2: 3D Isometric Board featuring His Signature Elements */}
        <section 
          id="arsenal-deck" 
          className="relative py-24 px-6 border-b border-zinc-900 bg-zinc-950/30"
        >
          {/* Subtle gold lines background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

          <div className="max-w-7xl mx-auto">
            <div className="text-center md:text-left mb-16">
              <div className="inline-block text-xs font-mono tracking-widest text-amber-500 border-b border-amber-500/30 pb-2">
                02 // INTERACTIVE ISOMETRIC GRID
              </div>
              <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
                MR. PANDIT'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">SIGNATURE ARSENAL</span>
              </h2>
              <p className="text-zinc-500 text-sm font-mono mt-2 max-w-xl">
                A 3D isometric blueprint mapping his trademark items. Interact with each vector coordinate to inspect the specifications.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Interactive 3D Model Display Stage (occupies 7 columns) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-black/90 rounded-2xl border border-zinc-900 h-[500px] relative overflow-hidden shadow-inner-3D group">
                
                {/* 3D Scene Controls HUD */}
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span>ISOMETRIC COMPASS LAYER</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsometricRotation(prev => prev - 15)} 
                      className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded cursor-pointer border border-zinc-800"
                      title="Rotate Anticlockwise"
                    >
                      ↩ ROT
                    </button>
                    <button 
                      onClick={() => setIsometricRotation(prev => prev + 15)} 
                      className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded cursor-pointer border border-zinc-800"
                      title="Rotate Clockwise"
                    >
                      ROT ↪
                    </button>
                    <button 
                      onClick={() => { setIsometricRotation(-45); setIsometricTilt(60); }}
                      className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-500 rounded cursor-pointer border border-amber-500/20"
                    >
                      RESET
                    </button>
                  </div>
                </div>

                {/* Simulated 3D Axis helper lines */}
                <div className="absolute inset-x-8 bottom-8 top-16 border-l border-b border-dashed border-zinc-900 pointer-events-none flex items-end p-2 select-none">
                  <span className="text-[8px] font-mono text-zinc-700 font-bold">X-ROTATOR: {isometricTilt}° / Z-YAW: {isometricRotation}°</span>
                </div>

                {/* THE ISOMETRIC CONTAINER PLATFORM */}
                <div 
                  className="relative w-72 h-72 transition-all duration-700 ease-out flex items-center justify-center cursor-grab active:cursor-grabbing"
                  style={{
                    perspective: "1200px",
                    transformStyle: "preserve-3d"
                  }}
                  onMouseEnter={() => setIsHovered3D(true)}
                  onMouseLeave={() => setIsHovered3D(false)}
                >
                  {/* Outer base grid rotating */}
                  <div 
                    className="absolute w-72 h-72 bg-gradient-to-tr from-amber-500/5 via-transparent to-red-500/5 border border-amber-500/10 rounded-xl transition-transform duration-500"
                    style={{
                      transform: `rotateX(${isometricTilt}deg) rotateZ(${isometricRotation}deg)`,
                      transformStyle: "preserve-3d",
                      boxShadow: "0px 24px 70px rgba(0,0,0,0.85), inset 0px 0px 20px rgba(245,158,11,0.05)"
                    }}
                  >
                    {/* Concentric coordinate layout grid */}
                    <div className="absolute inset-4 border border-dashed border-zinc-900 rounded-lg flex items-center justify-center">
                      <div className="w-32 h-32 border border-zinc-900 rounded-full" />
                    </div>

                    {/* Tactical ammo-spark laser guide */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent transform translate-z-[1px]" />
                    <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-amber-500/20 to-transparent transform translate-z-[1px]" />

                    {/* INTERACTIVE ISOMETRIC NODES */}
                    {styleElements.map((item) => {
                      const isActive = selectedStyleId === item.id;
                      
                      // Map custom pixel layouts based on their coordinate layout
                      const layoutStyle = {
                        transform: `translate3d(${item.position.x}px, ${item.position.y}px, ${isActive ? item.position.z + 20 : item.position.z}px)`,
                        transformStyle: "preserve-3d" as const,
                      };

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedStyleId(item.id);
                            // Synthesize bullet tracers directly on item click coordinates!
                            if (canvasRef.current) {
                              const rect = canvasRef.current.getBoundingClientRect();
                              triggerAmmunitionFire(rect.width * 0.5, rect.height, rect.width * 0.5 + item.position.x, rect.height * 0.4 - item.position.y);
                            }
                          }}
                          style={layoutStyle}
                          className={`absolute w-14 h-14 bg-zinc-950 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-xl ${
                            isActive 
                              ? "border-amber-400 bg-zinc-900 text-white scale-110 shadow-amber-500/20" 
                              : "border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                          } select-none`}
                        >
                          {/* Item Icon */}
                          <span className="text-2xl transform hover:scale-125 transition-transform">{item.icon}</span>

                          {/* Isometric vertical anchor stem (gives realistic 3D floating effect) */}
                          <div 
                            className={`absolute bottom-[-16px] left-[27px] w-[2px] h-4 bg-gradient-to-b ${
                              isActive ? "from-amber-400 to-transparent" : "from-zinc-800 to-transparent"
                            } transition-all`} 
                          />
                        </div>
                      );
                    })}

                  </div>

                </div>

                {/* Helpful prompt bottom hud */}
                <div className="absolute bottom-4 left-4 right-4 text-center text-[10px] font-mono text-zinc-600">
                  ⚡ Tap individual nodes to recalibrate dynamic dossier data panels below.
                </div>

              </div>

              {/* Specification Dossier (occupies 5 columns) */}
              <div className="lg:col-span-5 flex flex-col gap-6">

                {/* Subheading header */}
                <div className="bg-zinc-950/95 border border-zinc-900/90 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative">
                  
                  {/* Sophisticated Gold Ribbon */}
                  <div className="absolute top-0 right-6 w-12 h-1 bg-amber-500" />
                  
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeStyleItem.icon}</span>
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-amber-500 block">{activeStyleItem.blueprintCode}</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{activeStyleItem.name}</h3>
                    </div>
                  </div>

                  <p className="mt-4 text-zinc-400 text-xs font-mono leading-relaxed">
                    {activeStyleItem.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-zinc-900">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">CALIBRATION LEVEL</span>
                      <span className="text-xs font-mono font-bold text-amber-400 mt-1 block flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {activeStyleItem.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">CADET METRICS</span>
                      <span className="text-xs font-mono font-bold text-red-500 mt-1 block flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        100% Badass Vibe
                      </span>
                    </div>
                  </div>

                  {/* Secret rogue comments */}
                  <div className="mt-6 p-4 rounded-lg bg-black border border-zinc-900">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-widest">Mastermind Notes</span>
                    </div>
                    <p className="text-[11px] font-mono text-amber-500/80 mt-1.5 italic leading-relaxed">
                      "{activeStyleItem.secretVibe}"
                    </p>
                  </div>

                </div>

                {/* Real-time reactive Audio feedback instructions panel */}
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 relative overflow-hidden flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 select-none">
                    🎚️
                  </div>
                  <div className="text-xs font-mono">
                    <div className="text-zinc-200 font-bold tracking-wide uppercase">DYNAMIC PITCH SHIFT ENABLED</div>
                    <p className="text-zinc-500 mt-1 leading-relaxed text-[11px]">
                      The synthesis engine matches your scrolling velocity, pitch-shifting real time melody to represent Satya's energetic rogue charm.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* TIMELINE SECTION: The Master Plan */}
        <section id="plan-timeline" className="relative py-24 px-6 border-b border-zinc-900 bg-black">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="px-3 py-1 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-full text-[10px] font-mono tracking-widest">
                SYSTEM STEPS // ROADMAP
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight">
                THE SATYA <span className="text-amber-500">MASTER PLAN</span>
              </h2>
              <p className="text-zinc-500 text-xs font-mono mt-2">
                Drafted by Mr Pandit himself to assert majestic dominance, healthy lifestyle, and witty humor.
              </p>
            </div>

            <div className="relative border-l-2 border-zinc-900 pl-6 md:pl-12 ml-4 flex flex-col gap-12">
              
              {planSteps.map((step) => {
                const isCompleted = step.status === "Completed";
                const isInProgress = step.status === "In-Progress";

                return (
                  <div key={step.id} className="relative group">
                    
                    {/* Circle Bullet icon indicator */}
                    <div className={`absolute left-[-31px] md:left-[-55px] top-1.5 w-6 h-6 rounded-full border-2 bg-black flex items-center justify-center text-[10px] transition-all duration-300 ${
                      isCompleted 
                        ? "border-amber-500 text-amber-500" 
                        : isInProgress 
                          ? "border-red-600 text-red-500 animate-pulse shadow-md shadow-red-500/20" 
                          : "border-zinc-800 text-zinc-600"
                    }`}>
                      {isCompleted ? "✔" : isInProgress ? "⚡" : "🔒"}
                    </div>

                    {/* Content Block */}
                    <div className="p-6 bg-zinc-950/80 border border-zinc-900 rounded-xl group-hover:border-zinc-800 transition-all select-none">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-zinc-500 uppercase tracking-widest">{step.phase}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider ${
                            isCompleted 
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                              : isInProgress 
                                ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                : "bg-zinc-900 text-zinc-600"
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600">{step.vibeText}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-amber-400 transition-colors">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-zinc-400 text-xs leading-relaxed font-mono">
                        {step.description}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        </section>


        {/* INTERACTIVE FORM & RESULTS PANEL: Tribute & Roast Desk */}
        <section id="syndicate-tribute-desk" className="relative py-24 px-6 bg-zinc-950/20">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="text-xs font-mono tracking-widest text-red-500 border-b border-red-950 pb-2 uppercase">
                04 // THE SYNDICATE DECK TRANSMITTER
              </span>
              <h2 className="text-4xl font-extrabold mt-3 tracking-tight">
                SUBMIT BIRTHDAY <span className="text-amber-500">TRIBUTE</span> & RECEIVE VERDICT
              </h2>
              <p className="text-zinc-500 text-xs font-mono mt-2 max-w-xl mx-auto">
                Transmit your greeting. The Gemini-powered Satya "Mr Pandit" engine will review your message, judge your loyalty, analyze your offering, and strike back with a witty response. 
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Submission Form (occupies 6 columns) */}
              <div className="lg:col-span-6 bg-black border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400" />
                
                <h3 className="text-lg font-mono font-bold text-white mb-6 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-500 animate-pulse" />
                  INITIATE SECURE TRANSMISSION
                </h3>

                <form onSubmit={handleTributeSubmit} className="space-y-5">
                  
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
                      YOUR CODE NAME / FRIEND NAME
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={tributeName}
                        onChange={(e) => setTributeName(e.target.value)}
                        placeholder="e.g. Pappu Gangster, Rocky, Shanky"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-lg py-2.5 px-4 text-xs font-mono outline-none transition-colors"
                      />
                      <User className="absolute right-3.5 top-3 w-4 h-4 text-zinc-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
                        SYNDICATE RELATIONSHIP
                      </label>
                      <select
                        value={tributeCategory}
                        onChange={(e) => setTributeCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-lg py-2.5 px-3 text-xs font-mono outline-none transition-colors cursor-pointer"
                      >
                        <option value="Underworld Ally">Underworld Ally</option>
                        <option value="Henchman Cadet">Henchman Cadet</option>
                        <option value="Beard Disciple">Beard Disciple</option>
                        <option value="Rival Crime Boss">Rival Crime Boss</option>
                        <option value="Cigar Supplier">Cigar Supplier</option>
                        <option value="Loyal Crew Henchman">Loyal Crew Henchman</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
                        BIRTHDAY GIFT OFFERED
                      </label>
                      <input
                        type="text"
                        value={giftOffer}
                        onChange={(e) => setGiftOffer(e.target.value)}
                        placeholder="e.g. Cuban cigar box, luxury wax"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-lg py-2.5 px-3 text-xs font-mono outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
                      YOUR CONGRATULATION MESSAGE
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={tributeMessage}
                      onChange={(e) => setTributeMessage(e.target.value)}
                      placeholder="Write a heartfelt / badass / sarcastic birthday message to Satya. Trigger a witty mastermind response!"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-lg py-2.5 px-4 text-xs font-mono outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black font-extrabold text-xs font-mono tracking-widest py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        TRANSMITTING BLUEPRINT TO MR PANDIT...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        TRANSMIT SECURE GREETING
                      </>
                    )}
                  </button>

                  <div className="text-[9px] font-mono text-zinc-600 text-center uppercase tracking-wide">
                    *Tributes verified on secure sandbox node. Response generated by Gemini.
                  </div>

                </form>

              </div>

              {/* Real-time Verdict Assayer Panel (occupies 6 columns) */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl flex-grow flex flex-col justify-between min-h-[350px]">
                  
                  {latestResponse ? (
                    <div className="space-y-6 flex-grow flex flex-col justify-between animate-fade-in">
                      
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">SYS STAGE: ASSAYED RESPONSE</span>
                          <h4 className="text-sm font-mono font-bold text-amber-500">FROM: MR. PANDIT'S CODESK</h4>
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 select-none">
                          ⚡
                        </div>
                      </div>

                      {/* AI generated text output fully formatted */}
                      <div className="py-4 font-mono text-zinc-300 text-xs leading-relaxed border-b border-zinc-900 italic relative">
                        <span className="text-3xl font-serif text-amber-500/20 absolute -top-2 -left-2">“</span>
                        <p className="pl-4 pr-2">{latestResponse.text}</p>
                        <span className="text-3xl font-serif text-amber-500/20 absolute -bottom-6 -right-2">”</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">RATED SYNDICATE TIER</span>
                          <span className="block text-xs font-mono font-black text-red-500 mt-0.5">
                            {latestResponse.syndicateTier}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">LOYALTY RATING</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono font-black text-emerald-400">
                              {latestResponse.loyaltyScore} / 100
                            </span>
                            <div className="w-16 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full" 
                                style={{ width: `${latestResponse.loyaltyScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <span className="text-[9px] font-mono text-amber-500 uppercase block font-black">VERDICT MATRIX</span>
                        <p className="text-[11px] font-mono text-zinc-300 mt-1">
                          {latestResponse.verdict}
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 flex-grow">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-2xl text-zinc-700 animate-pulse select-none">
                        ⏳
                      </div>
                      <h4 className="text-sm font-mono font-black text-zinc-400 uppercase tracking-wider">
                        AWAITING SYNDICATE TRANSMISSION
                      </h4>
                      <p className="text-[11px] font-mono text-zinc-500 mt-2 max-w-xs leading-relaxed">
                        Input tribute parameters on the left and dispatch them to prompt Satya's custom AI assayer.
                      </p>
                    </div>
                  )}

                  {/* Aesthetic diagnostics line */}
                  <div className="mt-6 pt-4 border-t border-zinc-900 text-[9px] font-mono text-zinc-600 flex items-center justify-between">
                    <span>SECURITY CODESK: OK</span>
                    <span>MD5_CRYPT_PASS // TRUE</span>
                    <span>SYS_UPGRADE // 2026-05-24</span>
                  </div>

                </div>

              </div>

            </div>

            {/* Historic Syndicate Transmissions Feed */}
            <div className="mt-16">
              <h3 className="text-lg font-mono font-bold text-white mb-6 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                INTERCEPTED SYNDICATE GREETINGS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tributes.map((entry) => (
                  <div key={entry.id} className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all">
                    
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-white font-mono">{entry.name}</span>
                        <span className="block text-[9px] font-mono text-zinc-500 mt-0.5">{entry.category}</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600">{entry.timestamp}</span>
                    </div>

                    <p className="text-zinc-400 font-mono text-xs leading-relaxed italic">
                      "{entry.tributeMessage}"
                    </p>

                    <div className="mt-2 text-[10px] font-mono">
                      <span className="text-zinc-500">Gift offered: </span>
                      <strong className="text-amber-500 font-medium">{entry.giftOffer}</strong>
                    </div>

                    {entry.response && (
                      <div className="mt-4 p-3.5 bg-black border border-zinc-900 rounded-lg text-[11px] font-mono relative">
                        <div className="text-[9px] text-amber-500 font-bold uppercase mb-1">Satya "Mr Pandit" Assayed Response:</div>
                        <p className="text-zinc-300 italic">"{entry.response.text}"</p>
                        
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-900/60 text-[9.5px]">
                          <div><span className="text-zinc-500">Tier: </span><span className="text-red-500 font-bold">{entry.response.syndicateTier}</span></div>
                          <div><span className="text-zinc-500">Loyalty Score: </span><span className="text-emerald-400 font-bold">{entry.response.loyaltyScore}/100</span></div>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* FOOTER METRICS AND SYSTEMS GREETINGS */}
      <footer className="relative z-10 py-12 px-6 bg-black border-t border-zinc-950 text-center text-xs font-mono text-zinc-500 select-none">
        
        {/* Subtle decorative geometric lines */}
        <div className="w-12 h-[2px] bg-amber-500/50 mx-auto mb-6" />

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 uppercase font-black tracking-widest text-[11.5px] mb-1">
              HAPPY BIRTHDAY SATYA TRI-PANDIT
            </div>
            <p className="text-[10px] text-zinc-600">
              The ultimate badass rogue commander. Groom calibrated & blueprint structured.
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[10px] text-zinc-600 block">DESIGNED FOR MAXIMUM PREMIUM MAJESTY</span>
            <span className="text-[9px] text-zinc-700 block mt-1">NO AD-BLOCKERS OR COOKIE CRUMBS REQUIRED.</span>
          </div>
        </div>

        <div className="mt-10 text-[9px] text-zinc-700">
          © 2026 // SYSTEM SECURED BY HEAVY TRACER DECK PROTOCOLS. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* EMBED AUDIO DRIVER NODE WITH SCROLL VELOCITY-TRACKING BACKEND */}
      <AudioEngine 
        isMuted={isAudioMuted} 
        onMuteToggle={() => setIsAudioMuted(prev => !prev)}
        onBeat={handleAudioBeat}
      />

    </div>
  );
}
