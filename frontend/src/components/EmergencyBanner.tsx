import React, { useState } from "react";
import { AlertTriangle, Phone, ShieldAlert, ChevronRight, Lock } from "lucide-react";

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
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex items-start space-x-3">
        <div className="p-2.5 bg-rose-600 rounded-xl text-white shadow-md shadow-rose-600/20 shrink-0">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-rose-950">Emergency Fraud & Account Freeze Directory</h2>
            <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
              INSTANT 24/7 CODES
            </span>
          </div>
          <p className="text-xs text-rose-800 mt-1">
            If your phone was stolen or your account is facing unauthorized withdrawals, dial your bank's emergency USSD code from <strong>ANY</strong> borrowed phone immediately.
          </p>

          {/* Bank selector */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {bankKeys.map((key) => {
              const b = emergencyCodes[key];
              const isSelected = selectedBank === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedBank(key)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-rose-100 border border-rose-200/60"
                  }`}
                >
                  {b.name.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Action card for selected/detected bank */}
          {activeBank && (
            <div className="mt-4 bg-white border border-rose-200 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeBank.name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{activeBank.action_prompt}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <a
                  href={`tel:${encodeURIComponent(activeBank.ussd_freeze_code)}`}
                  className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Dial USSD: {activeBank.ussd_freeze_code}</span>
                </a>

                {activeBank.fraud_desk_phone && (
                  <a
                    href={`tel:${activeBank.fraud_desk_phone.split("/")[0].trim()}`}
                    className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-semibold transition-all border border-slate-300"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Fraud Desk: {activeBank.fraud_desk_phone.split("/")[0].trim()}</span>
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
