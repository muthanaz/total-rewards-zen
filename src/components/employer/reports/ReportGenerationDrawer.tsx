/**
 * Report Generation Drawer Component
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  TrendingUp,
  Clock,
  Banknote,
  BarChart3,
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  BookMarked,
  Loader2,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ReportDefinition,
  ReportFilters,
  ExportFormat,
  REPORT_CATEGORY_CONFIG,
  EXPORT_FORMAT_CONFIG,
} from './types';
import { ReportFiltersPanel } from './ReportFiltersPanel';
import { SavePresetDialog } from './SavePresetDialog';
import { SAVED_PRESETS } from './mockData';
import { toast } from 'sonner';

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

interface ReportGenerationDrawerProps {
  report: ReportDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GenerationState = 'idle' | 'generating' | 'complete';

export function ReportGenerationDrawer({
  report,
  open,
  onOpenChange,
}: ReportGenerationDrawerProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    timeRange: 'ytd',
    segments: [],
    grades: [],
  });
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [progress, setProgress] = useState(0);
  const [savePresetOpen, setSavePresetOpen] = useState(false);

  // Reset state when report changes
  useEffect(() => {
    if (report) {
      setSelectedFormat(report.defaultFormat);
      setGenerationState('idle');
      setProgress(0);
      
      // Load default preset if exists
      const defaultPreset = SAVED_PRESETS.find(
        (p) => p.reportId === report.id && p.isDefault
      );
      if (defaultPreset) {
        setFilters(defaultPreset.filters);
      } else {
        setFilters({
          timeRange: 'ytd',
          segments: [],
          grades: [],
        });
      }
    }
  }, [report]);

  const handleGenerate = async () => {
    if (!report) return;

    setGenerationState('generating');
    setProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Simulate completion
    await new Promise((resolve) => setTimeout(resolve, 2500));
    clearInterval(interval);
    setProgress(100);
    setGenerationState('complete');
    toast.success(`${report.name} generated successfully`);
  };

  const handleDownload = () => {
    toast.success('Download started');
    // In production, this would trigger actual download
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = SAVED_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFilters(preset.filters);
      toast.success(`Loaded preset: ${preset.name}`);
    }
  };

  if (!report) return null;

  const Icon = ICON_MAP[report.icon] || FileText;
  const categoryConfig = REPORT_CATEGORY_CONFIG[report.category];
  const reportPresets = SAVED_PRESETS.filter((p) => p.reportId === report.id);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-left">{report.name}</SheetTitle>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] mt-1', categoryConfig.color)}
                >
                  {categoryConfig.label}
                </Badge>
              </div>
            </div>
            <SheetDescription className="text-left mt-2">
              {report.description}
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <div className="py-6 space-y-6">
            {/* Saved Presets */}
            {reportPresets.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">
                  Load Saved Preset
                </label>
                <Select onValueChange={handleLoadPreset}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reportPresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div className="flex items-center gap-2">
                          {preset.name}
                          {preset.isDefault && (
                            <Badge variant="secondary" className="text-[9px]">
                              Default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filters */}
            <ReportFiltersPanel
              report={report}
              filters={filters}
              onChange={setFilters}
            />

            <Separator />

            {/* Export Format */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">
                Export Format
              </label>
              <div className="flex gap-2">
                {report.supportedFormats.map((fmt) => {
                  const formatConfig = EXPORT_FORMAT_CONFIG[fmt];
                  const FormatIcon = FORMAT_ICON_MAP[formatConfig.icon] || FileText;
                  return (
                    <Button
                      key={fmt}
                      variant={selectedFormat === fmt ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setSelectedFormat(fmt)}
                    >
                      <FormatIcon className="w-4 h-4" />
                      {formatConfig.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Generation Progress */}
            {generationState === 'generating' && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">Generating report...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {report.estimatedGenerationTime}
                </p>
              </div>
            )}

            {/* Complete State */}
            {generationState === 'complete' && (
              <div className="space-y-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Report ready!
                  </span>
                </div>
                <Button className="w-full gap-2" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download {EXPORT_FORMAT_CONFIG[selectedFormat].label}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="py-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setSavePresetOpen(true)}
            >
              <BookMarked className="w-4 h-4" />
              Save Preset
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleGenerate}
              disabled={generationState === 'generating'}
            >
              {generationState === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : generationState === 'complete' ? (
                <>
                  <Play className="w-4 h-4" />
                  Regenerate
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <SavePresetDialog
        open={savePresetOpen}
        onOpenChange={setSavePresetOpen}
        report={report}
        filters={filters}
      />
    </>
  );
}
