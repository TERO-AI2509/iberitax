"use client"
import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Link as UILink } from "@/components/ui/Link"

export default function ActionsPreview() {
  return (
    <div className="p-6 space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link-style</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon button">⚙️</Button>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Links</h2>
        <div className="flex flex-wrap gap-3">
          <UILink href="/dev/theme-preview/forms">Internal link</UILink>
          <UILink href="https://example.com">External link</UILink>
          <UILink href="/#" variant="subtle">Subtle link</UILink>
          <UILink href="/#" variant="muted">Muted link</UILink>
          <UILink href="/#" disabled>Disabled link</UILink>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Keyboard test hint</h2>
        <p className="text-sm text-muted-foreground">Use Tab and Shift+Tab to cycle focus over buttons and links. Look for a subtle border emphasis and soft focus shadow, no halo, in both light and dark modes.</p>
      </section>
    </div>
  )
}
