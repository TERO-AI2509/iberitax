"use client";

import { useEffect, useRef } from "react";

type Props = {
  returnId: string;
  ns: string;
  fields: string[];
};

const lsKey = (returnId: string, ns: string) => `return:${returnId}::ns:${ns}`;

export default function AutoPersist({ returnId, ns, fields }: Props) {
  const saved = useRef<Record<string, any> | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey(returnId, ns));
      saved.current = raw ? JSON.parse(raw) : {};
    } catch {
      saved.current = {};
    }

    const inputs: HTMLInputElement[] = [];
    const selects: HTMLSelectElement[] = [];
    const textareas: HTMLTextAreaElement[] = [];

    fields.forEach((name) => {
      const el =
        (document.querySelector(`[name="${name}"]`) as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          | null) || null;

      if (!el) return;

      if (saved.current && Object.prototype.hasOwnProperty.call(saved.current, name)) {
        const v = (saved.current as any)[name];
        try {
          if (el instanceof HTMLInputElement) {
            if (el.type === "checkbox") {
              el.checked = Boolean(v);
            } else {
              el.value = v ?? "";
            }
          } else if (el instanceof HTMLSelectElement) {
            el.value = v ?? "";
          } else if (el instanceof HTMLTextAreaElement) {
            el.value = v ?? "";
          }
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } catch {}
      }

      if (el instanceof HTMLInputElement) inputs.push(el);
      else if (el instanceof HTMLSelectElement) selects.push(el);
      else if (el instanceof HTMLTextAreaElement) textareas.push(el);
    });

    const persist = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const data: Record<string, any> = {};
        fields.forEach((name) => {
          const el =
            (document.querySelector(`[name="${name}"]`) as
              | HTMLInputElement
              | HTMLSelectElement
              | HTMLTextAreaElement
              | null) || null;
          if (!el) return;
          if (el instanceof HTMLInputElement) {
            if (el.type === "checkbox") data[name] = el.checked;
            else data[name] = el.value;
          } else {
            data[name] = (el as any).value;
          }
        });
        try {
          localStorage.setItem(lsKey(returnId, ns), JSON.stringify(data));
        } catch {}
      }, 150);
    };

    const handlers: Array<[Element, string, (e: any) => void]> = [];
    const attach = (el: Element, type: string) => {
      const fn = () => persist();
      el.addEventListener(type, fn, { passive: true });
      handlers.push([el, type, fn]);
    };

    inputs.forEach((el) => {
      attach(el, "input");
      attach(el, "change");
    });
    selects.forEach((el) => attach(el, "change"));
    textareas.forEach((el) => {
      attach(el, "input");
      attach(el, "change");
    });

    return () => {
      handlers.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [returnId, ns, JSON.stringify(fields)]);

  return null;
}
