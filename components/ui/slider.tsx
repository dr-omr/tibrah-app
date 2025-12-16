"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number[]
    defaultValue?: number[]
    max?: number
    min?: number
    step?: number
    onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    ({ className, value, defaultValue, max = 100, min = 0, step = 1, onValueChange, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState(defaultValue || [50])
        const currentValue = value !== undefined ? value : internalValue

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = [parseFloat(e.target.value)]
            if (value === undefined) {
                setInternalValue(newValue)
            }
            onValueChange?.(newValue)
        }

        const percentage = ((currentValue[0] - min) / (max - min)) * 100

        return (
            <div ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
                <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="absolute h-full bg-slate-900"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={currentValue[0]}
                    onChange={handleChange}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                />
                <div
                    className="absolute h-4 w-4 rounded-full border border-slate-200 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
                    style={{ left: `calc(${percentage}% - 8px)` }}
                />
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
