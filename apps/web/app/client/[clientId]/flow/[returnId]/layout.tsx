import React from "react";
import SidebarTree from "@/components/flow/SidebarTree";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh]">
      <aside className="w-72 border-r bg-gray-50 hidden md:block">
        <SidebarTree />
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
