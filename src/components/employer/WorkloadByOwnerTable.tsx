/**
 * Workload by Owner Table
 * 
 * Mini-table showing claims distribution by owner with SLA risk counts.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface OwnerWorkload {
  id: string;
  name: string;
  role?: string;
  assigned: number;
  slaRisk: number;
  oldestDays: number;
}

interface WorkloadByOwnerTableProps {
  workloads: OwnerWorkload[];
}

export function WorkloadByOwnerTable({ workloads }: WorkloadByOwnerTableProps) {
  const sortedWorkloads = [...workloads].sort((a, b) => b.slaRisk - a.slaRisk);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Workload by Owner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Owner</TableHead>
              <TableHead className="text-xs text-center">Assigned</TableHead>
              <TableHead className="text-xs text-center">SLA Risk</TableHead>
              <TableHead className="text-xs text-right">Oldest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedWorkloads.slice(0, 5).map((owner) => (
              <TableRow key={owner.id} className="hover:bg-muted/30">
                <TableCell className="py-2">
                  <div>
                    <span className="font-medium text-sm">{owner.name}</span>
                    {owner.role && (
                      <span className="text-xs text-muted-foreground block">{owner.role}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center py-2">
                  <Badge variant="secondary" className="font-mono">
                    {owner.assigned}
                  </Badge>
                </TableCell>
                <TableCell className="text-center py-2">
                  {owner.slaRisk > 0 ? (
                    <Badge className={cn(
                      "gap-1",
                      owner.slaRisk >= 3 
                        ? "bg-destructive/10 text-destructive border-0" 
                        : "bg-warning/10 text-warning border-0"
                    )}>
                      <AlertTriangle className="w-3 h-3" />
                      {owner.slaRisk}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className={cn(
                      "text-sm",
                      owner.oldestDays >= 5 && "text-destructive font-medium",
                      owner.oldestDays >= 3 && owner.oldestDays < 5 && "text-warning"
                    )}>
                      {owner.oldestDays}d
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedWorkloads.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No assignments yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Link to="/employer/claims?view=by_owner">
          <Button variant="ghost" size="sm" className="w-full mt-2 gap-1">
            View full workload
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
