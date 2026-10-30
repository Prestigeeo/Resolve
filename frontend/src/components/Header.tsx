import React from "react";
import { Shield, PhoneCall, Scale, BookOpen } from "lucide-react";

interface HeaderProps {
  activeTab: "intake" | "emergency" | "tracker" | "sources";
  setActiveTab: (tab: "intake" | "emergency" | "tracker" | "sources") => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab("intake")}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xl text-slate-900 tracking-tight">RESOLVE</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                NIGERIA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Consumer Redress & Dispute Assistant</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("intake")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "intake"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            File Issue
          </button>
          <button
            onClick={() => setActiveTab("emergency")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeTab === "emergency"
                ? "bg-rose-50 text-rose-700 shadow-sm"
                : "text-slate-600 hover:text-rose-600"
            }`}
          >
            <PhoneCall className="w-3 h-3 text-rose-600" />
            <span>USSD Lock</span>
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeTab === "sources"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Regulators</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
