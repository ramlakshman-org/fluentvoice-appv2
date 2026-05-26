"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, User, Stethoscope, ArrowRight, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "therapist">("patient");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleContinue() {
    if (!name.trim()) {
      setError("Please enter your name to continue.");
      return;
    }
    setError("");
    localStorage.setItem("fv_user", JSON.stringify({ name: name.trim(), role }));
    if (role === "patient") router.push("/patient");
    else router.push("/therapist");
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-10"
        style={{
          background: "var(--color-navy)",
        }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-gold)" }}
            >
              <Mic className="w-4 h-4" style={{ color: "var(--color-navy)" }} />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">FluentVoice</div>
              <div
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--color-gold)" }}
              >
                Speech Analytics
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-black text-white leading-tight tracking-tight mb-4">
            Clinical-grade fluency analysis.
            <br />
            <span style={{ color: "var(--color-gold)" }}>For everyone.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Whether you&apos;re a patient tracking your own progress or a therapist managing
            multiple patients, FluentVoice gives you the data that matters.
          </p>
        </div>

        {/* Stat cards */}
        <div className="space-y-3">
          {[
            { val: "74", label: "Avg fluency score improvement after 8 weeks", unit: "pts" },
            { val: "6", label: "Disfluency types precisely identified", unit: "types" },
            { val: "<30s", label: "Full analysis turnaround time", unit: "" },
          ].map((s) => (
            <div
              key={s.val}
              className="flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="text-2xl font-black text-white w-14 shrink-0">
                {s.val}
                <span className="text-sm font-bold text-white/40 ml-0.5">{s.unit}</span>
              </div>
              <div className="text-white/50 text-xs leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[var(--color-navy)] transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}>Welcome back.</h1>
          <p className="text-[#64748B] text-sm mb-8">Tell us who you are to get started.</p>

          {/* Role toggle */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B] mb-3">
              I am a
            </label>
            <div
              className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl"
              style={{ background: "#E8EDF5" }}
            >
              {(["patient", "therapist"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="relative flex flex-col items-center gap-1.5 py-4 rounded-xl text-sm font-bold transition-all"
                  style={
                    role === r
                      ? {
                          background: "white",
                          color: "var(--color-navy)",
                          boxShadow: "0 2px 12px rgba(27,43,94,0.12)",
                        }
                      : { color: "#9CA3AF" }
                  }
                >
                  {r === "patient" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Stethoscope className="w-5 h-5" />
                  )}
                  <span className="capitalize">{r}</span>
                  {role === r && (
                    <motion.div
                      layoutId="role-indicator"
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "var(--color-gold)" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="mb-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B] mb-2">
              Your full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              placeholder={role === "patient" ? "e.g. Arjun Kumar" : "e.g. Dr. Meera Iyer"}
              className="w-full px-4 py-3.5 rounded-xl text-sm font-medium text-[var(--color-navy)] outline-none transition-all"
              style={{
                background: "white",
                border: error ? "1.5px solid #EF4444" : "1.5px solid #DDE3F0",
                boxShadow: "0 2px 8px rgba(27,43,94,0.05)",
              }}
              onFocus={(e) => {
                if (!error) e.target.style.border = "1.5px solid var(--color-navy)";
                e.target.style.boxShadow = "0 0 0 3px rgba(27,43,94,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = error ? "1.5px solid #EF4444" : "1.5px solid #DDE3F0";
                e.target.style.boxShadow = "0 2px 8px rgba(27,43,94,0.05)";
              }}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-500 mt-1.5 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white mt-6 transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: "var(--color-navy)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            Continue to dashboard
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            No account required for now · Data stays in your session
          </p>
        </motion.div>
      </div>
    </div>
  );
}
