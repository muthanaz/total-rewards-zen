/**
 * IntegrationFieldMapping
 * 
 * Table showing field mappings between source systems and bnft fields.
 * Includes filters, inline actions, and completeness tracking.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  MoreHorizontal,
  Link2,
  Pencil,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Database,
  Zap,
} from 'lucide-react';
import { cn, formatPercent, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

// Types
export interface FieldMapping {
  id: string;
  sourceSystem: string;
  sourceField: string;
  bnftField: string | null;
  transform: string | null;
  isRequired: boolean;
  completeness: number;
  lastSeen: Date | null;
  domain: 'employees' | 'payroll' | 'policies' | 'claims' | 'marketplace' | 'surveys';
  status: 'mapped' | 'unmapped' | 'partial';
  sampleValue?: string;
}

// Mock data
const MOCK_FIELD_MAPPINGS: FieldMapping[] = [
  { id: 'fm-1', sourceSystem: 'SAP HRIS', sourceField: 'PERNR', bnftField: 'employee_id', transform: null, isRequired: true, completeness: 100, lastSeen: new Date(), domain: 'employees', status: 'mapped', sampleValue: 'EMP001' },
  { id: 'fm-2', sourceSystem: 'SAP HRIS', sourceField: 'VORNA', bnftField: 'first_name', transform: 'TRIM + TITLECASE', isRequired: true, completeness: 98, lastSeen: new Date(), domain: 'employees', status: 'mapped', sampleValue: 'Ahmed' },
  { id: 'fm-3', sourceSystem: 'SAP HRIS', sourceField: 'NACHN', bnftField: 'last_name', transform: 'TRIM + TITLECASE', isRequired: true, completeness: 98, lastSeen: new Date(), domain: 'employees', status: 'mapped', sampleValue: 'Hassan' },
  { id: 'fm-4', sourceSystem: 'SAP HRIS', sourceField: 'GBDAT', bnftField: 'date_of_birth', transform: 'DATE_FORMAT(YYYY-MM-DD)', isRequired: false, completeness: 85, lastSeen: new Date(Date.now() - 86400000), domain: 'employees', status: 'mapped', sampleValue: '1988-03-15' },
  { id: 'fm-5', sourceSystem: 'SAP HRIS', sourceField: 'ORGEH', bnftField: 'department', transform: 'LOOKUP(dept_codes)', isRequired: true, completeness: 92, lastSeen: new Date(), domain: 'employees', status: 'mapped', sampleValue: 'Engineering' },
  { id: 'fm-6', sourceSystem: 'SAP HRIS', sourceField: 'GRADE_CODE', bnftField: null, transform: null, isRequired: true, completeness: 0, lastSeen: null, domain: 'employees', status: 'unmapped' },
  { id: 'fm-7', sourceSystem: 'Payroll System', sourceField: 'BASE_SALARY', bnftField: 'base_salary', transform: 'NUMERIC', isRequired: true, completeness: 100, lastSeen: new Date(), domain: 'payroll', status: 'mapped', sampleValue: '25000' },
  { id: 'fm-8', sourceSystem: 'Payroll System', sourceField: 'HOUSING_ALLOW', bnftField: 'housing_allowance', transform: 'NUMERIC', isRequired: false, completeness: 78, lastSeen: new Date(Date.now() - 172800000), domain: 'payroll', status: 'partial', sampleValue: '8000' },
  { id: 'fm-9', sourceSystem: 'Claims System', sourceField: 'CLAIM_ID', bnftField: 'claim_id', transform: null, isRequired: true, completeness: 100, lastSeen: new Date(), domain: 'claims', status: 'mapped', sampleValue: 'CLM-2026-001' },
  { id: 'fm-10', sourceSystem: 'Claims System', sourceField: 'CLAIM_AMOUNT', bnftField: 'amount', transform: 'NUMERIC(2)', isRequired: true, completeness: 100, lastSeen: new Date(), domain: 'claims', status: 'mapped', sampleValue: '1500.00' },
  { id: 'fm-11', sourceSystem: 'Claims System', sourceField: 'PROVIDER_CODE', bnftField: null, transform: null, isRequired: false, completeness: 0, lastSeen: null, domain: 'claims', status: 'unmapped' },
  { id: 'fm-12', sourceSystem: 'Benefits Platform', sourceField: 'PLAN_ID', bnftField: 'benefit_plan_id', transform: null, isRequired: true, completeness: 95, lastSeen: new Date(), domain: 'policies', status: 'mapped', sampleValue: 'HEALTH-A1' },
  { id: 'fm-13', sourceSystem: 'Survey Tool', sourceField: 'RATING', bnftField: 'satisfaction_score', transform: 'SCALE(1-5 to 1-100)', isRequired: false, completeness: 65, lastSeen: new Date(Date.now() - 604800000), domain: 'surveys', status: 'partial', sampleValue: '4' },
];

const SOURCE_SYSTEMS = ['All Systems', 'SAP HRIS', 'Payroll System', 'Claims System', 'Benefits Platform', 'Survey Tool'];

const BNFT_FIELDS = [
  { value: 'employee_id', label: 'Employee ID', domain: 'employees' },
  { value: 'first_name', label: 'First Name', domain: 'employees' },
  { value: 'last_name', label: 'Last Name', domain: 'employees' },
  { value: 'grade', label: 'Grade', domain: 'employees' },
  { value: 'department', label: 'Department', domain: 'employees' },
  { value: 'base_salary', label: 'Base Salary', domain: 'payroll' },
  { value: 'housing_allowance', label: 'Housing Allowance', domain: 'payroll' },
  { value: 'claim_id', label: 'Claim ID', domain: 'claims' },
  { value: 'amount', label: 'Amount', domain: 'claims' },
  { value: 'provider_id', label: 'Provider ID', domain: 'claims' },
];

export function IntegrationFieldMapping() {
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState('All Systems');
  const [showRequiredOnly, setShowRequiredOnly] = useState(false);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  
  // Dialog states
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [editTransformOpen, setEditTransformOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldMapping | null>(null);
  const [selectedBnftField, setSelectedBnftField] = useState<string>('');
  const [transformValue, setTransformValue] = useState<string>('');
  
  const filteredMappings = useMemo(() => {
    return MOCK_FIELD_MAPPINGS.filter(mapping => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!mapping.sourceField.toLowerCase().includes(query) && 
            !mapping.bnftField?.toLowerCase().includes(query) &&
            !mapping.sourceSystem.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (systemFilter !== 'All Systems' && mapping.sourceSystem !== systemFilter) {
        return false;
      }
      if (showRequiredOnly && !mapping.isRequired) {
        return false;
      }
      if (showMissingOnly && mapping.status !== 'unmapped' && mapping.completeness >= 70) {
        return false;
      }
      return true;
    });
  }, [searchQuery, systemFilter, showRequiredOnly, showMissingOnly]);
  
  const stats = useMemo(() => {
    const total = MOCK_FIELD_MAPPINGS.length;
    const mapped = MOCK_FIELD_MAPPINGS.filter(m => m.status === 'mapped').length;
    const unmapped = MOCK_FIELD_MAPPINGS.filter(m => m.status === 'unmapped').length;
    const requiredMissing = MOCK_FIELD_MAPPINGS.filter(m => m.isRequired && m.status === 'unmapped').length;
    const avgCompleteness = Math.round(MOCK_FIELD_MAPPINGS.reduce((sum, m) => sum + m.completeness, 0) / total);
    return { total, mapped, unmapped, requiredMissing, avgCompleteness };
  }, []);
  
  const handleMapField = (field: FieldMapping) => {
    setSelectedField(field);
    setSelectedBnftField('');
    setMapDialogOpen(true);
  };
  
  const handleEditTransform = (field: FieldMapping) => {
    setSelectedField(field);
    setTransformValue(field.transform || '');
    setEditTransformOpen(true);
  };
  
  const handleToggleRequired = (field: FieldMapping) => {
    toast.success(`${field.sourceField} marked as ${field.isRequired ? 'optional' : 'required'}`);
  };
  
  const handleSaveMapping = () => {
    if (selectedField && selectedBnftField) {
      toast.success(`Mapped ${selectedField.sourceField} → ${selectedBnftField}`);
      setMapDialogOpen(false);
    }
  };
  
  const handleSaveTransform = () => {
    if (selectedField) {
      toast.success(`Transform updated for ${selectedField.sourceField}`);
      setEditTransformOpen(false);
    }
  };
  
  const getStatusBadge = (mapping: FieldMapping) => {
    switch (mapping.status) {
      case 'mapped':
        return <Badge className="bg-success/10 text-success border-0 text-xs gap-1"><CheckCircle className="w-3 h-3" />Mapped</Badge>;
      case 'unmapped':
        return <Badge className="bg-destructive/10 text-destructive border-0 text-xs gap-1"><AlertTriangle className="w-3 h-3" />Unmapped</Badge>;
      case 'partial':
        return <Badge className="bg-warning/10 text-warning border-0 text-xs gap-1"><AlertTriangle className="w-3 h-3" />Partial</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Fields</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Mapped</p>
            <p className="text-2xl font-bold text-success">{stats.mapped}</p>
          </CardContent>
        </Card>
        <Card className={stats.requiredMissing > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Required Missing</p>
            <p className={cn("text-2xl font-bold", stats.requiredMissing > 0 ? 'text-destructive' : 'text-success')}>
              {stats.requiredMissing}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Unmapped</p>
            <p className="text-2xl font-bold text-warning">{stats.unmapped}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Avg Completeness</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{stats.avgCompleteness}%</p>
              <Progress value={stats.avgCompleteness} className="w-12 h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-[180px]">
                <Database className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_SYSTEMS.map(sys => (
                  <SelectItem key={sys} value={sys}>{sys}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch id="required" checked={showRequiredOnly} onCheckedChange={setShowRequiredOnly} />
              <Label htmlFor="required" className="text-sm cursor-pointer">Required only</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="missing" checked={showMissingOnly} onCheckedChange={setShowMissingOnly} />
              <Label htmlFor="missing" className="text-sm cursor-pointer">Missing data</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source System</TableHead>
                <TableHead>Source Field</TableHead>
                <TableHead>bnft Field</TableHead>
                <TableHead>Transform</TableHead>
                <TableHead className="text-center">Required</TableHead>
                <TableHead className="text-right">Completeness</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping) => (
                <TableRow key={mapping.id} className={cn(
                  mapping.status === 'unmapped' && mapping.isRequired && 'bg-destructive/5'
                )}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{mapping.sourceSystem}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <code className="text-sm font-mono">{mapping.sourceField}</code>
                      {mapping.sampleValue && (
                        <p className="text-xs text-muted-foreground mt-0.5">e.g., {mapping.sampleValue}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {mapping.bnftField ? (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <code className="text-sm font-mono text-primary">{mapping.bnftField}</code>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs gap-1"
                        onClick={() => handleMapField(mapping)}
                      >
                        <Link2 className="w-3 h-3" />
                        Map field
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {mapping.transform ? (
                      <Badge variant="secondary" className="text-xs font-mono">
                        <Zap className="w-3 h-3 mr-1" />
                        {mapping.transform}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {mapping.isRequired ? (
                      <Star className="w-4 h-4 text-warning mx-auto" fill="currentColor" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress 
                        value={mapping.completeness} 
                        className={cn(
                          "w-12 h-1.5",
                          mapping.completeness < 70 && '[&>div]:bg-warning',
                          mapping.completeness < 50 && '[&>div]:bg-destructive'
                        )} 
                      />
                      <span className={cn(
                        "text-sm font-medium w-10",
                        mapping.completeness >= 90 ? 'text-success' : mapping.completeness >= 70 ? 'text-foreground' : 'text-warning'
                      )}>
                        {mapping.completeness}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {mapping.lastSeen ? formatRelativeTime(mapping.lastSeen) : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleMapField(mapping)}>
                          <Link2 className="w-4 h-4 mr-2" />
                          {mapping.bnftField ? 'Change mapping' : 'Map field'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTransform(mapping)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit transform
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleRequired(mapping)}>
                          <Star className="w-4 h-4 mr-2" />
                          {mapping.isRequired ? 'Mark optional' : 'Mark required'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredMappings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No fields match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Map Field Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Map Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs text-muted-foreground">Source Field</Label>
              <code className="block text-sm font-mono mt-1">{selectedField?.sourceSystem} → {selectedField?.sourceField}</code>
            </div>
            <div className="space-y-2">
              <Label>Map to bnft Field</Label>
              <Select value={selectedBnftField} onValueChange={setSelectedBnftField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {BNFT_FIELDS.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      <div className="flex items-center gap-2">
                        <span>{field.label}</span>
                        <Badge variant="outline" className="text-xs">{field.domain}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMapDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMapping} disabled={!selectedBnftField}>Save Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Transform Dialog */}
      <Dialog open={editTransformOpen} onOpenChange={setEditTransformOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transform</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs text-muted-foreground">Field</Label>
              <code className="block text-sm font-mono mt-1">{selectedField?.sourceField} → {selectedField?.bnftField}</code>
            </div>
            <div className="space-y-2">
              <Label>Transform Expression</Label>
              <Input 
                value={transformValue} 
                onChange={(e) => setTransformValue(e.target.value)}
                placeholder="e.g., TRIM + UPPERCASE"
              />
              <p className="text-xs text-muted-foreground">
                Available: TRIM, UPPERCASE, LOWERCASE, TITLECASE, DATE_FORMAT(), NUMERIC(), LOOKUP(), SCALE()
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTransformOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTransform}>Save Transform</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
