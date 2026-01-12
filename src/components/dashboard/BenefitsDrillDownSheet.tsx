import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, CheckCircle, TrendingUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Benefit {
  name: string;
  icon: LucideIcon;
  value: number;
  utilized: number;
  route: string;
  type: string;
}

interface BenefitsDrillDownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: 'fully-utilized' | 'room-to-use' | null;
  benefits: Benefit[];
}

export function BenefitsDrillDownSheet({ 
  open, 
  onOpenChange, 
  category, 
  benefits 
}: BenefitsDrillDownSheetProps) {
  const navigate = useNavigate();
  
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  // Filter and sort benefits based on category
  const filteredBenefits = benefits
    .map(b => ({
      ...b,
      utilization: Math.round((b.utilized / b.value) * 100),
      remaining: b.value - b.utilized,
    }))
    .filter(b => {
      if (category === 'fully-utilized') return b.utilization >= 100;
      if (category === 'room-to-use') return b.utilization < 100;
      return true;
    })
    .sort((a, b) => {
      if (category === 'fully-utilized') {
        // Sort by value (highest first)
        return b.value - a.value;
      }
      // For room-to-use, sort by remaining amount (highest potential first)
      return b.remaining - a.remaining;
    });

  const handleBenefitClick = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  const isFullyUtilized = category === 'fully-utilized';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              isFullyUtilized ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            )} />
            <SheetTitle className={cn(
              "font-display",
              isFullyUtilized ? "text-emerald-600" : "text-amber-600"
            )}>
              {isFullyUtilized ? 'Fully Utilized Benefits' : 'Benefits with Room to Use'}
            </SheetTitle>
          </div>
          <SheetDescription>
            {isFullyUtilized 
              ? 'These benefits have been completely utilized for this period. Great job maximizing your benefits!'
              : 'These benefits have remaining allocation. Click any benefit to learn more and utilize it.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {filteredBenefits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No benefits in this category</p>
            </div>
          ) : (
            filteredBenefits.map((benefit, index) => (
              <div
                key={benefit.name}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all duration-200 group",
                  "hover:shadow-md hover:scale-[1.01]",
                  isFullyUtilized 
                    ? "bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40"
                    : "bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleBenefitClick(benefit.route)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2.5 rounded-lg transition-colors shrink-0",
                    isFullyUtilized 
                      ? "bg-emerald-500/10 group-hover:bg-emerald-500/20"
                      : "bg-amber-500/10 group-hover:bg-amber-500/20"
                  )}>
                    <benefit.icon className={cn(
                      "w-5 h-5",
                      isFullyUtilized ? "text-emerald-600" : "text-amber-600"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-sm group-hover:text-foreground transition-colors">
                        {benefit.name}
                      </h3>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-all opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0",
                        isFullyUtilized ? "text-emerald-500" : "text-amber-500"
                      )} />
                    </div>
                    
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {isFullyUtilized ? 'Total Value' : 'Available'}
                        </span>
                        <span className="font-semibold">
                          {isFullyUtilized 
                            ? formatCurrency(benefit.value)
                            : formatCurrency(benefit.remaining)
                          }
                        </span>
                      </div>
                      
                      <Progress 
                        value={benefit.utilization} 
                        className={cn(
                          "h-1.5",
                          isFullyUtilized 
                            ? "[&>div]:bg-emerald-500" 
                            : "[&>div]:bg-amber-500"
                        )}
                      />
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground">
                          {formatCurrency(benefit.utilized)} / {formatCurrency(benefit.value)}
                        </span>
                        <span className={cn(
                          "font-medium flex items-center gap-1",
                          isFullyUtilized ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {isFullyUtilized ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              100%
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              {benefit.utilization}%
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        <div className={cn(
          "mt-6 p-4 rounded-xl border",
          isFullyUtilized 
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-amber-500/5 border-amber-500/20"
        )}>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {isFullyUtilized ? 'Total Utilized' : 'Total Available'}
            </span>
            <span className={cn(
              "font-bold",
              isFullyUtilized ? "text-emerald-600" : "text-amber-600"
            )}>
              {formatCurrency(
                isFullyUtilized
                  ? filteredBenefits.reduce((sum, b) => sum + b.value, 0)
                  : filteredBenefits.reduce((sum, b) => sum + b.remaining, 0)
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isFullyUtilized 
              ? `${filteredBenefits.length} benefit${filteredBenefits.length !== 1 ? 's' : ''} fully utilized`
              : `${filteredBenefits.length} benefit${filteredBenefits.length !== 1 ? 's' : ''} with remaining allocation`
            }
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
