import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Users, 
  Building2, 
  DollarSign, 
  Heart, 
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  Copy,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Home,
  Car,
  Dumbbell,
  PiggyBank,
  Shield,
  Clock,
  Database,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FieldSpec {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
  validation?: string;
}

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  fields: FieldSpec[];
  notes?: string[];
}

const employeeDataTemplate: TemplateSection = {
  id: 'employee_data',
  title: 'Employee Master Data',
  description: 'Core employee information required for user profiles and benefits assignment',
  icon: Users,
  fields: [
    { name: 'employee_id', type: 'String', required: true, description: 'Unique employee identifier from HR system', example: 'EMP-001234', validation: 'Must be unique across organization' },
    { name: 'email', type: 'Email', required: true, description: 'Corporate email address (used for login)', example: 'john.smith@company.com', validation: 'Valid email format' },
    { name: 'first_name', type: 'String', required: true, description: 'Employee first name', example: 'John', validation: 'Max 50 characters' },
    { name: 'last_name', type: 'String', required: true, description: 'Employee last name', example: 'Smith', validation: 'Max 50 characters' },
    { name: 'phone', type: 'String', required: false, description: 'Mobile phone number with country code', example: '+971501234567', validation: 'International format' },
    { name: 'nationality', type: 'String', required: true, description: 'Country of citizenship', example: 'United Kingdom', validation: 'ISO country name' },
    { name: 'date_of_birth', type: 'Date', required: true, description: 'Birth date for age-related benefits', example: '1985-06-15', validation: 'YYYY-MM-DD format' },
    { name: 'emirates_id', type: 'String', required: true, description: 'UAE Emirates ID number', example: '784-1985-1234567-1', validation: '15 digits with hyphens' },
    { name: 'passport_number', type: 'String', required: true, description: 'Passport number', example: 'AB1234567', validation: 'Alphanumeric' },
    { name: 'blood_type', type: 'Enum', required: false, description: 'Blood type for medical emergencies', example: 'O+', validation: 'A+, A-, B+, B-, AB+, AB-, O+, O-' },
    { name: 'marital_status', type: 'Enum', required: true, description: 'Marital status (affects family benefits)', example: 'Married', validation: 'Single, Married, Divorced, Widowed' },
    { name: 'spouse_name', type: 'String', required: false, description: 'Spouse name if married', example: 'Jane Smith', validation: 'Required if married' },
    { name: 'spouse_employer', type: 'String', required: false, description: 'Spouse employer (for duplicate benefit check)', example: 'ABC Corporation', validation: 'Optional' },
    { name: 'emergency_contact_name', type: 'String', required: true, description: 'Emergency contact full name', example: 'Mary Smith', validation: 'Max 100 characters' },
    { name: 'emergency_contact_phone', type: 'String', required: true, description: 'Emergency contact phone', example: '+971501234568', validation: 'International format' },
    { name: 'home_location', type: 'String', required: false, description: 'Residential area for transport calculation', example: 'Dubai Marina', validation: 'Free text' },
    { name: 'preferred_language', type: 'Enum', required: false, description: 'UI language preference', example: 'en', validation: 'en, ar' },
    { name: 'avatar_url', type: 'URL', required: false, description: 'Profile photo URL', example: 'https://...', validation: 'Valid URL' },
  ],
  notes: [
    'All personal data is encrypted at rest and in transit',
    'Emirates ID and Passport are stored in encrypted format',
    'Marital status determines eligibility for family benefits',
  ],
};

const employmentDataTemplate: TemplateSection = {
  id: 'employment_data',
  title: 'Employment Details',
  description: 'Job-related information for organizational structure and benefit tiers',
  icon: Briefcase,
  fields: [
    { name: 'employment_date', type: 'Date', required: true, description: 'Date of joining the organization', example: '2023-01-15', validation: 'YYYY-MM-DD format' },
    { name: 'department', type: 'String', required: true, description: 'Department name', example: 'Technology', validation: 'Must match org structure' },
    { name: 'position', type: 'String', required: true, description: 'Job title', example: 'Senior Product Manager', validation: 'Max 100 characters' },
    { name: 'grade', type: 'String', required: true, description: 'Employee grade/level for benefit tiers', example: 'G7', validation: 'Must match grade structure' },
    { name: 'work_location', type: 'String', required: true, description: 'Office location', example: 'DIFC Tower 2', validation: 'Must match location list' },
    { name: 'manager_name', type: 'String', required: false, description: 'Direct manager name', example: 'Sarah Johnson', validation: 'Max 100 characters' },
    { name: 'manager_email', type: 'Email', required: false, description: 'Manager email for approvals', example: 'sarah.johnson@company.com', validation: 'Valid email' },
    { name: 'contract_type', type: 'Enum', required: true, description: 'Employment contract type', example: 'Permanent', validation: 'Permanent, Fixed-term, Probation' },
    { name: 'probation_end_date', type: 'Date', required: false, description: 'Probation period end date', example: '2023-04-15', validation: 'YYYY-MM-DD format' },
  ],
  notes: [
    'Grade determines benefit tier and allowance amounts',
    'Department is used for segment analytics',
    'Manager email enables approval workflows',
  ],
};

const salaryDataTemplate: TemplateSection = {
  id: 'salary_data',
  title: 'Salary & Compensation',
  description: 'Compensation data for salary display and benefit calculations',
  icon: DollarSign,
  fields: [
    { name: 'monthly_basic_salary', type: 'Decimal', required: true, description: 'Monthly basic salary in AED', example: '25000.00', validation: 'Positive number' },
    { name: 'housing_allowance_monthly', type: 'Decimal', required: true, description: 'Monthly housing allowance in AED', example: '10000.00', validation: 'Positive number' },
    { name: 'transport_allowance_monthly', type: 'Decimal', required: true, description: 'Monthly transport allowance in AED', example: '2000.00', validation: 'Positive number' },
    { name: 'other_allowances_monthly', type: 'Decimal', required: false, description: 'Other monthly allowances in AED', example: '1500.00', validation: 'Positive number' },
    { name: 'annual_bonus_target', type: 'Decimal', required: false, description: 'Target annual bonus (% of salary)', example: '20', validation: '0-200' },
    { name: 'currency', type: 'String', required: true, description: 'Salary currency code', example: 'AED', validation: 'ISO currency code' },
    { name: 'payment_frequency', type: 'Enum', required: true, description: 'Salary payment frequency', example: 'Monthly', validation: 'Monthly, Bi-weekly' },
    { name: 'bank_name', type: 'String', required: false, description: 'Salary bank name', example: 'Emirates NBD', validation: 'Free text' },
    { name: 'effective_date', type: 'Date', required: true, description: 'Salary effective date', example: '2024-01-01', validation: 'YYYY-MM-DD format' },
  ],
  notes: [
    'Salary data is encrypted and only visible to authorized users',
    'Housing allowance affects eligibility for housing benefit',
    'Annual bonus target is used for total compensation display',
  ],
};

const dependentsDataTemplate: TemplateSection = {
  id: 'dependents_data',
  title: 'Dependents & Family',
  description: 'Family member data for education, health, and family benefits',
  icon: GraduationCap,
  fields: [
    { name: 'employee_id', type: 'String', required: true, description: 'Parent employee ID (foreign key)', example: 'EMP-001234', validation: 'Must exist in employees' },
    { name: 'dependent_type', type: 'Enum', required: true, description: 'Relationship to employee', example: 'Child', validation: 'Spouse, Child, Parent' },
    { name: 'name', type: 'String', required: true, description: 'Dependent full name', example: 'Emily Smith', validation: 'Max 100 characters' },
    { name: 'date_of_birth', type: 'Date', required: true, description: 'Dependent birth date', example: '2015-03-20', validation: 'YYYY-MM-DD format' },
    { name: 'gender', type: 'Enum', required: true, description: 'Dependent gender', example: 'Female', validation: 'Male, Female' },
    { name: 'school_name', type: 'String', required: false, description: 'Current school name (for children)', example: 'GEMS Wellington', validation: 'For school-age children' },
    { name: 'grade_level', type: 'String', required: false, description: 'Current school grade', example: 'Grade 5', validation: 'KG1-Grade 12' },
    { name: 'annual_tuition', type: 'Decimal', required: false, description: 'Annual school tuition in AED', example: '55000.00', validation: 'Positive number' },
    { name: 'health_insurance_included', type: 'Boolean', required: true, description: 'Include in health insurance', example: 'true', validation: 'true/false' },
    { name: 'emirates_id', type: 'String', required: false, description: 'Dependent Emirates ID', example: '784-2015-1234568-1', validation: '15 digits' },
  ],
  notes: [
    'Children over 18 may not be eligible for education benefits',
    'Spouse employment status affects duplicate benefit checks',
    'Health insurance coverage depends on policy tier',
  ],
};

const benefitsPolicyTemplate: TemplateSection = {
  id: 'benefits_policy',
  title: 'Benefits Policy Structure',
  description: 'Define benefit types, tiers, and eligibility rules',
  icon: Heart,
  fields: [
    { name: 'benefit_code', type: 'String', required: true, description: 'Unique benefit identifier', example: 'HOUSING_ALLOW', validation: 'Uppercase, underscores' },
    { name: 'benefit_name', type: 'String', required: true, description: 'Display name', example: 'Housing Allowance', validation: 'Max 100 characters' },
    { name: 'benefit_name_ar', type: 'String', required: true, description: 'Arabic display name', example: 'بدل السكن', validation: 'Arabic text' },
    { name: 'benefit_type', type: 'Enum', required: true, description: 'Benefit category', example: 'cash_allowances', validation: 'cash_allowances, health_protection, time_off_flex, growth_career, wealth_ownership, wellbeing' },
    { name: 'life_area', type: 'Enum', required: true, description: 'Life area category', example: 'home_living', validation: 'home_living, family_parenting, health, money, career, lifestyle, mobility' },
    { name: 'description', type: 'Text', required: true, description: 'Benefit description', example: 'Monthly housing support...', validation: 'Max 500 characters' },
    { name: 'is_taxable', type: 'Boolean', required: true, description: 'Subject to taxation', example: 'false', validation: 'true/false' },
    { name: 'requires_approval', type: 'Boolean', required: true, description: 'Requires manager approval', example: 'false', validation: 'true/false' },
    { name: 'requires_documentation', type: 'Boolean', required: true, description: 'Requires supporting documents', example: 'true', validation: 'true/false' },
    { name: 'claim_frequency', type: 'Enum', required: true, description: 'How often can be claimed', example: 'Monthly', validation: 'One-time, Monthly, Quarterly, Annual' },
    { name: 'proration_rule', type: 'Enum', required: true, description: 'Proration for new joiners', example: 'Monthly', validation: 'None, Monthly, Quarterly' },
  ],
  notes: [
    'Each benefit type maps to a life area for dashboard grouping',
    'Proration rules apply to mid-year joiners',
    'Approval workflows are configured separately',
  ],
};

const benefitEntitlementTemplate: TemplateSection = {
  id: 'benefit_entitlement',
  title: 'Benefit Entitlements by Grade',
  description: 'Map employee grades to specific benefit amounts',
  icon: Shield,
  fields: [
    { name: 'grade', type: 'String', required: true, description: 'Employee grade level', example: 'G7', validation: 'Must match grade structure' },
    { name: 'benefit_code', type: 'String', required: true, description: 'Benefit code (foreign key)', example: 'HOUSING_ALLOW', validation: 'Must exist in benefits' },
    { name: 'annual_allowance', type: 'Decimal', required: true, description: 'Annual entitlement in AED', example: '120000.00', validation: 'Positive number' },
    { name: 'max_claim_per_transaction', type: 'Decimal', required: false, description: 'Max single claim amount', example: '10000.00', validation: 'Positive number' },
    { name: 'rollover_allowed', type: 'Boolean', required: true, description: 'Unused balance rolls over', example: 'false', validation: 'true/false' },
    { name: 'rollover_max_percent', type: 'Decimal', required: false, description: 'Max % that can roll over', example: '25', validation: '0-100' },
    { name: 'eligibility_start', type: 'Enum', required: true, description: 'When benefit becomes active', example: 'Immediately', validation: 'Immediately, After_Probation, After_1_Year' },
    { name: 'dependent_coverage', type: 'Enum', required: false, description: 'Family coverage level', example: 'Employee_Spouse_Children', validation: 'Employee_Only, Employee_Spouse, Employee_Spouse_Children, Full_Family' },
  ],
  notes: [
    'Grade-based entitlements override default benefit values',
    'Rollover rules are processed at fiscal year end',
    'Eligibility conditions are checked automatically',
  ],
};

const leaveBalanceTemplate: TemplateSection = {
  id: 'leave_balance',
  title: 'Leave Balances',
  description: 'Initial leave balances and accrual rules',
  icon: Calendar,
  fields: [
    { name: 'employee_id', type: 'String', required: true, description: 'Employee ID (foreign key)', example: 'EMP-001234', validation: 'Must exist in employees' },
    { name: 'leave_type', type: 'Enum', required: true, description: 'Type of leave', example: 'Annual', validation: 'Annual, Sick, Maternity, Paternity, Compassionate, Hajj, Study' },
    { name: 'year', type: 'Integer', required: true, description: 'Leave year', example: '2026', validation: 'YYYY format' },
    { name: 'total_days', type: 'Integer', required: true, description: 'Total entitled days', example: '30', validation: 'Positive integer' },
    { name: 'used_days', type: 'Integer', required: true, description: 'Days already used', example: '5', validation: '0 or positive integer' },
    { name: 'carried_over', type: 'Integer', required: false, description: 'Days carried from previous year', example: '5', validation: '0 or positive integer' },
    { name: 'accrual_rate', type: 'Enum', required: true, description: 'How leave accrues', example: 'Monthly', validation: 'Upfront, Monthly, Quarterly' },
    { name: 'encashment_allowed', type: 'Boolean', required: true, description: 'Can encash unused leave', example: 'true', validation: 'true/false' },
    { name: 'max_encashment_days', type: 'Integer', required: false, description: 'Max days that can be encashed', example: '10', validation: 'Positive integer' },
  ],
  notes: [
    'UAE Labor Law mandates minimum 30 days annual leave after 1 year',
    'Sick leave requires medical certificate after 2 days',
    'Maternity leave is 60 days (45 full pay, 15 half pay)',
  ],
};

const organizationSetupTemplate: TemplateSection = {
  id: 'organization_setup',
  title: 'Organization Configuration',
  description: 'Company-level settings and branding',
  icon: Building2,
  fields: [
    { name: 'organization_name', type: 'String', required: true, description: 'Legal company name', example: 'Demo Company LLC', validation: 'Max 200 characters' },
    { name: 'organization_name_ar', type: 'String', required: false, description: 'Arabic company name', example: 'شركة ديمو ذ.م.م', validation: 'Arabic text' },
    { name: 'domain', type: 'String', required: true, description: 'Email domain for SSO', example: 'company.com', validation: 'Valid domain' },
    { name: 'logo_url', type: 'URL', required: false, description: 'Company logo URL', example: 'https://...', validation: 'Valid URL, PNG/SVG' },
    { name: 'primary_color', type: 'String', required: false, description: 'Brand primary color', example: '#0f766e', validation: 'Hex color code' },
    { name: 'secondary_color', type: 'String', required: false, description: 'Brand secondary color', example: '#115e59', validation: 'Hex color code' },
    { name: 'accent_color', type: 'String', required: false, description: 'Brand accent color', example: '#2dd4bf', validation: 'Hex color code' },
    { name: 'fiscal_year_start', type: 'String', required: true, description: 'Fiscal year start month', example: '01', validation: '01-12' },
    { name: 'default_currency', type: 'String', required: true, description: 'Default currency', example: 'AED', validation: 'ISO currency' },
    { name: 'timezone', type: 'String', required: true, description: 'Organization timezone', example: 'Asia/Dubai', validation: 'IANA timezone' },
    { name: 'welcome_message', type: 'Text', required: false, description: 'Dashboard welcome text', example: 'Welcome to your benefits portal', validation: 'Max 500 chars' },
    { name: 'footer_text', type: 'String', required: false, description: 'Footer copyright text', example: '© 2026 Company LLC', validation: 'Max 200 chars' },
  ],
  notes: [
    'Domain is used for automatic user provisioning via SSO',
    'Colors should meet WCAG contrast requirements',
    'Fiscal year affects benefit period calculations',
  ],
};

const allTemplates: TemplateSection[] = [
  organizationSetupTemplate,
  employeeDataTemplate,
  employmentDataTemplate,
  salaryDataTemplate,
  dependentsDataTemplate,
  benefitsPolicyTemplate,
  benefitEntitlementTemplate,
  leaveBalanceTemplate,
];

export default function DataMigrationPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleDownloadTemplate = (templateId: string) => {
    toast({
      title: 'Template Downloaded',
      description: `${templateId}.xlsx has been downloaded.`,
    });
  };

  const handleDownloadAll = () => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            <Database className="w-7 h-7 text-accent" />
            Data Migration & Onboarding
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive templates and guidance for platform setup
          </p>
        </div>
        <Button onClick={handleDownloadAll} className="gap-2">
          <Download className="w-4 h-4" />
          Download All Templates
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="border-accent/20 bg-gradient-to-r from-card to-accent/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-3xl font-bold text-emerald-500">100%</p>
              <p className="text-sm text-muted-foreground">Documentation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="benefits">Benefits Policy</TabsTrigger>
          <TabsTrigger value="leave">Leave & Time Off</TabsTrigger>
          <TabsTrigger value="validation">Validation Rules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
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

          {/* Quick Links to All Templates */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allTemplates.map((template) => (
              <Card key={template.id} className="hover:border-accent/40 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <template.icon className="w-5 h-5 text-accent" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {template.fields.length} fields
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm mt-3">{template.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {template.fields.filter(f => f.required).length} required
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {template.fields.filter(f => !f.required).length} optional
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full mt-3 gap-2"
                    onClick={() => handleDownloadTemplate(template.id)}
                  >
                    <Download className="w-3 h-3" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-4">
          <TemplateDetails template={organizationSetupTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <TemplateDetails template={employeeDataTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
          <TemplateDetails template={employmentDataTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
          <TemplateDetails template={dependentsDataTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
        </TabsContent>

        {/* Compensation Tab */}
        <TabsContent value="compensation" className="space-y-4">
          <TemplateDetails template={salaryDataTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-4">
          <TemplateDetails template={benefitsPolicyTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
          <TemplateDetails template={benefitEntitlementTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave" className="space-y-4">
          <TemplateDetails template={leaveBalanceTemplate} onDownload={handleDownloadTemplate} onCopy={handleCopyExample} />
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
                Common validation checks performed during import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Employee Data', rules: ['Unique employee IDs', 'Valid email format', 'Emirates ID format (784-XXXX-XXXXXXX-X)', 'Date of birth must be in the past', 'Phone numbers in international format'] },
                  { category: 'Salary Data', rules: ['Positive values for all amounts', 'Valid currency codes', 'Effective date not in the future', 'Basic salary within defined ranges'] },
                  { category: 'Benefits', rules: ['Valid benefit codes', 'Entitlement amounts within policy limits', 'Grade codes match defined structure', 'No duplicate benefit assignments'] },
                  { category: 'Dependents', rules: ['Parent employee must exist', 'Children age < 26 for education benefits', 'Valid relationship types', 'Unique Emirates ID per dependent'] },
                  { category: 'Leave', rules: ['Total days within policy limits', 'Used days <= Total days', 'Valid leave types', 'Year in valid range'] },
                ].map((section) => (
                  <div key={section.category} className="p-4 rounded-lg border">
                    <h3 className="font-semibold text-sm mb-2">{section.category}</h3>
                    <ul className="space-y-1">
                      {section.rules.map((rule, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
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
  onDownload: (id: string) => void;
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
              <CardDescription>{template.description}</CardDescription>
            </div>
          </div>
          <Button onClick={() => onDownload(template.id)} className="gap-2">
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
                      {field.example}
                      <Copy className="w-3 h-3 text-muted-foreground" />
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
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm text-blue-600">Important Notes</span>
            </div>
            <ul className="space-y-1">
              {template.notes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500">•</span>
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
