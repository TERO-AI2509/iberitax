'use client';
import { useEffect, useState } from 'react';
import { listen } from '@/src/ui/feedback';
export default function BannerHost() {
  const [msg, setMsg] = useState<string>('');
  useEffect(() => {
    const un = listen(p => { if (p.type==='banner') setMsg(p.message); setTimeout(()=>setMsg(''), 1500); });
    return () => { un(); };
  }, []);
  if (!msg) return null;
  return <div className="fixed top-0 inset-x-0 text-center py-2 bg-emerald-100 text-emerald-900 border-b border-emerald-300">{msg}</div>;
}
