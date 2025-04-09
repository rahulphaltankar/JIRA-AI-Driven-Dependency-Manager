import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusCardIconVariants = cva(
  "rounded-full bg-opacity-10",
  {
    variants: {
      type: {
        info: "bg-primary text-primary",
        warning: "bg-amber-500 text-amber-500",
        error: "bg-red-500 text-red-500",
        success: "bg-emerald-500 text-emerald-500",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

const statusChangeVariants = cva(
  "font-semibold",
  {
    variants: {
      trend: {
        positive: "text-emerald-600",
        negative: "text-red-600",
        neutral: "text-slate-600",
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
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={cn(statusCardIconVariants({ type }), "rounded-full p-3")}>
          <span className="material-icons text-xl">{icon}</span>
        </div>
      </div>
      <div className="mt-3 text-sm">
        <span className={cn(
          statusChangeVariants({ trend: trendDirection }),
          "flex items-center gap-1 font-medium"
        )}>
          <span className="material-icons text-sm">
            {trendDirection === "positive" ? "trending_up" : 
             trendDirection === "negative" ? "trending_down" : 
             "trending_flat"}
          </span>
          {change}
        </span>
      </div>
    </div>
  );
}
