"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, TrendingUp, Play, Save, Target, Dumbbell, FileText } from "lucide-react";
import { FluencyGauge } from "@/components/fluency-gauge";
import { MOCK_PATIENTS, MOCK_SESSIONS, MOCK_PATIENT_TREND } from "@/lib/mock-data";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const DISF_COLORS: Record<string, string> = {
  block: "#EF4444", word_rep: "#F59E0B", sound_rep: "#F97316",
  prolongation: "#8B5CF6", interjection: "#9CA3AF", pause: "#6366F1",
};

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = MOCK_PATIENTS.find((p) => p.id === id) ?? MOCK_PATIENTS[0];
  const sessions = MOCK_SESSIONS.filter((s) => s.patientId === patient.id);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = sessions[selectedIdx];

  const [goals, setGoals] = useState(patient.treatmentGoals.join("\n"));
  const [exercises, setExercises] = useState(patient.practiceExercises.join("\n"));
  const [remarks, setRemarks] = useState(patient.treatmentRemarks);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/therapist" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[var(--color-navy)] transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      {/* Patient header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 p-6 rounded-2xl border"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
          style={{ background: "var(--color-navy)" }}
        >
          {patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>{patient.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[#9CA3AF]">
            <span>{patient.age} years old</span>
            <span>·</span>
            <span>{patient.condition}</span>
            <span>·</span>
            <span>Joined {patient.joinedDate}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-black tabnum" style={{ color: "var(--color-navy)" }}>{patient.avgFluency}</div>
          <div className="text-xs text-[#9CA3AF] font-medium">Avg fluency score</div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#10B981] mt-1 justify-end">
            <TrendingUp className="w-3.5 h-3.5" />
            Improving
          </div>
        </div>
      </motion.div>

      {/* Trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl border"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[var(--color-navy)] text-sm">Fluency Over Time</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Weekly sessions</p>
          </div>
          <div className="text-xs font-bold text-[#10B981] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +26 pts over 7 weeks
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={MOCK_PATIENT_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B2B5E" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#1B2B5E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis domain={[30, 80]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "white", border: "1px solid #DDE3F0", borderRadius: 10, fontSize: 12 }}
              formatter={(v) => v != null ? [`${v}`, "Fluency"] : ["–", "Fluency"]}
            />
            <Area type="monotone" dataKey="fluency" stroke="#1B2B5E" strokeWidth={2.5} fill="url(#grad2)" dot={{ fill: "#1B2B5E", r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Sessions + report */}
      <div className="grid grid-cols-[240px_1fr] gap-4">
        {/* Session list */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-2xl border"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
            {sessions.length} Sessions
          </div>
          <div className="space-y-1.5">
            {sessions.map((s, i) => {
              const isSelected = i === selectedIdx;
              const sevColor = s.severity === "mild" ? "#10B981" : s.severity === "moderate" ? "#F59E0B" : "#EF4444";
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedIdx(i)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all"
                  style={isSelected
                    ? { background: "linear-gradient(135deg, #1B2B5E, #2D44A0)", color: "white" }
                    : { color: "#374151" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isSelected ? "rgba(255,255,255,0.15)" : `${sevColor}14` }}
                  >
                    <Play className="w-3.5 h-3.5" style={{ color: isSelected ? "white" : sevColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate" style={{ color: isSelected ? "white" : "var(--color-navy)" }}>
                      {s.date.split(" ")[0]}
                    </div>
                    <div className="text-[10px]" style={{ color: isSelected ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>
                      Score: {s.fluencyScore}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Session detail */}
        <motion.div
          key={selectedIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Gauge + metrics */}
          {selected && (
            <>
              <div
                className="grid grid-cols-[auto_1fr] gap-4 p-5 rounded-2xl border"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center justify-center px-4">
                  <FluencyGauge score={selected.fluencyScore} size={140} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Speech Rate", val: selected.speechRate > 300 ? "N/A" : `${selected.speechRate}`, unit: "wpm", color: "#6366F1" },
                    { label: "Disfluencies", val: selected.disfluencies.length, unit: "events", color: "#F59E0B" },
                    { label: "Pauses", val: selected.pauses, unit: "total", color: "#EC4899" },
                    { label: "Severity", val: selected.severity, unit: "", color: selected.severity === "mild" ? "#10B981" : selected.severity === "moderate" ? "#F59E0B" : "#EF4444" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="p-3 rounded-xl border text-center"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="text-xl font-black capitalize" style={{ color: m.color }}>{m.val}</div>
                      <div className="text-[10px] text-[#9CA3AF] font-medium">{m.unit}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1.5 pt-1.5 border-t border-[#F3F4F6]">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transcript */}
              <div
                className="p-5 rounded-2xl border"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Transcript</div>
                <p className="text-sm text-[#374151] leading-relaxed">{selected.transcript}</p>
              </div>

              {/* Disfluency events */}
              <div
                className="p-5 rounded-2xl border"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  Disfluency Events
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.disfluencies.map((ev, i) => {
                    const color = DISF_COLORS[ev.event] ?? "#9CA3AF";
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}
                      >
                        <span className="capitalize">{ev.event.replace("_", " ")}</span>
                        {ev.word && <span className="opacity-60">&quot;{ev.word}&quot;</span>}
                        <span className="opacity-50">@{ev.time}</span>
                        {ev.duration && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${color}20` }}>
                            {ev.duration}s
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Treatment plan editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl border"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[var(--color-navy)] text-sm">Treatment Plan</h3>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: saved ? "var(--color-green)" : "var(--color-gold)",
              color: saved ? "white" : "var(--color-navy)",
            }}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save changes"}
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: Target, label: "Goals", val: goals, set: setGoals, placeholder: "One goal per line...", color: "#6366F1" },
            { icon: Dumbbell, label: "Practice Exercises", val: exercises, set: setExercises, placeholder: "One exercise per line...", color: "#10B981" },
            { icon: FileText, label: "Treatment Remarks", val: remarks, set: setRemarks, placeholder: "Clinical notes...", color: "var(--color-gold)" },
          ].map((field) => (
            <div key={field.label}>
              <div className="flex items-center gap-2 mb-2">
                <field.icon className="w-4 h-4" style={{ color: field.color }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
                  {field.label}
                </span>
              </div>
              <textarea
                value={field.val}
                onChange={(e) => field.set(e.target.value)}
                rows={6}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-[#374151] resize-none outline-none transition-all"
                style={{
                  border: "1.5px solid #DDE3F0",
                  background: "#FAFBFF",
                  lineHeight: 1.7,
                }}
                onFocus={(e) => {
                  e.target.style.border = `1.5px solid ${field.color}`;
                  e.target.style.boxShadow = `0 0 0 3px ${field.color}18`;
                }}
                onBlur={(e) => {
                  e.target.style.border = "1.5px solid #DDE3F0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
