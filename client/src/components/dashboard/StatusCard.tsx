import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusCardIconVariants = cva(
  "rounded-full p-2 bg-opacity-20",
  {
    variants: {
      type: {
        info: "bg-info text-info",
        warning: "bg-warning text-warning",
        error: "bg-error text-error",
        success: "bg-success text-success",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

const statusChangeVariants = cva(
  "font-medium",
  {
    variants: {
      trend: {
        positive: "text-success",
        negative: "text-error",
        neutral: "text-gray-500",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

interface StatusCardProps extends VariantProps<typeof statusCardIconVariants> {
  title: string;
  value: string | number;
  change: string;
  icon: string;
  trendDirection?: "positive" | "negative" | "neutral";
}

export default function StatusCard({ 
  title, 
  value, 
  change, 
  icon, 
  type,
  trendDirection = "neutral"
}: StatusCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-semibold">{value}</h3>
        </div>
        <div className={cn(statusCardIconVariants({ type }))}>
          <span className="material-icons">{icon}</span>
        </div>
      </div>
      <div className="mt-2 text-sm">
        <span className={cn(statusChangeVariants({ trend: trendDirection }))}>
          {change}
        </span>
      </div>
    </div>
  );
}
