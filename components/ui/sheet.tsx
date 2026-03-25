"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Sheet Context
interface SheetContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

function useSheet() {
    const context = React.useContext(SheetContext)
    if (!context) {
        throw new Error("Sheet components must be used within a Sheet")
    }
    return context
}

// Sheet Root
interface SheetProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
        if (controlledOpen === undefined) {
            setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }, [controlledOpen, onOpenChange])

    return (
        <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
            {children}
        </SheetContext.Provider>
    )
}

// Sheet Trigger
interface SheetTriggerProps {
    children: React.ReactNode
    asChild?: boolean
}

function SheetTrigger({ children, asChild }: SheetTriggerProps) {
    const { onOpenChange } = useSheet()

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
            onClick: () => onOpenChange(true)
        })
    }

    return (
        <button onClick={() => onOpenChange(true)}>
            {children}
        </button>
    )
}

// Sheet Content
interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
}

const sheetVariants = {
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
}

const slideVariants = {
    top: "animate-in slide-in-from-top",
    bottom: "animate-in slide-in-from-bottom",
    left: "animate-in slide-in-from-left",
    right: "animate-in slide-in-from-right",
}

import { motion, useAnimation, PanInfo } from "framer-motion"

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
    ({ className, children, side = "right", ...props }, ref) => {
        const { open, onOpenChange } = useSheet()
        const controls = useAnimation()

        // Handle the drag gesture end
        const handleDragEnd = async (event: any, info: PanInfo) => {
            const offsetThreshold = 100;
            const velocityThreshold = 500;

            // Only close if it's a bottom sheet being swiped down
            if (side === "bottom" && (info.offset.y > offsetThreshold || info.velocity.y > velocityThreshold)) {
                onOpenChange(false);
            } else if (side === "bottom") {
                // Animate back to original position
                controls.start({ y: 0, transition: { type: "spring", bounce: 0, duration: 0.4 } });
            }
        }

        if (!open) return null

        return (
            <div className="fixed inset-0 z-50">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 animate-in fade-in-0"
                    onClick={() => onOpenChange(false)}
                />
                {/* Content */}
                <motion.div
                    ref={ref}
                    drag={side === "bottom" ? "y" : false}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    className={cn(
                        "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out",
                        sheetVariants[side],
                        slideVariants[side],
                        className
                    )}
                    {...props as any}
                >
                    {/* Native-like Pull Handle for Bottom Sheets */}
                    {side === "bottom" && (
                        <div className="mx-auto w-12 h-1.5 bg-slate-300 rounded-full mb-4 opacity-50 absolute top-3 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing" />
                    )}
                    {children}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                        <span className="sr-only">Close</span>
                    </button>
                </motion.div>
            </div>
        )
    }
)
SheetContent.displayName = "SheetContent"

// Sheet Header
const SheetHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-right",
            className
        )}
        {...props}
    />
)
SheetHeader.displayName = "SheetHeader"

// Sheet Footer
const SheetFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
SheetFooter.displayName = "SheetFooter"

// Sheet Title
const SheetTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-semibold text-slate-950", className)}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

// Sheet Description
const SheetDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500", className)}
        {...props}
    />
))
SheetDescription.displayName = "SheetDescription"

export {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
