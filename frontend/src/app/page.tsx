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
import { Shield, BookOpen, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

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
    // Load emergency codes and sources on mount
    api.getEmergencyCodes().then(setEmergencyCodes).catch(console.error);
    api.getSources().then(setSources).catch(console.error);
  }, []);

  // Handle Initial Intake Submission
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

      // If already complete, fetch resolution guidance
      // (In SQLite local session, case ID is returned or persisted)
      // For immediate preview, we can derive or request details
      if (res.case_status === "READY_FOR_COMPLAINT") {
        const details = await api.getCaseDetails(res.case_id, res.case_access_token);
        setGuidance(details.guidance);
        setCountdownDays(details.statutory_countdown_days);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not analyze complaint. Ensure the backend is reachable.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Clarification Answers
  const handleClarificationSubmit = async (answers: Record<string, any>) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (!activeCaseId || !caseAccessToken) throw new Error("Your private case session is missing. Please start a new case.");

      const res = await api.submitClarification(activeCaseId, caseAccessToken, answers);
      setIntakeResult(res);

      if (res.case_status === "READY_FOR_COMPLAINT") {
        const details = await api.getCaseDetails(activeCaseId, caseAccessToken);
        setGuidance(details.guidance);
        setCountdownDays(details.statutory_countdown_days);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit clarification.");
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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate document.");
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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update ticket.");
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold underline text-[11px]">
              Dismiss
            </button>
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Approved Regulatory Sources & Statutory Frameworks</h2>
                <p className="text-xs text-slate-500">Every guidance step generated by Resolve is backed by verified Nigerian official sources.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              {sources.map((s) => (
                <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                      {s.publisher}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-2">{s.title}</h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{s.summary}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">{s.statutory_basis}</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-2.5 h-2.5" />
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
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-5 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Case</span>
                  <h3 className="text-xs font-bold text-slate-900">
                    Category: <span className="text-emerald-700">{intakeResult.facts.category}</span>
                  </h3>
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
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
                caseId={activeCaseId}
                providerContacted={intakeResult?.facts.provider_contacted}
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
