import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const benefits = [
  { name: 'Housing Allowance', icon: Home, value: 120000, utilized: 120000, route: '/employee/housing', description: 'Monthly housing allowance paid with salary' },
  { name: 'Schooling Allowance', icon: GraduationCap, value: 60000, utilized: 42000, route: '/employee/schooling', description: 'School fee coverage for dependents' },
  { name: 'Health Insurance', icon: Heart, value: 45000, utilized: 12500, route: '/employee/health', description: 'Comprehensive health coverage for family' },
  { name: 'Transport & Mobility', icon: Car, value: 39000, utilized: 33000, route: '/employee/transport', description: 'Monthly transport and flight tickets' },
  { name: 'Wellbeing Program', icon: Dumbbell, value: 6000, utilized: 3200, route: '/employee/wellbeing', description: 'Gym membership and wellness apps' },
  { name: 'Learning & Development', icon: BookOpen, value: 12000, utilized: 4500, route: '/employee/learning', description: 'Professional courses and certifications' },
];

export default function BenefitsPage() {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
  const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
  const overallUtilization = Math.round((totalUtilized / totalValue) * 100);

  // Determine status styling based on utilization
  const getStatusStyle = (utilization: number) => {
    if (utilization >= 100) return { badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', progress: '[&>div]:bg-emerald-500' };
    if (utilization >= 50) return { badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20', progress: '[&>div]:bg-blue-500' };
    if (utilization >= 20) return { badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', progress: '[&>div]:bg-amber-500' };
    return { badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20', progress: '[&>div]:bg-slate-400' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold">All Benefits</h1>
        <p className="text-muted-foreground">
          {benefits.length} benefits • {formatCurrency(totalValue)} total value • {overallUtilization}% utilized
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-emerald-600">{benefits.filter(b => (b.utilized / b.value) >= 0.8).length}</span>
            </div>
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">Fully Utilized</p>
              <p className="text-xs text-muted-foreground">Benefits at 80%+</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">{benefits.filter(b => (b.utilized / b.value) >= 0.3 && (b.utilized / b.value) < 0.8).length}</span>
            </div>
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-400">On Track</p>
              <p className="text-xs text-muted-foreground">Benefits 30-79%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-600">{formatCurrency(totalValue - totalUtilized)}</span>
            </div>
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400">Available</p>
              <p className="text-xs text-muted-foreground">Remaining to use</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Benefits Grid - 2 rows x 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit, index) => {
          const utilization = Math.round((benefit.utilized / benefit.value) * 100);
          const remaining = benefit.value - benefit.utilized;
          const isFullyUsed = utilization >= 100;
          const status = getStatusStyle(utilization);
          
          return (
            <Card 
              key={benefit.name} 
              className="group cursor-pointer bg-card border border-border/60 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 overflow-hidden"
              onClick={() => navigate(benefit.route)} 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-5">
                {/* Header: Icon + Name */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-all duration-300 shrink-0">
                    <benefit.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-foreground group-hover:text-accent transition-colors leading-tight">
                        {benefit.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {benefit.description}
                    </p>
                  </div>
                </div>
                
                {/* Stats section */}
                <div className="mt-5 space-y-3">
                  {/* Value and status */}
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-2xl font-bold text-foreground tracking-tight">
                        {formatCurrency(benefit.value)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Annual Value
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn("text-xs px-2.5 py-1 font-medium border", status.badge)}
                    >
                      {utilization}%
                    </Badge>
                  </div>
                  
                  {/* Progress bar */}
                  <Progress 
                    value={utilization} 
                    className={cn("h-2 bg-muted/40 rounded-full", status.progress)}
                  />
                  
                  {/* Usage details */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatCurrency(benefit.utilized)} used
                    </span>
                    <span className={cn("font-medium", remaining > 0 ? "text-accent" : "text-emerald-600")}>
                      {remaining > 0 
                        ? `${formatCurrency(remaining)} remaining`
                        : 'Complete'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
