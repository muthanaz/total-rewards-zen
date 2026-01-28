/**
 * Reports Page
 * 
 * Curated executive and operations report library with
 * one-click generation, filtering, and preset saving.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, History, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ReportsStats,
  ReportCard,
  ReportGenerationDrawer,
  RecentReportsTable,
  DEFAULT_REPORTS,
  SAVED_PRESETS,
  RECENT_REPORTS,
  ReportDefinition,
} from '@/components/employer/reports';

export default function ReportsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('library');

  const handleGenerate = (report: ReportDefinition) => {
    setSelectedReport(report);
    setDrawerOpen(true);
  };

  const handleConfigure = (report: ReportDefinition) => {
    setSelectedReport(report);
    setDrawerOpen(true);
  };

  // Stats
  const scheduledCount = DEFAULT_REPORTS.filter((r) => r.schedulable).length;

  return (
    <div className={cn('p-6 space-y-6 animate-fade-in', isRTL && 'text-right')}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'ar' ? 'مكتبة التقارير' : 'Report Library'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {language === 'ar'
            ? 'تقارير جاهزة للتنفيذيين وفرق العمليات'
            : 'Curated reports for executives and operations teams'}
        </p>
      </div>

      {/* Stats */}
      <ReportsStats
        totalReports={DEFAULT_REPORTS.length}
        recentGenerations={RECENT_REPORTS.length}
        savedPresets={SAVED_PRESETS.length}
        scheduledReports={scheduledCount}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="library" className="gap-2">
            <FileText className="w-4 h-4" />
            Report Library
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <History className="w-4 h-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-2">
            <BookMarked className="w-4 h-4" />
            Saved Presets
          </TabsTrigger>
        </TabsList>

        {/* Library Tab */}
        <TabsContent value="library" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_REPORTS.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onGenerate={handleGenerate}
                onConfigure={handleConfigure}
              />
            ))}
          </div>
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="presets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Recently Generated Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentReportsTable reports={RECENT_REPORTS} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-muted-foreground" />
                Saved Filter Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {SAVED_PRESETS.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No saved presets yet</p>
                  <p className="text-xs mt-1">
                    Generate a report with custom filters and save them as a preset
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {SAVED_PRESETS.map((preset) => {
                    const report = DEFAULT_REPORTS.find(
                      (r) => r.id === preset.reportId
                    );
                    return (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {
                          if (report) {
                            setSelectedReport(report);
                            setDrawerOpen(true);
                          }
                        }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{preset.name}</p>
                            {preset.isDefault && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {report?.name} • Created by {preset.createdBy}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generation Drawer */}
      <ReportGenerationDrawer
        report={selectedReport}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
