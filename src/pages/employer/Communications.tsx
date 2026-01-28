import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Megaphone, 
  Plus, 
  Send,
  FileEdit,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  CommunicationsStats,
  AudienceBuilder,
  TemplateEditor,
  CampaignGuardrails,
  CampaignMetricsCard,
  CampaignTable,
  mockCampaigns,
  mockTemplates,
  mockSegments,
  getCampaignStats,
  Campaign,
  AudienceFilter,
  CampaignPurpose,
} from '@/components/employer/communications';

export default function CommunicationsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const [activeTab, setActiveTab] = useState<'campaigns' | 'create'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Create campaign state
  const [audienceType, setAudienceType] = useState<'segment' | 'filter' | 'all'>('all');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>();
  const [filters, setFilters] = useState<AudienceFilter>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [purpose, setPurpose] = useState<CampaignPurpose>('reminder');
  const [requiresPreview, setRequiresPreview] = useState(true);
  const [previewApproved, setPreviewApproved] = useState(false);
  const [optOutHandling, setOptOutHandling] = useState<'respect' | 'override_critical'>('respect');

  const stats = useMemo(() => getCampaignStats(mockCampaigns), []);

  const estimatedRecipients = useMemo(() => {
    if (audienceType === 'all') return 342;
    if (audienceType === 'segment' && selectedSegmentId) {
      return mockSegments.find(s => s.id === selectedSegmentId)?.estimatedCount || 0;
    }
    // Rough estimate for filters
    let estimate = 342;
    if (filters.grades?.length) estimate = Math.floor(estimate * (filters.grades.length / 8));
    if (filters.departments?.length) estimate = Math.floor(estimate * (filters.departments.length / 6));
    if (filters.locations?.length) estimate = Math.floor(estimate * (filters.locations.length / 4));
    return estimate;
  }, [audienceType, selectedSegmentId, filters]);

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailsOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    toast.info('Opening campaign editor...', {
      description: campaign.name,
    });
  };

  const handleDuplicateCampaign = (campaign: Campaign) => {
    toast.success('Campaign duplicated', {
      description: `Copy of "${campaign.name}" created as draft`,
    });
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    toast.success('Campaign deleted');
  };

  const handleSendCampaign = (campaign: Campaign) => {
    toast.success('Campaign sent!', {
      description: `Sending to ${campaign.estimatedRecipients} recipients`,
    });
  };

  const handleCancelCampaign = (campaign: Campaign) => {
    toast.info('Campaign cancelled');
  };

  const handleCreateCampaign = () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template');
      return;
    }
    if (requiresPreview && !previewApproved) {
      toast.error('Preview approval required');
      return;
    }
    toast.success('Campaign created!', {
      description: `Ready to send to ${estimatedRecipients} recipients`,
    });
    setActiveTab('campaigns');
  };

  const handleRequestPreviewApproval = () => {
    toast.info('Preview approval requested', {
      description: 'Awaiting approval from designated approver',
    });
    // Simulate approval for demo
    setTimeout(() => {
      setPreviewApproved(true);
      toast.success('Preview approved!');
    }, 2000);
  };

  return (
    <div className={cn('p-6 space-y-6 animate-fade-in', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'ar' ? 'الاتصالات' : 'Communications'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'ar' 
              ? 'إدارة الحملات والإشعارات للموظفين'
              : 'Manage targeted campaigns and employee notifications'
            }
          </p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => setActiveTab('create')}
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <CommunicationsStats stats={stats} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-2">
            <Megaphone className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <FileEdit className="w-4 h-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignTable
            campaigns={mockCampaigns}
            onView={handleViewCampaign}
            onEdit={handleEditCampaign}
            onDuplicate={handleDuplicateCampaign}
            onDelete={handleDeleteCampaign}
            onSend={handleSendCampaign}
            onCancel={handleCancelCampaign}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Audience & Template */}
            <div className="lg:col-span-2 space-y-4">
              <AudienceBuilder
                segments={mockSegments}
                audienceType={audienceType}
                selectedSegmentId={selectedSegmentId}
                filters={filters}
                onAudienceTypeChange={setAudienceType}
                onSegmentChange={setSelectedSegmentId}
                onFiltersChange={setFilters}
                estimatedCount={estimatedRecipients}
              />

              <TemplateEditor
                templates={mockTemplates}
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={setSelectedTemplateId}
              />
            </div>

            {/* Right Column - Guardrails & Actions */}
            <div className="space-y-4">
              <CampaignGuardrails
                purpose={purpose}
                onPurposeChange={setPurpose}
                requiresPreview={requiresPreview}
                onRequiresPreviewChange={setRequiresPreview}
                previewApproved={previewApproved}
                optOutHandling={optOutHandling}
                onOptOutHandlingChange={setOptOutHandling}
                onRequestPreviewApproval={handleRequestPreviewApproval}
              />

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  className="w-full gap-2"
                  onClick={handleCreateCampaign}
                  disabled={!selectedTemplateId || (requiresPreview && !previewApproved)}
                >
                  <Send className="w-4 h-4" />
                  Create & Send Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    toast.success('Campaign scheduled');
                  }}
                  disabled={!selectedTemplateId}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule for Later
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {selectedCampaign?.name}
            </SheetTitle>
            <SheetDescription>
              {selectedCampaign?.status === 'sent' 
                ? 'Campaign performance metrics'
                : 'Campaign details'
              }
            </SheetDescription>
          </SheetHeader>

          {selectedCampaign && (
            <div className="mt-6 space-y-4">
              {selectedCampaign.metrics && (
                <CampaignMetricsCard metrics={selectedCampaign.metrics} />
              )}

              <div className="p-4 rounded-lg bg-muted space-y-3">
                <h4 className="text-sm font-medium">Campaign Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Audience:</span>
                  </div>
                  <div>
                    {selectedCampaign.audienceType === 'all' 
                      ? 'All Employees' 
                      : selectedCampaign.segment?.name || 'Custom Filter'
                    }
                  </div>
                  <div>
                    <span className="text-muted-foreground">Template:</span>
                  </div>
                  <div>{selectedCampaign.template?.name}</div>
                  <div>
                    <span className="text-muted-foreground">Created by:</span>
                  </div>
                  <div>{selectedCampaign.createdBy}</div>
                  {selectedCampaign.previewApprovedBy && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Approved by:</span>
                      </div>
                      <div>{selectedCampaign.previewApprovedBy}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
