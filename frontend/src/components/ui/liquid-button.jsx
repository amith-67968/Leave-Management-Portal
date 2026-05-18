import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "text-foreground border border-border bg-card/25 shadow-lg hover:scale-105",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-8 text-lg",
        xxl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xxl",
    },
  }
);

const LiquidButton = React.forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <>
        {/* SVG Filter for the liquid glass effect */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <filter id="container-glass" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
              <feGaussianBlur in="noise" stdDeviation="2" result="blurredNoise" />
              <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="G" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="4" result="blurredDisplaced" />
              <feComposite in="SourceGraphic" in2="blurredDisplaced" operator="over" />
            </filter>
          </defs>
        </svg>

        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {/* Glass background layer with SVG filter applied */}
          <div 
            className="absolute inset-0 -z-10 bg-primary/5 dark:bg-primary/10 transition-transform duration-300 group-hover:scale-110"
            style={{ filter: 'url(#container-glass)' }}
          />

          {/* Refraction inset shadow layer */}
          <div 
            className="absolute inset-0 -z-10 rounded-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.4)] pointer-events-none mix-blend-overlay"
          />

          {children}
        </Comp>
      </>
    );
  }
);
LiquidButton.displayName = "LiquidButton";

export { LiquidButton, buttonVariants };
