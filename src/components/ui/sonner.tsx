import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

/**
 * @typedef {React.ComponentProps<typeof Sonner>} ToasterProps - The props for the Toaster component.
 */
type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * A component that displays toast notifications.
 * This component is a wrapper around the `sonner` library.
 * @see https://sonner.emilkowal.ski/
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
