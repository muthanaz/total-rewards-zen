/**
 * SLA Rules Modal
 * Configure SLA by category + value band with escalation ladder
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Clock, 
  AlertTriangle, 
  ArrowUp, 
  Bell, 
  Calendar,
  Settings,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SLARulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (rules: SLARuleSet) => void;
}

interface SLARule {
  category: string;
  valueBand: 'low' | 'standard' | 'high' | 'premium';
  slaHours: number;
  priority: 'low' | 'medium' | 'high';
}

interface EscalationStep {
  hoursBeforeBreach: number;
  action: 'reminder' | 'escalate' | 'notify_manager';
  target: string;
}

interface SLARuleSet {
  rules: SLARule[];
  escalationLadder: EscalationStep[];
  workingHoursOnly: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  excludeWeekends: boolean;
}

const CATEGORIES = [
  'Health Insurance',
  'Transport',
  'Housing',
  'Learning & Development',
  'Wellbeing',
  'Schooling',
  'Education Allowance',
  'Leave',
  'Per Diem',
  'Other',
];

const VALUE_BANDS = ['low', 'standard', 'high', 'premium'] as const;
const VALUE_BAND_LABELS: Record<string, string> = {
  low: 'Low (<500 AED)',
  standard: 'Standard (500-2K)',
  high: 'High (2K-5K)',
  premium: 'Premium (>5K)',
};

const DEFAULT_RULES: SLARule[] = [
  { category: 'Health Insurance', valueBand: 'low', slaHours: 72, priority: 'low' },
  { category: 'Health Insurance', valueBand: 'standard', slaHours: 48, priority: 'medium' },
  { category: 'Health Insurance', valueBand: 'high', slaHours: 24, priority: 'high' },
  { category: 'Health Insurance', valueBand: 'premium', slaHours: 8, priority: 'high' },
  { category: 'Leave', valueBand: 'standard', slaHours: 24, priority: 'medium' },
  { category: 'Per Diem', valueBand: 'standard', slaHours: 48, priority: 'medium' },
];

const DEFAULT_ESCALATION: EscalationStep[] = [
  { hoursBeforeBreach: 8, action: 'reminder', target: 'Assigned Owner' },
  { hoursBeforeBreach: 4, action: 'escalate', target: 'Team Lead' },
  { hoursBeforeBreach: 0, action: 'notify_manager', target: 'HR Manager' },
];

export function SLARulesModal({ open, onOpenChange, onSave }: SLARulesModalProps) {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<SLARule[]>(DEFAULT_RULES);
  const [escalation, setEscalation] = useState<EscalationStep[]>(DEFAULT_ESCALATION);
  const [workingHoursOnly, setWorkingHoursOnly] = useState(true);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');
  const [excludeWeekends, setExcludeWeekends] = useState(true);

  const [newRule, setNewRule] = useState<Partial<SLARule>>({
    category: 'Health Insurance',
    valueBand: 'standard',
    slaHours: 48,
    priority: 'medium',
  });

  const handleAddRule = () => {
    if (newRule.category && newRule.valueBand && newRule.slaHours && newRule.priority) {
      setRules([...rules, newRule as SLARule]);
      setNewRule({ category: '', valueBand: 'standard', slaHours: 48, priority: 'medium' });
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave?.({
      rules,
      escalationLadder: escalation,
      workingHoursOnly,
      workingHoursStart,
      workingHoursEnd,
      excludeWeekends,
    });
    onOpenChange(false);
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: 'bg-destructive/10 text-destructive border-destructive/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      low: 'bg-muted text-muted-foreground',
    };
    return <Badge className={cn('text-xs', styles[priority])}>{priority}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
      reminder: { bg: 'bg-primary/10 text-primary', icon: <Bell className="w-3 h-3" /> },
      escalate: { bg: 'bg-warning/10 text-warning', icon: <ArrowUp className="w-3 h-3" /> },
      notify_manager: { bg: 'bg-destructive/10 text-destructive', icon: <AlertTriangle className="w-3 h-3" /> },
    };
    const config = styles[action] || styles.reminder;
    return (
      <Badge className={cn('gap-1 text-xs', config.bg)}>
        {config.icon}
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            SLA Rules Configuration
          </DialogTitle>
          <DialogDescription>
            Define processing time targets by category and value band, configure escalation triggers
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="rules" className="gap-2">
              <Clock className="w-4 h-4" />
              SLA Rules
            </TabsTrigger>
            <TabsTrigger value="escalation" className="gap-2">
              <ArrowUp className="w-4 h-4" />
              Escalation
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Working Hours
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="rules" className="m-0 space-y-4">
              {/* Rules Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Category</TableHead>
                      <TableHead>Value Band</TableHead>
                      <TableHead>SLA (hours)</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{rule.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{VALUE_BAND_LABELS[rule.valueBand]}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{rule.slaHours}h</span>
                        </TableCell>
                        <TableCell>{getPriorityBadge(rule.priority)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveRule(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Add Rule Form */}
              <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Rule
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Select 
                      value={newRule.category}
                      onValueChange={(v) => setNewRule({ ...newRule, category: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Value Band</Label>
                    <Select 
                      value={newRule.valueBand}
                      onValueChange={(v) => setNewRule({ ...newRule, valueBand: v as SLARule['valueBand'] })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VALUE_BANDS.map(band => (
                          <SelectItem key={band} value={band}>{VALUE_BAND_LABELS[band]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">SLA (hours)</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={newRule.slaHours}
                      onChange={(e) => setNewRule({ ...newRule, slaHours: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddRule} className="w-full gap-2">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="escalation" className="m-0 space-y-4">
              {/* Escalation Ladder */}
              <div className="space-y-3">
                {escalation.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Trigger</Label>
                        <p className="font-medium">
                          {step.hoursBeforeBreach === 0 
                            ? 'On breach' 
                            : `${step.hoursBeforeBreach}h before breach`}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Action</Label>
                        <div className="mt-1">{getActionBadge(step.action)}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Target</Label>
                        <p className="font-medium">{step.target}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border border-dashed rounded-lg flex items-center justify-center gap-2 text-muted-foreground">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add escalation step (Demo only)</span>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="m-0 space-y-6">
              {/* Working Hours Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Count Working Hours Only</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        When enabled, SLA timers only count during specified working hours
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pause SLA countdown outside of business hours
                  </p>
                </div>
                <Switch
                  checked={workingHoursOnly}
                  onCheckedChange={setWorkingHoursOnly}
                />
              </div>

              {workingHoursOnly && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Working Hours Start</Label>
                      <Input
                        type="time"
                        value={workingHoursStart}
                        onChange={(e) => setWorkingHoursStart(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Working Hours End</Label>
                      <Input
                        type="time"
                        value={workingHoursEnd}
                        onChange={(e) => setWorkingHoursEnd(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Exclude Weekends</Label>
                      <p className="text-sm text-muted-foreground">
                        Friday & Saturday do not count toward SLA
                      </p>
                    </div>
                    <Switch
                      checked={excludeWeekends}
                      onCheckedChange={setExcludeWeekends}
                    />
                  </div>
                </>
              )}

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Current Schedule</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workingHoursOnly 
                        ? `SLA counted ${workingHoursStart} - ${workingHoursEnd}, ${excludeWeekends ? 'Sun-Thu' : 'All week'}`
                        : '24/7 SLA counting (no pauses)'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Settings className="w-4 h-4" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SLARulesModal;
