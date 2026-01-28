/**
 * Recent Reports Table Component
 */

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
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { GeneratedReport, EXPORT_FORMAT_CONFIG } from './types';
import { DEFAULT_REPORTS } from './mockData';
import { toast } from 'sonner';

const FORMAT_ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  FileSpreadsheet,
  FileCode,
};

interface RecentReportsTableProps {
  reports: GeneratedReport[];
}

export function RecentReportsTable({ reports }: RecentReportsTableProps) {
  const handleDownload = (report: GeneratedReport) => {
    toast.success('Download started');
  };

  const getReportName = (reportId: string) => {
    const def = DEFAULT_REPORTS.find((r) => r.id === reportId);
    return def?.name || 'Unknown Report';
  };

  const getStatusBadge = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'ready':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </Badge>
        );
      case 'generating':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
            <Clock className="w-3 h-3" />
            Generating
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
    }
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No reports generated yet</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Generated</TableHead>
          <TableHead>By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => {
          const formatConfig = EXPORT_FORMAT_CONFIG[report.format];
          const FormatIcon = FORMAT_ICON_MAP[formatConfig.icon] || FileText;

          return (
            <TableRow key={report.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">
                    {getReportName(report.reportDefinitionId)}
                  </p>
                  {report.metadata && (
                    <p className="text-xs text-muted-foreground">
                      {report.metadata.pageCount && `${report.metadata.pageCount} pages`}
                      {report.metadata.recordCount && `${report.metadata.recordCount} records`}
                      {report.metadata.fileSize && ` • ${report.metadata.fileSize}`}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1 text-xs">
                  <FormatIcon className="w-3 h-3" />
                  {formatConfig.label}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">
                    {format(report.generatedAt, 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(report.generatedAt, 'h:mm a')}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{report.generatedBy}</TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell className="text-right">
                {report.status === 'ready' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
