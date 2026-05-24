export interface StyleElement {
  id: string;
  name: string;
  icon: string;
  description: string;
  blueprintCode: string; // Fictional code name
  status: string; // Status of the dynamic items (e.g., "Armed", "Waxed & Groomed", "Calibrated")
  interactiveLabel: string;
  secretVibe: string;
  position: { x: number; y: number; z: number }; // Isometric grid offsets
}

export interface SyndicateTribute {
  id: string;
  name: string;
  category: string;
  tributeMessage: string;
  giftOffer: string;
  timestamp: string;
  response?: {
    text: string;
    syndicateTier: string;
    loyaltyScore: number;
    verdict: string;
  };
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface PlanStep {
  id: number;
  phase: string;
  title: string;
  description: string;
  status: "Completed" | "In-Progress" | "Locked";
  vibeText: string;
}
