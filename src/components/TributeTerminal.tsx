import React, { useState } from "react";
import { Terminal, Shield, Award, HardHat, RefreshCw, Send, CheckCircle, Flame } from "lucide-react";

interface SyndicateResponse {
  text: string;
  syndicateTier: string;
  loyaltyScore: number;
  verdict: string;
}

export default function TributeTerminal() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Henchman",
    tributeMessage: "",
    giftOffer: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syndicateFeedback, setSyndicateFeedback] = useState<SyndicateResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const categories = [
    { value: "Inner-Circle Ally", label: "Inner-Circle Ally (High Rank)" },
    { value: "Henchman", label: "Syndicate Henchman (Underling)" },
    { value: "Rival Boss", label: "Rivalling Boss / Pretender" },
    { value: "Underworld Banker", label: "Underworld Money Handler" },
    { value: "Fringe Contact", label: "Fringe Shadow Contact" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tributeMessage.trim()) {
      setErrorText("Identify yourself and write a real tribute, recruit.");
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);
    setSyndicateFeedback(null);

    try {
      const resp = await fetch("/api/tribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          tributeMessage: formData.tributeMessage,
          giftOffer: formData.giftOffer || "Underworld Respect",
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to contact Satya's encryption server.");
      }

      const rawResult = await resp.json();
      setSyndicateFeedback(rawResult);
    } catch (err: any) {
      console.error("Syndicate submit error:", err);
      setErrorText(err.message || "Something went wrong in the transmission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearStatus = () => {
    setSyndicateFeedback(null);
    setFormData({
      name: "",
      category: "Henchman",
      tributeMessage: "",
      giftOffer: "",
    });
  };

  return (
    <div className="border border-amber-500/15 bg-zinc-950/80 rounded-2xl p-6 lg:p-8 shadow-2xl backdrop-blur-md">
      
      {/* Header section */}
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-900 pb-5">
        <Terminal className="w-5 h-5 text-amber-500 animate-pulse" />
        <div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider block">SYNDICATE COMM desk</span>
          <h3 className="text-xl font-bold text-zinc-100 font-sans tracking-tight">
            TRIBUTE ENCRYPTOR & ROAST ENGINE
          </h3>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mb-6 font-mono leading-relaxed">
        Submit a birthday message or tribute down to Satya's private bunker desk. Choose your allegiance tier and offer your custom birthday tribute. The <strong className="text-amber-400">Gemini Roast Engine</strong> will scan your message and construct an real-time feedback transcript reflecting Mr Pandit's ultimate judgment. Let's see if your plan is accepted!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form Area */}
        <form onSubmit={submitTribute} className="lg:col-span-6 space-y-4">
          
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-zinc-400 lowercase" htmlFor="terminal-name">
              // FRIEND_OR_ALLY_IDENTIFICATION:
            </label>
            <input
              id="terminal-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your name... (e.g., Tiger, Singham, Rahul)"
              className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-zinc-200 font-mono outline-none transition-colors"
            />
          </div>

          {/* Allegiance Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-zinc-400 lowercase" htmlFor="terminal-category">
              // CLASSIFIED_SYNDICATE_RELATIONSHIP:
            </label>
            <select
              id="terminal-category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono outline-none transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="bg-zinc-950 text-zinc-200">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Birthday present / tribute offer */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-zinc-400 lowercase" htmlFor="terminal-gift">
              // OFFERED_BIRTHDAY_GIFT_COLLATERAL:
            </label>
            <input
              id="terminal-gift"
              type="text"
              name="giftOffer"
              value={formData.giftOffer}
              onChange={handleInputChange}
              placeholder="e.g., A golden lighter, razor shape comb, pure loyalty, cigar box"
              className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-zinc-200 font-mono outline-none transition-colors"
            />
          </div>

          {/* Message Text area */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-zinc-400 lowercase" htmlFor="terminal-tribute">
              // SECURE_BIRTHDAY_COMM_MESSAGE:
            </label>
            <textarea
              id="terminal-tribute"
              name="tributeMessage"
              value={formData.tributeMessage}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Write your happy birthday message. Add jokes, praise his beard, or roast him back. He is 'Harami' and smart, so keep it sharp!"
              className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-zinc-200 font-mono outline-none transition-colors resize-none"
            ></textarea>
          </div>

          {/* Submit transmission button */}
          <button
            id="btn-transmit-tribute"
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold rounded-lg py-2.5 px-4 text-xs font-mono select-none tracking-widest uppercase transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-amber-500/80 shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>DECRYPTING PLANS...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-black" />
                <span>TRANSMIT TRIBUTE</span>
              </>
            )}
          </button>
          
          {errorText && (
            <p className="text-[10px] font-mono text-red-500 p-2 bg-red-950/20 border border-red-500/10 rounded">
              ⚠️ ERROR_COMM_HALT: {errorText}
            </p>
          )}

        </form>

        {/* Realtime Syndicate Display Terminal */}
        <div className="lg:col-span-6 flex flex-col h-full min-h-[300px]">
          
          {/* Main Monitor Screen */}
          <div className="flex-1 bg-black border border-zinc-800/80 rounded-xl overflow-hidden shadow-inner flex flex-col relative">
            
            {/* Top Command Bar */}
            <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-2 flex items-center justify-between font-mono text-[9px] text-zinc-500 select-none">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                CHANNEL_SECURE: SATYA-TRI-DESK-2026
              </span>
              <span>MR.PANDIT-INTEL-OUTPUT</span>
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-4 leading-normal select-text">
              
              {!isSubmitting && !syndicateFeedback && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold mb-2 font-mono">
                    ?
                  </div>
                  <p className="text-[11px] text-zinc-500 uppercase max-w-xs leading-relaxed">
                    AWAITING SECURE COMM TRANSMISSION. INPUT BLUEPRINTS ON LEFT AND CLICK TRANSMIT TO INITIATE MR PANDIT'S DECISION ENGINE.
                  </p>
                </div>
              )}

              {isSubmitting && (
                <div className="space-y-2 animate-pulse py-6">
                  <span className="text-amber-500 text-[10px] block">// TRANSMISSION_INITIATED</span>
                  <div className="h-2 bg-zinc-800 w-3/4 rounded"></div>
                  <div className="h-2 bg-zinc-800 w-5/6 rounded"></div>
                  <div className="h-2 bg-zinc-800 w-2/3 rounded"></div>
                  <div className="h-2 bg-zinc-800 w-1/2 rounded mt-3"></div>
                  <span className="text-zinc-500 text-[9px] block">CRUNCHING PLAN MATH IN OBSIDIAN LAIR...</span>
                </div>
              )}

              {syndicateFeedback && (
                <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                  
                  {/* Status header blocks */}
                  <div className="grid grid-cols-2 gap-3.5">
                    
                    {/* Rated Syndicate Tier status */}
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800/60 leading-tight">
                      <span className="text-[9px] text-zinc-500 block uppercase font-semibold">ASSIGNED RANK:</span>
                      <span className="text-amber-400 text-[11px] font-bold tracking-wider block uppercase mt-0.5 truncate">
                        {syndicateFeedback.syndicateTier}
                      </span>
                    </div>

                    {/* Rated Syndicate Loyalty score */}
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800/60 leading-tight">
                      <span className="text-[9px] text-zinc-400 block uppercase font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        LOYALTY RATING:
                      </span>
                      <span className="text-zinc-100 text-[11px] font-bold tracking-wider block uppercase mt-0.5">
                        {syndicateFeedback.loyaltyScore} / 100
                      </span>
                    </div>

                  </div>

                  {/* Absolute core quote transcript */}
                  <div className="p-4 rounded-lg bg-zinc-950/80 border border-amber-500/10 space-y-2 text-zinc-300 relative">
                    <span className="absolute -top-2.5 left-3 px-1.5 py-0.5 text-[8px] font-bold bg-amber-500 text-black rounded tracking-widest">
                      SPEECH TRANSCRIPT
                    </span>
                    <p className="text-[11.5px] whitespace-pre-line italic font-sans leading-relaxed text-zinc-200">
                      {syndicateFeedback.text}
                    </p>
                  </div>

                  {/* Rated verdict block */}
                  <div className="p-3 rounded border border-zinc-900 bg-zinc-900/40 text-[10px] text-zinc-400 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 font-bold uppercase min-w-[55px]">
                      VERDICT:
                    </span>
                    <span>
                      "{syndicateFeedback.verdict}"
                    </span>
                  </div>

                  {/* Reset trigger */}
                  <div className="flex justify-end pt-2">
                    <button
                      id="btn-terminal-reset"
                      onClick={clearStatus}
                      className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-amber-500 font-mono uppercase bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Assign New Colleague
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
