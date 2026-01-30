/**
 * Benchmarks Page
 * 
 * Executive-ready benchmarking module with peer group definitions,
 * percentile bands, and gap explanations.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Building2,
  Activity,
  Timer,
  Download,
  RefreshCw,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandardPageHeader } from '@/components/shared';
import { useDataCoverageMetrics } from '@/components/employer';
import { DataTrustPanel } from '@/components/trust';
import { 
  BenchmarkCategorySection,
  BenchmarkMetadataCard,
  BENCHMARK_CATEGORIES,
  PEER_GROUP_DEFAULT,
  DATA_SOURCE_DEFAULT
} from '@/components/employer/benchmarks';

export default function Benchmarks() {
  const [activeTab, setActiveTab] = useState('all');
  const coverageMetrics = useDataCoverageMetrics();

  // Calculate overall benchmark position
  const allMetrics = BENCHMARK_CATEGORIES.flatMap(c => c.metrics);
  const avgPercentile = Math.round(
    allMetrics.reduce((sum, m) => sum + m.yourPercentile, 0) / allMetrics.length
  );
  
  const metricsAboveMedian = allMetrics.filter(m => m.yourPercentile > 50).length;
  const metricsBelowMedian = allMetrics.filter(m => m.yourPercentile <= 50).length;

  // Filter categories by tab
  const filteredCategories = activeTab === 'all' 
    ? BENCHMARK_CATEGORIES 
    : BENCHMARK_CATEGORIES.filter(c => c.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Standard Page Header - Executive variant */}
      <StandardPageHeader
        variant="executive"
        title="Benchmarks"
        titleAr="المقارنات المعيارية"
        helperText="Compare your benefits performance against industry peers with confidence indicators"
        helperTextAr="قارن أداء مزاياك بأقرانك في الصناعة مع مؤشرات الثقة"
        icon={BarChart3}
        iconClassName="from-accent to-accent/80 shadow-accent/25"
        lastUpdated={new Date()}
        secondaryActions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        }
      />

      {/* DATA TRUST PANEL */}
      <DataTrustPanel pageName="benchmarks" />

      {/* Summary Header */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              Overall Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">P{avgPercentile}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  avgPercentile > 50 
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-warning/10 text-warning border-warning/30'
                )}
              >
                {avgPercentile > 50 ? 'Above Median' : 'Below Median'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across {allMetrics.length} metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Above Median
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-success">
              {metricsAboveMedian}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Metrics performing well
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              Below Median
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-warning">
              {metricsBelowMedian}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Improvement opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" />
              Peer Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{PEER_GROUP_DEFAULT.sampleSize}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {PEER_GROUP_DEFAULT.industry} • {PEER_GROUP_DEFAULT.region}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Global Metadata (Compact) */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="py-3">
          <BenchmarkMetadataCard 
            peerGroup={PEER_GROUP_DEFAULT}
            dataSource={DATA_SOURCE_DEFAULT}
            confidence={{
              level: 'high',
              coveragePercent: 85,
              completenessPercent: 78,
              reason: 'Aggregated confidence across all benchmark categories',
            }}
            compact
          />
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              All Categories
            </TabsTrigger>
            <TabsTrigger value="total-rewards" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Total Rewards
            </TabsTrigger>
            <TabsTrigger value="utilization" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Utilization
            </TabsTrigger>
            <TabsTrigger value="operational" className="gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              Operational
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {filteredCategories.map((category, index) => (
            <BenchmarkCategorySection 
              key={category.id}
              category={category}
              defaultExpanded={index === 0}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Methodology Note */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Benchmark Methodology</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All benchmarks are derived from the {DATA_SOURCE_DEFAULT.name} conducted by {DATA_SOURCE_DEFAULT.provider}. 
                Data represents {PEER_GROUP_DEFAULT.sampleSize} organizations in the {PEER_GROUP_DEFAULT.industry} sector 
                across {PEER_GROUP_DEFAULT.region} ({PEER_GROUP_DEFAULT.countries.join(', ')}). 
                Percentile calculations use weighted averages normalized for company size ({PEER_GROUP_DEFAULT.headcountRange}). 
                Click any metric card to see detailed gap analysis and recommended actions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
