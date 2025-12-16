"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Tabs Context
interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error("Tabs components must be used within a Tabs")
    }
    return context
}

// Tabs Root
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
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
            <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
                <div ref={ref} className={cn("", className)} {...props} />
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = "Tabs"

// TabsList
const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

// TabsTrigger
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value: triggerValue, ...props }, ref) => {
        const { value, onValueChange } = useTabs()
        const isActive = value === triggerValue

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => onValueChange(triggerValue)}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isActive
                        ? "bg-white text-slate-950 shadow"
                        : "text-slate-500 hover:text-slate-950",
                    className
                )}
                {...props}
            />
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

// TabsContent
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value: contentValue, ...props }, ref) => {
        const { value } = useTabs()

        if (value !== contentValue) return null

        return (
            <div
                ref={ref}
                className={cn(
                    "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            />
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
