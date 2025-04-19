import { ReactNode } from "react";

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

export declare function Stepper(props: StepperProps): JSX.Element;
export declare function Step(props: StepProps): JSX.Element;
export declare function StepLabel(props: StepLabelProps): JSX.Element;
export declare function StepContent(props: StepContentProps): JSX.Element;
export declare function StepIcon(props: StepIconProps): JSX.Element;