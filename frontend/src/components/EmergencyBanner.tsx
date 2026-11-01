"use client";

import React, { useState } from "react";
import { ShieldAlert, Phone, Lock, ChevronRight } from "lucide-react";

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
    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm mb-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-rose-600 rounded-xl text-white shadow-md shadow-rose-600/20 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Emergency Bank Account Freeze Codes</h2>
            <span className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              24/7 Kill-Switches
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            If your phone was stolen or unauthorized debits are occurring, dial your bank's USSD freeze code from <strong>ANY</strong> phone immediately to lock your accounts before visiting a branch.
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
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-sm font-bold"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {b.name.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Action card for selected bank */}
          {activeBank && (
            <div className="mt-4 bg-white border border-rose-200/80 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">{activeBank.name}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{activeBank.action_prompt}</p>

              <div className="mt-3.5 flex flex-wrap gap-2.5 items-center">
                <a
                  href={`tel:${encodeURIComponent(activeBank.ussd_freeze_code)}`}
                  className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Dial USSD Freeze: {activeBank.ussd_freeze_code}</span>
                </a>

                {activeBank.fraud_desk_phone && (
                  <a
                    href={`tel:${activeBank.fraud_desk_phone.split("/")[0].trim()}`}
                    className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border border-slate-200"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>24/7 Hotline: {activeBank.fraud_desk_phone.split("/")[0].trim()}</span>
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
