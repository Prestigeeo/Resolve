import React, { useState } from "react";
import { ShieldAlert, Phone, Lock, ChevronRight, AlertOctagon } from "lucide-react";

interface EmergencyBannerProps {
  detectedBankInfo?: {
    name: string;
    ussd_freeze_code: string;
    fraud_desk_phone: string;
    action_prompt: string;
  };
  emergencyCodes: Record<string, any>;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ detectedBankInfo, emergencyCodes }) => {
  const [selectedBank, setSelectedBank] = useState<string>("GTBANK");
  const bankKeys = Object.keys(emergencyCodes);

  const activeBank = detectedBankInfo || emergencyCodes[selectedBank] || emergencyCodes["GTBANK"];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 p-5 sm:p-6 shadow-xl mb-6 backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start space-x-4">
        <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl text-white shadow-lg shadow-rose-600/30 shrink-0 border border-rose-400/30">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">Active Emergency Account Lock & Fraud Freeze</h2>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              24/7 Direct Kill-Switches
            </span>
          </div>
          <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
            If your phone was snatched, SIM compromised, or funds are actively being withdrawn, dial your bank's emergency USSD code from <strong>ANY</strong> phone immediately to freeze your account before visiting a branch.
          </p>

          {/* Bank Selector Chips */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {bankKeys.map((key) => {
              const b = emergencyCodes[key];
              const isSelected = selectedBank === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedBank(key)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-400/40 font-bold"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/5"
                  }`}
                >
                  {b.name.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Action card for selected bank */}
          {activeBank && (
            <div className="mt-4 bg-slate-900/80 border border-rose-500/20 rounded-2xl p-4 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <span>{activeBank.name}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">{activeBank.action_prompt}</p>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2.5 items-center">
                <a
                  href={`tel:${encodeURIComponent(activeBank.ussd_freeze_code)}`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30 border border-rose-400/30"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Dial USSD Freeze: {activeBank.ussd_freeze_code}</span>
                </a>

                {activeBank.fraud_desk_phone && (
                  <a
                    href={`tel:${activeBank.fraud_desk_phone.split("/")[0].trim()}`}
                    className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border border-white/10"
                  >
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    <span>24/7 Fraud Hotline: {activeBank.fraud_desk_phone.split("/")[0].trim()}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
