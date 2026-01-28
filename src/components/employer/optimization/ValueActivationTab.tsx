/**
 * Value Activation Tab - The CHRO View
 * 
 * Focus: Unused value, adoption barriers, employee comms triggers
 * Outputs: Utilization lift potential, Segment targets, Suggested comms
 * Action: "Simulate" (primary) + "Create Action"
 * Value Proposition: "Maximize Benefit Awareness"
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Users, 
  TrendingUp,
  Eye,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { ValueActivationItem } from './types';
import { OptimizationRecommendationCard, OptimizationRecommendation } from './OptimizationRecommendationCard';
import { TabDefinitionBanner } from './TabDefinitionBanner';

interface ValueActivationTabProps {
  items: ValueActivationItem[];
  totalUnutilizedMin: number;
  totalUnutilizedMax: number;
  onSimulate: (item: ValueActivationItem) => void;
  onCreateAction: (item: ValueActivationItem) => void;
  onLaunchCampaign?: (item: ValueActivationItem) => void; // Legacy support
}

// Transform ValueActivationItem to OptimizationRecommendation
function toRecommendation(item: ValueActivationItem): OptimizationRecommendation {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    impactMin: item.unutilizedValueMin,
    impactMax: item.unutilizedValueMax,
    confidence: item.awareness === 'low' ? 'high' : item.awareness === 'medium' ? 'medium' : 'low',
    mechanism: item.mechanism,
    riskDownside: item.riskDownside,
    type: 'value_activation',
    rootCause: `${formatPercent(item.adoptionRate)} adoption`,
    affectedHeadcount: item.eligibleCount - item.claimantCount,
  };
}

export function ValueActivationTab({ 
  items, 
  totalUnutilizedMin,
  totalUnutilizedMax,
  onSimulate,
  onCreateAction,
  onLaunchCampaign,
}: ValueActivationTabProps) {
  // Calculate aggregate stats
  const avgAdoption = items.length > 0 
    ? items.reduce((sum, i) => sum + i.adoptionRate, 0) / items.length 
    : 0;
  const totalEligible = items.reduce((sum, i) => sum + i.eligibleCount, 0);
  const totalClaimants = items.reduce((sum, i) => sum + i.claimantCount, 0);

  const handleSimulate = (rec: OptimizationRecommendation) => {
    const item = items.find(i => i.id === rec.id);
    if (item) onSimulate(item);
  };

  const handleCreateAction = (rec: OptimizationRecommendation) => {
    const item = items.find(i => i.id === rec.id);
    if (item) onCreateAction(item);
  };

  return (
    <div className="space-y-6">
      {/* Tab Definition Banner */}
      <TabDefinitionBanner tab="value_activation" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-info" />
              <span className="text-sm text-muted-foreground">Benefits Under 20%</span>
            </div>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Average Adoption</p>
            <p className="text-2xl font-bold text-warning">{formatPercent(avgAdoption)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Eligible Employees</p>
            <p className="text-2xl font-bold">{totalEligible}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Currently Claiming</p>
            <p className="text-2xl font-bold">{totalClaimants}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Low-Adoption Benefits
                <InfoTooltip 
                  formula="(Employees with ≥1 claim / Eligible) × 100" 
                  dataSource="benefit_entitlements + requests" 
                />
              </CardTitle>
              <CardDescription>
                Benefits under 20% participation. Click "Simulate" to model awareness campaigns.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {formatCurrencyAED(totalUnutilizedMin, { abbreviate: true })} – {formatCurrencyAED(totalUnutilizedMax, { abbreviate: true })} unutilized
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>All benefits have healthy adoption rates (&gt;20%)</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {items.map((item) => (
                <OptimizationRecommendationCard
                  key={item.id}
                  recommendation={toRecommendation(item)}
                  onSimulate={handleSimulate}
                  onCreateAction={handleCreateAction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
