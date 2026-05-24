import { useState } from "react";
import { ShieldAlert, BookOpen, Crown, Glasses, Calendar, CheckCircle, Compass, ShieldCheck } from "lucide-react";

interface StyleElement {
  id: string;
  name: string;
  blueprintCode: string;
  status: string;
  description: string;
  secretVibe: string;
  metricLabel: string;
  metricValue: string;
  healthLevel: number;
}

export default function IsometricBlueprint() {
  const [activeElementId, setActiveElementId] = useState<string>("beard");
  const [pitchAngle, setPitchAngle] = useState<number>(45); // Pitch degree for pseudo isometric rotation
  const [yawAngle, setYawAngle] = useState<number>(-35); // Yaw degree for isometric layout
  const [scale, setScale] = useState<number>(1);
  const [isAssembled, setIsAssembled] = useState(true);

  const styleElements: StyleElement[] = [
    {
      id: "beard",
      name: "The Coolest Beard in Town",
      blueprintCode: "BEARD-TRIM-ALPHA_MAX",
      status: "SHARP / DEEP MANLY CRISP",
      description: "Crafted with perfect symmetry, premium sandalwood custom grooming oil, and dense masculine follicles. Provides +99% mastermind influence and is legally patented as a majestic town treasure.",
      secretVibe: "Harami Level: Infinite. Underhood: Secret herbal blend & pure confidence.",
      metricLabel: "Follicle Symmetry",
      metricValue: "99.97% PERFECT",
      healthLevel: 100,
    },
    {
      id: "aviators",
      name: "Obsidian Bandit Aviators",
      blueprintCode: "SHIELD-GLASS-600",
      status: "POLARIZED / INSOLENT GLOSS",
      description: "Special anti-flash black iridium lenses finished with pristine custom-molded pure gold rims. Engineered specifically to mask the deep strategic calculations of a plotting mastermind.",
      secretVibe: "Tint Level: Midnight Obsidian. Automatically scans room for potential syndicate henchmen.",
      metricLabel: "Glare Deflection",
      metricValue: "10,000 NITS MAX",
      healthLevel: 95,
    },
    {
      id: "ledger",
      name: "The Mr. Pandit Master Plan Ledger",
      blueprintCode: "SYNDICATE-STRATEGY-V8",
      status: "TOP SECRET // ENCRYPTED",
      description: "Satya's private tactical binder containing the full playbook. Includes secret escape blueprints from family functions, detailed charts classifying friends into loyal vs. suspicious tiers.",
      secretVibe: "Current Directive: Orchestrate the absolute ultimate Satya Tripathi Birthday takeover.",
      metricLabel: "Complot Density",
      metricValue: "420 MACRO PLOTS",
      healthLevel: 98,
    },
    {
      id: "matches",
      name: "Obsidian Cigar & Gold Lighter",
      blueprintCode: "EMBER-CALIBER-BURN",
      status: "ARMED // ARISTOCRATE CLOUD",
      description: "Premium hand-rolled syndicate cigars crafted to output beautiful aromatic cloud rings. Symbol of absolute command, paired with a solid brass matches case engraved with 'S.T.' (Satya Tripathi).",
      secretVibe: "Combustion Index: High. Smells like pure leadership, luxury leather, and power.",
      metricLabel: "Ember Temperature",
      metricValue: "850° CELSIUS",
      healthLevel: 90,
    }
  ];

  const activeElement = styleElements.find((e) => e.id === activeElementId) || styleElements[0];

  return (
    <div className="border border-amber-500/15 bg-zinc-950/80 rounded-2xl p-6 lg:p-8 shadow-2xl backdrop-blur-md">
      {/* Header Labeling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider block">TACTICAL BLUEPRINT PROJECTION</span>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            ISOMETRIC 3D STYLE ENGINE
          </h3>
        </div>

        {/* Board Rotators / Manual Control Panels */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setIsAssembled(!isAssembled)}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                isAssembled ? "bg-amber-500 text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              ASSEMBLED
            </button>
            <button
              onClick={() => setIsAssembled(false)}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                !isAssembled ? "bg-amber-500 text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              EXPLODED VIEW
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Dynamic 3D Isometric Board Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4">
          
          {/* Main 3D Stage bounds */}
          <div className="relative w-full max-w-md h-[420px] bg-zinc-900/40 border border-zinc-900/85 rounded-xl flex items-center justify-center overflow-hidden group">
            {/* Background Grid Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(#1c1917_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40"></div>
            
            {/* Ambient HUD circles in background */}
            <div className="absolute w-80 h-80 rounded-full border border-dashed border-amber-500/10 animate-[spin_50s_linear_infinite]"></div>
            <div className="absolute w-[360px] h-[360px] rounded-full border border-amber-500/5 animate-[spin_100s_linear2_infinite]"></div>

            {/* Simulated Axis Labels */}
            <div className="absolute top-4 left-4 text-[9px] font-mono text-zinc-600 block">AXIS_X+ : 45.92m</div>
            <div className="absolute top-4 right-4 text-[9px] font-mono text-zinc-600 block">AXIS_Y+ : -12.11m</div>
            <div className="absolute bottom-4 left-4 text-[9px] font-mono text-zinc-600 block">BLUEPRINT_ROTATION: {yawAngle}°</div>

            {/* Dynamic Stage Layer */}
            <div
              className="relative transition-all duration-700 ease-out flex items-center justify-center"
              style={{
                transform: `perspective(1000px) rotateX(${pitchAngle}deg) rotateY(0deg) rotateZ(${yawAngle}deg) scale(${scale})`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Isometric Ground Shadow Plane */}
              <div 
                className="absolute w-64 h-64 bg-amber-500/5 rounded-2xl border border-amber-500/10 transition-colors duration-300"
                style={{
                  transform: "translateZ(-30px)",
                }}
              ></div>

              {/* 1. LAYER ONE (Bottom Level): Strat Ledger */}
              <div
                id="iso-ledger"
                onClick={() => setActiveElementId("ledger")}
                className={`absolute w-36 h-40 bg-zinc-950/90 border rounded-xl flex flex-col justify-between p-3.5 shadow-2xl cursor-pointer transition-all duration-300 ${
                  activeElementId === "ledger" 
                    ? "border-amber-500/90 shadow-amber-500/10 bg-zinc-950" 
                    : "border-zinc-800 hover:border-zinc-500"
                }`}
                style={{
                  transform: `translate3d(-20px, -20px, ${isAssembled ? "0px" : "-120px"})`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-amber-500/15 p-1 text-amber-500 rounded text-xs font-mono font-bold">01</div>
                  <BookOpen className={`w-5 h-5 ${activeElementId === "ledger" ? "text-amber-400" : "text-zinc-600"}`} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 tracking-wider">LEDGER</div>
                  <div className="text-xs font-bold text-zinc-300 truncate font-mono">PANDIT.LDR</div>
                </div>
              </div>

              {/* 2. LAYER TWO (Mid Level): The Beard & Groomer Oil */}
              <div
                id="iso-beard"
                onClick={() => setActiveElementId("beard")}
                className={`absolute w-36 h-36 bg-zinc-950/90 border rounded-xl flex flex-col justify-between p-3.5 shadow-2xl cursor-pointer transition-all duration-300 ${
                  activeElementId === "beard" 
                    ? "border-amber-500/90 shadow-amber-500/10 bg-zinc-950" 
                    : "border-zinc-800 hover:border-zinc-500"
                }`}
                style={{
                  transform: `translate3d(60px, 40px, ${isAssembled ? "25px" : "-40px"})`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-amber-500/15 p-1 text-amber-500 rounded text-xs font-mono font-bold">02</div>
                  <Crown className={`w-5 h-5 ${activeElementId === "beard" ? "text-amber-400" : "text-zinc-600"}`} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 tracking-wider">BEARD CO.</div>
                  <div className="text-xs font-bold text-zinc-300 truncate font-mono">ROYAL.RAW</div>
                </div>
              </div>

              {/* 3. LAYER THREE (Top-Mid Level): Obsidian Aviators */}
              <div
                id="iso-aviators"
                onClick={() => setActiveElementId("aviators")}
                className={`absolute w-36 h-32 bg-zinc-950/90 border rounded-xl flex flex-col justify-between p-3.5 shadow-2xl cursor-pointer transition-all duration-300 ${
                  activeElementId === "aviators" 
                    ? "border-amber-500/90 shadow-amber-500/10 bg-zinc-950" 
                    : "border-zinc-800 hover:border-zinc-500"
                }`}
                style={{
                  transform: `translate3d(-50px, 70px, ${isAssembled ? "60px" : "40px"})`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-amber-500/15 p-1 text-amber-500 rounded text-xs font-mono font-bold">03</div>
                  <Glasses className={`w-5 h-5 ${activeElementId === "aviators" ? "text-amber-400" : "text-zinc-600"}`} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 tracking-wider">SPECS</div>
                  <div className="text-xs font-bold text-zinc-300 truncate font-mono">MIDNIGHT_99</div>
                </div>
              </div>

              {/* 4. LAYER FOUR (Floating Peak Level): Matches and Cigar Case */}
              <div
                id="iso-matches"
                onClick={() => setActiveElementId("matches")}
                className={`absolute w-32 h-32 bg-zinc-950/95 border rounded-xl flex flex-col justify-between p-3.5 shadow-2xl cursor-pointer transition-all duration-300 ${
                  activeElementId === "matches" 
                    ? "border-amber-500/90 shadow-amber-500/10 bg-zinc-950" 
                    : "border-zinc-800 hover:border-zinc-500"
                }`}
                style={{
                  transform: `translate3d(10px, -70px, ${isAssembled ? "100px" : "120px"})`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-amber-500/15 p-1 text-amber-500 rounded text-xs font-mono font-bold">04</div>
                  <ShieldAlert className={`w-5 h-5 ${activeElementId === "matches" ? "text-amber-400" : "text-zinc-600"}`} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 tracking-wider">EMBER</div>
                  <div className="text-xs font-bold text-zinc-300 truncate font-mono">COMBUSTION.BRS</div>
                </div>
              </div>

            </div>
          </div>

          {/* Projection Tuning Rotations Slider */}
          <div className="w-full mt-6 space-y-3.5 text-xs text-zinc-400 font-mono bg-zinc-950/60 p-4 border border-zinc-900/80 rounded-xl">
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>BOARD MANUAL ROTATOR INTERRUPT</span>
              <span className="text-amber-500 text-[10px]">REAL-TIME 3D MATRIX</span>
            </div>
            
            {/* Pitch rotation (up/down) */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>PITCH ANGLE:</span>
                <span className="text-zinc-300">{pitchAngle}°</span>
              </div>
              <input
                id="slider-pitch-angle"
                type="range"
                min="30"
                max="75"
                value={pitchAngle}
                onChange={(e) => setPitchAngle(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Yaw rotation (left/right spin) */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>YAW ROTATION:</span>
                <span className="text-zinc-300">{yawAngle}°</span>
              </div>
              <input
                id="slider-yaw-angle"
                type="range"
                min="-179"
                max="179"
                value={yawAngle}
                onChange={(e) => setYawAngle(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Tactical Specification Panel (Right Side detail layout) */}
        <div className="lg:col-span-5 flex flex-col h-full justify-center space-y-6">
          <div className="border border-zinc-900 bg-zinc-950/95 rounded-xl p-5 shadow-inner space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-amber-500 text-black">
                {activeElement.blueprintCode}
              </span>
              <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                SYSTEM SECURED
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-zinc-100 font-sans tracking-tight">
                {activeElement.name}
              </h4>
              <p className="text-xs font-mono text-zinc-400 uppercase mt-1 tracking-wider">
                Current Status: <span className="text-amber-400 font-semibold">{activeElement.status}</span>
              </p>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {activeElement.description}
            </p>

            {/* Inner-Specs Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4 font-mono text-[11px]">
              <div>
                <span className="text-zinc-500 block">TACTICAL METRIC</span>
                <span className="text-zinc-200 uppercase font-semibold">{activeElement.metricLabel}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">RATED VALUE</span>
                <span className="text-amber-400 font-bold uppercase">{activeElement.metricValue}</span>
              </div>
            </div>

            {/* Vibe commentary */}
            <div className="border-l-2 border-amber-500/40 pl-3 py-1 bg-zinc-950/40 text-[10px] text-zinc-400 font-mono italic">
              {activeElement.secretVibe}
            </div>

            {/* Foliage Integrity level */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>ESTIMATED BADASS LEVEL:</span>
                <span className="text-amber-500 font-bold">{activeElement.healthLevel}% CALIBER</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                  style={{ width: `${activeElement.healthLevel}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick-select navigation tabs for mobile feel */}
          <div className="grid grid-cols-4 gap-1.5">
            {styleElements.map((el) => {
              const isActive = el.id === activeElementId;
              return (
                <button
                  id={`btn-blueprint-tab-${el.id}`}
                  key={el.id}
                  onClick={() => setActiveElementId(el.id)}
                  className={`py-2 px-1 text-[10px] font-mono font-medium rounded-lg text-center border cursor-pointer hover:border-zinc-700 transition-colors uppercase ${
                    isActive 
                      ? "bg-amber-500 text-black border-amber-500 font-semibold" 
                      : "bg-zinc-900/50 text-zinc-400 border-zinc-800/40"
                  }`}
                >
                  {el.id}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
