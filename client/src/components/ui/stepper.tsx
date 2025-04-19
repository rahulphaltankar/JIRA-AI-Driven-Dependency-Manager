import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepperProps {
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
  className?: string;
}

export function Stepper({
  activeStep,
  orientation = "horizontal",
  children,
  className,
}: StepperProps) {
  const steps = React.Children.toArray(children);
  
  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            index,
            active: activeStep === index,
            completed: activeStep > index,
            last: index === steps.length - 1,
            orientation,
          });
        }
        return child;
      })}
    </div>
  );
}

interface StepProps {
  children: React.ReactNode;
  completed?: boolean;
  className?: string;
  active?: boolean;
  index?: number;
  last?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function Step({
  children,
  completed,
  className,
  active,
  index,
  last,
  orientation = "horizontal",
}: StepProps) {
  const isActive = !!active;
  const isCompleted = !!completed;
  const isLast = !!last;

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col" : "flex-row items-center",
        !isLast && orientation === "horizontal" && "flex-1",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            active: isActive,
            completed: isCompleted,
            orientation,
          });
        }
        return child;
      })}
      
      {!isLast && orientation === "horizontal" && (
        <div
          className={cn(
            "h-[1px] w-full bg-border mx-2",
            isCompleted && "bg-primary"
          )}
        />
      )}
    </div>
  );
}

interface StepLabelProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  completed?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function StepLabel({
  children,
  className,
  active,
  completed,
  orientation = "horizontal",
}: StepLabelProps) {
  const isActive = !!active;
  const isCompleted = !!completed;
  
  return (
    <div
      className={cn(
        "flex items-center",
        orientation === "vertical" && "mb-2",
        className
      )}
    >
      <StepIcon active={isActive} completed={isCompleted} />
      <span
        className={cn(
          "ml-2 text-sm font-medium",
          isActive ? "text-primary" : "text-muted-foreground",
          isCompleted && "text-primary"
        )}
      >
        {children}
      </span>
    </div>
  );
}

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function StepContent({
  children,
  className,
  active,
  orientation = "vertical",
}: StepContentProps) {
  const isActive = !!active;
  
  if (orientation === "horizontal") {
    return null;
  }

  return isActive ? (
    <div
      className={cn(
        "ml-8 border-l pl-8 pb-8 border-border",
        className
      )}
    >
      {children}
    </div>
  ) : null;
}

export function StepIcon({
  active,
  completed,
}: {
  active?: boolean;
  completed?: boolean;
}) {
  const isActive = !!active;
  const isCompleted = !!completed;
  
  return (
    <div
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center border-2",
        isActive
          ? "border-primary bg-primary/10"
          : isCompleted
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground bg-background text-muted-foreground"
      )}
    >
      {isCompleted ? (
        <CheckIcon className="h-5 w-5" />
      ) : (
        <span className="text-sm font-medium">{isCompleted ? "✓" : ""}</span>
      )}
    </div>
  );
}