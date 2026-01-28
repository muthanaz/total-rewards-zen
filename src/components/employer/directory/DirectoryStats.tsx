import { Users, AlertTriangle, FileWarning, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DirectoryEmployee } from './types';

interface DirectoryStatsProps {
  employees: DirectoryEmployee[];
}

export function DirectoryStats({ employees }: DirectoryStatsProps) {
  const totalEmployees = employees.length;
  const withOpenRequests = employees.filter(e => e.openRequestsCount > 0).length;
  const withMissingDocs = employees.filter(e => e.missingDocsCount > 0).length;
  const onProbation = employees.filter(e => e.status === 'probation').length;

  const stats = [
    {
      label: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-l-primary',
    },
    {
      label: 'With Open Requests',
      value: withOpenRequests,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-l-amber-500',
    },
    {
      label: 'Missing Documents',
      value: withMissingDocs,
      icon: FileWarning,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-l-destructive',
    },
    {
      label: 'On Probation',
      value: onProbation,
      icon: AlertTriangle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-l-blue-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border-l-4 ${stat.borderColor}`}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
