"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
type Node={path:string;label:string;children?:Node[]}
export default function SidebarTree({clientId,returnId,tree}:{clientId:string;returnId:string;tree:Node}){
  const pathname=usePathname()
  function Item({node}:{node:Node}){
    const href=`/client/${clientId}/flow/${returnId}${node.path}`
    const active=pathname===href
    return (
      <div className="mb-1">
        <Link href={href} className={`block rounded px-3 py-1 ${active?"bg-blue-600 text-white":"hover:bg-gray-100"}`}>{node.label}</Link>
        {node.children&&node.children.length>0&&(
          <div className="ml-3 mt-1 border-l pl-2 space-y-1">
            {node.children.map(c=><Item key={c.path} node={c}/>)}
          </div>
        )}
      </div>
    )
  }
  return (
    <nav>
      <div className="text-xs uppercase tracking-wide mb-2 opacity-60">Workflow</div>
      <Item node={tree}/>
    </nav>
  )
}
