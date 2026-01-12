import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface ChartContainerProps {
  title: string;
  formula?: string;
  dataSource?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartContainer({ 
  title, 
  formula, 
  dataSource, 
  children, 
  className = '',
  action
}: ChartContainerProps) {
  return (
    <Card className={`overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/80 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-semibold flex items-center gap-2 text-foreground">
            {title}
            {formula && <InfoTooltip formula={formula} dataSource={dataSource} />}
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
