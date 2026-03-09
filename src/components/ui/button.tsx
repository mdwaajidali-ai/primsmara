import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-display",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] border border-primary/30",
        destructive:
          "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-[0_0_20px_hsl(var(--destructive)/0.4)] hover:shadow-[0_0_30px_hsl(var(--destructive)/0.6)] hover:scale-[1.02] active:scale-[0.98] border border-destructive/30",
        outline:
          "border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
        secondary:
          "bg-secondary/80 text-secondary-foreground border border-border hover:bg-secondary hover:border-primary/30 hover:shadow-[0_0_10px_hsl(var(--primary)/0.2)]",
        ghost:
          "hover:bg-accent/50 hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        premium:
          "relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_40px_rgba(234,179,8,0.7)] hover:scale-[1.03] active:scale-[0.98] border border-yellow-300/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        mythic:
          "relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] hover:scale-[1.03] active:scale-[0.98] border border-purple-400/50 animate-pulse",
      },
      size: {
        default: "h-11 px-6 py-2 rounded-lg",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
