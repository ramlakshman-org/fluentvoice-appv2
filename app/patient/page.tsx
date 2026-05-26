"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, Upload, TrendingUp, TrendingDown, Calendar, ArrowRight, Play, Sparkles } from "lucide-react";
import { FluencyGauge } from "@/components/fluency-gauge";
import { MOCK_SESSIONS, MOCK_PATIENT_TREND, MOCK_DISF_BREAKDOWN } from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Constants ─────────────────────────────────────────────────────────────────
const DISF_COLORS: Record<string, string> = {
  block: "#EF4444", word_rep: "#F59E0B", sound_rep: "#F97316",
  prolongation: "#8B5CF6", interjection: "#9CA3AF", pause: "#6366F1",
  // model variants / fallbacks
  repetition: "#F59E0B", filler: "#9CA3AF", revision: "#6366F1",
  false_start: "#EC4899", phrase_rep: "#F97316", unknown: "#D1D5DB",
};
const DISF_LABELS: Record<string, string> = {
  block: "Block", word_rep: "Word Rep", sound_rep: "Sound Rep",
  prolongation: "Prolongation", interjection: "Interjection", pause: "Pause",
  // model variants / fallbacks
  repetition: "Repetition", filler: "Filler", revision: "Revision",
  false_start: "False Start", phrase_rep: "Phrase Rep", unknown: "Other",
};

const MOCK_PATIENT_SESSIONS = MOCK_SESSIONS.filter((s) => s.patientId === "p1");
const MOCK_LATEST = MOCK_PATIENT_SESSIONS[0];

function sevColor(s: string) {
  return s === "mild" ? "#10B981" : s === "moderate" ? "#F59E0B" : "#EF4444";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const [realSessions, setRealSessions] = useState<StoredSession[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fv_sessions");
      if (raw) setRealSessions(JSON.parse(raw));
    } catch { /* ignore parse errors */ }
    setHydrated(true);
  }, []);

  const hasReal = realSessions.length > 0;

  // ── Latest session ──────────────────────────────────────────────────────────
  const latestScore    = hasReal ? realSessions[0].report.fluency_score : MOCK_LATEST.fluencyScore;
  const latestDate     = hasReal ? realSessions[0].date                  : MOCK_LATEST.date;
  const latestSev      = hasReal ? realSessions[0].report.severity        : MOCK_LATEST.severity;
  const latestDisf     = hasReal ? realSessions[0].report.disfluencies    : MOCK_LATEST.disfluencies;

  // ── Trend chart (oldest→newest, max 7 points) ───────────────────────────────
  const trendData = useMemo(() => {
    if (realSessions.length >= 2) {
      return [...realSessions]
        .reverse()
        .slice(-7)
        .map((s, i) => ({ week: `S${i + 1}`, fluency: s.report.fluency_score }));
    }
    return MOCK_PATIENT_TREND;
  }, [realSessions]);

  const trendDelta = useMemo(() => {
    if (realSessions.length >= 2) {
      const oldest = [...realSessions].reverse()[0].report.fluency_score;
      return realSessions[0].report.fluency_score - oldest;
    }
    return 26; // mock fallback
  }, [realSessions]);

  const trendLabel = hasReal && realSessions.length >= 2
    ? `Last ${Math.min(realSessions.length, 7)} sessions`
    : "Sample data";

  // ── Disfluency breakdown ────────────────────────────────────────────────────
  const disfBreakdown = useMemo(() => {
    if (!hasReal) return MOCK_DISF_BREAKDOWN;
    const counts: Record<string, number> = {};
    realSessions.forEach((s) =>
      s.report.disfluencies.forEach((ev) => {
        const t = ev.event ?? "unknown";
        counts[t] = (counts[t] ?? 0) + 1;
      })
    );
    return Object.entries(counts)
      .filter(([, n]) => n > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type: DISF_LABELS[type] ?? type,
        count,
        color: DISF_COLORS[type] ?? "#9CA3AF",
      }));
  }, [realSessions, hasReal]);

  // ── Recent sessions list (real first, mock fill to 3) ──────────────────────
  const recentSessions = useMemo(() => {
    const real = realSessions.slice(0, 3).map((s) => ({
      id: String(s.id),
      date: s.date,
      fluencyScore: s.report.fluency_score,
      severity: s.report.severity,
      speechRate: s.report.speech_rate,
      disfCount: s.report.disfluencies.length,
    }));
    if (real.length >= 3) return real;
    const fill = MOCK_PATIENT_SESSIONS.slice(0, 3 - real.length).map((s) => ({
      id: s.id,
      date: s.date,
      fluencyScore: s.fluencyScore,
      severity: s.severity,
      speechRate: s.speechRate,
      disfCount: s.disfluencies.length,
    }));
    return [...real, ...fill];
  }, [realSessions]);

  const totalCount = realSessions.length + MOCK_PATIENT_SESSIONS.length;

  // ── Header subtitle ─────────────────────────────────────────────────────────
  const headerSub = hasReal
    ? `You have ${realSessions.length} recorded session${realSessions.length > 1 ? "s" : ""}. Keep recording to track your progress.`
    : "Record your first sample to see your personalised fluency analysis.";

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Live data banner ── */}
      {hydrated && hasReal && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669" }}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          Showing your personalised analysis from {realSessions.length} recording{realSessions.length > 1 ? "s" : ""}.
        </motion.div>
      )}
      {hydrated && !hasReal && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "var(--color-gold-dim)", border: "1px solid rgba(201,169,97,0.25)", color: "#92680a" }}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          Showing sample data — record your voice to see your personalised analysis.
        </motion.div>
      )}

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8"
        style={{ background: "var(--color-navy)", boxShadow: "var(--shadow-lg)" }}
      >
        <div>
          <p className="text-white/50 text-sm font-medium mb-1">Good morning,</p>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}>
            Arjun Kumar 👋
          </h1>
          <p className="text-white/60 text-sm">{headerSub}</p>
          <div className="flex gap-3 mt-6">
            <Link href="/patient/record"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "var(--color-gold)", color: "var(--color-navy)" }}>
              <Mic className="w-4 h-4" />
              Record now
            </Link>
            <Link href="/patient/sessions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
              View all sessions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Mic,      label: "Record Voice",  sub: "Starts recording session", href: "/patient/record",    color: "#1B2B5E", grad: "135deg, #1B2B5E, #2D44A0" },
          { icon: Upload,   label: "Upload Audio",  sub: "WAV, MP3, or M4A file",   href: "/patient/record",    color: "#6366F1", grad: "135deg, #6366F1, #818CF8" },
          { icon: Calendar, label: "Treatment Plan", sub: "View exercises & goals",  href: "/patient/treatment", color: "#C9A961", grad: "135deg, #C9A961, #E8C96A" },
        ].map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(27,43,94,0.15)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link href={item.href}
              className="flex flex-col gap-3 p-5 rounded-2xl border transition-all"
              style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "0 2px 10px rgba(27,43,94,0.06)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(${item.grad})` }}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-[var(--color-navy)] text-sm">{item.label}</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">{item.sub}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Gauge + Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">

        {/* Gauge — real or mock score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center justify-center p-6 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "0 2px 10px rgba(27,43,94,0.06)" }}
        >
          <FluencyGauge score={latestScore} size={160} />
          <div className="mt-4 text-center">
            <div className="text-xs text-[#9CA3AF] font-medium">Last session</div>
            <div className="text-xs font-semibold text-[var(--color-navy)] mt-0.5">{latestDate}</div>
            <div className="text-xs font-bold capitalize mt-1" style={{ color: sevColor(latestSev) }}>{latestSev}</div>
          </div>
        </motion.div>

        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "0 2px 10px rgba(27,43,94,0.06)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[var(--color-navy)] text-sm">Fluency Trend</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{trendLabel}</p>
            </div>
            {realSessions.length >= 2 ? (
              <div className={`flex items-center gap-1.5 text-xs font-bold ${trendDelta >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                {trendDelta >= 0
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />}
                {trendDelta >= 0 ? "+" : ""}{trendDelta} pts
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                <TrendingUp className="w-3.5 h-3.5" />
                +26 pts
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="fluencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B2B5E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B2B5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #DDE3F0", borderRadius: 10, fontSize: 12 }}
                formatter={(v) => v != null ? [`${v}`, "Fluency Score"] : ["–", "Fluency Score"]}
              />
              <Area type="monotone" dataKey="fluency" stroke="#1B2B5E" strokeWidth={2.5}
                fill="url(#fluencyGrad)" dot={{ fill: "#1B2B5E", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Disfluency breakdown + Recent sessions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Breakdown — real aggregated or mock */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "0 2px 10px rgba(27,43,94,0.06)" }}
        >
          <h3 className="font-bold text-[var(--color-navy)] text-sm mb-1">Disfluency Breakdown</h3>
          <p className="text-xs text-[#9CA3AF] mb-5">
            {hasReal ? `Across ${realSessions.length} session${realSessions.length > 1 ? "s" : ""}` : "Sample data"}
          </p>
          {disfBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-sm text-[#9CA3AF]">
              No disfluency events detected yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={disfBreakdown} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #DDE3F0", borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {disfBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "0 2px 10px rgba(27,43,94,0.06)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[var(--color-navy)] text-sm">Recent Sessions</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{totalCount} sessions</p>
            </div>
            <Link href="/patient/sessions"
              className="text-xs font-bold text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentSessions.map((s) => {
              const sc = sevColor(s.severity);
              return (
                <Link key={s.id} href="/patient/sessions">
                  <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[#F0F4FF] cursor-pointer">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${sc}14` }}>
                      <Play className="w-4 h-4" style={{ color: sc }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--color-navy)] truncate">{s.date}</div>
                      <div className="text-xs text-[#9CA3AF]">
                        {s.disfCount} events
                        {s.speechRate > 0 && s.speechRate < 300 && ` · ${Math.round(s.speechRate)} wpm`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black tabnum" style={{ color: "var(--color-navy)" }}>{s.fluencyScore}</div>
                      <div className="text-[10px] font-bold capitalize" style={{ color: sc }}>{s.severity}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Latest disfluency timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-6 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "0 2px 10px rgba(27,43,94,0.06)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[var(--color-navy)] text-sm">Latest Session — Disfluency Timeline</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{latestDate}</p>
          </div>
        </div>
        {latestDisf.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">No disfluency events detected in this session. 🎉</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {latestDisf.map((ev, i) => {
              const evType = ev.event ?? "unknown";
              const color = DISF_COLORS[evType] ?? "#9CA3AF";
              const label = DISF_LABELS[evType] ?? evType.replace("_", " ");
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: `${color}16`, color, border: `1px solid ${color}30` }}
                >
                  <span>{label}</span>
                  {ev.word && <span className="opacity-60">&quot;{ev.word}&quot;</span>}
                  <span className="opacity-50">@{ev.time ?? "–"}</span>
                  {ev.duration && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: `${color}20` }}>
                      {ev.duration}s
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
