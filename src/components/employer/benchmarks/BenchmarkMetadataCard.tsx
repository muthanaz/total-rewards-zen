/**
 * Benchmark Metadata Card
 * 
 * Shows peer group definition, data source, and confidence indicator.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Building2, 
  Users, 
  Globe, 
  Database, 
  Calendar, 
  ShieldCheck,
  ShieldAlert,
  Shield,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PeerGroupDefinition, BenchmarkDataSource, ConfidenceIndicator } from './types';

interface BenchmarkMetadataCardProps {
  peerGroup: PeerGroupDefinition;
  dataSource: BenchmarkDataSource;
  confidence: ConfidenceIndicator;
  compact?: boolean;
}

const confidenceConfig = {
  high: {
    icon: ShieldCheck,
    label: 'High Confidence',
    className: 'bg-success/10 text-success border-success/30',
  },
  medium: {
    icon: Shield,
    label: 'Medium Confidence',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  low: {
    icon: ShieldAlert,
    label: 'Low Confidence',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export function BenchmarkMetadataCard({ 
  peerGroup, 
  dataSource, 
  confidence,
  compact = false 
}: BenchmarkMetadataCardProps) {
  const ConfidenceIcon = confidenceConfig[confidence.level].icon;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          <span>{peerGroup.industry}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{peerGroup.headcountRange}</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          <span>{peerGroup.region}</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-[10px]", confidenceConfig[confidence.level].className)}
        >
          <ConfidenceIcon className="h-3 w-3 mr-1" />
          {confidence.coveragePercent}% coverage
        </Badge>
        <span className="text-muted-foreground/60">
          Updated {format(dataSource.lastUpdated, 'MMM yyyy')}
        </span>
      </div>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="pt-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Peer Group Definition */}
          <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="h-4 w-4 text-accent" />
            Peer Group Definition
            <InfoTooltip 
              notes="Organizations included in this benchmark comparison"
            />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Industry:</span>
                <span className="font-medium">{peerGroup.industry}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Company Size:</span>
                <span className="font-medium">{peerGroup.headcountRange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Region:</span>
                <span className="font-medium">{peerGroup.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sample Size:</span>
                <Badge variant="secondary" className="text-[10px]">
                  {peerGroup.sampleSize} companies
                </Badge>
              </div>
            </div>
          </div>

          {/* Data Source */}
          <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Database className="h-4 w-4 text-accent" />
            Data Source
            <InfoTooltip 
              notes="Origin and methodology of benchmark data"
            />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Survey:</span>
                <span className="font-medium text-right max-w-[150px] truncate" title={dataSource.name}>
                  {dataSource.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-medium">{dataSource.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">{format(dataSource.lastUpdated, 'dd MMM yyyy')}</span>
                </div>
              </div>
              {dataSource.nextUpdate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Update:</span>
                  <span className="font-medium">{format(dataSource.nextUpdate, 'MMM yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confidence Indicator */}
          <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ConfidenceIcon className="h-4 w-4 text-accent" />
            Confidence Indicator
            <InfoTooltip 
              notes="Reliability of benchmark comparison based on data quality"
            />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Level:</span>
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px]", confidenceConfig[confidence.level].className)}
                >
                  <ConfidenceIcon className="h-3 w-3 mr-1" />
                  {confidenceConfig[confidence.level].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data Coverage:</span>
                <span className="font-medium">{confidence.coveragePercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completeness:</span>
                <span className="font-medium">{confidence.completenessPercent}%</span>
              </div>
              <div className="flex items-start gap-1 pt-1">
                <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-tight">{confidence.reason}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
