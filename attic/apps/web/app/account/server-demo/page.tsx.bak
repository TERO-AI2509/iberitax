import { serverFetch } from "@/lib/server/fetch";

export default async function ServerDemo() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const who = await serverFetch<{ sub: string; email: string }>(base + "/api/private/whoami", { cache: "no-store" });
  if (who?.error) {
    return (
      <div>
        <h1>Session expired, please log in again.</h1>
        <p>{who.error.code}</p>
      </div>
    );
  }
  return (
    <div>
      <h1>Account</h1>
      <p>{who?.data?.email}</p>
    </div>
  );
}
