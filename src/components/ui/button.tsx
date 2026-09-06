import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border-2 border-ink-black bg-clip-padding text-sm font-bold tracking-tight whitespace-nowrap transition-all outline-none select-none focus-visible:border-eko-gold focus-visible:ring-2 focus-visible:ring-eko-gold/50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-ink-black text-warm-cream shadow-[3px_3px_0px_var(--eko-gold)] hover:bg-ink-black-soft hover:shadow-[4px_4px_0px_var(--eko-gold)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        trust:
          "bg-eko-gold text-ink-black shadow-[3px_3px_0px_#0a0a0a] hover:bg-eko-gold-bright hover:shadow-[4px_4px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5",
        outline:
          "bg-card text-ink-black shadow-[3px_3px_0px_#0a0a0a] hover:bg-warm-cream hover:shadow-[4px_4px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[3px_3px_0px_#0a0a0a] hover:bg-secondary/80 hover:shadow-[4px_4px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5",
        ghost:
          "border-transparent shadow-none hover:border-ink-black hover:bg-ink-black/5 hover:text-ink-black active:translate-x-0.5 active:translate-y-0.5",
        destructive:
          "border-destructive bg-destructive/10 text-destructive shadow-[3px_3px_0px_var(--alert-red)] hover:bg-destructive/20",
        link: "border-transparent shadow-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-sm px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-9",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-sm",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
