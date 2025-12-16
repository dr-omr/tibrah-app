"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// RadioGroup Context
interface RadioGroupContextValue {
    value: string
    onValueChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined)

function useRadioGroup() {
    const context = React.useContext(RadioGroupContext)
    if (!context) {
        throw new Error("RadioGroup components must be used within a RadioGroup")
    }
    return context
}

// RadioGroup Root
interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value: controlledValue, defaultValue = "", onValueChange, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState(defaultValue)
        const value = controlledValue !== undefined ? controlledValue : internalValue

        const handleValueChange = React.useCallback((newValue: string) => {
            if (controlledValue === undefined) {
                setInternalValue(newValue)
            }
            onValueChange?.(newValue)
        }, [controlledValue, onValueChange])

        return (
            <RadioGroupContext.Provider value={{ value, onValueChange: handleValueChange }}>
                <div
                    ref={ref}
                    className={cn("grid gap-2", className)}
                    role="radiogroup"
                    {...props}
                />
            </RadioGroupContext.Provider>
        )
    }
)
RadioGroup.displayName = "RadioGroup"

// RadioGroupItem
interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ className, value: itemValue, ...props }, ref) => {
        const { value, onValueChange } = useRadioGroup()
        const isChecked = value === itemValue

        return (
            <button
                type="button"
                role="radio"
                aria-checked={isChecked}
                onClick={() => onValueChange(itemValue)}
                className={cn(
                    "aspect-square h-4 w-4 rounded-full border border-slate-900 text-slate-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
            >
                {isChecked && (
                    <span className="flex items-center justify-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                    </span>
                )}
                <input
                    ref={ref}
                    type="radio"
                    value={itemValue}
                    checked={isChecked}
                    onChange={() => onValueChange(itemValue)}
                    className="sr-only"
                    {...props}
                />
            </button>
        )
    }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
