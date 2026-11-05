"use client";

import React, { useState } from "react";
import { 
  Scale, 
  BookOpen, 
  Plus, 
  Menu, 
  X, 
  HelpCircle, 
  Lock,
  ChevronRight,
  History,
  Sparkles
} from "lucide-react";

interface NavItem {
  id: "intake" | "history" | "emergency" | "tracker" | "sources" | "guide";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}

interface HeaderProps {
  activeTab: "intake" | "history" | "emergency" | "tracker" | "sources" | "guide";
  setActiveTab: (tab: "intake" | "history" | "emergency" | "tracker" | "sources" | "guide") => void;
  onNewChat?: () => void;
  caseCategory?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNewChat 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: "intake", label: "Transaction Resolution", icon: Scale },
    { id: "history", label: "Resolution History", icon: History },
    { id: "emergency", label: "Bank Freeze Codes", icon: Lock, alert: true },
    { id: "guide", label: "How Resolution Works", icon: HelpCircle },
    { id: "sources", label: "Official Regulators & Laws", icon: BookOpen },
  ];

  const handleNavClick = (tab: "intake" | "history" | "emergency" | "tracker" | "sources" | "guide") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F0]/90 backdrop-blur-xl border-b border-[#E07A5F]/20 shadow-sm shadow-[#2B1E1A]/5 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity */}
          <div 
            onClick={() => handleNavClick("intake")}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D95D39] to-[#C84B27] flex items-center justify-center text-white shadow-md shadow-[#D95D39]/25 group-hover:scale-105 transition-all duration-200">
              <Scale className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-[#2B1E1A] tracking-tight font-outfit">
                  RESOLVE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2CC8F]/35 text-[#C84B27] border border-[#E07A5F]/30 uppercase tracking-wider">
                  Nigeria
                </span>
              </div>
              <span className="text-[11px] text-[#2B1E1A]/60 font-medium hidden sm:block">
                Consumer Transaction Redress Platform
              </span>
            </div>
          </div>

          {/* Center Pill-Shaped Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#F3ECE2] p-1 rounded-full border border-[#E07A5F]/20 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#2B1E1A] shadow-sm font-bold border border-[#E07A5F]/30"
                      : item.alert
                      ? "text-[#D95D39] hover:text-[#C84B27] hover:bg-[#F2CC8F]/30"
                      : "text-[#2B1E1A]/70 hover:text-[#2B1E1A] hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D95D39]" : item.alert ? "text-[#D95D39]" : "text-[#2B1E1A]/50"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF6F0] text-xs font-bold text-[#2B1E1A] border border-[#E07A5F]/30 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-[#D95D39]" />
                <span>Start Fresh</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-1.5">
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="p-2 rounded-xl bg-white border border-[#E07A5F]/25 text-[#2B1E1A] text-xs font-semibold"
                title="Start Fresh"
              >
                <Plus className="w-4 h-4 text-[#D95D39]" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white border border-[#E07A5F]/25 text-[#2B1E1A]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6F0] border-b border-[#E07A5F]/20 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#D95D39]/10 text-[#D95D39] font-bold border border-[#D95D39]/30"
                    : item.alert
                    ? "bg-[#F2CC8F]/30 text-[#D95D39]"
                    : "text-[#2B1E1A]/80 hover:bg-white/80"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#2B1E1A]/40" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
