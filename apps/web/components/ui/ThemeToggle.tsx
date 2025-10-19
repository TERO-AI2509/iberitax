"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, []);
  return (
    <Button
      variant="secondary"
      onClick={() => {
        const el = document.documentElement;
        el.classList.toggle("dark");
        setIsDark(el.classList.contains("dark"));
      }}
      aria-pressed={isDark}
      className="ml-2"
    >
      {isDark ? "Dark" : "Light"}
    </Button>
  );
}
