import * as React from "react"
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden"

export function VisuallyHidden({
  children,
  ...props
}: React.ComponentProps<typeof VisuallyHiddenPrimitive.Root>) {
  return (
    <VisuallyHiddenPrimitive.Root {...props}>
      {children}
    </VisuallyHiddenPrimitive.Root>
  )
}
