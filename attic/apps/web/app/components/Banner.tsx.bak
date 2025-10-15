"use client";
import { useSearchParams } from "next/navigation";
export default function Banner() {
  const params = useSearchParams();
  const reason = params.get("reason");
  if (reason !== "expired") return null;
  return (
    <div className="w-full bg-yellow-100 text-yellow-900 border border-yellow-200 rounded-xl p-3 mb-4">
      <div className="text-sm font-medium">Session expired, please log in again.</div>
    </div>
  );
}
