import React from "react";
import { Scale, PhoneCall, BookOpen, Shield, Zap } from "lucide-react";

interface HeaderProps {
  activeTab: "intake" | "emergency" | "tracker" | "sources";
  setActiveTab: (tab: "intake" | "emergency" | "tracker" | "sources") => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#060913]/85 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Brand Identity */}
        <div 
          onClick={() => setActiveTab("intake")}
          className="flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-[1.5px] shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 transition-all">
              <div className="w-full h-full bg-[#0B0F1D] rounded-[14px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#060913] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl text-white tracking-tight">RESOLVE</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-widest">
                Nigeria
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Consumer Dispute & Statutory Redress Intelligence</p>
          </div>
        </div>

        {/* Action Tabs */}
        <nav className="flex items-center space-x-1.5 bg-[#0C1222] border border-white/10 p-1.5 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab("intake")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "intake"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            File Dispute
          </button>
          <button
            onClick={() => setActiveTab("emergency")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "emergency"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>USSD Freeze</span>
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "sources"
                ? "bg-white/10 text-white shadow-sm border border-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Regulators</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
