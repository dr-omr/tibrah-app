"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Select Context
interface SelectContextValue {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

function useSelect() {
    const context = React.useContext(SelectContext)
    if (!context) {
        throw new Error("Select components must be used within a Select")
    }
    return context
}

// Select Root
interface SelectProps {
    children: React.ReactNode
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
}

function Select({ children, value: controlledValue, defaultValue = "", onValueChange }: SelectProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)
    const value = controlledValue !== undefined ? controlledValue : internalValue

    const handleValueChange = React.useCallback((newValue: string) => {
        if (controlledValue === undefined) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
        setOpen(false)
    }, [controlledValue, onValueChange])

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

// Select Trigger
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useSelect()

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {children}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
        )
    }
)
SelectTrigger.displayName = "SelectTrigger"

// Select Value
interface SelectValueProps {
    placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
    const { value } = useSelect()
    return <span className={!value ? "text-slate-500" : ""}>{value || placeholder}</span>
}

// Select Content
interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useSelect()

        if (!open) return null

        return (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div
                    ref={ref}
                    className={cn(
                        "absolute z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95",
                        "top-full mt-1 w-full",
                        className
                    )}
                    {...props}
                >
                    <div className="p-1">
                        {children}
                    </div>
                </div>
            </>
        )
    }
)
SelectContent.displayName = "SelectContent"

// Select Item
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
    children: React.ReactNode
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, value: itemValue, children, ...props }, ref) => {
        const { value, onValueChange } = useSelect()
        const isSelected = value === itemValue

        return (
            <div
                ref={ref}
                onClick={() => onValueChange(itemValue)}
                className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100",
                    isSelected && "bg-slate-100",
                    className
                )}
                {...props}
            >
                {isSelected && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </span>
                )}
                {children}
            </div>
        )
    }
)
SelectItem.displayName = "SelectItem"

export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
}
