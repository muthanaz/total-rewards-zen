/**
 * WhatChangedPanel - Top 3 drivers of variance
 * 
 * Shows what changed vs prior period with links to source (segments/policies)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Users,
  FileText,
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface VarianceDriver {
  id: string;
  name: string;
  type: 'benefit' | 'segment' | 'policy';
  change: number; // AED change
  changePercent: number;
  explanation: string;
  sourceLink: string;
  severity: 'high' | 'medium' | 'low';
}

interface WhatChangedPanelProps {
  drivers: VarianceDriver[];
  periodLabel?: string;
}

export function WhatChangedPanel({ 
  drivers, 
  periodLabel = 'vs Prior Period' 
}: WhatChangedPanelProps) {
  const navigate = useNavigate();
  
  // Take top 3 drivers
  const topDrivers = drivers.slice(0, 3);

  const getTypeIcon = (type: VarianceDriver['type']) => {
    switch (type) {
      case 'benefit': return Sparkles;
      case 'segment': return Users;
      case 'policy': return FileText;
    }
  };

  const getSeverityStyle = (severity: VarianceDriver['severity']) => {
    switch (severity) {
      case 'high': return 'border-destructive/30 bg-destructive/5';
      case 'medium': return 'border-warning/30 bg-warning/5';
      case 'low': return 'border-muted';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            What Changed
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal">
            {periodLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topDrivers.map((driver, index) => {
          const isIncrease = driver.change > 0;
          const TypeIcon = getTypeIcon(driver.type);
          
          return (
            <div
              key={driver.id}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                getSeverityStyle(driver.severity)
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    isIncrease ? "bg-destructive/10" : "bg-success/10"
                  )}>
                    {isIncrease ? (
                      <TrendingUp className="w-4 h-4 text-destructive" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-success" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{driver.name}</h4>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {driver.type}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {driver.explanation}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn(
                        "text-sm font-semibold tabular-nums",
                        isIncrease ? "text-destructive" : "text-success"
                      )}>
                        {isIncrease ? '+' : ''}{formatCurrencyAED(driver.change, { abbreviate: true })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({isIncrease ? '+' : ''}{driver.changePercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 px-2 gap-1 text-xs"
                  onClick={() => navigate(driver.sourceLink)}
                >
                  View
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {topDrivers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No significant changes detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
