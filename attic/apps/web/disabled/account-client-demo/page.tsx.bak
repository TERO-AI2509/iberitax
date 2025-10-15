'use client';

import { useEffect, useState } from 'react';
import { fetchJSON } from '../../../lib/client/fetcher';

type WhoAmI = { email?: string; sub?: string };

export default function ClientDemo() {
  const [who, setWho] = useState<WhoAmI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchJSON<WhoAmI>('/api/private/whoami').then((res) => {
      if (!mounted) return;
      setWho(res.data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Client Demo</h1>
      {who ? <pre>{JSON.stringify(who, null, 2)}</pre> : <div>No data</div>}
    </div>
  );
}
