/**
 * Report Card Component
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  TrendingUp,
  Clock,
  Banknote,
  BarChart3,
  Play,
  Settings2,
  FileText,
  FileSpreadsheet,
  FileCode,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ReportDefinition, REPORT_CATEGORY_CONFIG, EXPORT_FORMAT_CONFIG } from './types';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  TrendingUp,
  Clock,
  Banknote,
  BarChart3,
};

const FORMAT_ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  FileSpreadsheet,
  FileCode,
};

interface ReportCardProps {
  report: ReportDefinition;
  onGenerate: (report: ReportDefinition) => void;
  onConfigure: (report: ReportDefinition) => void;
}

export function ReportCard({ report, onGenerate, onConfigure }: ReportCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = ICON_MAP[report.icon] || FileText;
  const categoryConfig = REPORT_CATEGORY_CONFIG[report.category];

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 cursor-pointer group',
        'hover:shadow-md hover:border-primary/30',
        isHovered && 'ring-1 ring-primary/20'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{report.name}</h3>
              <Badge 
                variant="outline" 
                className={cn('text-[10px] mt-1', categoryConfig.color)}
              >
                {categoryConfig.label}
              </Badge>
            </div>
          </div>
          {report.schedulable && (
            <Calendar className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
          {report.description}
        </p>

        {/* Formats */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Export:
          </span>
          <div className="flex gap-1">
            {report.supportedFormats.map((fmt) => {
              const formatConfig = EXPORT_FORMAT_CONFIG[fmt];
              const FormatIcon = FORMAT_ICON_MAP[formatConfig.icon] || FileText;
              return (
                <Badge
                  key={fmt}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 gap-1"
                >
                  <FormatIcon className="w-3 h-3" />
                  {formatConfig.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="text-[10px] text-muted-foreground">
            {report.lastGenerated ? (
              <>Last: {format(report.lastGenerated, 'MMM d, yyyy')}</>
            ) : (
              <>Never generated</>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure(report);
              }}
            >
              <Settings2 className="w-3 h-3 mr-1" />
              Configure
            </Button>
            <Button
              size="sm"
              className="h-7 px-3 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(report);
              }}
            >
              <Play className="w-3 h-3" />
              Generate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
