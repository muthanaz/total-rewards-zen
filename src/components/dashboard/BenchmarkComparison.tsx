import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TrendingUp, TrendingDown, Minus, Building2, Award, Target } from 'lucide-react';
import { AnimatedRadarChart, AnimatedBarChart } from '@/components/charts';

interface BenchmarkData {
  category: string;
  yourValue: number;
  industryAvg: number;
  topPerformers: number;
  unit: string;
}

interface BenchmarkComparisonProps {
  data: BenchmarkData[];
  companyName?: string;
  industry?: string;
}

export function BenchmarkComparison({ 
  data, 
  companyName = 'Your Company',
  industry = 'Financial Services' 
}: BenchmarkComparisonProps) {
  // Transform data for radar chart
  const radarData = data.map(d => ({
    subject: d.category,
    value: d.yourValue,
    secondaryValue: d.industryAvg,
    fullMark: d.topPerformers,
  }));

  // Calculate overall score
  const overallScore = Math.round(
    data.reduce((sum, d) => sum + (d.yourValue / d.industryAvg) * 100, 0) / data.length
  );

  // Transform data for bar comparison
  const barData = data.map(d => ({
    name: d.category,
    value: d.yourValue,
    secondaryValue: d.industryAvg,
  }));

  const getBenchmarkStatus = (value: number, avg: number, top: number) => {
    const ratio = value / avg;
    if (ratio >= 1.1) return { status: 'above', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (ratio >= 0.9) return { status: 'at', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { status: 'below', color: 'text-rose-500', bg: 'bg-rose-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header with overall score */}
      <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-display font-semibold">Industry Benchmark</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Comparing {companyName} against {industry} standards
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-2xl font-bold text-accent">{overallScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </div>
              <div className="hidden md:block h-12 w-px bg-border" />
              <div className="flex gap-3">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {data.filter(d => d.yourValue >= d.industryAvg * 1.1).length} Above Avg
                </Badge>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  {data.filter(d => d.yourValue >= d.industryAvg * 0.9 && d.yourValue < d.industryAvg * 1.1).length} At Avg
                </Badge>
                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30">
                  {data.filter(d => d.yourValue < d.industryAvg * 0.9).length} Below Avg
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar Chart */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">Comparison Overview</CardTitle>
                <InfoTooltip 
                  formula="Your metrics vs industry average" 
                  dataSource="Industry Reports 2025"
                />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedRadarChart
                data={radarData}
                height={280}
                showSecondary={true}
                primaryLabel={companyName}
                secondaryLabel="Industry Avg"
              />
            </CardContent>
          </Card>
        </div>

        {/* Bar Comparison */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">Detailed Comparison</CardTitle>
                <InfoTooltip 
                  formula="Side-by-side metric comparison" 
                  dataSource="HR Analytics"
                />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedBarChart
                data={barData}
                layout="vertical"
                showSecondary={true}
                primaryLabel={companyName}
                secondaryLabel="Industry Avg"
                formatValue={(v) => `${v}%`}
                height={280}
                gradientId="benchmark"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((metric, index) => {
          const benchmark = getBenchmarkStatus(metric.yourValue, metric.industryAvg, metric.topPerformers);
          const diff = metric.yourValue - metric.industryAvg;
          const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;

          return (
            <Card 
              key={metric.category}
              className="group hover:border-accent/30 transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{metric.category}</h4>
                    <p className="text-2xl font-bold mt-1">
                      {metric.yourValue}{metric.unit}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${benchmark.status === 'above' ? 'bg-emerald-500/10' : benchmark.status === 'at' ? 'bg-amber-500/10' : 'bg-rose-500/10'}`}>
                    <TrendIcon className={`w-4 h-4 ${benchmark.color}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">vs Industry Avg</span>
                    <span className={`font-medium ${benchmark.color}`}>
                      {diff > 0 ? '+' : ''}{diff}{metric.unit}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${benchmark.bg}`}
                      style={{ width: `${Math.min(100, (metric.yourValue / metric.topPerformers) * 100)}%` }}
                    />
                    <div 
                      className="absolute inset-y-0 w-0.5 bg-foreground/50"
                      style={{ left: `${(metric.industryAvg / metric.topPerformers) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Industry: {metric.industryAvg}{metric.unit}</span>
                    <span>Top: {metric.topPerformers}{metric.unit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
