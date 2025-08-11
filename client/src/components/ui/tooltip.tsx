"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { InfoIcon, HelpCircle, AlertCircle, CheckCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Enhanced tooltip variants
interface HelpfulTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  variant?: "info" | "help" | "warning" | "success";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  triggerClassName?: string;
  delayDuration?: number;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const variantStyles = {
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
  help: "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-100", 
  warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100",
  success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100"
};

const variantIcons = {
  info: InfoIcon,
  help: HelpCircle,
  warning: AlertCircle,
  success: CheckCircle
};

const maxWidthStyles = {
  sm: "max-w-xs",
  md: "max-w-sm", 
  lg: "max-w-md",
  xl: "max-w-lg"
};

export function HelpfulTooltip({
  children,
  content,
  variant = "info",
  side = "top",
  className,
  triggerClassName,
  delayDuration = 300,
  maxWidth = "md"
}: HelpfulTooltipProps) {
  const Icon = variantIcons[variant];
  
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help", triggerClassName)}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className={cn(
            variantStyles[variant],
            maxWidthStyles[maxWidth],
            "flex items-start gap-2 p-3",
            className
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Quick help tooltip for form fields
export function FieldHelpTooltip({
  content,
  className
}: {
  content: React.ReactNode;
  className?: string;
}) {
  return (
    <HelpfulTooltip
      content={content}
      variant="help"
      side="right"
      maxWidth="sm"
      className={className}
    >
      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
    </HelpfulTooltip>
  );
}

// Info tooltip for additional context
export function InfoTooltip({
  content,
  children,
  className
}: {
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <HelpfulTooltip
      content={content}
      variant="info"
      className={className}
    >
      {children || <InfoIcon className="h-4 w-4 text-blue-500" />}
    </HelpfulTooltip>
  );
}

// Warning tooltip for important notices
export function WarningTooltip({
  content,
  children,
  className
}: {
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <HelpfulTooltip
      content={content}
      variant="warning"
      className={className}
    >
      {children || <AlertCircle className="h-4 w-4 text-amber-500" />}
    </HelpfulTooltip>
  );
}

// Success tooltip for confirmations
export function SuccessTooltip({
  content,
  children,
  className
}: {
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <HelpfulTooltip
      content={content}
      variant="success"
      className={className}
    >
      {children || <CheckCircle className="h-4 w-4 text-green-500" />}
    </HelpfulTooltip>
  );
}

// Tax-specific tooltips for R&D credit app
export function TaxTermTooltip({
  term,
  definition,
  children
}: {
  term: string;
  definition: string;
  children: React.ReactNode;
}) {
  return (
    <HelpfulTooltip
      content={
        <div className="space-y-1">
          <div className="font-medium">{term}</div>
          <div className="text-muted-foreground">{definition}</div>
        </div>
      }
      variant="info"
      maxWidth="lg"
    >
      {children}
    </HelpfulTooltip>
  );
}

export function CalculationTooltip({
  formula,
  explanation,
  children
}: {
  formula?: string;
  explanation: string;
  children: React.ReactNode;
}) {
  return (
    <HelpfulTooltip
      content={
        <div className="space-y-2">
          {formula && (
            <div className="font-mono text-xs bg-muted/50 p-2 rounded">
              {formula}
            </div>
          )}
          <div>{explanation}</div>
        </div>
      }
      variant="info"
      maxWidth="lg"
    >
      {children}
    </HelpfulTooltip>
  );
}

export function ComplianceTooltip({
  requirement,
  details,
  children
}: {
  requirement: string;
  details: string;
  children: React.ReactNode;
}) {
  return (
    <HelpfulTooltip
      content={
        <div className="space-y-1">
          <div className="font-medium text-amber-700 dark:text-amber-300">
            IRS Requirement
          </div>
          <div className="font-medium">{requirement}</div>
          <div className="text-muted-foreground text-xs">{details}</div>
        </div>
      }
      variant="warning"
      maxWidth="lg"
    >
      {children}
    </HelpfulTooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
