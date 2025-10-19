type Option = { label: string; href: string };
export default function SectionGate({ title, options }: { title: string; options: Option[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map(o=>(
          <li key={o.href}>
            <a href={o.href} className="block rounded-xl border p-4 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2">
              {o.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
