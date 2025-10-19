import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-10">
      <h1 className="text-3xl font-bold">TERO Fiscal – Structure Preview</h1>
      <p className="text-muted-foreground">Temporary dev menu (no auth yet)</p>
      <nav className="flex flex-col gap-4">
        <Link href="/client" className="px-6 py-3 border rounded-lg hover:bg-muted">Client Portal</Link>
        <Link href="/lawyer" className="px-6 py-3 border rounded-lg hover:bg-muted">Lawyer Console</Link>
        <Link href="/ops" className="px-6 py-3 border rounded-lg hover:bg-muted">Ops Dashboard</Link>
      </nav>
    </main>
  );
}
