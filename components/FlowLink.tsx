import React from "react";
import Link from "next/link";
import { flowJoin } from "../lib/paths";

type Props = {
  clientId: string;
  returnId: string;
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
};

export default function FlowLink({ clientId, returnId, to, children, className, prefetch }: Props) {
  const href = flowJoin(clientId, returnId, to);
  return (
    <Link href={href} className={className} prefetch={prefetch}>
      {children}
    </Link>
  );
}
