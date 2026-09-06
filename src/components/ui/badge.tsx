import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 rounded-sm border-2 border-ink-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shadow-[2px_2px_0px_#0a0a0a] [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default: "bg-ink-black text-warm-cream border-ink-black shadow-[2px_2px_0px_var(--eko-gold)]",
        verified:
          "bg-eko-gold text-ink-black border-ink-black shadow-[2px_2px_0px_#0a0a0a]",
        estimated:
          "bg-ink-black text-eko-gold-bright border-eko-gold shadow-[2px_2px_0px_var(--eko-gold)]",
        secondary:
          "bg-secondary text-secondary-foreground border-ink-black shadow-[2px_2px_0px_#0a0a0a]",
        destructive:
          "bg-alert-red text-white border-ink-black shadow-[2px_2px_0px_#0a0a0a]",
        outline:
          "bg-warm-cream text-ink-black border-ink-black shadow-[2px_2px_0px_#0a0a0a]",
        ghost:
          "border-transparent bg-transparent shadow-none hover:border-ink-black",
        link: "border-transparent bg-transparent shadow-none underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
