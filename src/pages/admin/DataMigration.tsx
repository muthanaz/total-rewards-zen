import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2,
  AlertCircle,
  Info,
  Copy,
  Database,
  Wand2,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { allTemplates, templateCategories, TemplateSection } from '@/components/admin/MigrationTemplates';
import { downloadTemplate, downloadCompleteMigrationPackage } from '@/components/admin/ExcelGenerator';
import SampleDataGenerator from '@/components/admin/SampleDataGenerator';
import DataImportWizard from '@/components/admin/DataImportWizard';
import AdminSeedData from '@/components/admin/AdminSeedData';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DataMigrationPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('organization');

  const handleDownloadTemplate = (template: TemplateSection) => {
    downloadTemplate(template);
    toast({
      title: 'Template Downloaded',
      description: `${template.title} template has been downloaded.`,
    });
  };

  const handleDownloadAll = () => {
    downloadCompleteMigrationPackage();
    toast({
      title: 'All Templates Downloaded',
      description: 'Complete migration package has been downloaded.',
    });
  };

  const handleCopyExample = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Example copied to clipboard.',
    });
  };

  const getCategoryTemplates = (categoryKey: string) => {
    const category = templateCategories[categoryKey as keyof typeof templateCategories];
    return allTemplates.filter(t => category?.templates.includes(t.id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header using shared PageHeader component */}
      <PageHeader
        title="Data Migration & Onboarding"
        description="Comprehensive templates, import tools, and sample data generation"
        icon={Database}
        iconClassName="from-accent to-accent/80"
        actions={
          <Button onClick={handleDownloadAll} className="gap-2">
            <Download className="w-4 h-4" />
            Download All Templates
          </Button>
        }
      />

      {/* Progress Overview */}
      <Card className="border-accent/20 bg-gradient-to-r from-card to-accent/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-background/50">
              <p className="text-3xl font-bold text-accent">{allTemplates.length}</p>
              <p className="text-sm text-muted-foreground">Data Templates</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50">
              <p className="text-3xl font-bold text-accent">
                {allTemplates.reduce((acc, t) => acc + t.fields.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Fields</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50">
              <p className="text-3xl font-bold text-accent">
                {allTemplates.reduce((acc, t) => acc + t.fields.filter(f => f.required).length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Required Fields</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50">
              <p className="text-3xl font-bold text-accent">
                {Object.keys(templateCategories).length}
              </p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50">
              <p className="text-3xl font-bold text-success">100%</p>
              <p className="text-sm text-muted-foreground">Coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="w-4 h-4" />
            Import Wizard
          </TabsTrigger>
          <TabsTrigger value="generator" className="gap-2">
            <Wand2 className="w-4 h-4" />
            Sample Data
          </TabsTrigger>
          <TabsTrigger value="admin-seed" className="gap-2">
            <Database className="w-4 h-4" />
            Admin Seed
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-2">
            <Settings className="w-4 h-4" />
            Validation Rules
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Workflow</CardTitle>
              <CardDescription>
                Follow these steps to successfully migrate your data to the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: 1, title: 'Download Templates', desc: 'Get Excel templates for all data types', icon: Download },
                  { step: 2, title: 'Prepare Data', desc: 'Fill templates following field specifications', icon: FileSpreadsheet },
                  { step: 3, title: 'Validate & Review', desc: 'Run validation checks and fix errors', icon: CheckCircle2 },
                  { step: 4, title: 'Import & Verify', desc: 'Upload data and verify in platform', icon: Upload },
                ].map((item) => (
                  <div key={item.step} className="p-4 rounded-lg border bg-card hover:border-accent/40 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                        {item.step}
                      </div>
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex-wrap">
              {Object.entries(templateCategories).map(([key, cat]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(templateCategories).map(([key, cat]) => (
              <TabsContent key={key} value={key} className="space-y-4 mt-4">
                {getCategoryTemplates(key).map((template) => (
                  <TemplateDetails 
                    key={template.id} 
                    template={template} 
                    onDownload={handleDownloadTemplate} 
                    onCopy={handleCopyExample} 
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>

          {/* Quick Links to All Templates */}
          <Card>
            <CardHeader>
              <CardTitle>All Templates</CardTitle>
              <CardDescription>Quick download links for all available templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allTemplates.map((template) => (
                  <div key={template.id} className="p-4 rounded-lg border hover:border-accent/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <template.icon className="w-4 h-4 text-accent" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {template.fields.length} fields
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full mt-3 gap-2"
                      onClick={() => handleDownloadTemplate(template)}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Wizard Tab */}
        <TabsContent value="import">
          <DataImportWizard />
        </TabsContent>

        {/* Sample Data Generator Tab */}
        <TabsContent value="generator">
          <SampleDataGenerator />
        </TabsContent>

        {/* Admin Seed Data Tab */}
        <TabsContent value="admin-seed">
          <AdminSeedData />
        </TabsContent>

        {/* Validation Rules Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Data Validation Rules
              </CardTitle>
              <CardDescription>
                Validation checks performed during import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { 
                    category: 'Employee Data', 
                    rules: [
                      'Unique employee IDs across organization',
                      'Valid email format (user@domain.com)',
                      'Emirates ID format (784-XXXX-XXXXXXX-X)',
                      'Date of birth must be in the past',
                      'Phone numbers in international format (+971...)',
                      'Passport expiry must be future date',
                    ] 
                  },
                  { 
                    category: 'Employment Details', 
                    rules: [
                      'Employment date not in the future',
                      'Grade code must match grade structure',
                      'Valid contract type (Permanent, Fixed-term, etc.)',
                      'Manager employee ID must exist',
                      'Visa expiry must be future date',
                      'Cost center format validation',
                    ] 
                  },
                  { 
                    category: 'Salary & Compensation', 
                    rules: [
                      'Positive values for all amounts',
                      'Valid currency codes (ISO 4217)',
                      'Effective date required',
                      'Basic salary within defined ranges',
                      'Bonus target between 0-200%',
                      'Valid IBAN format for bank accounts',
                    ] 
                  },
                  { 
                    category: 'Benefits Policy', 
                    rules: [
                      'Unique benefit codes',
                      'Valid benefit_type enum values',
                      'Valid life_area enum values',
                      'Icon name from Lucide icons',
                      'Claim frequency validation',
                      'Proration rule validation',
                    ] 
                  },
                  { 
                    category: 'Benefit Entitlements', 
                    rules: [
                      'Grade code must exist',
                      'Benefit code must exist',
                      'Annual allowance positive number',
                      'Rollover percentage 0-100',
                      'Coverage level validation',
                      'Co-pay percentage 0-100',
                    ] 
                  },
                  { 
                    category: 'Dependents', 
                    rules: [
                      'Parent employee must exist',
                      'Children age calculation for eligibility',
                      'Valid relationship types',
                      'Unique Emirates ID per dependent',
                      'School name for school-age children',
                      'Tuition amount validation',
                    ] 
                  },
                  { 
                    category: 'Leave Balances', 
                    rules: [
                      'Total days within policy limits',
                      'Used days <= Total days',
                      'Valid leave types',
                      'Year in valid range (current/next)',
                      'Accrual rate validation',
                      'Encashment limits validation',
                    ] 
                  },
                  { 
                    category: 'Vendors & Marketplace', 
                    rules: [
                      'Unique vendor codes',
                      'Valid trade license number',
                      'Commission rate 0-50%',
                      'Valid IBAN for settlements',
                      'Offer dates validation',
                      'Discount percentage validation',
                    ] 
                  },
                ].map((section) => (
                  <div key={section.category} className="p-4 rounded-lg border">
                    <h3 className="font-semibold text-sm mb-3">{section.category}</h3>
                    <ul className="space-y-2">
                      {section.rules.map((rule, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Template Details Component
function TemplateDetails({ 
  template, 
  onDownload, 
  onCopy 
}: { 
  template: TemplateSection; 
  onDownload: (template: TemplateSection) => void;
  onCopy: (text: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <template.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {template.description}
                <Badge variant="outline" className="text-[10px]">
                  Table: {template.tableName}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => onDownload(template)} className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Field Specifications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Field Name</th>
                <th className="text-left py-2 px-3 font-medium">Type</th>
                <th className="text-left py-2 px-3 font-medium">Required</th>
                <th className="text-left py-2 px-3 font-medium">Description</th>
                <th className="text-left py-2 px-3 font-medium">Example</th>
                <th className="text-left py-2 px-3 font-medium">Validation</th>
              </tr>
            </thead>
            <tbody>
              {template.fields.map((field) => (
                <tr key={field.name} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 px-3 font-mono text-xs">{field.name}</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                  </td>
                  <td className="py-2 px-3">
                    {field.required ? (
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Optional</Badge>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs text-muted-foreground max-w-xs">{field.description}</td>
                  <td className="py-2 px-3">
                    <button 
                      onClick={() => onCopy(field.example)}
                      className="flex items-center gap-1 text-xs font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                    >
                      <span className="max-w-[150px] truncate">{field.example}</span>
                      <Copy className="w-3 h-3 text-muted-foreground shrink-0" />
                    </button>
                  </td>
                  <td className="py-2 px-3 text-xs text-muted-foreground max-w-xs">{field.validation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {template.notes && template.notes.length > 0 && (
          <div className="p-4 rounded-lg bg-info/5 border border-info/20">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-info" />
              <span className="font-medium text-sm text-info">Important Notes</span>
            </div>
            <ul className="space-y-1">
              {template.notes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-info">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
