/**
 * Benchmark Category Section
 * 
 * Groups related benchmark metrics with shared metadata.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Activity, 
  Timer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BenchmarkCategory, BenchmarkMetric } from './types';
import { BenchmarkMetadataCard } from './BenchmarkMetadataCard';
import { PercentileBandChart } from './PercentileBandChart';
import { ExplainTheGapPanel } from './ExplainTheGapPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BenchmarkCategorySectionProps {
  category: BenchmarkCategory;
  defaultExpanded?: boolean;
}

const iconMap: Record<string, typeof DollarSign> = {
  DollarSign,
  Activity,
  Timer,
};

export function BenchmarkCategorySection({ 
  category, 
  defaultExpanded = true 
}: BenchmarkCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedMetric, setSelectedMetric] = useState<BenchmarkMetric | null>(null);
  
  const Icon = iconMap[category.icon] || Activity;

  const handleMetricClick = (metric: BenchmarkMetric) => {
    setSelectedMetric(selectedMetric?.key === metric.key ? null : metric);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-accent/10">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                {category.name}
              </CardTitle>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Metadata Card */}
            <BenchmarkMetadataCard 
              peerGroup={category.peerGroup}
              dataSource={category.dataSource}
              confidence={category.confidence}
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.metrics.map((metric) => (
                <PercentileBandChart
                  key={metric.key}
                  metric={metric}
                  onClick={() => handleMetricClick(metric)}
                  isSelected={selectedMetric?.key === metric.key}
                />
              ))}
            </div>

            {/* Explain the Gap Panel */}
            {selectedMetric && (
              <ExplainTheGapPanel 
                metric={selectedMetric}
                onClose={() => setSelectedMetric(null)}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
