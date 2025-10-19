"use client";
import React from "react";
export default function CasillaChips({ casillas }: { casillas: Array<string | number> }) {
  if (!casillas?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2" aria-label="Modelo 100 casillas">
      {casillas.map((c) => (
        <span key={String(c)} className="inline-flex items-center rounded-full border px-2 py-1 text-xs bg-gray-50 border-gray-300">
          Casilla {c}
        </span>
      ))}
    </div>
  );
}
