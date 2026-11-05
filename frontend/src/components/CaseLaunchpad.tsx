"use client";

import React from "react";
import { Landmark, ShoppingBag, Store, HelpCircle, ArrowRight, ShieldCheck, Sparkles, Scale, User, FileText } from "lucide-react";

interface CaseLaunchpadProps {
  onStart: (description: string) => void;
}

const pathways = [
  {
    title: "Failed Bank Transfer",
    role: "Customer",
    description: "Account was debited for a transfer, but the recipient never received value.",
    prompt: "I was debited for a bank transfer and the recipient has not received the money.",
    icon: Landmark,
    theme: {
      border: "hover:border-[#D95D39]/50",
      iconBg: "bg-gradient-to-br from-[#D95D39] to-[#C84B27] text-white shadow-md shadow-[#D95D39]/20",
      accentPill: "bg-[#D95D39]/10 text-[#D95D39] border-[#D95D39]/25",
      link: "text-[#D95D39]"
    }
  },
  {
    title: "Online Order & Delivery",
    role: "Buyer / Customer",
    description: "Paid an online seller but the order has delayed or remains unfulfilled.",
    prompt: "I bought an item from an online seller and the delivery has delayed.",
    icon: ShoppingBag,
    theme: {
      border: "hover:border-[#E07A5F]/60",
      iconBg: "bg-gradient-to-br from-[#E07A5F] to-[#D95D39] text-white shadow-md shadow-[#E07A5F]/20",
      accentPill: "bg-[#E07A5F]/15 text-[#C84B27] border-[#E07A5F]/30",
      link: "text-[#E07A5F]"
    }
  },
  {
    title: "Merchant Settlements & Disputes",
    role: "Vendor / Seller",
    description: "Customer disputes, delayed payment gateway settlements, or handling refund requests.",
    prompt: "I am a merchant dealing with a customer payment dispute or delayed gateway settlement.",
    icon: Store,
    theme: {
      border: "hover:border-[#F2CC8F]",
      iconBg: "bg-gradient-to-br from-[#F2CC8F] to-[#E07A5F] text-[#2B1E1A] shadow-md shadow-[#F2CC8F]/30",
      accentPill: "bg-[#F2CC8F]/30 text-[#8C2E0B] border-[#F2CC8F]/60",
      link: "text-[#C84B27]"
    }
  },
  {
    title: "Banking Terms & PND Freeze",
    role: "Financial Inquirer",
    description: "Understand Post-No-Debit (PND), BVN/NIN linkage, chargebacks, and CBN timelines.",
    prompt: "What does a Post-No-Debit (PND) or account freeze mean, and how do I resolve it?",
    icon: HelpCircle,
    theme: {
      border: "hover:border-[#C84B27]/60",
      iconBg: "bg-gradient-to-br from-[#C84B27] to-[#8C271E] text-white shadow-md shadow-[#C84B27]/25",
      accentPill: "bg-[#C84B27]/12 text-[#C84B27] border-[#C84B27]/30",
      link: "text-[#C84B27]"
    }
  },
];

export function CaseLaunchpad({ onStart }: CaseLaunchpadProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 px-4 sm:px-6 max-w-4xl mx-auto text-center">
      
      {/* Top Subtle Pill */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E07A5F]/25 text-xs font-semibold text-[#2B1E1A] shadow-xs mb-5">
        <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" />
        <span>Financial Resolution Companion</span>
        <span className="text-[#D95D39] font-bold">&bull; Nigeria</span>
      </div>

      {/* Main Headline with Serif Elegance & Warm Gradient */}
      <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2B1E1A] tracking-tight font-outfit max-w-2xl leading-[1.15]">
        How can we help{" "}
        <span className="font-serif-display italic font-normal text-gradient-fire pr-1">
          guide
        </span>{" "}
        your transaction today?
      </h1>

      <p className="mt-3.5 text-sm sm:text-base text-[#2B1E1A]/80 font-medium max-w-xl leading-relaxed">
        Your companion for Nigerian banking regulations, merchant dispute resolution, and transaction clarity under{" "}
        <strong className="text-[#2B1E1A] font-semibold">CBN</strong>,{" "}
        <strong className="text-[#2B1E1A] font-semibold">NIBSS</strong>, and{" "}
        <strong className="text-[#2B1E1A] font-semibold">FCCPC</strong> guidelines.
      </p>

      {/* 4 Interactive Multi-Perspective Cards */}
      <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
        {pathways.map(({ title, role, description, prompt, icon: Icon, theme }) => (
          <button
            key={title}
            onClick={() => onStart(prompt)}
            className={`group relative flex flex-col justify-between rounded-2xl border border-[#E07A5F]/20 bg-white/85 backdrop-blur-md p-5 sm:p-6 shadow-sm shadow-[#2B1E1A]/5 hover:shadow-xl hover:shadow-[#D95D39]/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] ${theme.border}`}
          >
            <div>
              {/* Custom Circular Icon Container */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${theme.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${theme.accentPill}`}>
                  {role}
                </span>
              </div>

              <h2 className="mt-4 text-base font-bold text-[#2B1E1A] group-hover:text-[#D95D39] transition-colors font-outfit">
                {title}
              </h2>
              <p className="mt-1.5 text-xs text-[#2B1E1A]/75 font-medium leading-relaxed">
                {description}
              </p>
            </div>

            <div className={`mt-5 pt-3 border-t border-[#E07A5F]/15 flex items-center space-x-1.5 text-xs font-bold ${theme.link} group-hover:translate-x-1 transition-transform`}>
              <span>Start consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
