'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchCases, postCollect, postReply, postClose, exportCSVUrl } from '../../lib/lawyerClient';
import { showToast, showBanner } from '@/src/ui/feedback';

type Case = { id: string; title: string; state: string; updated_at?: string };

const palette: Record<string,string> = {
  open: 'bg-yellow-100 text-yellow-900',
  picked_up: 'bg-blue-100 text-blue-900',
  answered: 'bg-purple-100 text-purple-900',
  closed: 'bg-green-100 text-green-900'
};

export default function LawyerDashboard() {
  const [rows, setRows] = useState<Case[]>([]);
  const [q, setQ] = useState('');
  const [state, setState] = useState<string>('all');
  const [tick, setTick] = useState(0);
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (state && state !== 'all') p.set('state', state);
    return p.toString();
  }, [q, state, tick]);

  async function refresh() {
    try {
      const data = await fetchCases(query);
      setRows(Array.isArray(data) ? data : []);
      showBanner('Dashboard actualizado');
    } catch (e:any) {
      showToast('Error al actualizar');
    }
  }

  useEffect(() => { refresh(); }, [query]);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  async function onCollect(id: string) {
    await postCollect(id);
    showToast('Caso asignado');
    refresh();
  }
  async function onReply(id: string) {
    const message = prompt('Respuesta rápida') || '';
    await postReply(id, message);
    showToast('Respuesta enviada');
    refresh();
  }
  async function onClose(id: string) {
    await postClose(id);
    showToast('Caso cerrado');
    refresh();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input className="border rounded px-3 py-2 w-64" placeholder="Buscar" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="border rounded px-3 py-2" value={state} onChange={e=>setState(e.target.value)}>
          <option value="all">Todos</option>
          <option value="open">Abierto</option>
          <option value="picked_up">En curso</option>
          <option value="answered">Respondido</option>
          <option value="closed">Cerrado</option>
        </select>
        <a href={exportCSVUrl(query)} className="border px-3 py-2 rounded">Exportar CSV</a>
        <button className="border px-3 py-2 rounded" onClick={refresh}>Refrescar</button>
      </div>
      <div className="grid gap-3">
        {rows.map(r => (
          <div key={r.id} className="p-4 rounded border flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold">{r.title || r.id}</div>
              <div className={`inline-block px-2 py-1 rounded text-xs ${palette[r.state] || 'bg-gray-100 text-gray-800'}`}>{r.state}</div>
              {r.updated_at ? <div className="text-xs text-gray-500">{r.updated_at}</div> : null}
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded border" onClick={()=>onCollect(r.id)}>Recoger</button>
              <button className="px-3 py-2 rounded border" onClick={()=>onReply(r.id)}>Responder</button>
              <button className="px-3 py-2 rounded border" onClick={()=>onClose(r.id)}>Cerrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
