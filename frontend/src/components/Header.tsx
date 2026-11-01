"use client";

import React, { useState } from "react";
import { 
  Scale, 
  BookOpen, 
  Plus, 
  Menu, 
  X, 
  HelpCircle, 
  MessageSquare, 
  Lock,
  ChevronRight
} from "lucide-react";

interface NavItem {
  id: "intake" | "emergency" | "tracker" | "sources" | "guide";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}

interface HeaderProps {
  activeTab: "intake" | "emergency" | "tracker" | "sources" | "guide";
  setActiveTab: (tab: "intake" | "emergency" | "tracker" | "sources" | "guide") => void;
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
    { id: "intake", label: "Chat Assistant", icon: MessageSquare },
    { id: "emergency", label: "Bank Freeze Codes", icon: Lock, alert: true },
    { id: "guide", label: "How Redress Works", icon: HelpCircle },
    { id: "sources", label: "Official Regulators", icon: BookOpen },
  ];

  const handleNavClick = (tab: "intake" | "emergency" | "tracker" | "sources" | "guide") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity */}
          <div 
            onClick={() => handleNavClick("intake")}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
              <Scale className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  RESOLVE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Nigeria
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Consumer Transaction Redress Assistant
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : item.alert
                      ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : item.alert ? "text-rose-600" : "text-slate-400"}`} />
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
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>Start Over</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-1.5">
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="p-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                title="Start Over"
              >
                <Plus className="w-4 h-4 text-slate-700" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : item.alert
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
