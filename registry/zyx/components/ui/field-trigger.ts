// The closed state of every pick-a-value control (select, combobox): it has
// to read as the same kind of field as Input, so they share one class list.
// The outline is a frame (FrameEdges) colored by fieldFrameClassName.
export const fieldTriggerClassName =
  "group/field relative flex h-10 w-fit rounded-control items-center justify-between gap-2 bg-transparent px-3 text-body whitespace-nowrap transition-colors outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

// A field's frame: the input line color at rest, the text color in focus,
// red when invalid. The frame's parent is the field (group/field): a trigger itself, or
// the box around an input.
export const fieldFrameClassName =
  "text-input transition duration-state group-focus-visible/field:text-ring group-has-focus-visible/field:text-ring group-aria-invalid/field:text-destructive group-has-aria-invalid/field:text-destructive"
