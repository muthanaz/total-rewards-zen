/**
 * Unified "Create Action" Modal
 * 
 * Usable across the platform with smart prefilling based on source context:
 * - Policy Insights: policy name, section, questions, clarity %, drop-off %, evidence, fix
 * - Marketplace Opportunity: category/vendor, problem, savings, confidence, evidence
 * - Zombie Spend: category, potential recovery, confidence
 * - Segments: dimension, segment, gap analysis
 * - Manual: blank form
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  X, 
  Lightbulb, 
  FileText, 
  ShoppingBag, 
  TrendingDown,
  Users,
  AlertTriangle,
  Link2,
  Info,
  Target,
  DollarSign,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrencyAED } from '@/lib/utils';
import type { ActionItem, ActionType, Priority, Confidence, SourceType, ExpectedImpact } from '@/hooks/useEmployerActions';

// ============= PREFILL TYPES =============

export interface PolicyInsightPrefill {
  type: 'policy_insight';
  policyName: string;
  policyRef?: string;
  section?: string;
  topQuestions?: string[];
  clarityPercent?: number;
  dropOffPercent?: number;
  evidenceLink?: string;
  recommendedFix?: string;
  confidenceLevel?: Confidence;
}

export interface MarketplaceOpportunityPrefill {
  type: 'marketplace_opportunity';
  category?: string;
  vendor?: string;
  problemStatement: string;
  expectedSavingsLow?: number;
  expectedSavingsHigh?: number;
  confidence?: Confidence;
  evidenceLink?: string;
}

export interface ZombieSpendPrefill {
  type: 'zombie_spend';
  category: string;
  potentialRecovery?: number;
  potentialRecoveryLow?: number;
  potentialRecoveryHigh?: number;
  currentUtilization?: number;
  confidence?: Confidence;
  evidenceLink?: string;
}

export interface SegmentInsightPrefill {
  type: 'segment_insight';
  dimension: string;
  segmentName: string;
  gapDescription?: string;
  impactedEmployees?: number;
  expectedImpact?: number;
  confidence?: Confidence;
  evidenceLink?: string;
}

export interface MetricEvidencePrefill {
  type: 'metric_evidence';
  metricKey: string;
  metricName: string;
  currentValue?: number | string;
  targetValue?: number | string;
  delta?: string;
  confidence?: Confidence;
  evidenceLink?: string;
}

export type ActionPrefill = 
  | PolicyInsightPrefill 
  | MarketplaceOpportunityPrefill 
  | ZombieSpendPrefill 
  | SegmentInsightPrefill
  | MetricEvidencePrefill
  | { type: 'manual' };

// ============= CONSTANTS =============

const TYPE_OPTIONS: Array<{ value: ActionType; label: string; icon: React.ElementType }> = [
  { value: 'policy', label: 'Policy Update', icon: FileText },
  { value: 'process', label: 'Process Change', icon: Target },
  { value: 'comms', label: 'Communications', icon: Users },
  { value: 'vendor', label: 'Vendor/Partner', icon: ShoppingBag },
  { value: 'analytics', label: 'Analytics/Review', icon: TrendingDown },
];

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string; description: string; color: string }> = [
  { value: 'P0', label: 'P0 - Critical', description: 'Immediate action required', color: 'bg-red-500/10 text-red-600' },
  { value: 'P1', label: 'P1 - High', description: 'Complete within 2 weeks', color: 'bg-amber-500/10 text-amber-600' },
  { value: 'P2', label: 'P2 - Medium', description: 'Plan for this quarter', color: 'bg-primary/10 text-primary' },
];

const CONFIDENCE_OPTIONS: Array<{ value: Confidence; label: string; description: string }> = [
  { value: 'high', label: 'High', description: '85%+ data completeness, proven approach' },
  { value: 'medium', label: 'Medium', description: 'Partial data, reasonable estimate' },
  { value: 'low', label: 'Low', description: 'Limited data, exploratory' },
];

const IMPACT_TYPES = [
  { value: 'cost_avoidance', label: 'Cost Avoidance', prefix: 'AED', useDirhamIcon: true },
  { value: 'utilization_change', label: 'Utilization Change', suffix: '%' },
  { value: 'sla_reduction', label: 'SLA Improvement', suffix: 'hours' },
  { value: 'satisfaction_change', label: 'Satisfaction Change', suffix: 'pts' },
];

const CATEGORY_OPTIONS = [
  'Learning & Development', 'Wellbeing', 'Health Insurance', 'Transport', 
  'Housing', 'Leave', 'Gym', 'Claims Processing', 'Flight Tickets', 
  'Retention', 'Policy Clarity', 'Marketplace', 'Employee Experience',
];

// ============= COMPONENT =============

interface UnifiedActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (action: Partial<ActionItem>) => void;
  owners: Array<{ id: string | null; name: string }>;
  prefill?: ActionPrefill;
}

export function UnifiedActionModal({
  open,
  onOpenChange,
  onCreate,
  owners,
  prefill,
}: UnifiedActionModalProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActionType>('process');
  const [priority, setPriority] = useState<Priority>('P2');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [confidence, setConfidence] = useState<Confidence>('medium');
  const [linkedCategories, setLinkedCategories] = useState<string[]>([]);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [evidenceRef, setEvidenceRef] = useState('');
  
  // Impact fields
  const [impactType, setImpactType] = useState('cost_avoidance');
  const [impactLow, setImpactLow] = useState('');
  const [impactHigh, setImpactHigh] = useState('');

  // Reset and prefill when modal opens
  useEffect(() => {
    if (open && prefill) {
      applyPrefill(prefill);
    } else if (!open) {
      resetForm();
    }
  }, [open, prefill]);

  const applyPrefill = (pf: ActionPrefill) => {
    switch (pf.type) {
      case 'policy_insight':
        setTitle(`Improve ${pf.policyName} Policy Clarity`);
        setDescription(buildPolicyDescription(pf));
        setType('policy');
        setPriority(pf.clarityPercent && pf.clarityPercent < 60 ? 'P1' : 'P2');
        setConfidence(pf.confidenceLevel || 'medium');
        setLinkedCategories(['Policy Clarity', pf.policyName]);
        setEvidenceRef(pf.evidenceLink || '');
        if (pf.dropOffPercent) {
          setImpactType('utilization_change');
          setImpactLow(String(Math.round(pf.dropOffPercent * 0.3)));
          setImpactHigh(String(Math.round(pf.dropOffPercent * 0.6)));
        }
        break;

      case 'marketplace_opportunity':
        setTitle(`${pf.vendor || pf.category} Marketplace Optimization`);
        setDescription(pf.problemStatement);
        setType('vendor');
        setPriority('P2');
        setConfidence(pf.confidence || 'medium');
        setLinkedCategories(['Marketplace', pf.category || ''].filter(Boolean));
        setEvidenceRef(pf.evidenceLink || '');
        if (pf.expectedSavingsLow || pf.expectedSavingsHigh) {
          setImpactType('cost_avoidance');
          setImpactLow(String(pf.expectedSavingsLow || 0));
          setImpactHigh(String(pf.expectedSavingsHigh || pf.expectedSavingsLow || 0));
        }
        break;

      case 'zombie_spend':
        setTitle(`Recover ${pf.category} Utilization`);
        setDescription(`Current utilization at ${pf.currentUtilization || 'low'}%. Potential to recover underutilized budget through targeted awareness and process improvements.`);
        setType('comms');
        setPriority('P1');
        setConfidence(pf.confidence || 'medium');
        setLinkedCategories([pf.category]);
        setEvidenceRef(pf.evidenceLink || '');
        if (pf.potentialRecoveryLow || pf.potentialRecoveryHigh || pf.potentialRecovery) {
          setImpactType('cost_avoidance');
          setImpactLow(String(pf.potentialRecoveryLow || pf.potentialRecovery || 0));
          setImpactHigh(String(pf.potentialRecoveryHigh || pf.potentialRecovery || 0));
        }
        break;

      case 'segment_insight':
        setTitle(`Address ${pf.segmentName} ${pf.dimension} Gap`);
        setDescription(pf.gapDescription || `Analysis shows opportunity in ${pf.segmentName} segment.`);
        setType('analytics');
        setPriority('P2');
        setConfidence(pf.confidence || 'medium');
        setLinkedCategories([pf.dimension]);
        setEvidenceRef(pf.evidenceLink || '');
        if (pf.expectedImpact) {
          setImpactType('cost_avoidance');
          setImpactLow(String(Math.round(pf.expectedImpact * 0.7)));
          setImpactHigh(String(pf.expectedImpact));
        }
        break;

      case 'metric_evidence':
        setTitle(`Improve ${pf.metricName}`);
        setDescription(`Current: ${pf.currentValue}, Target: ${pf.targetValue}. Delta: ${pf.delta || 'To be determined'}.`);
        setType('analytics');
        setPriority('P2');
        setConfidence(pf.confidence || 'medium');
        setEvidenceRef(pf.evidenceLink || '');
        break;

      default:
        resetForm();
    }
  };

  const buildPolicyDescription = (pf: PolicyInsightPrefill) => {
    let desc = '';
    if (pf.section) desc += `Section: ${pf.section}\n`;
    if (pf.clarityPercent !== undefined) desc += `Current clarity score: ${pf.clarityPercent}%\n`;
    if (pf.dropOffPercent !== undefined) desc += `Claims drop-off rate: ${pf.dropOffPercent}%\n`;
    if (pf.topQuestions?.length) {
      desc += `\nTop employee questions:\n${pf.topQuestions.map(q => `• ${q}`).join('\n')}\n`;
    }
    if (pf.recommendedFix) {
      desc += `\nRecommended fix: ${pf.recommendedFix}`;
    }
    return desc.trim();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('process');
    setPriority('P2');
    setOwnerId(null);
    setDueDate(undefined);
    setConfidence('medium');
    setLinkedCategories([]);
    setBlockers([]);
    setDependencies([]);
    setEvidenceRef('');
    setImpactType('cost_avoidance');
    setImpactLow('');
    setImpactHigh('');
  };

  const handleSubmit = () => {
    const owner = owners.find(o => o.id === ownerId);
    
    // Build expected impact based on type
    const expectedImpact: ExpectedImpact = {};
    const lowVal = parseFloat(impactLow) || 0;
    const highVal = parseFloat(impactHigh) || lowVal;
    
    switch (impactType) {
      case 'cost_avoidance':
        expectedImpact.costAvoidance = highVal;
        expectedImpact.costAvoidanceLow = lowVal;
        expectedImpact.costAvoidanceHigh = highVal;
        break;
      case 'utilization_change':
        expectedImpact.utilizationChange = highVal;
        break;
      case 'sla_reduction':
        expectedImpact.slaReduction = highVal;
        break;
      case 'satisfaction_change':
        expectedImpact.satisfactionChange = highVal;
        break;
    }
    
    // Determine source type from prefill
    let sourceType: SourceType = 'manual';
    let sourceRefId: string | undefined;
    if (prefill?.type === 'policy_insight') {
      sourceType = 'policies';
      sourceRefId = (prefill as PolicyInsightPrefill).policyRef;
    } else if (prefill?.type === 'marketplace_opportunity') {
      sourceType = 'manual'; // Could add 'marketplace' source type
      sourceRefId = (prefill as MarketplaceOpportunityPrefill).vendor;
    } else if (prefill?.type === 'zombie_spend') {
      sourceType = 'zombie_spend';
      sourceRefId = (prefill as ZombieSpendPrefill).category;
    } else if (prefill?.type === 'segment_insight') {
      sourceType = 'segments';
      sourceRefId = (prefill as SegmentInsightPrefill).segmentName;
    }
    
    onCreate({
      title,
      description,
      type,
      priority,
      ownerId,
      owner: owner?.name || 'Unassigned',
      dueDate: dueDate || null,
      expectedImpact,
      confidence,
      confidenceNote: evidenceRef ? `Evidence: ${evidenceRef}` : undefined,
      linkedCategories,
      blockers: blockers.map((b, i) => ({ id: `blocker-${i}`, description: b, addedAt: new Date(), addedBy: 'Current User' })),
      sourceType,
      sourceRefId,
    });
    
    resetForm();
    onOpenChange(false);
  };

  const addCategory = (cat: string) => {
    if (cat && !linkedCategories.includes(cat)) {
      setLinkedCategories([...linkedCategories, cat]);
    }
  };

  const removeCategory = (cat: string) => {
    setLinkedCategories(linkedCategories.filter(c => c !== cat));
  };

  const addBlocker = () => {
    setBlockers([...blockers, '']);
  };

  const updateBlocker = (index: number, value: string) => {
    const updated = [...blockers];
    updated[index] = value;
    setBlockers(updated);
  };

  const removeBlocker = (index: number) => {
    setBlockers(blockers.filter((_, i) => i !== index));
  };

  const addDependency = () => {
    setDependencies([...dependencies, '']);
  };

  const updateDependency = (index: number, value: string) => {
    const updated = [...dependencies];
    updated[index] = value;
    setDependencies(updated);
  };

  const removeDependency = (index: number) => {
    setDependencies(dependencies.filter((_, i) => i !== index));
  };

  const isValid = title.trim().length > 0;

  const prefillSourceLabel = useMemo(() => {
    if (!prefill) return null;
    switch (prefill.type) {
      case 'policy_insight': return { label: 'Policy Insight', icon: FileText, color: 'text-blue-600' };
      case 'marketplace_opportunity': return { label: 'Marketplace', icon: ShoppingBag, color: 'text-purple-600' };
      case 'zombie_spend': return { label: 'Budget Leakage', icon: TrendingDown, color: 'text-amber-600' };
      case 'segment_insight': return { label: 'Segment Analysis', icon: Users, color: 'text-teal-600' };
      case 'metric_evidence': return { label: 'Metric Evidence', icon: Target, color: 'text-primary' };
      default: return null;
    }
  }, [prefill]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Create Action
          </DialogTitle>
          {prefillSourceLabel && (
            <DialogDescription className="flex items-center gap-2">
              <prefillSourceLabel.icon className={cn("w-4 h-4", prefillSourceLabel.color)} />
              <span>Pre-filled from {prefillSourceLabel.label}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Source Context Banner */}
          {prefill && prefill.type !== 'manual' && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium">Action created from insight</p>
                <p className="text-muted-foreground">
                  Fields have been pre-filled based on the source analysis. Review and adjust as needed.
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Launch L&D Awareness Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the action, context, and expected outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", opt.color)}>{opt.value}</Badge>
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Owner & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={ownerId || 'unassigned'} onValueChange={(v) => setOwnerId(v === 'unassigned' ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id || 'unassigned'} value={owner.id || 'unassigned'}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Expected Impact */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expected Impact
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <Select value={impactType} onValueChange={setImpactType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPACT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Low"
                  value={impactLow}
                  onChange={(e) => setImpactLow(e.target.value)}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="High"
                  value={impactHigh}
                  onChange={(e) => setImpactHigh(e.target.value)}
                />
              </div>
            </div>
            {impactLow && impactHigh && (
              <p className="text-sm text-muted-foreground">
                Range: {impactType === 'cost_avoidance' 
                  ? `${formatCurrencyAED(parseFloat(impactLow))} – ${formatCurrencyAED(parseFloat(impactHigh))}`
                  : `${impactLow} – ${impactHigh}`}
              </p>
            )}
          </div>

          {/* Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Confidence Level</Label>
              <Select value={confidence} onValueChange={(v) => setConfidence(v as Confidence)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONFIDENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <span className="font-medium capitalize">{opt.label}</span>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Evidence Reference
              </Label>
              <Input
                placeholder="Link or reference to source data"
                value={evidenceRef}
                onChange={(e) => setEvidenceRef(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Linked Categories */}
          <div className="space-y-2">
            <Label>Linked Categories</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {linkedCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs gap-1">
                  {cat}
                  <button className="ml-1 hover:text-destructive" onClick={() => removeCategory(cat)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={addCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Add a category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.filter(c => !linkedCategories.includes(c)).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Blockers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Blockers
              </Label>
              <Button variant="ghost" size="sm" onClick={addBlocker}>+ Add</Button>
            </div>
            {blockers.map((blocker, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Describe blocker..."
                  value={blocker}
                  onChange={(e) => updateBlocker(i, e.target.value)}
                />
                <Button variant="ghost" size="sm" onClick={() => removeBlocker(i)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Dependencies */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                Dependencies
              </Label>
              <Button variant="ghost" size="sm" onClick={addDependency}>+ Add</Button>
            </div>
            {dependencies.map((dep, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Depends on..."
                  value={dep}
                  onChange={(e) => updateDependency(i, e.target.value)}
                />
                <Button variant="ghost" size="sm" onClick={() => removeDependency(i)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Create Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnifiedActionModal;
