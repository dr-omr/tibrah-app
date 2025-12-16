"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked)
        }

        return (
            <label className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full", className)}>
                <input
                    type="checkbox"
                    ref={ref}
                    checked={checked}
                    onChange={handleChange}
                    className="sr-only"
                    {...props}
                />
                <span
                    className={cn(
                        "pointer-events-none block h-5 w-9 rounded-full transition-colors",
                        checked ? "bg-slate-900" : "bg-slate-200"
                    )}
                />
                <span
                    className={cn(
                        "pointer-events-none absolute block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-4" : "translate-x-0.5"
                    )}
                />
            </label>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
