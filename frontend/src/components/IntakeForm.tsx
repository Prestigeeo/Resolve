import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, AlertCircle, ShoppingBag, Send, Wifi, ShieldAlert } from "lucide-react";

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
      name: "Failed Transfer",
      subtitle: "Debited, recipient not credited",
      icon: Send,
      color: "emerald"
    },
    {
      id: "UNDELIVERED_AIRTIME_DATA",
      name: "Airtime / Data",
      subtitle: "Debited without receiving value",
      icon: Wifi,
      color: "blue"
    },
    {
      id: "MERCHANT_NON_DELIVERY",
      name: "Vendor Non-Delivery",
      subtitle: "Paid online vendor who refused to deliver",
      icon: ShoppingBag,
      color: "purple"
    },
    {
      id: "STOLEN_FUNDS_FRAUD",
      name: "Stolen Funds / Scam",
      subtitle: "Unauthorized debit or account hacked",
      icon: ShieldAlert,
      color: "rose"
    }
  ];

  const pidginExamples = [
    "I transferred 25,000 naira from GTBank to OPay with Session ID 100004241030123456789012345678 but money no enter.",
    "I paid an Instagram vendor 45,000 naira for dresses and she blocked me on WhatsApp after promising delivery yesterday.",
    "I bought 5000 MTN data on my Access Bank app, money was deducted but no data dropped on my line.",
    "Someone stole my phone in traffic and they are draining my account right now on Access Bank!"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSubmit(text, selectedCategory);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
      <div className="max-w-2xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI-Powered Complaint & Redress Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          What happened with your transaction?
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Describe the incident in plain English or Nigerian Pidgin. Resolve will identify missing evidence, apply Central Bank (CBN), NCC, or FCCPC rules, and prepare your formal dispute dossier.
        </p>
      </div>

      {/* Category Quick Select Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? undefined : cat.id)}
              className={`p-3.5 rounded-2xl text-left transition-all border ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100/80"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${
                isSelected ? "bg-emerald-600 text-white" : "bg-white text-slate-700 shadow-xs border border-slate-200"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{cat.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-5">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Tell us what happened... (e.g. 'I transferred ₦35,000 from Zenith to Moniepoint on Monday. Debit alert entered but recipient no receive am. The Session ID is 10000424...')"
            className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 outline-none transition-all resize-none"
          />
        </div>

        {/* PII Safety Notice */}
        <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Bank-grade privacy:</strong> Resolve automatically blocks and strips PINs, OTPs, BVNs, and Card CVVs. Never share your secret banking PIN or password with anyone.
          </span>
        </div>

        {/* Example Chips */}
        <div className="mt-3.5">
          <p className="text-xs font-semibold text-slate-500 mb-1.5">Or try a real case scenario:</p>
          <div className="flex flex-wrap gap-1.5">
            {pidginExamples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(ex)}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-all text-left truncate max-w-xs"
              >
                "{ex.slice(0, 48)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-5 flex items-center justify-end">
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20"
          >
            {isLoading ? (
              <span>Analyzing Case Facts...</span>
            ) : (
              <>
                <span>Analyze & Guide Redress</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
