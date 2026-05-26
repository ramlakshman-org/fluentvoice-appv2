"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Dumbbell, FileText, CheckCircle2 } from "lucide-react";

const DEFAULT_GOALS = [
  "Reduce block frequency to < 3 per minute",
  "Maintain 120–140 wpm comfortable speech rate",
  "Use diaphragmatic breathing before long utterances",
];

const DEFAULT_EXERCISES = [
  "Prolongation drills — 5 minutes daily",
  "Slow speech rate practice (90 wpm) — 10 min",
  "Easy onset technique on vowel-initial words",
  "Reading aloud with recorded playback",
  "Mirror practice for eye contact confidence",
];

const DEFAULT_REMARKS =
  "Patient is showing consistent improvement over the last 3 sessions. Focus on maintaining gains during conversational speech. Recommend increasing practice to 3x per week.";

const STORAGE_KEY = "fv_treatment_checked";

export default function TreatmentPage() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [therapistName, setTherapistName] = useState("Dr. Meera Iyer");

  // Load persisted state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
      // If patient has a linked therapist name stored, use it
      const user = localStorage.getItem("fv_user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed?.therapistName) setTherapistName(parsed.therapistName);
      }
    } catch { /* ignore */ }
  }, []);

  function toggle(i: number) {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  const total = DEFAULT_GOALS.length + DEFAULT_EXERCISES.length;
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl"
        style={{ background: "var(--color-navy)", boxShadow: "var(--shadow-lg)" }}
      >
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Your treatment plan</p>
        <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Practice & Goals
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Updated by {therapistName} · Follow these exercises daily for best results.
        </p>
        {doneCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/50 font-medium">Today&apos;s progress</span>
              <span className="text-white/80 font-bold">{doneCount} / {total} done</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--color-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="p-5 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4" style={{ color: "#6366F1" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Goals</span>
        </div>
        <div className="space-y-2.5">
          {DEFAULT_GOALS.map((goal, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer"
              style={{
                background: checked[i] ? "rgba(16,185,129,0.06)" : "#FAFBFF",
                border: `1px solid ${checked[i] ? "rgba(16,185,129,0.2)" : "var(--color-border)"}`,
              }}
              onClick={() => toggle(i)}
            >
              <button
                className="mt-0.5 shrink-0"
                aria-label={checked[i] ? `Unmark goal: ${goal}` : `Mark goal as done: ${goal}`}
                onClick={(e) => { e.stopPropagation(); toggle(i); }}
              >
                {checked[i]
                  ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  : <div className="w-5 h-5 rounded-full border-2 border-[#DDE3F0]" />
                }
              </button>
              <p className={`text-sm font-medium leading-snug ${checked[i] ? "line-through text-[#9CA3AF]" : "text-[#374151]"}`}>
                {goal}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="p-5 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-4 h-4 text-[#10B981]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Daily Exercises</span>
        </div>
        <div className="space-y-2">
          {DEFAULT_EXERCISES.map((ex, i) => {
            const idx = i + DEFAULT_GOALS.length;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
                style={{
                  background: checked[idx] ? "rgba(16,185,129,0.06)" : "#FAFBFF",
                  border: `1px solid ${checked[idx] ? "rgba(16,185,129,0.2)" : "var(--color-border)"}`,
                }}
                onClick={() => toggle(idx)}
              >
                <button
                  className="shrink-0"
                  aria-label={checked[idx] ? `Unmark exercise: ${ex}` : `Mark exercise as done: ${ex}`}
                  onClick={(e) => { e.stopPropagation(); toggle(idx); }}
                >
                  {checked[idx]
                    ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    : <div className="w-5 h-5 rounded-full border-2 border-[#DDE3F0]" />
                  }
                </button>
                <p className={`text-sm font-medium ${checked[idx] ? "line-through text-[#9CA3AF]" : "text-[#374151]"}`}>
                  {ex}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress bar (only in exercises card on mobile where header progress is above fold) */}
        {doneCount > 0 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#9CA3AF] font-medium">Today&apos;s progress</span>
              <span className="font-bold" style={{ color: "var(--color-navy)" }}>
                {doneCount} / {total}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #1B2B5E, #C9A961)" }}
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Therapist remarks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4" style={{ color: "var(--color-gold)" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Therapist Notes</span>
        </div>
        <p className="text-sm text-[#374151] leading-relaxed">{DEFAULT_REMARKS}</p>
        <div className="mt-3 text-xs text-[#9CA3AF] font-medium">— {therapistName}, SLP</div>
      </motion.div>
    </div>
  );
}
