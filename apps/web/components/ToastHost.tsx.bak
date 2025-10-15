'use client';
import { useEffect, useState } from 'react';
import { listen } from '@/src/ui/feedback';
export default function ToastHost() {
  const [msg, setMsg] = useState<string>('');
  useEffect(() => {
    const un = listen(p => { if (p.type==='toast') setMsg(p.message); });
    const hid = setInterval(() => setMsg(''), 3000);
    return () => { un(); clearInterval(hid); };
  }, []);
  if (!msg) return null;
  return <div className="fixed bottom-4 right-4 px-4 py-2 rounded shadow bg-black text-white">{msg}</div>;
}
