import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to lazily initialize GoogleGenAI to prevent crash on startup if key is missing
  let aiInstance: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to Settings -> Secrets.");
      }
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiInstance;
  }

  // API Route: Generate a satirical mastermind roast / response from Satya "Mr Pandit" Tripathi
  app.post("/api/tribute", async (req, res) => {
    try {
      const { name, tributeMessage, category, giftOffer } = req.body;

      if (!name || !tributeMessage) {
        return res.status(400).json({ error: "Name and tribute message are required." });
      }

      // Check if API key is present
      if (!process.env.GEMINI_API_KEY) {
        // Fallback response if API key is not configured yet
        const localMockResponse = {
          text: `[SYSTEM FALLBACK: OFFLINE MODE]
"Aha, ${name}! I see your message. You called me a '${category || "Harami"}'. Smart move. The plan is in action, and my beard remains spotless. Your tribute is appreciated, but remember, there's only one Mr Pandit in this town. Keep your eyes open tonight."`,
          syndicateTier: "Provisional Member",
          loyaltyScore: 88,
          verdict: "Acceptable for now. Await instructions."
        };
        return res.json(localMockResponse);
      }

      const ai = getGeminiClient();

      const prompt = `You are playing the character of SATYA, also known as "Mr Pandit". Today is your birthday.
Here are your personality traits:
- Sarcastic, highly clever, witty, and extremely badass.
- Often described by friends as "Harami" (meaning witty, rogue, lovable rascal, mischievous but cool).
- A mastermind/villain persona who always has a "master plan" in action.
- Extremely styling and healthy, with the "coolest beard in town" and a solid masculine man look.
- Speaks with cinematic gangster-like confidence, mixture of professional mastermind and street-smart wit.

A friend of yours has submitted a Birthday Tribute/Message to your Syndicate Desk:
Friend's Name: "${name}"
Tribute Category Selected: "${category || "Acquaintance"}" (e.g., Gangster, Henchman, Boss, Underworld Ally)
Friend's Message: "${tributeMessage}"
Gift offered (value or description): "${giftOffer || "Respect & Loyalty"}"

Your Goal: Write a direct, immersive, and hilariously sharp birthday response in your trademark "Mr Pandit" villain persona.
1. Formulate a witty, highly specific, and slightly sarcastic (Harami) acknowledgment of their tribute, mocking or appreciating their style/message.
2. Mention your master plan, your majestic beard, or why you are the coolest in town.
3. Judge their gift offer and rate their "Syndicate Loyalty Score" out of 100.
4. Give them a "Syndicate Tier status" (e.g., "Inner-circle Henchman", "Sub-gangster Associate", "Fringe Suspective", "Cigar Handler", etc.).
5. Provide a short, fun "Verdict" action.

Respond in strict JSON format matching this schema:
{
  "text": "The full hilarious response speech from Satya 'Mr Pandit' Tripathi in his villain persona.",
  "syndicateTier": "The custom syndicate tier assigned to them, up to 4 words",
  "loyaltyScore": A number from 0 to 100 representing their rated loyalty,
  "verdict": "One short witty villainous verdict sentence."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const jsonStr = response.text ? response.text.trim() : "{}";
      const resultObj = JSON.parse(jsonStr);
      return res.json(resultObj);
    } catch (err: any) {
      console.error("Error generating dynamic tribute:", err);
      return res.status(500).json({
        error: "Failed to process syndicate tribute: " + err.message,
        text: "I am Mr Pandit, my servers are currently plotting a takeover. Try again.",
        syndicateTier: "Fringe Contact",
        loyaltyScore: 50,
        verdict: "Server alert. Recalibrating."
      });
    }
  });

  // Vite middleware for development or Static Server in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MASTERMIND SERVER] Live and plotting on port ${PORT}`);
  });
}

startServer();
