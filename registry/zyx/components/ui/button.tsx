import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { FrameEdges } from "./frame"

// One height for text and icon buttons; variants follow what the zyx.tw apps use.
const buttonVariants = cva(
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-control text-body font-medium whitespace-nowrap transition-[color,background-color,scale] duration-state outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-safe:active:scale-98 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50 active:bg-primary/80",
        outline:
          "group/outline relative bg-transparent focus-visible:ring-0 active:bg-muted",
        ghost: "hover:bg-muted active:bg-muted",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 active:bg-destructive/25",
      },
      size: {
        default: "px-4",
        icon: "w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// An outline button is framed in glyphs; hovering lights the frame up.
// Pressing any button inverts its cell, as a terminal highlights a key.
function Button({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      {variant === "outline" && (
        <FrameEdges className="text-muted-foreground opacity-20 transition duration-state group-hover/outline:text-foreground group-hover/outline:opacity-100 group-focus-visible/outline:text-ring group-focus-visible/outline:opacity-100" />
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
