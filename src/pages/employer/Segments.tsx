/**
 * Employee Segments Page (Workforce Insights)
 * 
 * Upgraded segmentation workbench with:
 * - Segment dimension cards (Grade, Department, Nationality, Life Stage, Work Arrangement, Joiner Cohort)
 * - Drilldown tables with charts
 * - Insights drawer with actions connecting to Recommendations + Zombie Spend
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp,
  TrendingDown,
  Plus,
  AlertTriangle,
  ArrowLeft,
  Database,
  Lightbulb
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics 
} from '@/components/employer';
import { SegmentDimensionCard } from '@/components/employer/SegmentDimensionCard';
import { SegmentDrilldownTable } from '@/components/employer/SegmentDrilldownTable';
import { SegmentInsightsDrawer } from '@/components/employer/SegmentInsightsDrawer';
import { SegmentCharts } from '@/components/employer/SegmentCharts';
import { useSegmentData, SegmentDimensionId } from '@/hooks/useSegmentData';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { toast } from 'sonner';

// Prebuilt segment options for the dropdown
const PREBUILT_SEGMENTS = [
  { id: 'grade', label: 'Grade Bands' },
  { id: 'department', label: 'Departments' },
  { id: 'nationality', label: 'Nationality Type' },
  { id: 'life_stage', label: 'Life Stage' },
  { id: 'work_arrangement', label: 'Work Arrangement' },
  { id: 'joiner_cohort', label: 'Joiner Cohort' },
];

export default function SegmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const coverageMetrics = useDataCoverageMetrics();
  
  const {
    dimensions,
    selectedDimension,
    activeDimension,
    activeSegmentValue,
    segmentInsights,
    chartData,
    drawerOpen,
    summaryMetrics,
    selectDimension,
    selectSegmentValue,
    openInsightsDrawer,
    closeInsightsDrawer,
  } = useSegmentData();
  
  // Handle URL params for deep linking
  useEffect(() => {
    const dimParam = searchParams.get('dimension') as SegmentDimensionId | null;
    const valueParam = searchParams.get('value');
    
    if (dimParam && dimensions.find(d => d.id === dimParam)) {
      selectDimension(dimParam);
      if (valueParam) {
        setTimeout(() => openInsightsDrawer(valueParam), 100);
      }
    }
  }, []);
  
  // Update URL when dimension changes
  useEffect(() => {
    if (selectedDimension) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('dimension', selectedDimension);
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedDimension]);
  
  const handleDimensionSelect = (id: SegmentDimensionId) => {
    const dim = dimensions.find(d => d.id === id);
    if (dim && !dim.isAvailable) {
      toast.error('Low data coverage', {
        description: 'This segment requires more data. Improve HRIS mapping or Smart Profile fields.',
        action: {
          label: 'Improve data',
          onClick: () => navigate('/employer/integrations?view=exec'),
        },
      });
      return;
    }
    selectDimension(id);
  };
  
  const handleDropdownChange = (value: string) => {
    if (value === 'custom') {
      toast.info('Custom segments coming soon', {
        description: 'Build your own segment criteria with the upcoming Segment Builder',
      });
      return;
    }
    handleDimensionSelect(value as SegmentDimensionId);
  };
  
  const handleBackToOverview = () => {
    selectDimension(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('dimension');
    newParams.delete('value');
    setSearchParams(newParams, { replace: true });
  };
  
  // Available (high-coverage) dimensions
  const availableDimensions = dimensions.filter(d => d.isAvailable);
  const lowCoverageDimensions = dimensions.filter(d => !d.isAvailable);
  
  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Employee Segments</h1>
            <p className="text-muted-foreground">
              Understand usage, cost, and risk by workforce segment
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DataConfidenceBadge metrics={coverageMetrics} />
            <Select onValueChange={handleDropdownChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select segment..." />
              </SelectTrigger>
              <SelectContent>
                {PREBUILT_SEGMENTS.map(seg => {
                  const dim = dimensions.find(d => d.id === seg.id);
                  return (
                    <SelectItem key={seg.id} value={seg.id}>
                      <div className="flex items-center gap-2">
                        {seg.label}
                        {dim && !dim.isAvailable && (
                          <AlertTriangle className="h-3 w-3 text-warning" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Custom segment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Global Filters */}
        <EmployerGlobalFiltersBar showEmploymentType />
        
        {/* Drilldown View */}
        {activeDimension ? (
          <div className="space-y-6">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToOverview}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all segments
            </Button>
            
            {/* Charts */}
            <SegmentCharts dimension={activeDimension} />
            
            {/* Drilldown Table */}
            <SegmentDrilldownTable 
              dimension={activeDimension}
              onViewInsights={openInsightsDrawer}
            />
          </div>
        ) : (
          /* Overview: Segment Cards */
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatInteger(summaryMetrics.totalHeadcount)}</p>
                      <p className="text-sm text-muted-foreground">Total Employees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-success/10">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{formatPercent(summaryMetrics.avgUtilization)}</p>
                        <Progress value={summaryMetrics.avgUtilization} className="h-1.5 w-12" />
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Utilization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-warning/10">
                      <TrendingDown className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">
                        {formatCurrencyAED(summaryMetrics.totalUnusedEntitlement)}
                      </p>
                      <p className="text-sm text-muted-foreground">Unused Entitlement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10">
                      <Lightbulb className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{availableDimensions.length}</p>
                      <p className="text-sm text-muted-foreground">Available Segments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Segment Dimension Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Segment Dimensions
                  <InfoTooltip 
                    formula="Click a card to drill down" 
                    dataSource="profiles + benefit_entitlements" 
                  />
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {availableDimensions.length} of {dimensions.length} available
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDimensions.map((dim) => (
                  <SegmentDimensionCard
                    key={dim.id}
                    dimension={dim}
                    isSelected={selectedDimension === dim.id}
                    onClick={() => handleDimensionSelect(dim.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Low Coverage Dimensions */}
            {lowCoverageDimensions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-muted-foreground">Needs More Data</h2>
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Low coverage
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowCoverageDimensions.map((dim) => (
                    <SegmentDimensionCard
                      key={dim.id}
                      dimension={dim}
                      isSelected={false}
                      onClick={() => handleDimensionSelect(dim.id)}
                    />
                  ))}
                </div>
                
                {/* Data Confidence CTA */}
                <Card className="mt-4 border-dashed">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Improve data confidence</p>
                          <p className="text-xs text-muted-foreground">
                            Connect HRIS or improve Smart Profile fields to unlock more segments
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/employer/integrations?view=exec')}
                      >
                        Improve data confidence
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
        
        {/* Insights Drawer */}
        <SegmentInsightsDrawer
          open={drawerOpen}
          onOpenChange={closeInsightsDrawer}
          insights={segmentInsights}
          chartData={chartData}
          dimensionName={activeDimension?.name || ''}
        />
      </div>
    </PageConfidenceGate>
  );
}
