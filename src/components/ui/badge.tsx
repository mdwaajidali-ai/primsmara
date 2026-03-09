import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold font-display uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.3)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-[0_0_10px_hsl(var(--destructive)/0.3)]",
        outline: 
          "border-primary/50 text-primary bg-primary/10",
        common:
          "border-transparent bg-muted text-muted-foreground",
        uncommon:
          "border-transparent bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
        rare:
          "border-transparent bg-blue-500/20 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]",
        legendary:
          "border-transparent bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.4)]",
        mythic:
          "border-transparent bg-primary/20 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
