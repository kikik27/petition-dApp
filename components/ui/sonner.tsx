import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-gray-900 group-[.toaster]:via-gray-800 group-[.toaster]:to-gray-900 group-[.toaster]:border-2 group-[.toaster]:border-gray-700/50 group-[.toaster]:text-white group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-lg",
          description: "group-[.toast]:text-gray-400",
          actionButton: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-purple-500 group-[.toast]:to-pink-500 group-[.toast]:text-white group-[.toast]:shadow-lg group-[.toast]:shadow-purple-500/30 group-[.toast]:hover:scale-105 group-[.toast]:transition-transform",
          cancelButton: "group-[.toast]:bg-gray-800 group-[.toast]:text-gray-300 group-[.toast]:border group-[.toast]:border-gray-600 group-[.toast]:hover:bg-gray-700 group-[.toast]:hover:scale-105 group-[.toast]:transition-transform",
          closeButton: "group-[.toast]:bg-gray-800/80 group-[.toast]:text-gray-400 group-[.toast]:border group-[.toast]:border-gray-700 group-[.toast]:hover:bg-gray-700 group-[.toast]:hover:text-white group-[.toast]:transition-all",

          // Success variant
          success: "group-[.toaster]:border-green-500/30 group-[.toaster]:shadow-green-500/20 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-green-900/20 group-[.toaster]:via-gray-800 group-[.toaster]:to-gray-900",

          // Error variant
          error: "group-[.toaster]:border-red-500/30 group-[.toaster]:shadow-red-500/20 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-red-900/20 group-[.toaster]:via-gray-800 group-[.toaster]:to-gray-900",

          // Warning variant
          warning: "group-[.toaster]:border-yellow-500/30 group-[.toaster]:shadow-yellow-500/20 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-yellow-900/20 group-[.toaster]:via-gray-800 group-[.toaster]:to-gray-900",

          // Info variant
          info: "group-[.toaster]:border-blue-500/30 group-[.toaster]:shadow-blue-500/20 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-blue-900/20 group-[.toaster]:via-gray-800 group-[.toaster]:to-gray-900",
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "rgba(34, 197, 94, 0.1)",
          "--success-text": "rgb(134, 239, 172)",
          "--success-border": "rgba(34, 197, 94, 0.3)",
          "--error-bg": "rgba(239, 68, 68, 0.1)",
          "--error-text": "rgb(252, 165, 165)",
          "--error-border": "rgba(239, 68, 68, 0.3)",
          "--warning-bg": "rgba(234, 179, 8, 0.1)",
          "--warning-text": "rgb(253, 224, 71)",
          "--warning-border": "rgba(234, 179, 8, 0.3)",
          "--info-bg": "rgba(59, 130, 246, 0.1)",
          "--info-text": "rgb(147, 197, 253)",
          "--info-border": "rgba(59, 130, 246, 0.3)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
