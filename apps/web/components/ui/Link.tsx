import * as React from "react"
import NextLink from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const linkVariants = cva(
  "soft-transition inline-flex items-center gap-1 text-primary underline-offset-4 outline-none focus-visible:outline-none s-visible:shadow-[0_1px_0_0_hsl(var(--border))]",
  {
    variants: {
      variant: {
        default: "",
        subtle: "text-foreground",
        muted: "text-muted-foreground",
      },
      size: {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "base",
    },
  }
)

export interface UILinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">,
    VariantProps<typeof linkVariants> {
  href: st
  disabled?: boolean
}

function isExternal(href: st) {
  return /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")
}

export const Link = React.forwardRef<HTMLAnchorElement, UILinkProps>(
  ({ href, className, variant, size, disabled, children, ...props }, ref) => {
    const classes = cn(
      linkVariants({ variant, size, className }),
      disabled ? "pointer-events-none opacity-50" : ""
    )

    if (disabled) {
      return (
        <span role="link" aria-disabled="true" tabIndex={-1} className={classes}>
          {children}
        </span>
      )
    }

    if (isExternal(href)) {
      return (
        <a ref={ref} href={href} className={classes} {...props}>
          {children}
        </a>
      )
    }

    return (
      <NextLink ref={ref as any} href={href} className={classes} {...props}>
        {children}
      </NextLink>
    )
  }
)
Link.displayName = "Link"
