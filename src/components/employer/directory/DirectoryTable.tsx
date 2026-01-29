import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, FileWarning, Clock } from 'lucide-react';
import { DirectoryEmployee, STATUS_CONFIG } from './types';
import { cn } from '@/lib/utils';

interface DirectoryTableProps {
  employees: DirectoryEmployee[];
  onViewEmployee: (employee: DirectoryEmployee) => void;
}

export function DirectoryTable({ employees, onViewEmployee }: DirectoryTableProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[240px]">Name (Grade)</TableHead>
            <TableHead className="w-[140px]">Department</TableHead>
            <TableHead className="w-[120px]">Location</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px] text-center">Open Requests</TableHead>
            <TableHead className="w-[200px]">Eligibility</TableHead>
            <TableHead className="w-[120px]">Utilization</TableHead>
            <TableHead className="w-[80px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow 
              key={emp.id} 
              className="group cursor-pointer"
              onClick={() => onViewEmployee(emp)}
            >
            {/* Name (Grade) */}
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={emp.avatarUrl} alt={`${emp.firstName} ${emp.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(emp.firstName, emp.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm">
                    {emp.firstName} {emp.lastName}{' '}
                    <span className="text-muted-foreground font-mono text-xs">({emp.grade})</span>
                  </p>
                </div>
              </div>
            </TableCell>

            {/* Department */}
            <TableCell className="text-sm">{emp.department}</TableCell>

            {/* Location */}
            <TableCell className="text-sm text-muted-foreground">{emp.location}</TableCell>

            {/* Status */}
            <TableCell>
              <Badge 
                variant="outline" 
                className={cn('text-xs', STATUS_CONFIG[emp.status].className)}
              >
                {STATUS_CONFIG[emp.status].label}
              </Badge>
            </TableCell>

            {/* Open Requests */}
            <TableCell className="text-center">
              {emp.openRequestsCount > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'gap-1',
                        emp.openRequestsCount >= 3 && 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {emp.openRequestsCount}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{emp.openRequestsCount} open request{emp.openRequestsCount !== 1 ? 's' : ''}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </TableCell>

            {/* Eligibility Highlights */}
            <TableCell>
              <div className="flex items-center gap-1 flex-wrap">
                {emp.eligibilityHighlights.slice(0, 2).map((highlight) => (
                  <Badge key={highlight} variant="outline" className="text-xs px-1.5 py-0">
                    {highlight}
                  </Badge>
                ))}
                {emp.eligibilityHighlights.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    +{emp.eligibilityHighlights.length - 2}
                  </Badge>
                )}
                {emp.missingDocsCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="destructive" className="gap-0.5 text-xs px-1.5 py-0">
                        <FileWarning className="w-3 h-3" />
                        {emp.missingDocsCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{emp.missingDocsCount} missing document{emp.missingDocsCount !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TableCell>

            {/* Utilization */}
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress 
                  value={emp.utilizationPercent} 
                  className={cn(
                    "h-2 flex-1",
                    emp.utilizationPercent >= 75 && "[&>div]:bg-emerald-500",
                    emp.utilizationPercent >= 50 && emp.utilizationPercent < 75 && "[&>div]:bg-primary",
                    emp.utilizationPercent < 50 && "[&>div]:bg-amber-500"
                  )}
                />
                <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                  {emp.utilizationPercent}%
                </span>
              </div>
            </TableCell>

              {/* Action */}
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onViewEmployee(emp)}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View {emp.firstName}</span>
              </Button>
            </TableCell>
            </TableRow>
          ))}

          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center">
                <p className="text-muted-foreground">No employees found matching your criteria.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
