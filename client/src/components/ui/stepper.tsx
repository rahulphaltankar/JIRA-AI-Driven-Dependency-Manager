import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepperProps {
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
  className?: string;
}

interface StepProps {
  children: React.ReactNode;
  completed?: boolean;
  className?: string;
}

interface StepLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Stepper({
  activeStep,
  orientation = "horizontal",
  children,
  className,
}: StepperProps) {
  const childrenArray = React.Children.toArray(children);
  const steps = childrenArray.map((child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        completed: index < activeStep,
      });
    }
    return child;
  });

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col gap-1" : "flex-row gap-4",
        className
      )}
    >
      {steps}
    </div>
  );
}

export function Step({ children, completed, className }: StepProps) {
  return (
    <div
      className={cn(
        "flex flex-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StepLabel({ children, className }: StepLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 my-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StepContent({ children, className }: StepContentProps) {
  return (
    <div
      className={cn(
        "ml-7 border-l pl-6 py-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StepIcon({ active, completed }: { active: boolean, completed: boolean }) {
  return (
    <div
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center border-2",
        {
          "bg-primary text-primary-foreground border-primary": active,
          "bg-muted text-muted-foreground border-muted": !active && !completed,
          "bg-primary/20 text-primary border-primary": !active && completed,
        }
      )}
    >
      {completed ? (
        <CheckIcon className="h-5 w-5" />
      ) : (
        <div className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
    </div>
  );
}