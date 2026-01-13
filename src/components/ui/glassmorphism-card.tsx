import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassmorphismCardProps {
  variant?: "default" | "frosted" | "subtle" | "vibrant";
  gradient?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const variantStyles = {
  default: "bg-card/80 backdrop-blur-md border border-border/50",
  frosted: "bg-white/60 dark:bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10",
  subtle: "bg-card/60 backdrop-blur-sm border border-border/30",
  vibrant: "bg-gradient-to-br from-white/80 to-white/40 dark:from-card/60 dark:to-card/30 backdrop-blur-xl border border-white/30 dark:border-white/10",
};

const GlassmorphismCard = React.forwardRef<HTMLDivElement, GlassmorphismCardProps>(
  ({ className, variant = "default", gradient, hover = true, glow = false, delay = 0, children, onClick, style }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: delay * 0.05 }}
        className={cn(
          "rounded-xl shadow-lg",
          variantStyles[variant],
          hover && "transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-accent/30",
          glow && "shadow-glow",
          gradient,
          className
        )}
        onClick={onClick}
        style={style}
      >
        {children}
      </motion.div>
    );
  }
);

GlassmorphismCard.displayName = "GlassmorphismCard";

// Gradient mesh background component
interface GradientMeshBackgroundProps {
  category?: string;
  className?: string;
  children?: React.ReactNode;
}

const categoryGradients: Record<string, string> = {
  housing: "from-blue-500/10 via-indigo-500/5 to-purple-500/10",
  education: "from-violet-500/10 via-purple-500/5 to-fuchsia-500/10",
  health: "from-emerald-500/10 via-teal-500/5 to-cyan-500/10",
  transport: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
  rewards: "from-rose-500/10 via-pink-500/5 to-red-500/10",
  financial: "from-green-500/10 via-emerald-500/5 to-teal-500/10",
  wellbeing: "from-cyan-500/10 via-sky-500/5 to-blue-500/10",
  learning: "from-indigo-500/10 via-blue-500/5 to-violet-500/10",
  default: "from-accent/10 via-primary/5 to-accent/10",
};

export function GradientMeshBackground({ category = "default", className, children }: GradientMeshBackgroundProps) {
  const gradientClass = categoryGradients[category] || categoryGradients.default;
  
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Gradient mesh background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-80",
        gradientClass
      )} />
      {/* Subtle mesh pattern overlay */}
      <div className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, hsl(var(--accent) / 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, hsl(var(--chart-2) / 0.1) 0%, transparent 40%)`
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export { GlassmorphismCard };
