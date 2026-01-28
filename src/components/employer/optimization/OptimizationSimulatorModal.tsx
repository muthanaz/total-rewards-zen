/**
 * Optimization Simulator Modal
 * 
 * Shows simulation details for a recommendation:
 * - Expected savings (AED)
 * - Affected headcount
 * - Policy sections impacted
 * - Operational workload impact (SLA/cycle time)
 * - "Submit for Approval" button (routes into approval workflow)
 */

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Send,
  TrendingUp,
  TrendingDown,
  Gauge,
  Scale,
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { OptimizationRecommendation } from './OptimizationRecommendationCard';
import { toast } from 'sonner';

interface SimulationResult {
  expectedSavingsMin: number;
  expectedSavingsMax: number;
  affectedHeadcount: number;
  impactedPolicySections: string[];
  operationalImpact: {
    slaImpact: 'positive' | 'neutral' | 'negative';
    slaChange: string;
    cycleTimeImpact: 'positive' | 'neutral' | 'negative';
    cycleTimeChange: string;
    workloadChange: string;
  };
  implementationTimeline: string;
  confidenceScore: number;
  assumptions: string[];
}

interface OptimizationSimulatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: OptimizationRecommendation | null;
  onSubmitForApproval: (recommendation: OptimizationRecommendation) => void;
}

// Generate simulation results based on recommendation
function generateSimulation(rec: OptimizationRecommendation): SimulationResult {
  const confidenceMultiplier = rec.confidence === 'high' ? 0.9 : rec.confidence === 'medium' ? 0.7 : 0.5;
  
  const baseMin = rec.impactMin * confidenceMultiplier;
  const baseMax = (rec.impactMax || rec.impactMin) * 1.1;
  
  // Generate realistic simulation based on type
  const policySections: Record<string, string[]> = {
    cost_efficiency: ['Eligibility Criteria', 'Coverage Limits', 'Documentation Requirements'],
    value_activation: ['Communication Triggers', 'Enrollment Windows', 'Awareness Campaigns'],
    portfolio_rebalancing: ['Budget Allocation', 'Cap Adjustments', 'Tier Definitions'],
  };
  
  const operationalImpacts: Record<string, SimulationResult['operationalImpact']> = {
    cost_efficiency: {
      slaImpact: 'neutral',
      slaChange: 'No significant change expected',
      cycleTimeImpact: 'positive',
      cycleTimeChange: '-0.5 days avg processing',
      workloadChange: '+15% initial workload, -20% after 4 weeks',
    },
    value_activation: {
      slaImpact: 'negative',
      slaChange: '+5% temporary SLA pressure during campaign',
      cycleTimeImpact: 'neutral',
      cycleTimeChange: 'No change expected',
      workloadChange: '+25% during campaign period',
    },
    portfolio_rebalancing: {
      slaImpact: 'neutral',
      slaChange: 'Minimal impact during transition',
      cycleTimeImpact: 'neutral',
      cycleTimeChange: 'Policy review may add 1-2 days',
      workloadChange: '+10% for policy updates',
    },
  };
  
  const timelines: Record<string, string> = {
    cost_efficiency: '2-4 weeks to full implementation',
    value_activation: '4-6 weeks for campaign cycle',
    portfolio_rebalancing: '6-8 weeks including policy approval',
  };
  
  return {
    expectedSavingsMin: Math.round(baseMin),
    expectedSavingsMax: Math.round(baseMax),
    affectedHeadcount: rec.affectedHeadcount || Math.round(50 + Math.random() * 200),
    impactedPolicySections: policySections[rec.type] || ['General Policy'],
    operationalImpact: operationalImpacts[rec.type] || operationalImpacts.cost_efficiency,
    implementationTimeline: timelines[rec.type] || '4-6 weeks',
    confidenceScore: rec.confidence === 'high' ? 85 : rec.confidence === 'medium' ? 65 : 45,
    assumptions: [
      'Current headcount remains stable',
      'No major policy changes in parallel',
      'Vendor contracts remain unchanged',
      rec.type === 'value_activation' ? 'Employee engagement with communications' : 'Compliance enforcement active',
    ],
  };
}

const impactIcon = (impact: 'positive' | 'neutral' | 'negative') => {
  if (impact === 'positive') return <TrendingUp className="h-4 w-4 text-success" />;
  if (impact === 'negative') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Scale className="h-4 w-4 text-muted-foreground" />;
};

export function OptimizationSimulatorModal({
  open,
  onOpenChange,
  recommendation,
  onSubmitForApproval,
}: OptimizationSimulatorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!recommendation) return null;
  
  const simulation = generateSimulation(recommendation);
  
  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      onSubmitForApproval(recommendation);
      toast.success('Submitted for approval', {
        description: `"${recommendation.title}" has been sent to the approval workflow.`,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Simulation Results
          </DialogTitle>
          <DialogDescription className="text-sm">
            <span className="font-medium text-foreground">{recommendation.title}</span>
          </DialogDescription>
        </DialogHeader>
        
        {/* Confidence Meter */}
        <div className="p-3 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Simulation Confidence</span>
            </div>
            <span className="text-sm font-bold">{simulation.confidenceScore}%</span>
          </div>
          <Progress value={simulation.confidenceScore} className="h-2" />
        </div>
        
        {/* Expected Savings */}
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Expected Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              {formatCurrencyAED(simulation.expectedSavingsMin)} – {formatCurrencyAED(simulation.expectedSavingsMax)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Range based on {recommendation.confidence} confidence level
            </p>
          </CardContent>
        </Card>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Affected Headcount */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Affected Employees</span>
              </div>
              <p className="text-xl font-bold">{simulation.affectedHeadcount}</p>
            </CardContent>
          </Card>
          
          {/* Implementation Timeline */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Timeline</span>
              </div>
              <p className="text-sm font-semibold">{simulation.implementationTimeline}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Policy Sections Impacted */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Policy Sections Impacted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {simulation.impactedPolicySections.map((section, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {section}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Operational Impact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Operational Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* SLA Impact */}
            <div className="flex items-start gap-3">
              {impactIcon(simulation.operationalImpact.slaImpact)}
              <div>
                <p className="text-sm font-medium">SLA Performance</p>
                <p className="text-xs text-muted-foreground">{simulation.operationalImpact.slaChange}</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Cycle Time Impact */}
            <div className="flex items-start gap-3">
              {impactIcon(simulation.operationalImpact.cycleTimeImpact)}
              <div>
                <p className="text-sm font-medium">Cycle Time</p>
                <p className="text-xs text-muted-foreground">{simulation.operationalImpact.cycleTimeChange}</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Workload Change */}
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-info" />
              <div>
                <p className="text-sm font-medium">HR Ops Workload</p>
                <p className="text-xs text-muted-foreground">{simulation.operationalImpact.workloadChange}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Assumptions */}
        <div className="p-3 rounded-lg bg-muted/30 border">
          <p className="text-xs font-medium mb-2 text-muted-foreground">Key Assumptions</p>
          <ul className="space-y-1">
            {simulation.assumptions.map((assumption, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-success" />
                {assumption}
              </li>
            ))}
          </ul>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleSubmitForApproval}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
