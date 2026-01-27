/**
 * Strategic Segments Analysis Page
 * 
 * Executive-grade workforce segmentation tool with:
 * - Strategic Header with health metrics
 * - Segment card view (left)
 * - Deep dive panel (right, sticky)
 * - Risk scoring and targeted actions
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Users, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Rocket,
  Target,
  Building2,
  Briefcase,
  Globe,
  UserPlus,
  MapPin,
  ArrowRight,
  MessageSquare,
  ThumbsDown,
  HeartHandshake,
  Scale,
  PieChart,
} from 'lucide-react';
import { 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics 
} from '@/components/employer';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';

// ============================================================================
// TYPES & DATA
// ============================================================================

interface SegmentData {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  headcount: number;
  totalSpend: number;
  utilizationRate: number;
  companyAvgUtilization: number;
  riskScore: 'high' | 'medium' | 'low';
  topBenefit: string;
  topComplaint: string;
  retentionRisk: number; // % of high performers with low satisfaction
}

// Demo segment data
const SEGMENTS: SegmentData[] = [
  {
    id: 'executives',
    name: 'Executives (Grade A)',
    description: 'C-suite and senior leadership',
    icon: Briefcase,
    headcount: 45,
    totalSpend: 2450000,
    utilizationRate: 52,
    companyAvgUtilization: 68,
    riskScore: 'high',
    topBenefit: 'Executive Health Check',
    topComplaint: 'Slow pre-approval process',
    retentionRisk: 28,
  },
  {
    id: 'new-joiners',
    name: 'New Joiners (<1 yr)',
    description: 'Employees in first year',
    icon: UserPlus,
    headcount: 85,
    totalSpend: 1820000,
    utilizationRate: 45,
    companyAvgUtilization: 68,
    riskScore: 'high',
    topBenefit: 'Relocation Allowance',
    topComplaint: 'Unclear eligibility rules',
    retentionRisk: 35,
  },
  {
    id: 'field-staff',
    name: 'Field Staff',
    description: 'Remote/site-based employees',
    icon: MapPin,
    headcount: 120,
    totalSpend: 2100000,
    utilizationRate: 58,
    companyAvgUtilization: 68,
    riskScore: 'medium',
    topBenefit: 'Transport Allowance',
    topComplaint: 'Portal access issues',
    retentionRisk: 18,
  },
  {
    id: 'expats',
    name: 'Expats',
    description: 'International assignees',
    icon: Globe,
    headcount: 65,
    totalSpend: 3200000,
    utilizationRate: 72,
    companyAvgUtilization: 68,
    riskScore: 'low',
    topBenefit: 'Housing Allowance',
    topComplaint: 'Dependent coverage limits',
    retentionRisk: 12,
  },
];

const riskConfig = {
  high: { label: 'High Risk', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  medium: { label: 'Medium Risk', className: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: 'Low Risk', className: 'bg-success/10 text-success border-success/30' },
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface SegmentCardProps {
  segment: SegmentData;
  isSelected: boolean;
  onClick: () => void;
}

function SegmentCard({ segment, isSelected, onClick }: SegmentCardProps) {
  const Icon = segment.icon;
  const risk = riskConfig[segment.riskScore];
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:border-accent/50 hover:shadow-md',
        isSelected && 'ring-2 ring-accent border-accent'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2.5 rounded-xl',
              isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted'
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{segment.name}</h3>
              <p className="text-xs text-muted-foreground">{segment.description}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs', risk.className)}>
            {risk.label}
          </Badge>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-2 rounded bg-muted/50 text-center">
            <p className="text-muted-foreground">Headcount</p>
            <p className="font-bold text-sm">{formatInteger(segment.headcount)}</p>
          </div>
          <div className="p-2 rounded bg-muted/50 text-center">
            <p className="text-muted-foreground">Total Spend</p>
            <p className="font-bold text-sm">{formatCurrencyAED(segment.totalSpend, { abbreviate: true })}</p>
          </div>
          <div className="p-2 rounded bg-muted/50 text-center">
            <p className="text-muted-foreground">Utilization</p>
            <p className={cn(
              "font-bold text-sm",
              segment.utilizationRate >= 70 ? 'text-success' :
              segment.utilizationRate >= 50 ? 'text-foreground' : 'text-warning'
            )}>
              {formatPercent(segment.utilizationRate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DeepDivePanelProps {
  segment: SegmentData | null;
  onLaunchCampaign: () => void;
}

function DeepDivePanel({ segment, onLaunchCampaign }: DeepDivePanelProps) {
  if (!segment) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
          <PieChart className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Select a Segment</h3>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Click on a segment card to view detailed analysis and take action
          </p>
        </CardContent>
      </Card>
    );
  }

  const Icon = segment.icon;
  const utilizationGap = segment.companyAvgUtilization - segment.utilizationRate;
  const isUnderperforming = utilizationGap > 0;
  
  return (
    <Card className="h-full sticky top-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">{segment.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{segment.headcount} employees</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Utilization Comparison */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Utilization Rate</span>
            <Badge variant={isUnderperforming ? 'destructive' : 'secondary'} className="text-xs">
              {isUnderperforming ? `${utilizationGap}% below avg` : `${Math.abs(utilizationGap)}% above avg`}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">This Segment</span>
              <span className={cn(
                "font-bold tabular-nums",
                segment.utilizationRate >= 70 ? 'text-success' :
                segment.utilizationRate >= 50 ? 'text-foreground' : 'text-warning'
              )}>
                {formatPercent(segment.utilizationRate)}
              </span>
            </div>
            <Progress value={segment.utilizationRate} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Company Average</span>
              <span className="font-semibold tabular-nums">{formatPercent(segment.companyAvgUtilization)}</span>
            </div>
            <Progress value={segment.companyAvgUtilization} className="h-2 opacity-50" />
          </div>
        </div>
        
        {/* Insights Grid */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-success/5 border-success/20">
            <Target className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Top Used Benefit</p>
              <p className="text-sm text-muted-foreground">{segment.topBenefit}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-warning/5 border-warning/20">
            <ThumbsDown className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Top Complaint</p>
              <p className="text-sm text-muted-foreground">{segment.topComplaint}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/5 border-destructive/20">
            <HeartHandshake className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Retention Risk</p>
              <p className="text-sm text-muted-foreground">
                {segment.retentionRisk}% high performers have low satisfaction
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <Button className="w-full gap-2" onClick={onLaunchCampaign}>
          <Rocket className="h-4 w-4" />
          Launch Targeted Campaign
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function SegmentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const coverageMetrics = useDataCoverageMetrics();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  
  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    // Retention Risk: High performers (Grade A, New Joiners) with low satisfaction
    const highRiskSegments = SEGMENTS.filter(s => s.riskScore === 'high');
    const retentionRiskCount = highRiskSegments.reduce((sum, s) => 
      sum + Math.round(s.headcount * (s.retentionRisk / 100)), 0
    );
    
    // Inequity Gap: Difference between HQ (expats) and Field Staff
    const hqUtilization = SEGMENTS.find(s => s.id === 'expats')?.utilizationRate || 72;
    const fieldUtilization = SEGMENTS.find(s => s.id === 'field-staff')?.utilizationRate || 58;
    const inequityGap = hqUtilization - fieldUtilization;
    
    return {
      retentionRiskCount,
      inequityGap,
      totalSegments: SEGMENTS.length,
    };
  }, []);
  
  const selectedSegment = SEGMENTS.find(s => s.id === selectedSegmentId) || null;
  
  // Handle deep link from URL params
  useEffect(() => {
    const segmentParam = searchParams.get('segment');
    if (segmentParam && SEGMENTS.find(s => s.id === segmentParam)) {
      setSelectedSegmentId(segmentParam);
    }
  }, [searchParams]);
  
  const handleLaunchCampaign = () => {
    if (selectedSegment) {
      navigate(`/employer/actions?create=true&source=segments&segment=${selectedSegment.id}`);
    }
  };
  
  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Strategic Segments Analysis</h1>
            <p className="text-muted-foreground">
              Identify high-risk and high-value employee groups
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DataConfidenceBadge metrics={coverageMetrics} />
          </div>
        </div>
        
        {/* Health Check Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elevated border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive tabular-nums">
                    {summaryMetrics.retentionRiskCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Retention Risk</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    High performers with low satisfaction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <Scale className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning tabular-nums">
                    {summaryMetrics.inequityGap}%
                  </p>
                  <p className="text-sm text-muted-foreground">Inequity Gap</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    HQ vs Remote/Site utilization difference
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {summaryMetrics.totalSegments}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Segments Tracked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Active workforce segments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content: Segment List + Deep Dive Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Segment Cards */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Employee Segments
              <InfoTooltip 
                formula="Click a segment to see detailed analysis" 
                dataSource="profiles + benefit_entitlements" 
              />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SEGMENTS.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  isSelected={selectedSegmentId === segment.id}
                  onClick={() => setSelectedSegmentId(segment.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Right: Deep Dive Panel */}
          <div className="lg:col-span-2">
            <DeepDivePanel 
              segment={selectedSegment}
              onLaunchCampaign={handleLaunchCampaign}
            />
          </div>
        </div>
      </div>
    </PageConfidenceGate>
  );
}
