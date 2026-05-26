"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, ChevronRight, Check, ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    icon: User,
    title: "Profile",
    color: "#6366F1",
    fields: [
      { label: "Full Name", value: "Arjun Kumar", type: "text" },
      { label: "Email", value: "arjun.kumar@example.com", type: "email" },
      { label: "Phone", value: "+91 98765 43210", type: "tel" },
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    color: "#F59E0B",
    fields: [
      { label: "Session reminders", value: "On", type: "toggle" },
      { label: "Weekly progress report", value: "On", type: "toggle" },
      { label: "Therapist messages", value: "On", type: "toggle" },
    ],
  },
  {
    icon: Shield,
    title: "Privacy",
    color: "#10B981",
    fields: [
      { label: "Share data with therapist", value: "On", type: "toggle" },
      { label: "Allow anonymous analytics", value: "Off", type: "toggle" },
    ],
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Session reminders": true,
    "Weekly progress report": true,
    "Therapist messages": true,
    "Share data with therapist": true,
    "Allow anonymous analytics": false,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--color-bg)" }}>
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back nav */}
      <Link
        href="/patient"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[var(--color-navy)] transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-black tracking-tight"
          style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
        >
          Settings
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Manage your account preferences</p>
      </div>

      {SECTIONS.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.07 }}
          className="p-5 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${section.color}14` }}
            >
              <section.icon className="w-4 h-4" style={{ color: section.color }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>
              {section.title}
            </span>
          </div>

          <div className="space-y-3">
            {section.fields.map((field) =>
              field.type === "toggle" ? (
                <div key={field.label} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-sm text-[#374151]">{field.label}</span>
                  <button
                    onClick={() => setToggles((prev) => ({ ...prev, [field.label]: !prev[field.label] }))}
                    className="relative w-10 h-5.5 rounded-full transition-all duration-200 shrink-0"
                    style={{
                      background: toggles[field.label] ? "var(--color-navy)" : "#D1D5DB",
                      height: "22px",
                      width: "40px",
                    }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200"
                      style={{ transform: toggles[field.label] ? "translateX(18px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
              ) : (
                <div key={field.label} className="flex flex-col gap-1 py-2 border-b last:border-0"
                  style={{ borderColor: "var(--color-border)" }}>
                  <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    className="text-sm font-medium outline-none bg-transparent"
                    style={{ color: "var(--color-navy)" }}
                  />
                </div>
              )
            )}
          </div>
        </motion.div>
      ))}

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-5 rounded-2xl border"
        style={{ background: "white", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
            <Palette className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>Appearance</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-[#374151]">Theme</span>
          <div className="flex items-center gap-1 text-sm font-medium text-[#9CA3AF]">
            Light <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-1">Dark mode coming soon.</p>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: saved ? "#10B981" : "var(--color-navy)" }}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save changes"}
        </button>
      </div>
    </div>
    </div>
  );
}
