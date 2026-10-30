"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { IntakeForm } from "../components/IntakeForm";
import { ClarificationWizard } from "../components/ClarificationWizard";
import { GuidanceCard } from "../components/GuidanceCard";
import { EvidenceChecklist } from "../components/EvidenceChecklist";
import { DocumentPreview } from "../components/DocumentPreview";
import { CaseTracker } from "../components/CaseTracker";
import { api, IntakeAnalysisResponse, ResolutionGuidance, GeneratedDocument } from "../lib/api";
import { BookOpen, ExternalLink, RefreshCw, AlertCircle, Scale, Shield, CheckCircle, Zap } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"intake" | "emergency" | "tracker" | "sources">("intake");
  const [emergencyCodes, setEmergencyCodes] = useState<Record<string, any>>({});
  const [sources, setSources] = useState<any[]>([]);

  // Active Case State
  const [intakeResult, setIntakeResult] = useState<IntakeAnalysisResponse | null>(null);
  const [guidance, setGuidance] = useState<ResolutionGuidance | null>(null);
  const [countdownDays, setCountdownDays] = useState<number | undefined>(undefined);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseAccessToken, setCaseAccessToken] = useState<string | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getEmergencyCodes().then(setEmergencyCodes).catch(console.error);
    api.getSources().then(setSources).catch(console.error);
  }, []);

  // Handle Initial Intake
  const handleIntakeSubmit = async (rawText: string, category?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedDoc(null);
    try {
      const res = await api.analyzeIntake(rawText, category);
      setIntakeResult(res);
      setActiveCaseId(res.case_id);
      setCaseAccessToken(res.case_access_token);

      if (res.is_urgent_emergency) {
        setActiveTab("emergency");
      }

      if (res.case_status === "READY_FOR_COMPLAINT") {
        const details = await api.getCaseDetails(res.case_id, res.case_access_token);
        setGuidance(details.guidance);
        setCountdownDays(details.statutory_countdown_days);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not analyze complaint. Ensure the backend is reachable.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Clarification Answers
  const handleClarificationSubmit = async (answers: Record<string, string | number | boolean>) => {
    if (!activeCaseId || !caseAccessToken) {
      setErrorMsg("Missing active case session. Please resubmit your complaint.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.submitClarification(activeCaseId, caseAccessToken, answers);
      setIntakeResult(res);

      if (res.case_status === "READY_FOR_COMPLAINT" || res.case_status === "FILED_WITH_PROVIDER") {
        const details = await api.getCaseDetails(activeCaseId, caseAccessToken);
        setGuidance(details.guidance);
        setCountdownDays(details.statutory_countdown_days);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit clarification answers.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Document
  const handleGenerateDocument = async () => {
    if (!activeCaseId || !caseAccessToken) return;
    setIsGeneratingDoc(true);
    setErrorMsg(null);
    try {
      const doc = await api.generateDocument(activeCaseId, caseAccessToken);
      setGeneratedDoc(doc);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate document.";
      setErrorMsg(message);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // Update Ticket
  const handleUpdateTicket = async (ticket: string) => {
    if (!activeCaseId || !caseAccessToken) return;
    setIsLoading(true);
    try {
      await api.updateTicket(activeCaseId, caseAccessToken, ticket);
      const details = await api.getCaseDetails(activeCaseId, caseAccessToken);
      setGuidance(details.guidance);
      setCountdownDays(details.statutory_countdown_days);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update ticket reference.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIntakeResult(null);
    setGuidance(null);
    setGeneratedDoc(null);
    setActiveCaseId(null);
    setCaseAccessToken(null);
    setErrorMsg(null);
    setActiveTab("intake");
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20 font-sans selection:bg-blue-600 selection:text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between shadow-lg backdrop-blur-md">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold underline text-[11px] text-rose-300 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Features Bar (Shown on intake when no case is active) */}
        {activeTab === "intake" && !intakeResult && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center space-x-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">CBN • NCC • FCCPC</h4>
                <p className="text-[11px] text-slate-400">Verified official legal frameworks</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center space-x-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">0% Hallucinations</h4>
                <p className="text-[11px] text-slate-400">Verified factual grounding check</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center space-x-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant USSD Freeze</h4>
                <p className="text-[11px] text-slate-400">24/7 bank emergency kill-switches</p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency USSD View */}
        {activeTab === "emergency" && (
          <EmergencyBanner 
            detectedBankInfo={intakeResult?.emergency_instructions}
            emergencyCodes={emergencyCodes} 
          />
        )}

        {/* Regulators / Sources Tab */}
        {activeTab === "sources" && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl mb-6">
            <div className="flex items-center space-x-3 pb-5 border-b border-white/10">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Approved Regulatory Sources & Statutory Frameworks</h2>
                <p className="text-xs text-slate-400">Every dispute step generated by Resolve cites verified Nigerian official authorities.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {sources.map((s) => (
                <div key={s.id} className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                      {s.publisher}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-2.5 tracking-tight">{s.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{s.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">{s.statutory_basis}</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intake & Case Flow View */}
        {activeTab === "intake" && (
          <>
            {/* If urgent fraud was detected, show emergency banner right on top */}
            {intakeResult?.is_urgent_emergency && (
              <EmergencyBanner 
                detectedBankInfo={intakeResult?.emergency_instructions}
                emergencyCodes={emergencyCodes} 
              />
            )}

            {/* Case in Progress Header */}
            {intakeResult && (
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl px-5 py-3.5 mb-6 shadow-md">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Dispute Case</span>
                  <h3 className="text-xs font-bold text-white mt-0.5 flex items-center space-x-2">
                    <span>Category:</span>
                    <span className="text-blue-400 font-extrabold">{intakeResult.facts.category}</span>
                  </h3>
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start New Case</span>
                </button>
              </div>
            )}

            {/* Stage 1: Intake Form */}
            {!intakeResult && (
              <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />
            )}

            {/* Stage 2: Clarification Wizard (Evidence Gate) */}
            {intakeResult?.case_status === "NEEDS_CLARIFICATION" && intakeResult.clarifying_questions.length > 0 && (
              <ClarificationWizard
                questions={intakeResult.clarifying_questions}
                category={intakeResult.facts.category}
                onSubmitAnswers={handleClarificationSubmit}
                isLoading={isLoading}
              />
            )}

            {/* Stage 3: Resolution Guidance Timeline */}
            {guidance && (
              <GuidanceCard
                guidance={guidance}
                countdownDays={countdownDays}
                onGenerateDocument={handleGenerateDocument}
                isGeneratingDoc={isGeneratingDoc}
              />
            )}

            {/* Stage 4: Evidence Checklist */}
            {guidance && guidance.evidence_checklist.length > 0 && (
              <div className="mb-6">
                <EvidenceChecklist items={guidance.evidence_checklist} />
              </div>
            )}

            {/* Stage 5: Generated Grounded Document Preview */}
            {generatedDoc && (
              <DocumentPreview document={generatedDoc} />
            )}

            {/* Stage 6: Case Tracker & Regulatory Countdown */}
            {guidance && activeCaseId && (
              <CaseTracker
                existingTicketRef={intakeResult?.facts.existing_ticket_ref}
                countdownDays={countdownDays}
                onUpdateTicket={handleUpdateTicket}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
