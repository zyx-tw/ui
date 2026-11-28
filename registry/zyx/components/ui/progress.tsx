import { cn } from "../../lib/utils"

/**
 * A determinate progress bar: a pill track that fills smoothly to `value`,
 * 0 to 100. It is the native <progress> element styled through its
 * pseudo-elements, so screen readers know it and it shows before hydration.
 */
function Progress({
  value,
  className,
  ...props
}: { value: number } & Omit<React.ComponentProps<"progress">, "children">) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <progress
      data-slot="progress"
      max={100}
      value={clamped}
      className={cn(
        "block h-2 w-full appearance-none overflow-hidden rounded-full bg-muted",
        "[&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-foreground [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-foreground [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-overlay",
        className
      )}
      {...props}
    />
  )
}

export { Progress }
