import "../globals.css";
import AppShell from "@/components/app/AppShell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppShell area="client">{children}</AppShell>;
}
