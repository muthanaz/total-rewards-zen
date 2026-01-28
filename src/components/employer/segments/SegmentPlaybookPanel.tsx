/**
 * Segment Playbook Panel
 * 
 * Shows recommended interventions for flagged segments:
 * - Policy tweak
 * - Education comms
 * - Vendor offer
 * - Workflow change
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileEdit, 
  Mail, 
  Gift, 
  Settings2, 
  ChevronRight, 
  Lightbulb,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BehavioralGapType, SegmentMetrics } from './types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface InterventionType {
  id: 'policy_tweak' | 'education_comms' | 'vendor_offer' | 'workflow_change';
  label: string;
  description: string;
  icon: React.ElementType;
  priority: 'high' | 'medium' | 'low';
  route: string;
}

// Define intervention recommendations per behavioral gap
const INTERVENTIONS: Record<BehavioralGapType, InterventionType[]> = {
  'low-engagement': [
    {
      id: 'education_comms',
      label: 'Education Comms',
      description: 'Launch awareness campaign to explain benefit value and how to claim',
      icon: Mail,
      priority: 'high',
      route: '/employer/communications?template=awareness',
    },
    {
      id: 'workflow_change',
      label: 'Workflow Change',
      description: 'Simplify claiming process to reduce friction barriers',
      icon: Settings2,
      priority: 'medium',
      route: '/employer/policies?focus=workflow',
    },
    {
      id: 'vendor_offer',
      label: 'Vendor Offer',
      description: 'Partner with providers for special onboarding offers',
      icon: Gift,
      priority: 'low',
      route: '/employer/vendors?action=new-offer',
    },
  ],
  'concentrated-spend': [
    {
      id: 'policy_tweak',
      label: 'Policy Tweak',
      description: 'Review eligibility rules to improve benefit equity',
      icon: FileEdit,
      priority: 'high',
      route: '/employer/policies?action=review',
    },
    {
      id: 'education_comms',
      label: 'Education Comms',
      description: 'Target under-utilizing groups with personalized guidance',
      icon: Mail,
      priority: 'high',
      route: '/employer/communications?template=targeted',
    },
    {
      id: 'workflow_change',
      label: 'Workflow Change',
      description: 'Add pre-approval nudges to prevent budget concentration',
      icon: Settings2,
      priority: 'medium',
      route: '/employer/policies?focus=approval',
    },
  ],
  'high-engagement-low-cost': [
    {
      id: 'vendor_offer',
      label: 'Vendor Offer',
      description: 'Negotiate volume discounts with popular providers',
      icon: Gift,
      priority: 'high',
      route: '/employer/vendors?action=negotiate',
    },
    {
      id: 'policy_tweak',
      label: 'Policy Tweak',
      description: 'Consider expanding this benefit category',
      icon: FileEdit,
      priority: 'medium',
      route: '/employer/policies?action=expand',
    },
  ],
  'balanced': [
    {
      id: 'workflow_change',
      label: 'Workflow Change',
      description: 'Maintain current approach, focus on operational efficiency',
      icon: Settings2,
      priority: 'low',
      route: '/employer/ops',
    },
  ],
};

const priorityConfig = {
  high: { className: 'bg-destructive/10 text-destructive border-destructive/30', label: 'High' },
  medium: { className: 'bg-warning/10 text-warning border-warning/30', label: 'Med' },
  low: { className: 'bg-muted text-muted-foreground', label: 'Low' },
};

const gapConfig: Record<BehavioralGapType, { icon: React.ElementType; color: string; label: string }> = {
  'low-engagement': { icon: TrendingUp, color: 'text-destructive', label: 'Low Engagement' },
  'concentrated-spend': { icon: AlertTriangle, color: 'text-warning', label: 'Concentrated Spend' },
  'high-engagement-low-cost': { icon: CheckCircle, color: 'text-success', label: 'High Engagement' },
  'balanced': { icon: Target, color: 'text-primary', label: 'Balanced' },
};

interface SegmentPlaybookPanelProps {
  metrics: SegmentMetrics;
  segmentName?: string;
  className?: string;
}

export function SegmentPlaybookPanel({ 
  metrics, 
  segmentName,
  className,
}: SegmentPlaybookPanelProps) {
  const navigate = useNavigate();
  const interventions = INTERVENTIONS[metrics.behavioralGap];
  const gapInfo = gapConfig[metrics.behavioralGap];
  const GapIcon = gapInfo.icon;
  
  // Don't show for balanced segments with no specific recommendations
  if (metrics.behavioralGap === 'balanced' && interventions.length <= 1) {
    return (
      <Card className={cn('border-success/20 bg-success/5', className)}>
        <CardContent className="py-6 text-center">
          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
          <h4 className="font-semibold">Segment Performing Well</h4>
          <p className="text-sm text-muted-foreground mt-1">
            No interventions recommended at this time
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const handleInterventionClick = (intervention: InterventionType) => {
    // Append segment context to route
    const separator = intervention.route.includes('?') ? '&' : '?';
    const contextRoute = `${intervention.route}${separator}segment=${encodeURIComponent(segmentName || 'Current Segment')}`;
    navigate(contextRoute);
  };

  return (
    <Card className={cn('border-accent/20', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          Segment Playbook
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Recommended interventions based on behavioral gap analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Gap Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <GapIcon className={cn('h-4 w-4', gapInfo.color)} />
            <span className="text-sm font-medium">{gapInfo.label}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {interventions.length} recommendation{interventions.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Intervention List */}
        <div className="space-y-2">
          {interventions.map((intervention, index) => {
            const Icon = intervention.icon;
            const priority = priorityConfig[intervention.priority];
            
            return (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleInterventionClick(intervention)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    'hover:border-accent/50 hover:bg-accent/5 hover:shadow-sm',
                    'focus:outline-none focus:ring-2 focus:ring-accent/50',
                    'group'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted shrink-0 group-hover:bg-accent/10 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{intervention.label}</span>
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priority.className)}>
                          {priority.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {intervention.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Action */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full gap-2 text-accent border-accent/30 hover:bg-accent/10"
            onClick={() => {
              const topIntervention = interventions[0];
              if (topIntervention) handleInterventionClick(topIntervention);
            }}
          >
            <Lightbulb className="h-4 w-4" />
            Start Top Recommendation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact inline version for tight spaces
export function SegmentPlaybookInline({ 
  metrics,
  onAction,
}: { 
  metrics: SegmentMetrics;
  onAction?: (interventionId: string) => void;
}) {
  const interventions = INTERVENTIONS[metrics.behavioralGap];
  const topIntervention = interventions[0];
  
  if (!topIntervention) return null;
  
  const Icon = topIntervention.icon;
  
  return (
    <button
      onClick={() => onAction?.(topIntervention.id)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
        'hover:border-accent/50 hover:bg-accent/5',
        'text-left w-full'
      )}
    >
      <Icon className="h-4 w-4 text-accent shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block">{topIntervention.label}</span>
        <span className="text-xs text-muted-foreground block truncate">
          {topIntervention.description}
        </span>
      </div>
      <Badge variant="outline" className={cn('text-[10px]', priorityConfig[topIntervention.priority].className)}>
        Recommended
      </Badge>
    </button>
  );
}
