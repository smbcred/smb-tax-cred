import { useState, useEffect } from "react";
import { CheckCircle, Check, TrendingUp, CreditCard, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  variant?: "default" | "calculator" | "payment" | "document" | "download";
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  description?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16", 
  xl: "h-24 w-24"
};

const iconVariants = {
  default: CheckCircle,
  calculator: TrendingUp,
  payment: CreditCard,
  document: FileText,
  download: Download
};

export function SuccessAnimation({
  variant = "default",
  size = "lg",
  message = "Success!",
  description,
  duration = 3000,
  onComplete,
  className
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<"enter" | "stay" | "exit">("enter");
  
  const Icon = iconVariants[variant];

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase("stay");
    }, 300);

    const timer2 = setTimeout(() => {
      setAnimationPhase("exit");
    }, duration - 500);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center space-y-4 p-6",
      "transition-all duration-500 ease-out",
      animationPhase === "enter" && "opacity-0 scale-95 translate-y-4",
      animationPhase === "stay" && "opacity-100 scale-100 translate-y-0",
      animationPhase === "exit" && "opacity-0 scale-105 translate-y-2",
      className
    )}>
      {/* Icon with success animation */}
      <div className={cn(
        "relative",
        "transition-all duration-500 ease-out",
        animationPhase === "enter" && "scale-0 rotate-180",
        animationPhase === "stay" && "scale-100 rotate-0",
        animationPhase === "exit" && "scale-110"
      )}>
        <Icon className={cn(
          "text-green-500",
          sizeClasses[size],
          "transition-all duration-300"
        )} />
        
        {/* Ripple effect */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-green-500/30",
          "animate-ping",
          animationPhase === "stay" ? "opacity-100" : "opacity-0"
        )} />
      </div>

      {/* Text content */}
      <div className={cn(
        "space-y-2",
        "transition-all duration-500 delay-200 ease-out",
        animationPhase === "enter" && "opacity-0 translate-y-4",
        animationPhase === "stay" && "opacity-100 translate-y-0",
        animationPhase === "exit" && "opacity-0 translate-y-2"
      )}>
        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
          {message}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function CalculatorSuccessAnimation({ 
  creditAmount, 
  onComplete 
}: { 
  creditAmount: number; 
  onComplete?: () => void; 
}) {
  return (
    <SuccessAnimation
      variant="calculator"
      message="Calculation Complete!"
      description={`Estimated R&D tax credit: $${creditAmount.toLocaleString()}`}
      onComplete={onComplete}
    />
  );
}

export function PaymentSuccessAnimation({ 
  amount, 
  onComplete 
}: { 
  amount: number; 
  onComplete?: () => void; 
}) {
  return (
    <SuccessAnimation
      variant="payment"
      message="Payment Successful!"
      description={`Thank you for your payment of $${amount.toLocaleString()}`}
      onComplete={onComplete}
    />
  );
}

export function DocumentSuccessAnimation({ 
  documentCount = 1, 
  onComplete 
}: { 
  documentCount?: number; 
  onComplete?: () => void; 
}) {
  return (
    <SuccessAnimation
      variant="document"
      message="Documents Generated!"
      description={`${documentCount} document${documentCount !== 1 ? 's' : ''} ready for download`}
      onComplete={onComplete}
    />
  );
}

export function DownloadSuccessAnimation({ 
  fileName, 
  onComplete 
}: { 
  fileName?: string; 
  onComplete?: () => void; 
}) {
  return (
    <SuccessAnimation
      variant="download"
      message="Download Complete!"
      description={fileName ? `${fileName} downloaded successfully` : "File downloaded successfully"}
      duration={2000}
      onComplete={onComplete}
    />
  );
}

// Mini success checkmark for inline use
export function InlineSuccessCheck({ 
  className,
  size = "sm" 
}: { 
  className?: string; 
  size?: "sm" | "md"; 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20",
      size === "sm" ? "h-5 w-5" : "h-6 w-6",
      "transition-all duration-300 ease-out",
      isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0",
      className
    )}>
      <Check className={cn(
        "text-green-600 dark:text-green-400",
        size === "sm" ? "h-3 w-3" : "h-4 w-4"
      )} />
    </div>
  );
}

// Success toast content
export function SuccessToastContent({ 
  title, 
  description, 
  icon: CustomIcon 
}: { 
  title: string; 
  description?: string; 
  icon?: typeof CheckCircle; 
}) {
  const Icon = CustomIcon || CheckCircle;
  
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-5 w-5 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// Success banner for full-width notifications
export function SuccessBanner({ 
  message, 
  description, 
  onDismiss,
  className 
}: { 
  message: string; 
  description?: string; 
  onDismiss?: () => void;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4",
      "transition-all duration-300 ease-out",
      className
    )}>
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
            {message}
          </h4>
          {description && (
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {description}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-green-500 hover:text-green-600 transition-colors p-1"
            aria-label="Dismiss"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}