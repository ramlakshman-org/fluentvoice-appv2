import { Sidebar } from "@/components/sidebar";

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar role="therapist" userName="Dr. Meera Iyer" />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
