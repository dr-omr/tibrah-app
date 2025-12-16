"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Accordion Context
interface AccordionContextValue {
    value: string | string[] | undefined
    onValueChange: (value: string) => void
    type: "single" | "multiple"
    collapsible?: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

function useAccordion() {
    const context = React.useContext(AccordionContext)
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion")
    }
    return context
}

// Accordion Item Context
interface AccordionItemContextValue {
    value: string
    isOpen: boolean
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(undefined)

function useAccordionItem() {
    const context = React.useContext(AccordionItemContext)
    if (!context) {
        throw new Error("AccordionItem components must be used within an AccordionItem")
    }
    return context
}

// Accordion Root
interface AccordionSingleProps extends React.HTMLAttributes<HTMLDivElement> {
    type: "single"
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    collapsible?: boolean
}

interface AccordionMultipleProps extends React.HTMLAttributes<HTMLDivElement> {
    type: "multiple"
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
}

type AccordionProps = AccordionSingleProps | AccordionMultipleProps

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
    ({ className, type, collapsible, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState<string | string[]>(
            type === "single"
                ? (props as AccordionSingleProps).defaultValue || ""
                : (props as AccordionMultipleProps).defaultValue || []
        )

        const controlledValue = type === "single"
            ? (props as AccordionSingleProps).value
            : (props as AccordionMultipleProps).value

        const value = controlledValue !== undefined ? controlledValue : internalValue

        const handleValueChange = React.useCallback((itemValue: string) => {
            if (type === "single") {
                const newValue = value === itemValue && collapsible ? "" : itemValue
                if (controlledValue === undefined) {
                    setInternalValue(newValue)
                }
                (props as AccordionSingleProps).onValueChange?.(newValue)
            } else {
                const currentValues = value as string[]
                const newValue = currentValues.includes(itemValue)
                    ? currentValues.filter(v => v !== itemValue)
                    : [...currentValues, itemValue]
                if (controlledValue === undefined) {
                    setInternalValue(newValue)
                }
                (props as AccordionMultipleProps).onValueChange?.(newValue)
            }
        }, [type, value, controlledValue, collapsible, props])

        // Remove custom props from div
        const {
            value: _,
            defaultValue: __,
            onValueChange: ___,
            ...divProps
        } = props as AccordionSingleProps & AccordionMultipleProps

        return (
            <AccordionContext.Provider
                value={{
                    value,
                    onValueChange: handleValueChange,
                    type,
                    collapsible
                }}
            >
                <div ref={ref} className={cn("", className)} {...divProps} />
            </AccordionContext.Provider>
        )
    }
)
Accordion.displayName = "Accordion"

// AccordionItem
interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ className, value, ...props }, ref) => {
        const { value: accordionValue, type } = useAccordion()

        const isOpen = type === "single"
            ? accordionValue === value
            : (accordionValue as string[]).includes(value)

        return (
            <AccordionItemContext.Provider value={{ value, isOpen }}>
                <div
                    ref={ref}
                    className={cn("border-b", className)}
                    data-state={isOpen ? "open" : "closed"}
                    {...props}
                />
            </AccordionItemContext.Provider>
        )
    }
)
AccordionItem.displayName = "AccordionItem"

// AccordionTrigger
const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { onValueChange } = useAccordion()
    const { value, isOpen } = useAccordionItem()

    return (
        <h3 className="flex">
            <button
                ref={ref}
                type="button"
                onClick={() => onValueChange(value)}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                data-state={isOpen ? "open" : "closed"}
                aria-expanded={isOpen}
                {...props}
            >
                {children}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>
        </h3>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

// AccordionContent
const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { isOpen } = useAccordionItem()

    return (
        <div
            ref={ref}
            className={cn(
                "overflow-hidden text-sm",
                isOpen ? "animate-accordion-down" : "hidden"
            )}
            data-state={isOpen ? "open" : "closed"}
            {...props}
        >
            <div className={cn("pb-4 pt-0", className)}>{children}</div>
        </div>
    )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
