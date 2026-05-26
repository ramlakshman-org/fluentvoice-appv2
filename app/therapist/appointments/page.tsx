"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, X, Clock, User } from "lucide-react";
import { MOCK_PATIENTS } from "@/lib/mock-data";

const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#1B2B5E", "#10B981", "#F59E0B"];

type ApptStatus = "pending" | "confirmed" | "cancelled";

export default function AppointmentsPage() {
  const [statuses, setStatuses] = useState<Record<string, ApptStatus>>(
    Object.fromEntries(MOCK_PATIENTS.map((p) => [p.id, "pending"]))
  );

  function setStatus(id: string, status: ApptStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }

  const confirmed = MOCK_PATIENTS.filter((p) => statuses[p.id] === "confirmed").length;
  const pending = MOCK_PATIENTS.filter((p) => statuses[p.id] === "pending").length;
  const cancelled = MOCK_PATIENTS.filter((p) => statuses[p.id] === "cancelled").length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-black tracking-tight"
          style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
        >
          Appointments
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Upcoming sessions with your patients</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", val: pending, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
          { label: "Confirmed", val: confirmed, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
          { label: "Cancelled", val: cancelled, color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl border text-center"
            style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="text-2xl font-black tabnum" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[#9CA3AF] font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Appointment list */}
      <div className="space-y-3">
        {MOCK_PATIENTS.map((patient, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const initials = patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
          const [date, time] = patient.nextAppointment.split(" ");
          const status = statuses[patient.id];

          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl border transition-all"
              style={{
                background: "white",
                borderColor:
                  status === "confirmed"
                    ? "rgba(16,185,129,0.3)"
                    : status === "cancelled"
                    ? "rgba(239,68,68,0.2)"
                    : "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                  style={{ background: color }}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>
                    {patient.name}
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-2">
                    <User className="w-3 h-3" /> {patient.condition}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-medium" style={{ color: "var(--color-navy)" }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#9CA3AF]" /> {date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#9CA3AF]" /> {time}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setStatus(patient.id, "cancelled")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => setStatus(patient.id, "confirmed")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors hover:opacity-90"
                      style={{ background: "var(--color-navy)" }}
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm
                    </button>
                  </div>
                )}

                {status !== "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold capitalize"
                      style={{
                        background: status === "confirmed" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                        color: status === "confirmed" ? "#10B981" : "#EF4444",
                      }}
                    >
                      {status === "confirmed" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {status}
                    </span>
                    <button
                      onClick={() => setStatus(patient.id, "pending")}
                      className="text-[10px] font-medium text-[#9CA3AF] hover:text-[var(--color-navy)] transition-colors"
                    >
                      Undo
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
