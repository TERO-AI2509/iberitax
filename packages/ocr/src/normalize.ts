export function normalizeSpanishText(input: string): string {
  let t = input;

  t = t.replace(/€/g, "EUR");

  t = t.replace(/\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b/g, (m) => {
    const noThousands = m.replace(/\./g, "");
    return noThousands.replace(",", ".");
  });

  t = t.replace(/\b(\d+)\s*EUR\b/g, (_m, n) => `${n} EUR`);
  t = t.replace(/\bEUR\s*(\d+(?:\.\d+)?)\b/g, (_m, n) => `EUR ${n}`);

  t = t.replace(/\b([0-3]?\d)[\/\-]([01]?\d)[\/\-]((?:19|20)?\d{2})\b/g, (_m, d, m, y) => {
    const day = String(d).padStart(2, "0");
    const mon = String(m).padStart(2, "0");
    let year = String(y);
    if (year.length === 2) year = (parseInt(year, 10) >= 70 ? "19" : "20") + year;
    return `${year}-${mon}-${day}`;
  });

  t = t.replace(/\s{2,}/g, " ");
  return t.trim();
}
