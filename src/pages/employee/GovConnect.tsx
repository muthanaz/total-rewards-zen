import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Shield, FileCheck, Globe, Users, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, Send, Calendar, ExternalLink, X,
  FileText, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatDate } from '@/lib/utils';

/**
 * Government Services Hub
 * 
 * A functional page for managing government-related HR services:
 * - Visa & Work Permit status
 * - Emirates ID tracking
 * - Dependent sponsorship
 * - Submit government service requests
 */

// Demo data for government document statuses
const DEMO_GOV_STATUS = {
  visa: {
    status: 'valid',
    type: 'Employment Visa',
    expiryDate: '2026-08-15',
    daysUntilExpiry: 198,
    nextAction: 'Renewal application opens 60 days before expiry',
  },
  emiratesId: {
    status: 'valid',
    idNumber: '784-****-*******-1',
    expiryDate: '2026-08-15',
    renewalWindow: 'Opens Mar 2026',
  },
  dependents: [
    { name: 'Sara (Spouse)', status: 'valid', expiryDate: '2026-08-15' },
    { name: 'Ahmed (Child)', status: 'valid', expiryDate: '2026-08-15' },
  ],
};

const REQUEST_TYPES = [
  { value: 'visa_renewal', label: 'Visa Renewal', description: 'Initiate employment visa renewal process' },
  { value: 'eid_renewal', label: 'Emirates ID Renewal', description: 'Request Emirates ID renewal assistance' },
  { value: 'dependent_visa', label: 'Dependent Sponsorship', description: 'Add or renew dependent visas' },
  { value: 'labor_card', label: 'Labor Card Update', description: 'Update labor card information' },
  { value: 'other', label: 'Other Government Service', description: 'General government-related request' },
];

const REQUIRED_DOCS: Record<string, string[]> = {
  visa_renewal: ['Passport copy (valid 6+ months)', 'Current visa copy', 'Passport photos (white background)'],
  eid_renewal: ['Passport copy', 'Current Emirates ID copy', 'Passport photos'],
  dependent_visa: ['Sponsor passport copy', 'Dependent passport copy', 'Marriage/Birth certificate (attested)', 'Salary certificate'],
  labor_card: ['Passport copy', 'Current labor card', 'Updated employment contract'],
  other: ['Relevant supporting documents'],
};

export default function GovConnectPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const isRTL = direction === 'rtl';

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; steps: string[] } | null>(null);
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<string>('');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  const openInfoModal = (title: string, steps: string[]) => {
    setInfoModalContent({ title, steps });
    setInfoModalOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedRequestType || !user?.id) return;

    setIsSubmitting(true);
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const requestTypeLabel = REQUEST_TYPES.find(r => r.value === selectedRequestType)?.label || 'Government Service';

      // Create request in database
      const { error } = await supabase.from('requests').insert({
        user_id: user.id,
        organization_id: profile?.organization_id || '00000000-0000-0000-0000-000000000001',
        request_type: 'request',
        subject: `${requestTypeLabel} Request`,
        description: requestNotes || `Request for ${requestTypeLabel} assistance`,
        category: 'Government Services',
        status: 'submitted',
        amount: 0,
        sla_hours: 120,
        workflow_definition_id: 'd1000001-0001-0001-0001-000000000006', // Government Services workflow
      });

      if (error) throw error;

      toast({
        title: 'Request Submitted',
        description: 'Your government services request has been submitted. HR will contact you shortly.',
      });

      setRequestSheetOpen(false);
      setSelectedRequestType('');
      setRequestNotes('');

      // Navigate to requests page
      navigate('/employee/requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-success/10 text-success border-success/20';
      case 'expiring': return 'bg-warning/10 text-warning border-warning/20';
      case 'expired': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={t('Government Services', 'الخدمات الحكومية')}
        description={t('Track your visa, Emirates ID, and dependent sponsorship status', 'تتبع حالة التأشيرة والهوية الإماراتية وكفالة المعالين')}
        icon={Building2}
        iconClassName="from-accent/20 to-accent/5"
        actions={
          <Button onClick={() => setRequestSheetOpen(true)} className="gap-2">
            <Send className="h-4 w-4" />
            {t('Submit Request', 'تقديم طلب')}
          </Button>
        }
      />

      {/* Section 1: Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visa & Work Permit */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                {t('Visa & Work Permit', 'التأشيرة وتصريح العمل')}
              </CardTitle>
              <Badge className={cn('border', getStatusColor(DEMO_GOV_STATUS.visa.status))}>
                {DEMO_GOV_STATUS.visa.status === 'valid' ? t('Valid', 'ساري') : t('Expiring Soon', 'قارب الانتهاء')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('Type', 'النوع')}</span>
              <span className="font-medium">{DEMO_GOV_STATUS.visa.type}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('Expires', 'ينتهي')}</span>
              <span className="font-medium">{formatDate(new Date(DEMO_GOV_STATUS.visa.expiryDate))}</span>
            </div>
            <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {DEMO_GOV_STATUS.visa.nextAction}
            </div>
          </CardContent>
        </Card>

        {/* Emirates ID */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-accent" />
                {t('Emirates ID', 'الهوية الإماراتية')}
              </CardTitle>
              <Badge className={cn('border', getStatusColor(DEMO_GOV_STATUS.emiratesId.status))}>
                {t('Valid', 'ساري')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('ID Number', 'رقم الهوية')}</span>
              <span className="font-medium font-mono">{DEMO_GOV_STATUS.emiratesId.idNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('Expires', 'ينتهي')}</span>
              <span className="font-medium">{formatDate(new Date(DEMO_GOV_STATUS.emiratesId.expiryDate))}</span>
            </div>
            <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {t('Renewal window:', 'نافذة التجديد:')} {DEMO_GOV_STATUS.emiratesId.renewalWindow}
            </div>
          </CardContent>
        </Card>

        {/* Dependent Sponsorship */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                {t('Dependents', 'المعالين')}
              </CardTitle>
              <Badge variant="secondary">{DEMO_GOV_STATUS.dependents.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_GOV_STATUS.dependents.map((dep, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">{dep.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {t('Exp:', 'انتهاء:')} {formatDate(new Date(dep.expiryDate))}
                </span>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-xs"
              onClick={() => {
                setSelectedRequestType('dependent_visa');
                setRequestSheetOpen(true);
              }}
            >
              {t('Add Dependent', 'إضافة معال')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Globe className="w-5 h-5 text-muted-foreground" />
            {t('Quick Guide', 'دليل سريع')}
          </CardTitle>
          <CardDescription>
            {t('Common processes and required documents', 'العمليات الشائعة والمستندات المطلوبة')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => openInfoModal('Visa Renewal Process', [
                '1. HR initiates renewal 60 days before expiry',
                '2. Provide updated passport copy and photos',
                '3. Medical fitness test (if required)',
                '4. Visa stamping at immigration',
                '5. Emirates ID update (automatic)',
              ])}
            >
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-xs">{t('Visa Renewal', 'تجديد التأشيرة')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => openInfoModal('Emirates ID Renewal', [
                '1. Submit request through this portal',
                '2. Provide biometrics at ICP center',
                '3. Collect new card in 3-5 working days',
                '4. Update bank and telecom records',
              ])}
            >
              <FileCheck className="w-5 h-5 text-accent" />
              <span className="text-xs">{t('EID Renewal', 'تجديد الهوية')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => openInfoModal('Dependent Visa Process', [
                '1. Submit sponsorship request with documents',
                '2. HR processes entry permit application',
                '3. Dependent enters UAE on entry permit',
                '4. Medical and biometrics within 60 days',
                '5. Visa stamping and Emirates ID issuance',
              ])}
            >
              <Users className="w-5 h-5 text-accent" />
              <span className="text-xs">{t('Family Visa', 'تأشيرة العائلة')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => openInfoModal('Required Documents', [
                '• Passport (valid 6+ months)',
                '• Passport-size photos (white background)',
                '• Attested marriage/birth certificates',
                '• Salary certificate from HR',
                '• Tenancy contract (for family visa)',
              ])}
            >
              <FileText className="w-5 h-5 text-accent" />
              <span className="text-xs">{t('Documents', 'المستندات')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Submit Request CTA */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">{t('Need Assistance?', 'تحتاج مساعدة؟')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('Submit a request and HR will guide you through the process', 'قدم طلبًا وسيرشدك فريق الموارد البشرية خلال العملية')}
              </p>
            </div>
            <Button onClick={() => setRequestSheetOpen(true)} size="lg" className="gap-2">
              <Send className="h-4 w-4" />
              {t('Submit Request', 'تقديم طلب')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Modal */}
      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoModalContent?.title}</DialogTitle>
            <DialogDescription>
              {t('Steps and requirements for this process', 'الخطوات والمتطلبات لهذه العملية')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {infoModalContent?.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoModalOpen(false)}>
              {t('Close', 'إغلاق')}
            </Button>
            <Button onClick={() => {
              setInfoModalOpen(false);
              setRequestSheetOpen(true);
            }}>
              {t('Submit Request', 'تقديم طلب')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Sheet */}
      <Sheet open={requestSheetOpen} onOpenChange={setRequestSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('Government Services Request', 'طلب خدمات حكومية')}</SheetTitle>
            <SheetDescription>
              {t('Select the service you need and HR will assist you', 'اختر الخدمة التي تحتاجها وسيساعدك فريق الموارد البشرية')}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Request Type */}
            <div className="space-y-2">
              <Label>{t('Request Type', 'نوع الطلب')}</Label>
              <Select value={selectedRequestType} onValueChange={setSelectedRequestType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select a service', 'اختر خدمة')} />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <span className="font-medium">{type.label}</span>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Required Documents */}
            {selectedRequestType && (
              <div className="space-y-2">
                <Label>{t('Required Documents', 'المستندات المطلوبة')}</Label>
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  {REQUIRED_DOCS[selectedRequestType]?.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('HR will request documents after initial review', 'سيطلب فريق الموارد البشرية المستندات بعد المراجعة الأولية')}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label>{t('Additional Notes', 'ملاحظات إضافية')}</Label>
              <Textarea
                placeholder={t('Any specific details or urgency...', 'أي تفاصيل محددة أو استعجال...')}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setRequestSheetOpen(false)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button 
              onClick={handleSubmitRequest} 
              disabled={!selectedRequestType || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>{t('Submitting...', 'جاري الإرسال...')}</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('Submit Request', 'تقديم الطلب')}
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
