import * as React from "react"
import { cn } from "@/lib/utils"

// Button variants helper function
const buttonVariants = ({ variant = "default", size = "default" }: { variant?: string; size?: string } = {}) => {
    const variantClasses: Record<string, string> = {
        default: "bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90",
        destructive: "bg-red-500 text-slate-50 shadow-sm hover:bg-red-500/90",
        outline: "border-2 border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300",
        secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
        primary: "gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40",
    }

    const sizeClasses: Record<string, string> = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg font-bold",
        icon: "h-10 w-10",
    }

    return cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
        // Transitions & Tactile Feedback
        "transition-all duration-150 active:scale-[0.97]",
        // Touch target & accessibility
        "touch-target select-none",
        // Focus states
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Remove tap highlight
        "[&]:tap-highlight-transparent",
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default
    )
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
