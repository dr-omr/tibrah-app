import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Base sizing - mobile friendly (min 48px height)
                    "flex min-h-[48px] w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3",
                    // Typography - 16px prevents iOS zoom
                    "text-base text-slate-800 font-medium",
                    // Placeholder
                    "placeholder:text-slate-400 placeholder:font-normal",
                    // Focus states
                    "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                    // Transitions
                    "transition-all duration-200",
                    // File inputs
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    // Disabled
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
                    // Shadow for depth
                    "shadow-sm",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
