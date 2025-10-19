# TERO Theme Freeze (MVP)

Canonical semantic tokens live in apps/web/styles/tero.theme.css.
Light and dark values are defined in :root and .dark.

Use tokens via Tailwind hsl(var(--token)).
Examples:
bg-[hsl(var(--background))]
text-[hsl(var(--foreground))]
border-[hsl(var(--border))]
bg-[hsl(var(--primary))]
text-[hsl(var(--primary-foreground))]

States:
Focus uses a subtle shadow and border emphasis, no rings.
Disabled states reduce opacity and pointer events, not color alone.
Reduced motion guards remain for animated components.

Change policy:
Token edits require a quick visual pass on /dev/theme-preview/*.
