"use client";
type Props = { onSkip: () => void };
export default function CapitalSecurities({ onSkip }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Capital and securities section coming soon</div>
      <button type="button" onClick={onSkip} className="rounded-xl px-4 py-2 border bg-background hover:bg-muted focus:outline-none">Skip for later</button>
    </div>
  );
}
