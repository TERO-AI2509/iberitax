export default function AppSidebar({ area }: { area: 'client' | 'lawyer' | 'ops' }) {
  return <div role="navigation">Sidebar: {area}</div>;
}
