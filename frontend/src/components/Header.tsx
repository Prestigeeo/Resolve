"use client";

import React, { useState } from "react";
import { 
  Scale, 
  ShieldAlert, 
  BookOpen, 
  Plus, 
  Menu, 
  X, 
  HelpCircle, 
  ExternalLink,
  MessageSquare,
  Lock,
  ChevronRight
} from "lucide-react";

interface HeaderProps {
  activeTab: "intake" | "emergency" | "tracker" | "sources" | "guide";
  setActiveTab: (tab: "intake" | "emergency" | "tracker" | "sources" | "guide") => void;
  onNewChat?: () => void;
  caseCount?: number;
  caseCategory?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNewChat,
  caseCategory 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavItem {
    id: "intake" | "emergency" | "tracker" | "sources" | "guide";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    alert?: boolean;
  }

  const navItems: NavItem[] = [
    { id: "intake", label: "Dispute Assistant", icon: MessageSquare },
    { id: "guide", label: "How Redress Works", icon: HelpCircle },
    { id: "emergency", label: "USSD Kill-Switches", icon: Lock, alert: true },
    { id: "sources", label: "Statutory Authorities", icon: BookOpen },
  ];

  const handleNavClick = (tab: "intake" | "emergency" | "tracker" | "sources" | "guide") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070B14]/90 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity */}
          <div 
            onClick={() => handleNavClick("intake")}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 p-[1.5px] shadow-lg shadow-blue-600/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#090D1A] rounded-[10px] flex items-center justify-center">
                  <Scale className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#070B14] animate-pulse" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-white tracking-tight font-sans">
                  RESOLVE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-sky-300 border border-blue-400/25 tracking-wider uppercase">
                  Nigeria
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Consumer Dispute & Statutory Redress Intelligence
              </span>
            </div>
          </div>

          {/* Center Menu Bar (Desktop Navigation) */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0A0F1D] border border-white/[0.08] p-1.5 rounded-2xl shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                      : item.alert
                      ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : item.alert ? "text-rose-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden sm:flex items-center space-x-3">
            {caseCategory && (
              <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-[11px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="font-semibold text-slate-200">Active Dispute:</span>
                <span className="text-sky-300 capitalize">{caseCategory.replace(/_/g, " ").toLowerCase()}</span>
              </div>
            )}

            {onNewChat && (
              <button
                onClick={onNewChat}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-white border border-white/10 hover:border-white/20 transition-all duration-200 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>New Case</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="p-2 rounded-xl bg-white/[0.06] text-white border border-white/10 text-xs font-semibold"
                title="Start New Case"
              >
                <Plus className="w-4 h-4 text-sky-400" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070B14]/98 border-b border-white/10 px-4 pt-3 pb-5 space-y-2 backdrop-blur-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold"
                    : item.alert
                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 px-2 leading-relaxed">
            Statutory redress guided by Central Bank of Nigeria (CBN), Nigerian Communications Commission (NCC), and FCCPC.
          </div>
        </div>
      )}
    </header>
  );
};
