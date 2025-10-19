import "../globals.css";
import AppShell from "@/components/app/AppShell";

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell area="lawyer">{children}</AppShell>;
}
