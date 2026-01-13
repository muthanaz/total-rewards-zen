import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "accent" | "success" | "warning" | "destructive" | "primary";
  bgOpacity?: number;
  animationDuration?: number;
  children?: React.ReactNode;
}

const colorClasses = {
  accent: "stroke-accent",
  success: "stroke-emerald-500",
  warning: "stroke-amber-500",
  destructive: "stroke-destructive",
  primary: "stroke-primary",
};

const bgColorClasses = {
  accent: "stroke-accent/20",
  success: "stroke-emerald-500/20",
  warning: "stroke-amber-500/20",
  destructive: "stroke-destructive/20",
  primary: "stroke-primary/20",
};

export function AnimatedProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  className,
  showPercentage = true,
  color = "accent",
  bgOpacity = 0.2,
  animationDuration = 1,
  children,
}: AnimatedProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={bgColorClasses[color]}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorClasses[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: animationDuration,
            ease: "easeOut",
            delay: 0.2,
          }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : showPercentage ? (
          <motion.span
            className="text-sm font-semibold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {Math.round(clampedValue)}%
          </motion.span>
        ) : null}
      </div>
    </div>
  );
}

// Mini version for inline use
interface MiniProgressRingProps {
  value: number;
  size?: number;
  color?: "accent" | "success" | "warning" | "destructive" | "primary";
}

export function MiniProgressRing({ value, size = 24, color = "accent" }: MiniProgressRingProps) {
  return (
    <AnimatedProgressRing
      value={value}
      size={size}
      strokeWidth={3}
      showPercentage={false}
      color={color}
      animationDuration={0.6}
    />
  );
}
