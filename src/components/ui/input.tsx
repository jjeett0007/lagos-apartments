import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border-2 border-ink-black bg-warm-cream px-3 py-1.5 text-base font-medium text-ink-black transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-eko-gold focus-visible:shadow-[3px_3px_0px_#0a0a0a] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[3px_3px_0px_var(--alert-red)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
