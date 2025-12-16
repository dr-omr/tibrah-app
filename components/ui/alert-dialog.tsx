"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// AlertDialog Context
interface AlertDialogContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined)

function useAlertDialog() {
    const context = React.useContext(AlertDialogContext)
    if (!context) {
        throw new Error("AlertDialog components must be used within an AlertDialog")
    }
    return context
}

// AlertDialog Root
interface AlertDialogProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function AlertDialog({ children, open: controlledOpen, onOpenChange }: AlertDialogProps) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
        if (controlledOpen === undefined) {
            setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }, [controlledOpen, onOpenChange])

    return (
        <AlertDialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
            {children}
        </AlertDialogContext.Provider>
    )
}

// AlertDialog Trigger
interface AlertDialogTriggerProps {
    children: React.ReactNode
    asChild?: boolean
}

function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
    const { onOpenChange } = useAlertDialog()

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

// AlertDialog Content
interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open } = useAlertDialog()

        if (!open) return null

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop - no click to close for alert dialogs */}
                <div className="fixed inset-0 bg-black/50 animate-in fade-in-0" />
                {/* Content */}
                <div
                    ref={ref}
                    className={cn(
                        "fixed z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </div>
        )
    }
)
AlertDialogContent.displayName = "AlertDialogContent"

// AlertDialog Header
const AlertDialogHeader = ({
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
AlertDialogHeader.displayName = "AlertDialogHeader"

// AlertDialog Footer
const AlertDialogFooter = ({
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
AlertDialogFooter.displayName = "AlertDialogFooter"

// AlertDialog Title
const AlertDialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-semibold",
            className
        )}
        {...props}
    />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

// AlertDialog Description
const AlertDialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500", className)}
        {...props}
    />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

// AlertDialog Action (confirm button)
interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
    ({ className, onClick, ...props }, ref) => {
        const { onOpenChange } = useAlertDialog()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            onOpenChange(false)
        }

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    className
                )}
                onClick={handleClick}
                {...props}
            />
        )
    }
)
AlertDialogAction.displayName = "AlertDialogAction"

// AlertDialog Cancel
interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
    ({ className, ...props }, ref) => {
        const { onOpenChange } = useAlertDialog()

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    className
                )}
                onClick={() => onOpenChange(false)}
                {...props}
            />
        )
    }
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
