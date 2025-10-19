export type Role = "client" | "lawyer" | "ops";
export type NavItem = { label: string; href: string; match?: RegExp | string };
export type NavConfig = Record<Role, NavItem[]>;
export const NAV: NavConfig = {
  client: [
    { label: "Dashboard", href: "/client", match: "^/client$" },
    { label: "Cases", href: "/client/cases", match: "^/client/cases" },
    { label: "Documents", href: "/client/docs", match: "^/client/docs" },
    { label: "Account", href: "/client/account", match: "^/client/account" }
  ],
  lawyer: [
    { label: "Overview", href: "/lawyer", match: "^/lawyer$" },
    { label: "Assignments", href: "/lawyer/assignments", match: "^/lawyer/assignments" },
    { label: "Files", href: "/lawyer/files", match: "^/lawyer/files" },
    { label: "Settings", href: "/lawyer/settings", match: "^/lawyer/settings" }
  ],
  ops: [
    { label: "Ops Home", href: "/ops", match: "^/ops$" },
    { label: "Queues", href: "/ops/queues", match: "^/ops/queues" },
    { label: "Admin", href: "/ops/admin", match: "^/ops/admin" }
  ]
};
