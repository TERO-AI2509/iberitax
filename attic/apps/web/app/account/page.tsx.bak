import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Providers from "./Providers";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Account</h1>
      <Providers email={session.user.email ?? null} />
    </main>
  );
}
