import { Sidebar } from "@/components/sidebar";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar role="patient" userName="Arjun Kumar" />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
