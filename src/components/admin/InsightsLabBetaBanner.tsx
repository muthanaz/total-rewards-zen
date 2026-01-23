/**
 * Insights Lab Beta Banner
 * 
 * Displays a prominent beta notice for Insights Lab pages that depend on 
 * mock/placeholder or low-confidence data. Shows data requirements and
 * gates content when data is insufficient.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FlaskConical, 
  Database, 
  ArrowRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface InsightsLabBetaBannerProps {
  title: string;
  description: string;
  dataRequirements: string[];
  hasRealData?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function InsightsLabBetaBanner({
  title,
  description,
  dataRequirements,
  hasRealData = false,
  children,
  className,
}: InsightsLabBetaBannerProps) {
  const { isDemoMode } = useDemoMode();
  
  // In non-demo mode with no real data, show data requirements notice
  if (!isDemoMode && !hasRealData) {
    return (
      <div className={cn("space-y-6", className)}>
        <InsightsLabHeader title={title} description={description} />
        
        {/* Insufficient Data State */}
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Insufficient Data</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              This analytics view requires production data to display meaningful insights. Connect your data sources to unlock this feature.
            </p>
            <Link to="/admin/data-sources">
              <Button>
                Configure Data Sources
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-2">Data requirements for this view:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {dataRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show content with beta banner
  return (
    <div className={cn("space-y-6", className)}>
      <InsightsLabHeader title={title} description={description} />
      
      {/* Beta Banner */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FlaskConical className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Beta
                </Badge>
                <span className="text-sm font-medium">Insights Lab - Experimental Analytics</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isDemoMode 
                  ? "You're viewing demo data. Connect real data sources to see production insights."
                  : "This view is based on limited data. Insights may be incomplete or estimated."
                }
              </p>
            </div>
            <Link to="/admin/data-sources">
              <Button variant="outline" size="sm" className="gap-1.5">
                Improve Data
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

function InsightsLabHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
        <FlaskConical className="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display font-bold">{title}</h1>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
            Beta
          </Badge>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function InsightsLabBadge() {
  return (
    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs gap-1">
      <FlaskConical className="w-3 h-3" />
      Insights Lab
    </Badge>
  );
}
