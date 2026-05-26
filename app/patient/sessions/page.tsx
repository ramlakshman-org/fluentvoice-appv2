"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, TrendingUp, Mic, ChevronRight, X } from "lucide-react";
import { FluencyGauge } from "@/components/fluency-gauge";
import { MOCK_SESSIONS } from "@/lib/mock-data";

interface StoredSession {
  id: number;
  date: string;
  report: {
    fluency_score: number;
    severity: "mild" | "moderate" | "severe";
    speech_rate: number;
    transcript: string;
    disfluencies: Array<{ event: string; word?: string; time: string; duration?: number }>;
    pauses: number | unknown[];
  };
}

const DISF_COLORS: Record<string, string> = {
  block: "#EF4444", word_rep: "#F59E0B", sound_rep: "#F97316",
  prolongation: "#8B5CF6", interjection: "#9CA3AF", pause: "#6366F1",
  repetition: "#F59E0B", filler: "#9CA3AF", revision: "#6366F1",
  false_start: "#EC4899", phrase_rep: "#F97316", unknown: "#D1D5DB",
};

function pauseCount(p: number | unknown[]): number {
  return Array.isArray(p) ? p.length : (p as number);
}

export default function SessionsPage() {
  const [realSessions, setRealSessions] = useState<StoredSession[]>([]);
  const [selected, setSelected] = useState<StoredSession | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("fv_sessions");
    if (raw) setRealSessions(JSON.parse(raw));
  }, []);

  // Merge real + mock (real first)
  const mockAsStored: StoredSession[] = MOCK_SESSIONS
    .filter((s) => s.patientId === "p1")
    .map((s) => ({
      id: parseInt(s.id.replace(/\D/g, ""), 10) || 0,
      date: s.date,
      report: {
        fluency_score: s.fluencyScore,
        severity: s.severity as "mild" | "moderate" | "severe",
        speech_rate: s.speechRate,
        transcript: s.transcript,
        disfluencies: s.disfluencies,
        pauses: s.pauses,
      },
    }));

  const allSessions = [...realSessions, ...mockAsStored];

  const sevColor = (s: string) =>
    s === "mild" ? "#10B981" : s === "moderate" ? "#F59E0B" : "#EF4444";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>
            My Sessions
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{allSessions.length} recordings total</p>
        </div>
        <a href="/patient/record"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--color-navy)" }}>
          <Mic className="w-4 h-4" />
          New recording
        </a>
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {allSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">🎙️</div>
            <p className="font-bold text-[var(--color-navy)]">No sessions yet</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Record your first sample to get started.</p>
          </div>
        )}
        {allSessions.map((sess, i) => {
          const sev = sess.report.severity;
          const color = sevColor(sev);
          return (
            <motion.div
              key={sess.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 3 }}
            >
              <button
                onClick={() => setSelected(sess)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:shadow-md"
                style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}14` }}>
                  <Play className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--color-navy)" }}>
                    {sess.date}
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">
                    {sess.report.disfluencies.length} disfluency events
                    {sess.report.speech_rate < 300 && ` · ${Math.round(sess.report.speech_rate)} wpm`}
                  </div>
                </div>
                <div className="text-right shrink-0 mr-2">
                  <div className="text-xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
                    {sess.report.fluency_score}
                  </div>
                  <div className="text-[10px] font-bold capitalize" style={{ color }}>
                    {sev}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Avg trend */}
      {allSessions.length > 1 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: "var(--color-navy-dim)" }}>
          <TrendingUp className="w-4 h-4 shrink-0" style={{ color: "var(--color-navy)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>
            Average fluency score:{" "}
            <strong>{Math.round(allSessions.reduce((s, r) => s + r.report.fluency_score, 0) / allSessions.length)}</strong>
            {" "}across {allSessions.length} sessions
          </p>
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(27,43,94,0.3)" }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg z-50 overflow-y-auto"
              style={{ background: "var(--color-bg)" }}
            >
              <div className="p-6 space-y-4">
                {/* Close */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-[#9CA3AF] font-medium">Session</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>{selected.date}</p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white"
                    style={{ border: "1.5px solid var(--color-border)" }}>
                    <X className="w-4 h-4 text-[#9CA3AF]" />
                  </button>
                </div>

                {/* Gauge + metrics */}
                <div className="p-5 rounded-2xl border"
                  style={{ background: "white", borderColor: "var(--color-border)" }}>
                  <div className="flex justify-center mb-4">
                    <FluencyGauge score={selected.report.fluency_score} size={130} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Speech Rate", val: selected.report.speech_rate > 300 ? "N/A" : `${Math.round(selected.report.speech_rate)}`, unit: "wpm", color: "#6366F1" },
                      { label: "Disfluencies", val: selected.report.disfluencies.length, unit: "events", color: "#F59E0B" },
                      { label: "Pauses", val: pauseCount(selected.report.pauses), unit: "total", color: "#EC4899" },
                      { label: "Severity", val: selected.report.severity, unit: "", color: sevColor(selected.report.severity) },
                    ].map((m) => (
                      <div key={m.label} className="p-3 rounded-xl border text-center"
                        style={{ borderColor: "var(--color-border)" }}>
                        <div className="text-lg font-black capitalize" style={{ color: m.color }}>{m.val}</div>
                        <div className="text-[10px] text-[#9CA3AF]">{m.unit}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1 pt-1 border-t border-[#F3F4F6]">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transcript */}
                {selected.report.transcript && (
                  <div className="p-4 rounded-2xl border"
                    style={{ background: "white", borderColor: "var(--color-border)" }}>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Transcript</div>
                    <p className="text-sm text-[#374151] leading-relaxed">{selected.report.transcript}</p>
                  </div>
                )}

                {/* Disfluencies */}
                {selected.report.disfluencies.length > 0 && (
                  <div className="p-4 rounded-2xl border"
                    style={{ background: "white", borderColor: "var(--color-border)" }}>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Disfluency Events</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.report.disfluencies.map((ev, i) => {
                        const evType = ev.event ?? "unknown";
                        const color = DISF_COLORS[evType] ?? "#9CA3AF";
                        return (
                          <div key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold"
                            style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}>
                            <span className="capitalize">{evType.replace("_", " ")}</span>
                            {ev.word && <span className="opacity-60">&quot;{ev.word}&quot;</span>}
                            <span className="opacity-50">@{ev.time ?? "–"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
