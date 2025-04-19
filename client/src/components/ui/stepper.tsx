import React, { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
  className?: string;
}

interface StepProps {
  children: ReactNode;
  completed?: boolean;
  className?: string;
  active?: boolean;
  index?: number;
  last?: boolean;
  orientation?: "horizontal" | "vertical";
}

interface StepLabelProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  completed?: boolean;
  orientation?: "horizontal" | "vertical";
}

interface StepContentProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  orientation?: "horizontal" | "vertical";
}

interface StepIconProps {
  active?: boolean;
  completed?: boolean;
}

export function Stepper({
  activeStep,
  orientation = "horizontal",
  children,
  className,
}: StepperProps) {
  const [steps, setSteps] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const filteredSteps = React.Children.toArray(children).filter(
      (step) => React.isValidElement(step) && step.type === Step
    ) as React.ReactElement[];

    const updatedSteps = filteredSteps.map((step, index) => {
      return React.cloneElement(step, {
        index,
        active: index === activeStep,
        completed: index < activeStep,
        last: index === filteredSteps.length - 1,
        orientation,
      });
    });

    setSteps(updatedSteps);
  }, [children, activeStep, orientation]);

  return (
    <div
      className={cn(
        orientation === "vertical" 
          ? "flex flex-col space-y-1" 
          : "flex items-center",
        className
      )}
    >
      {steps}
    </div>
  );
}

export function Step({
  children,
  active,
  completed,
  className,
  index,
  last,
  orientation = "horizontal",
}: StepProps) {
  const childrenArray = React.Children.toArray(children);

  const stepLabel = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === StepLabel
  );

  const stepContent = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === StepContent
  );

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col" : "items-center",
        className
      )}
    >
      <div className={cn(
        "flex",
        orientation === "vertical" ? "items-start" : "flex-col items-center"
      )}>
        {React.isValidElement(stepLabel) &&
          React.cloneElement(stepLabel, {
            active,
            completed,
            orientation,
          })}
        
        {!last && orientation === "horizontal" && (
          <div
            className={cn(
              "w-20 h-[1px] mx-2",
              completed ? "bg-primary" : "bg-border"
            )}
          />
        )}
      </div>

      {React.isValidElement(stepContent) &&
        React.cloneElement(stepContent, {
          active,
          orientation,
        })}

      {!last && orientation === "vertical" && (
        <div
          className={cn(
            "w-[1px] h-10 ml-4 my-1",
            completed ? "bg-primary" : "bg-border"
          )}
        />
      )}
    </div>
  );
}

export function StepLabel({
  children,
  active,
  completed,
  className,
  orientation = "horizontal",
}: StepLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        orientation === "vertical" ? "mb-2" : "flex-col",
        className
      )}
    >
      <div className="flex items-center">
        <StepIcon active={active} completed={completed} />
        <span
          className={cn(
            "text-sm font-medium ml-2",
            active ? "text-primary" : completed ? "text-primary" : "text-muted-foreground"
          )}
        >
          {children}
        </span>
      </div>
    </div>
  );
}

export function StepContent({
  children,
  active,
  className,
  orientation = "horizontal",
}: StepContentProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        orientation === "vertical" ? "ml-4 pl-4 border-l border-border" : "mt-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StepIcon({ active, completed }: StepIconProps) {
  if (completed) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full border-2",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted-foreground/30 text-muted-foreground"
      )}
    >
      {active ? (
        <div className="w-2 h-2 rounded-full bg-primary" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
      )}
    </div>
  );
}