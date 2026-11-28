import { cn } from "../../lib/utils"

// A placeholder that breathes: a muted block whose opacity eases between 1
// and 0.5 (globals.css, Skeleton). Pure CSS, so it shows before hydration.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-control bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
