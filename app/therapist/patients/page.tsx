"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, TrendingUp, TrendingDown, Minus, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { MOCK_PATIENTS } from "@/lib/mock-data";

const TREND_ICON = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};
const TREND_COLOR = {
  improving: "#10B981",
  stable: "#F59E0B",
  declining: "#EF4444",
};
const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#1B2B5E", "#10B981", "#F59E0B"];

export default function PatientsPage() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.condition.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
          >
            All Patients
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{MOCK_PATIENTS.length} active patients</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white"
          style={{ borderColor: "var(--color-border)" }}>
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search patients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-sm outline-none bg-transparent w-48"
            style={{ color: "var(--color-navy)" }}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, val: MOCK_PATIENTS.length, label: "Total Patients", color: "var(--color-navy)", bg: "var(--color-navy-dim)" },
          { icon: TrendingUp, val: MOCK_PATIENTS.filter((p) => p.trend === "improving").length, label: "Improving", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
          { icon: TrendingDown, val: MOCK_PATIENTS.filter((p) => p.trend === "declining").length, label: "Declining", color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl border flex items-center gap-4"
            style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-black tabnum" style={{ color: "var(--color-navy)" }}>{s.val}</div>
              <div className="text-xs text-[#9CA3AF] font-medium">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Patient list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#9CA3AF]">
            <p className="font-bold">No patients found</p>
            <p className="text-sm mt-1">Try a different search term.</p>
          </div>
        )}
        {filtered.map((patient, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const initials = patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
          const TrendIcon = TREND_ICON[patient.trend];
          const trendColor = TREND_COLOR[patient.trend];
          const sevColor = patient.avgFluency >= 70 ? "#10B981" : patient.avgFluency >= 40 ? "#F59E0B" : "#EF4444";
          const sevScore = patient.avgFluency >= 70 ? "Good" : patient.avgFluency >= 40 ? "Fair" : "Low";

          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ x: 3 }}
            >
              <Link href={`/therapist/patients/${patient.id}`}>
                <div
                  className="flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer"
                  style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--color-navy)] text-sm">{patient.name}</span>
                      <span className="text-xs text-[#9CA3AF]">· {patient.age} yrs</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${trendColor}14`, color: trendColor }}
                      >
                        {patient.condition}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9CA3AF]">
                      <span>{patient.sessionsCount} sessions</span>
                      <span>·</span>
                      <span>Joined {patient.joinedDate}</span>
                      <span>·</span>
                      <span>Next: {patient.nextAppointment.split(" ")[0]}</span>
                    </div>
                  </div>

                  {/* Fluency + trend */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-black tabnum" style={{ color: "var(--color-navy)" }}>
                        {patient.avgFluency}
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
    </div>
  );
}
