import "../globals.css";
import AppShell from "@/components/app/AppShell";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell area="ops">{children}</AppShell>;
}
