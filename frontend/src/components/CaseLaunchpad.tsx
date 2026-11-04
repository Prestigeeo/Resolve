"use client";

import React from "react";
import { ArrowRight, FileCheck2, Landmark, ShieldAlert, ShoppingBag, Smartphone, Waypoints } from "lucide-react";

interface CaseLaunchpadProps {
  onStart: (description: string) => void;
}

const pathways = [
  {
    title: "Failed transfer",
    description: "You were debited but the recipient was not credited.",
    prompt: "I was debited for a transfer but the recipient did not receive the money.",
    icon: Landmark,
    accent: "text-blue-700 bg-blue-50 border-blue-100",
  },
  {
    title: "Vendor did not deliver",
    description: "A seller received payment but will not deliver or refund.",
    prompt: "I paid an online vendor who has not delivered my order or refunded me.",
    icon: ShoppingBag,
    accent: "text-amber-700 bg-amber-50 border-amber-100",
  },
  {
    title: "Missing airtime or data",
    description: "You were debited but the value never reached your line.",
    prompt: "I was debited for airtime or data but did not receive it.",
    icon: Smartphone,
    accent: "text-indigo-700 bg-indigo-50 border-indigo-100",
  },
  {
    title: "Fraud or stolen phone",
    description: "Lock the account first, then preserve the recovery trail.",
    prompt: "My phone was stolen or I noticed an unauthorized transaction on my account.",
    icon: ShieldAlert,
    accent: "text-rose-700 bg-rose-50 border-rose-100",
  },
];

export function CaseLaunchpad({ onStart }: CaseLaunchpadProps) {
  return (
    <section className="flex-1 overflow-y-auto pb-6">
      <div className="rounded-3xl bg-slate-950 px-6 py-8 sm:px-10 sm:py-12 text-white shadow-xl overflow-hidden relative">
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-blue-300">Consumer redress command centre</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Know your next move before your case goes cold.</h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
            Resolve turns a transaction incident into a verified action plan: the evidence to preserve, the institution to contact, and the deadline that matters.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Evidence-first</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Rule-based routing</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Source-linked guidance</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pathways.map(({ title, description, prompt, icon: Icon, accent }) => (
          <button key={title} onClick={() => onStart(prompt)} className="group text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
            <div className={`inline-flex rounded-xl border p-2.5 ${accent}`}><Icon className="h-5 w-5" /></div>
            <h2 className="mt-4 text-sm font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Assess this case <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Waypoints className="h-4 w-4 text-blue-600" /><h3 className="mt-2 text-xs font-bold text-slate-900">1. Route the case</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Separate a failed payment from a merchant breach or urgent fraud.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><FileCheck2 className="h-4 w-4 text-blue-600" /><h3 className="mt-2 text-xs font-bold text-slate-900">2. Close evidence gaps</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Collect the precise records required before you complain.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><ShieldAlert className="h-4 w-4 text-blue-600" /><h3 className="mt-2 text-xs font-bold text-slate-900">3. Act at the right time</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Follow provider, regulator, and recovery deadlines with confidence.</p></div>
      </div>
    </section>
  );
}
