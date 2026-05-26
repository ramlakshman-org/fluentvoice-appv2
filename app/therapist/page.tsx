"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, TrendingDown, Minus, ArrowRight,
  Calendar, Check, X, Activity, Loader2,
} from "lucide-react";
import { MOCK_PATIENTS, MOCK_SESSIONS } from "@/lib/mock-data";

const TREND_ICON = {
  improving: TrendingUp,
  stable:    Minus,
  declining: TrendingDown,
};
const TREND_COLOR = {
  improving: "#10B981",
  stable:    "#F59E0B",
  declining: "#EF4444",
};

const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#1B2B5E", "#10B981", "#F59E0B"];

interface ApiPatient {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  sessionsCount: number;
  avgFluency: number;
  trend: "improving" | "stable" | "declining";
  lastSessionDate: string | null;
  condition: string | null;
  nextAppointment: string | null;
}

interface DisplayPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  sessionsCount: number;
  avgFluency: number;
  trend: "improving" | "stable" | "declining";
  nextAppointment: string;
}

function toDisplay(p: ApiPatient): DisplayPatient {
  return {
    id: p.id,
    name: p.name,
    age: 0,
    condition: p.condition ?? "Fluency disorder",
    sessionsCount: p.sessionsCount,
    avgFluency: p.avgFluency,
    trend: p.trend,
    nextAppointment: p.nextAppointment ?? "Not scheduled",
  };
}

export default function TherapistDashboard() {
  const [patients, setPatients] = useState<DisplayPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgFluency, setAvgFluency] = useState(0);
  const [apptStatus, setApptStatus] = useState<Record<string, "confirmed" | "cancelled" | null>>({});
  const [displayName, setDisplayName] = useState("Therapist");

  useEffect(() => {
    try {
      const user = localStorage.getItem("fv_user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed?.name) setDisplayName(parsed.name);
      }
    } catch { /* ignore */ }

    fetch("/api/therapist/patients")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.patients && data.patients.length > 0) {
          const real: DisplayPatient[] = (data.patients as ApiPatient[]).map(toDisplay);
          setPatients(real);
          setTotalSessions(real.reduce((s, p) => s + p.sessionsCount, 0));
          setAvgFluency(Math.round(real.reduce((s, p) => s + p.avgFluency, 0) / real.length));
          setUsingMock(false);
        } else {
          useMockFallback();
        }
      })
      .catch(() => useMockFallback())
      .finally(() => setLoading(false));
  }, []);

  function useMockFallback() {
    setPatients(
      MOCK_PATIENTS.map((p) => ({
        id: p.id, name: p.name, age: p.age,
        condition: p.condition, sessionsCount: p.sessionsCount,
        avgFluency: p.avgFluency, trend: p.trend,
        nextAppointment: p.nextAppointment,
      }))
    );
    setTotalSessions(MOCK_SESSIONS.length);
    setAvgFluency(Math.round(MOCK_PATIENTS.reduce((s, p) => s + p.avgFluency, 0) / MOCK_PATIENTS.length));
    setUsingMock(true);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 pt-1"
      >
        <div>
          <p className="text-xs font-medium text-[#9CA3AF] mb-0.5">Therapist Dashboard</p>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            {displayName}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9CA3AF]">
            <span>
              <strong className="font-bold" style={{ color: "var(--color-navy)" }}>
                {loading ? "…" : patients.length}
              </strong>{" "}active patients
            </span>
            <span>·</span>
            <span>
              <strong className="font-bold" style={{ color: "var(--color-navy)" }}>
                {loading ? "…" : totalSessions}
              </strong>{" "}sessions this month
            </span>
            {!loading && usingMock && (
              <span className="text-amber-500 font-medium">· Sample data</span>
            )}
          </div>
        </div>
        <Link
          href="/therapist/patients"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 mt-1"
          style={{ background: "var(--color-navy)", color: "white" }}
        >
          <Users className="w-4 h-4" aria-hidden="true" />
          All patients
        </Link>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,      val: patients.length, label: "Active Patients",       color: "var(--color-navy)", bg: "var(--color-navy-dim)" },
          { icon: Activity,   val: totalSessions,   label: "Sessions This Month",   color: "#6366F1",           bg: "rgba(99,102,241,0.08)" },
          { icon: TrendingUp, val: avgFluency,       label: "Avg Fluency Score",    color: "#10B981",           bg: "rgba(16,185,129,0.08)" },
          { icon: Calendar,   val: 3,                label: "Upcoming Appointments", color: "var(--color-gold)", bg: "var(--color-gold-dim)" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-5 rounded-2xl border"
            style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin opacity-40" /> : s.val}
            </div>
            <div className="text-xs text-[#9CA3AF] font-medium mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Patient roster */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-black text-[var(--color-navy)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Patient Roster
          </h2>
          <Link
            href="/therapist/patients"
            className="text-sm font-bold text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#9CA3AF]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading patients…
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const initials = patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
              const TrendIcon = TREND_ICON[patient.trend];
              const trendColor = TREND_COLOR[patient.trend];
              const sevScore = patient.avgFluency >= 70 ? "Good" : patient.avgFluency >= 40 ? "Fair" : "Low";
              const sevColor = patient.avgFluency >= 70 ? "#10B981" : patient.avgFluency >= 40 ? "#F59E0B" : "#EF4444";

              return (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ x: 3 }}
                >
                  <Link href={`/therapist/patients/${patient.id}`}>
                    <div
                      className="flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer"
                      style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                        style={{ background: color }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[var(--color-navy)] text-sm">{patient.name}</span>
                          {patient.age > 0 && (
                            <span className="text-xs text-[#9CA3AF]">· {patient.age} yrs</span>
                          )}
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${trendColor}14`, color: trendColor }}
                          >
                            {patient.condition}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9CA3AF]">
                          <span>{patient.sessionsCount} session{patient.sessionsCount !== 1 ? "s" : ""}</span>
                          <span>·</span>
                          <span>
                            {patient.nextAppointment === "Not scheduled"
                              ? "No appt scheduled"
                              : `Next appt: ${patient.nextAppointment.split(" ")[0]}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
                            {patient.avgFluency > 0 ? patient.avgFluency : "—"}
                          </div>
                          <div className="text-[10px] font-bold" style={{ color: sevColor }}>{sevScore}</div>
                        </div>
                        <div
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ background: `${trendColor}14`, color: trendColor }}
                        >
                          <TrendIcon className="w-3.5 h-3.5" />
                          {patient.trend}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9CA3AF]" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="font-bold text-[var(--color-navy)] text-sm mb-5">Upcoming Appointments</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF] py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((p, i) => {
              const apptDate = p.nextAppointment === "Not scheduled" ? null : p.nextAppointment;
              const [date, time] = apptDate ? apptDate.split(" ") : ["Not scheduled", ""];
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
              const status = apptStatus[p.id] ?? null;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded-xl transition-all"
                  style={{
                    background:
                      status === "confirmed" ? "rgba(16,185,129,0.05)"
                      : status === "cancelled" ? "rgba(239,68,68,0.05)"
                      : "transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[var(--color-navy)]">{p.name}</span>
                    <span className="text-xs text-[#9CA3AF] ml-2">{p.condition}</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-[var(--color-navy)]">{date}</div>
                    {time && <div className="text-[#9CA3AF]">{time}</div>}
                  </div>
                  {status === null ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApptStatus((prev) => ({ ...prev, [p.id]: "cancelled" }))}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors border border-red-100 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button
                        onClick={() => setApptStatus((prev) => ({ ...prev, [p.id]: "confirmed" }))}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-1"
                        style={{ background: "var(--color-navy)" }}
                      >
                        <Check className="w-3 h-3" /> Confirm
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-3 py-1.5 rounded-lg capitalize flex items-center gap-1"
                        style={{
                          background: status === "confirmed" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          color: status === "confirmed" ? "#10B981" : "#EF4444",
                        }}
                      >
                        {status === "confirmed" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {status}
                      </span>
                      <button
                        onClick={() => setApptStatus((prev) => ({ ...prev, [p.id]: null }))}
                        className="text-[10px] text-[#9CA3AF] hover:text-[var(--color-navy)] transition-colors"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
