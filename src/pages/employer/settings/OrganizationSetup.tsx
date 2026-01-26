/**
 * Organization Setup Page
 * 
 * Employer settings for configuring organization structure:
 * - Legal Entities, Business Units, Departments
 * - Cost Centers, Locations, Grades
 * - Employment Types, Segment Tags
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Building2, Users, MapPin, Briefcase, Tag, Settings, ChevronRight } from 'lucide-react';
import { useOrgStructure } from '@/hooks/useOrgStructure';
import { OrgStructureTable } from '@/components/employer/settings/OrgStructureTable';
import { CreateEntityDialog } from '@/components/employer/settings/CreateEntityDialog';
import { useLanguage } from '@/contexts/LanguageContext';

const TABS = [
  { id: 'legal_entities', label: 'Legal Entities', labelAr: 'الكيانات القانونية', icon: Building2 },
  { id: 'business_units', label: 'Business Units', labelAr: 'وحدات الأعمال', icon: Briefcase },
  { id: 'departments', label: 'Departments', labelAr: 'الأقسام', icon: Users },
  { id: 'cost_centers', label: 'Cost Centers', labelAr: 'مراكز التكلفة', icon: Settings },
  { id: 'locations', label: 'Locations', labelAr: 'المواقع', icon: MapPin },
  { id: 'grades', label: 'Grades', labelAr: 'الدرجات', icon: ChevronRight },
  { id: 'employment_types', label: 'Employment Types', labelAr: 'أنواع التوظيف', icon: Briefcase },
  { id: 'segment_tags', label: 'Segment Tags', labelAr: 'علامات التقسيم', icon: Tag },
] as const;

type TabId = typeof TABS[number]['id'];

export default function OrganizationSetupPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [activeTab, setActiveTab] = useState<TabId>('departments');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data, 
    isLoading, 
    createEntity, 
    updateEntity, 
    deleteEntity,
    isCreating 
  } = useOrgStructure(activeTab);

  const activeTabConfig = TABS.find(t => t.id === activeTab)!;
  const TabIcon = activeTabConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRTL ? 'إعداد المنظمة' : 'Organization Setup'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? 'إدارة الهيكل التنظيمي والتكوينات'
                : 'Manage your organizational structure and configurations'
              }
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {isRTL ? 'إضافة جديد' : `Add ${activeTabConfig.label.slice(0, -1)}`}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 data-[state=active]:bg-background"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{isRTL ? tab.labelAr : tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TabIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {isRTL ? tab.labelAr : tab.label}
                      </CardTitle>
                      <CardDescription>
                        {getTabDescription(tab.id, isRTL)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {data?.length || 0} {isRTL ? 'سجل' : 'records'}
                  </Badge>
                </div>
                
                {/* Search */}
                <div className="mt-4">
                  <Input
                    placeholder={isRTL ? 'بحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <OrgStructureTable
                  entityType={tab.id}
                  data={data || []}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onEdit={(entity) => updateEntity.mutate(entity)}
                  onDelete={(id) => deleteEntity.mutate(id)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dialog */}
      <CreateEntityDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        entityType={activeTab}
        onSubmit={(data) => {
          createEntity.mutate(data, {
            onSuccess: () => setCreateDialogOpen(false),
          });
        }}
        isLoading={isCreating}
      />
    </div>
  );
}

function getTabDescription(tabId: TabId, isRTL: boolean): string {
  const descriptions: Record<TabId, { en: string; ar: string }> = {
    legal_entities: { 
      en: 'Manage legal entities and registrations', 
      ar: 'إدارة الكيانات القانونية والتسجيلات' 
    },
    business_units: { 
      en: 'Configure business units and divisions', 
      ar: 'تكوين وحدات الأعمال والأقسام' 
    },
    departments: { 
      en: 'Manage departments and team structures', 
      ar: 'إدارة الأقسام وهياكل الفرق' 
    },
    cost_centers: { 
      en: 'Define cost centers and budget allocations', 
      ar: 'تحديد مراكز التكلفة وتخصيصات الميزانية' 
    },
    locations: { 
      en: 'Configure work locations and offices', 
      ar: 'تكوين مواقع العمل والمكاتب' 
    },
    grades: { 
      en: 'Define grade bands and salary ranges', 
      ar: 'تحديد نطاقات الدرجات والرواتب' 
    },
    employment_types: { 
      en: 'Configure contract and employment types', 
      ar: 'تكوين أنواع العقود والتوظيف' 
    },
    segment_tags: { 
      en: 'Create custom tags for employee segmentation', 
      ar: 'إنشاء علامات مخصصة لتقسيم الموظفين' 
    },
  };
  
  return isRTL ? descriptions[tabId].ar : descriptions[tabId].en;
}
