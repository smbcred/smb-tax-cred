import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "muted";
  className?: string;
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const variantClasses = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-muted-foreground"
};

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  className,
  text = "Loading...",
  showText = false
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-2">
        <LoaderCircle 
          className={cn(
            "animate-spin",
            sizeClasses[size],
            variantClasses[variant]
          )} 
        />
        {showText && (
          <span className={cn(
            "text-sm",
            variantClasses[variant]
          )}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

export function InlineSpinner({ 
  size = "sm", 
  variant = "default", 
  className 
}: Omit<LoadingSpinnerProps, "text" | "showText">) {
  return (
    <LoaderCircle 
      className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  );
}

export function FullPageLoader({ 
  text = "Loading...",
  showText = true 
}: Pick<LoadingSpinnerProps, "text" | "showText">) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner 
        size="xl" 
        variant="primary" 
        text={text}
        showText={showText}
      />
    </div>
  );
}

export function ButtonSpinner({ 
  size = "sm", 
  className 
}: Pick<LoadingSpinnerProps, "size" | "className">) {
  return (
    <InlineSpinner 
      size={size} 
      variant="secondary" 
      className={cn("mr-2", className)} 
    />
  );
}

export function CardLoader({ 
  text = "Loading content...",
  height = "h-32"
}: {
  text?: string;
  height?: string;
}) {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-lg border border-border bg-card",
      height
    )}>
      <LoadingSpinner 
        size="lg" 
        variant="muted" 
        text={text}
        showText={true}
      />
    </div>
  );
}

export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="h-12 bg-muted/50 rounded-md animate-pulse flex items-center justify-center"
        >
          {i === Math.floor(rows / 2) && (
            <InlineSpinner size="sm" variant="muted" />
          )}
        </div>
      ))}
    </div>
  );
}

export function FormLoader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner 
          size="lg" 
          variant="primary" 
          text="Loading form..."
          showText={true}
        />
      </div>
    </div>
  );
}

// Loading states for specific components
export function CalculatorLoader() {
  return (
    <div className="text-center py-12">
      <LoadingSpinner 
        size="xl" 
        variant="primary" 
        text="Calculating R&D tax credits..."
        showText={true}
      />
    </div>
  );
}

export function DocumentLoader() {
  return (
    <div className="text-center py-8">
      <LoadingSpinner 
        size="lg" 
        variant="primary" 
        text="Generating documents..."
        showText={true}
      />
    </div>
  );
}

export function PaymentLoader() {
  return (
    <div className="text-center py-8">
      <LoadingSpinner 
        size="lg" 
        variant="primary" 
        text="Processing payment..."
        showText={true}
      />
    </div>
  );
}

export function UploadLoader({ 
  progress, 
  fileName 
}: { 
  progress?: number; 
  fileName?: string; 
}) {
  return (
    <div className="text-center py-6 space-y-3">
      <LoadingSpinner 
        size="lg" 
        variant="primary" 
      />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {fileName ? `Uploading ${fileName}...` : "Uploading file..."}
        </p>
        {progress !== undefined && (
          <div className="w-48 mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}