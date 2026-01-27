/**
 * Segment Member Table
 * 
 * Data table for HR Ops view showing specific employees in the segment.
 * Supports bulk actions for operational efficiency.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MockEmployee } from './types';
import { formatPercent, formatCurrencyAED, cn } from '@/lib/utils';
import { Mail, ClipboardCheck, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

interface SegmentMemberTableProps {
  employees: MockEmployee[];
}

// Compute derived fields for display
function enrichEmployeeData(employee: MockEmployee) {
  const utilizationPct = employee.budgetAllocated > 0 
    ? Math.round((employee.amountSpent / employee.budgetAllocated) * 100) 
    : 0;
  
  // Generate a mock last claim date based on claim count
  const lastClaimDate = employee.hasMadeClaim 
    ? subDays(new Date(), Math.floor(Math.random() * 90))
    : null;
  
  // Risk status based on utilization
  const riskStatus: 'at-risk' | 'watch' | 'healthy' = 
    utilizationPct === 0 ? 'at-risk' :
    utilizationPct < 30 ? 'watch' : 'healthy';
  
  return {
    ...employee,
    utilizationPct,
    lastClaimDate,
    riskStatus,
  };
}

type EnrichedEmployee = ReturnType<typeof enrichEmployeeData>;

export function SegmentMemberTable({ employees }: SegmentMemberTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enrichedEmployees = useMemo(() => 
    employees.map(enrichEmployeeData),
    [employees]
  );

  const allSelected = selectedIds.size === enrichedEmployees.length && enrichedEmployees.length > 0;
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(enrichedEmployees.map(e => e.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSendEmail = () => {
    toast.success(`Drafting email to ${selectedIds.size} employees...`, {
      description: 'Email composer opening',
    });
    setSelectedIds(new Set());
  };

  const handleCheckEligibility = () => {
    toast.success(`Checking eligibility for ${selectedIds.size} employees...`, {
      description: 'Eligibility report generating',
    });
    setSelectedIds(new Set());
  };

  const getRiskBadge = (status: EnrichedEmployee['riskStatus']) => {
    switch (status) {
      case 'at-risk':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
            <AlertTriangle className="h-3 w-3" />
            At Risk
          </Badge>
        );
      case 'watch':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
            <Clock className="h-3 w-3" />
            Watch
          </Badge>
        );
      case 'healthy':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
            <CheckCircle className="h-3 w-3" />
            Healthy
          </Badge>
        );
    }
  };

  if (employees.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Members Found</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Adjust your filters to see segment members
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {someSelected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="shadow-lg border-primary/20">
              <CardContent className="flex items-center gap-4 p-3">
                <span className="text-sm font-medium">
                  {selectedIds.size} member{selectedIds.size > 1 ? 's' : ''} selected
                </span>
                <div className="h-4 w-px bg-border" />
                <Button size="sm" variant="outline" className="gap-2" onClick={handleSendEmail}>
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handleCheckEligibility}>
                  <ClipboardCheck className="h-4 w-4" />
                  Check Eligibility
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Segment Members ({employees.length})</span>
            {someSelected && (
              <span className="text-muted-foreground font-normal">
                {selectedIds.size} selected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Utilization %</TableHead>
                  <TableHead>Last Claim</TableHead>
                  <TableHead>Risk Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedEmployees.slice(0, 50).map((emp) => (
                  <TableRow
                    key={emp.id}
                    className={cn(
                      'transition-colors',
                      selectedIds.has(emp.id) && 'bg-primary/5'
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(emp.id)}
                        onCheckedChange={() => toggleOne(emp.id)}
                        aria-label={`Select ${emp.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {emp.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={cn(
                        'font-semibold',
                        emp.utilizationPct >= 80 ? 'text-success' :
                        emp.utilizationPct >= 40 ? 'text-foreground' : 'text-warning'
                      )}>
                        {formatPercent(emp.utilizationPct)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.lastClaimDate ? format(emp.lastClaimDate, 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(emp.riskStatus)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {employees.length > 50 && (
            <div className="p-3 text-center text-sm text-muted-foreground border-t">
              Showing 50 of {employees.length} members. Export for full list.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}