import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Send, Wifi, ShoppingBag, ShieldAlert, Building2, Smartphone } from "lucide-react";

interface IntakeFormProps {
  onSubmit: (text: string, category?: string) => Promise<void>;
  isLoading: boolean;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const categories = [
    {
      id: "FAILED_TRANSFER",
      name: "Failed Bank Transfer",
      subtitle: "Debited without credit",
      icon: Send,
      badge: "CBN 14-Day SLA",
      gradient: "from-blue-600/20 via-sky-500/10 to-transparent",
      activeRing: "ring-2 ring-sky-500 border-sky-400 bg-sky-500/15",
      accentColor: "text-sky-400"
    },
    {
      id: "UNDELIVERED_AIRTIME_DATA",
      name: "Airtime / Data Bundle",
      subtitle: "Bank VTU or SIM failure",
      icon: Wifi,
      badge: "NCC 622 Hotline",
      gradient: "from-indigo-600/20 via-violet-500/10 to-transparent",
      activeRing: "ring-2 ring-indigo-500 border-indigo-400 bg-indigo-500/15",
      accentColor: "text-indigo-400"
    },
    {
      id: "MERCHANT_NON_DELIVERY",
      name: "Vendor Non-Delivery",
      subtitle: "Paid vendor who refused delivery",
      icon: ShoppingBag,
      badge: "FCCPA 2018 Redress",
      gradient: "from-purple-600/20 via-fuchsia-500/10 to-transparent",
      activeRing: "ring-2 ring-purple-500 border-purple-400 bg-purple-500/15",
      accentColor: "text-purple-400"
    },
    {
      id: "STOLEN_FUNDS_FRAUD",
      name: "Unauthorized Fraud",
      subtitle: "Phone snatched or scam transfer",
      icon: ShieldAlert,
      badge: "24/7 Fraud Lien & PND",
      gradient: "from-rose-600/20 via-red-500/10 to-transparent",
      activeRing: "ring-2 ring-rose-500 border-rose-400 bg-rose-500/15",
      accentColor: "text-rose-400"
    }
  ];

  const popularInstitutions = [
    { name: "GTBank", code: "GTBank" },
    { name: "Access Bank", code: "Access Bank" },
    { name: "Zenith Bank", code: "Zenith Bank" },
    { name: "OPay", code: "OPay" },
    { name: "Moniepoint", code: "Moniepoint" },
    { name: "Kuda", code: "Kuda" },
    { name: "MTN", code: "MTN" },
    { name: "Airtel", code: "Airtel" }
  ];

  const nigerianExamples = [
    {
      title: "Failed Interbank NIP",
      text: "I transferred ₦25,000 from GTBank to OPay with Session ID 100004241030123456789012345678 but the recipient never received it."
    },
    {
      title: "Defaulting IG Vendor",
      text: "I paid an Instagram boutique ₦45,000 for two dresses on October 15. The delivery date was October 20. She has blocked me on WhatsApp."
    },
    {
      title: "Undelivered VTU Data",
      text: "I bought ₦5,000 MTN data on my Access Bank mobile app. The bank debited me but no data was credited to my line."
    },
    {
      title: "Snatched Phone Emergency",
      text: "Someone snatched my phone in traffic and they are draining my account right now on Access Bank!"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSubmit(text, selectedCategory);
  };

  const appendInstitution = (name: string) => {
    if (!text.includes(name)) {
      setText((prev) => (prev ? `${prev} with ${name}` : `My transaction was with ${name}`));
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 glow-card p-6 sm:p-9 shadow-2xl">
      {/* Decorative background light beams */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Progress Stepper Banner */}
      <div className="relative z-10 mb-7 pb-5 border-b border-white/[0.08] flex items-center justify-between text-xs font-bold text-slate-400 overflow-x-auto gap-2">
        <div className="flex items-center space-x-2 text-sky-400 shrink-0">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-blue-600/40">1</span>
          <span>Triage Complaint</span>
        </div>
        <span className="text-slate-600"></span>
        <div className="flex items-center space-x-2 text-slate-500 shrink-0">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">2</span>
          <span>Evidence Gate</span>
        </div>
        <span className="text-slate-600"></span>
        <div className="flex items-center space-x-2 text-slate-500 shrink-0">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">3</span>
          <span>Statutory Roadmap</span>
        </div>
        <span className="text-slate-600"></span>
        <div className="flex items-center space-x-2 text-slate-500 shrink-0">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">4</span>
          <span>Official Dossier</span>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Statutory Consumer Redress Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          What went wrong with your money or order?
        </h1>
        <p className="text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
          Describe the incident in everyday language or Nigerian Pidgin. Resolve identifies missing evidence, applies <strong>Central Bank (CBN), NCC, or FCCPC</strong> regulations, and compiles your formal dispute package.
        </p>
      </div>

      {/* Category Cards with Animated Gradients */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-7">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? undefined : cat.id)}
              className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden group border ${
                isSelected
                  ? `${cat.activeRing} shadow-xl`
                  : "border-white/10 bg-[#0C1222]/80 hover:bg-[#121B30] hover:border-white/20"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${cat.gradient} pointer-events-none opacity-50`} />

              <div className="relative z-10 flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-white text-slate-900 shadow-md font-bold" : "bg-slate-800/80 border border-white/10 " + cat.accentColor
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 uppercase tracking-wider">
                  {cat.badge.split(" ")[0]}
                </span>
              </div>
              <h4 className="relative z-10 text-xs font-bold text-white tracking-tight">{cat.name}</h4>
              <p className="relative z-10 text-[11px] text-slate-400 mt-1 leading-snug">{cat.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Popular Institution Badges */}
      <div className="relative z-10 mt-6 pt-5 border-t border-white/[0.08]">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2">Quick Institution Tag:</span>
        <div className="flex flex-wrap gap-2">
          {popularInstitutions.map((inst) => (
            <button
              key={inst.name}
              type="button"
              onClick={() => appendInstitution(inst.code)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 border border-white/10 hover:border-sky-400/40 transition-all flex items-center space-x-1.5"
            >
              <span>+</span>
              <span>{inst.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Command Input Area */}
      <form onSubmit={handleSubmit} className="relative z-10 mt-5">
        <div className="relative rounded-2xl bg-[#080D1A] p-1 border border-white/15 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/15 transition-all shadow-inner">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Type what happened... (e.g. 'I transferred ₦35,000 from Zenith to Moniepoint on Monday. Debit alert entered but recipient no receive am. The Session ID is 10000424...')"
            className="w-full bg-transparent p-4 text-sm text-white placeholder:text-slate-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* PII Safety Notice */}
        <div className="mt-3 flex items-center space-x-2.5 text-[11px] text-slate-300 bg-[#080D1A]/80 border border-white/10 rounded-xl px-4 py-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong className="text-white">Strict privacy protection:</strong> PINs, OTPs, BVNs, and Card CVVs are automatically masked. Never share your secret banking PIN or password with anyone.
          </span>
        </div>

        {/* Real Scenario Click-Starters */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-400 mb-2">Or test with real verified Nigerian cases:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nigerianExamples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(ex.text)}
                className="text-xs bg-[#0F172A] hover:bg-[#1A2642] text-slate-300 border border-white/5 hover:border-sky-500/30 p-2.5 rounded-xl transition-all text-left flex items-start space-x-2"
              >
                <span className="text-sky-400 font-bold shrink-0"></span>
                <div>
                  <span className="font-bold text-white block text-[11px]">{ex.title}:</span>
                  <span className="text-[11px] text-slate-400 truncate block max-w-xs">{ex.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit CTA */}
        <div className="mt-7 flex items-center justify-end">
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/35 border border-white/20 group"
          >
            {isLoading ? (
              <span>Analyzing Dispute Facts...</span>
            ) : (
              <>
                <span>Analyze & Prepare Redress Roadmap</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
