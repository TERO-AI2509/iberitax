import "../globals.css";
import HeaderBar from "../../components/app/HeaderBar";
import SidebarNav from "../../components/nav/SidebarNav";
import Breadcrumbs from "../../components/nav/Breadcrumbs";

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-white">
        <HeaderBar area="lawyer" />
      </header>
      <main className="container-page">
        <aside className="hidden md:block">
          <SidebarNav area="lawyer" />
        </aside>
        <section className="min-w-0 page-x page-y section-stack">
          <Breadcrumbs />
          {children}
        </section>
      </main>
    </div>
  );
}
