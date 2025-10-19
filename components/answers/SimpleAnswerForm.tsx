"use client";

import React from "react";
import { fetchJSON, postJSON } from "../../lib/api";

type Field = { name: string; label: string; type?: "text" | "number" | "checkbox" };

type Props = {
  returnId: string;
  sectionKey: string;
  fields: Field[];
  onSaved?: () => void;
};

export default function SimpleAnswerForm({ returnId, sectionKey, fields, onSaved }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    let mounted = true;
    fetchJSON<Record<string, any>>(`/api/answers?returnId=${encodeURIComponent(returnId)}`)
      .then((data) => {
        if (!mounted) return;
        const section = (data && (data as any)[sectionKey]) || {};
        setValues(section);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [returnId, sectionKey]);

  function setField(name: string, value: any) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await postJSON(`/api/answers`, { returnId, updates: { [sectionKey]: values } });
      if (onSaved) onSaved();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map((f) => {
        const t = f.type || "text";
        const id = `${sectionKey}.${f.name}`;
        if (t === "checkbox") {
          return (
            <label key={id} className="flex items-center gap-2">
              <input
                id={id}
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => setField(f.name, e.currentTarget.checked)}
              />
              <span>{f.label}</span>
            </label>
          );
        }
        return (
          <div key={id} className="grid gap-1">
            <label htmlFor={id} className="text-sm font-medium">{f.label}</label>
            <input
              id={id}
              type={t}
              className="rounded-lg border px-3 py-2"
              value={values[f.name] ?? ""}
              onChange={(e) =>
                setField(f.name, t === "number" ? Number(e.currentTarget.value || 0) : e.currentTarget.value)
              }
            />
          </div>
        );
      })}
      <button type="submit" disabled={saving} className="rounded-xl border px-4 py-2">
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
