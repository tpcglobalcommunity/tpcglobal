import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg" | "icon"
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",

          // variants
          variant === "default" &&
            "bg-gold-500 text-black hover:bg-gold-400",
          variant === "secondary" &&
            "bg-neutral-800 text-white hover:bg-neutral-700",
          variant === "outline" &&
            "border border-neutral-700 text-white hover:bg-neutral-800",
          variant === "ghost" &&
            "text-white hover:bg-neutral-800",
          variant === "destructive" &&
            "bg-red-600 text-white hover:bg-red-500",

          // sizes
          size === "sm" && "h-8 px-3",
          size === "md" && "h-10 px-4",
          size === "lg" && "h-12 px-6 text-base",
          size === "icon" && "h-10 w-10",

          className
        )}
        {...props}
      >
        {loading ? "Loading..." : children}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button }
