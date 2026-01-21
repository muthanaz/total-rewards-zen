/**
 * VendorDetailsDrawer
 * 
 * Full vendor details drawer with KYB checklist and actions.
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Store, CheckCircle, XCircle, Clock, Ban, FileCheck, FileX,
  Building2, CreditCard, MapPin, Phone, Mail, Receipt, 
  Star, Tag, AlertTriangle, MessageSquare, Shield, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { VendorDisplay, KYBDocument, ReasonTemplate } from '@/lib/governanceTypes';
import { REASON_TEMPLATES, calculateKYBProgress } from '@/lib/governanceTypes';

interface VendorDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: VendorDisplay | null;
  onApprove: (vendor: VendorDisplay, notes?: string) => Promise<void>;
  onReject: (vendor: VendorDisplay, reason: string) => Promise<void>;
  onSuspend: (vendor: VendorDisplay, reason: string) => Promise<void>;
  onRequestChanges: (vendor: VendorDisplay, reason: string) => Promise<void>;
  isProcessing?: boolean;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-muted text-muted-foreground', icon: Clock },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  suspended: { label: 'Suspended', labelAr: 'معلق', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Ban },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

const DOC_STATUS_CONFIG = {
  verified: { icon: FileCheck, color: 'text-success', bgColor: 'bg-success/10', label: 'Verified' },
  pending: { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Pending' },
  missing: { icon: FileX, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Missing' },
  expired: { icon: FileX, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Expired' },
  rejected: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Rejected' },
};

export function VendorDetailsDrawer({
  open,
  onOpenChange,
  vendor,
  onApprove,
  onReject,
  onSuspend,
  onRequestChanges,
  isProcessing = false,
}: VendorDetailsDrawerProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  if (!vendor) return null;

  const statusConfig = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.pending;
  const kybProgress = calculateKYBProgress(vendor.kybProgress.documents);
  const applicableTemplates = REASON_TEMPLATES.filter(t => t.applicableTo.includes('vendor'));

  const handleReasonSelect = (reasonId: string) => {
    const template = REASON_TEMPLATES.find(t => t.id === reasonId);
    if (template) {
      setNotes(language === 'ar' ? template.textAr : template.text);
      setSelectedReason(reasonId);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'suspend' | 'request_changes') => {
    if ((action === 'reject' || action === 'suspend' || action === 'request_changes') && !notes.trim()) {
      return;
    }

    switch (action) {
      case 'approve':
        await onApprove(vendor, notes);
        break;
      case 'reject':
        await onReject(vendor, notes);
        break;
      case 'suspend':
        await onSuspend(vendor, notes);
        break;
      case 'request_changes':
        await onRequestChanges(vendor, notes);
        break;
    }
    setNotes('');
    setSelectedReason('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full p-0">
        <SheetHeader className="p-6 pb-0">
          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-lg bg-muted">
              <Store className="w-6 h-6" />
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <SheetTitle className="text-xl">{vendor.companyName}</SheetTitle>
              <SheetDescription className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                <Badge variant="outline" className={statusConfig.color}>
                  <statusConfig.icon className="w-3 h-3 me-1" />
                  {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                </Badge>
                {vendor.rating > 0 && (
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    {vendor.rating.toFixed(1)}
                  </span>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full justify-start px-6 border-b rounded-none h-auto p-0 bg-transparent">
            {['overview', 'kyb', 'performance', 'actions'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
              >
                {t(
                  tab === 'overview' ? 'Overview' : tab === 'kyb' ? 'KYB Documents' : tab === 'performance' ? 'Performance' : 'Actions',
                  tab === 'overview' ? 'نظرة عامة' : tab === 'kyb' ? 'وثائق KYB' : tab === 'performance' ? 'الأداء' : 'الإجراءات'
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <TabsContent value="overview" className="m-0 p-6 space-y-4">
              {/* Business Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('Business Information', 'معلومات العمل')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow icon={Building2} label={t('Trade License', 'الرخصة')} value={vendor.tradeLicense || 'TL-2024-12345'} />
                  <DetailRow icon={Receipt} label={t('VAT/TRN', 'الضريبة')} value={vendor.vatNumber || '100123456789012'} />
                  <DetailRow icon={MapPin} label={t('Address', 'العنوان')} value={vendor.address || 'Dubai, UAE'} />
                  <DetailRow icon={Phone} label={t('Phone', 'الهاتف')} value={vendor.contactPhone || '+971 4 123 4567'} />
                  <DetailRow icon={Mail} label={t('Email', 'البريد')} value={vendor.contactEmail || 'contact@vendor.com'} />
                </CardContent>
              </Card>

              {/* Banking */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t('Banking (Masked)', 'البنك (مخفي)')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DetailRow icon={CreditCard} label={t('Bank', 'البنك')} value={vendor.bankName || 'Emirates NBD - ****4567'} />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('Commission Rate:', 'نسبة العمولة:')} {vendor.commissionRate}%
                  </p>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('Categories', 'الفئات')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {vendor.categories.map(cat => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kyb" className="m-0 p-6 space-y-4">
              {/* KYB Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className={cn("text-sm flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span>{t('KYB Verification', 'التحقق')}</span>
                    <Badge variant={kybProgress.percentage === 100 ? 'default' : 'secondary'}>
                      {kybProgress.percentage}% {t('Complete', 'مكتمل')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={kybProgress.percentage} className="h-2 mb-4" />
                  <p className="text-xs text-muted-foreground mb-4">
                    {kybProgress.completedSteps}/{kybProgress.totalSteps} {t('documents verified', 'وثائق تم التحقق منها')}
                  </p>
                  
                  <div className="space-y-2">
                    {vendor.kybProgress.documents.map(doc => {
                      const config = DOC_STATUS_CONFIG[doc.status];
                      return (
                        <div
                          key={doc.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            doc.status === 'missing' || doc.status === 'expired' 
                              ? "border-destructive/30 bg-destructive/5" 
                              : "bg-muted/30"
                          )}
                        >
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <config.icon className={cn("w-4 h-4", config.color)} />
                            <span className="text-sm font-medium">
                              {language === 'ar' ? doc.nameAr : doc.name}
                            </span>
                          </div>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <Badge variant="outline" className={cn("text-xs", config.bgColor, config.color)}>
                              {config.label}
                            </Badge>
                            {doc.url && (
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {kybProgress.missingItems.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-sm font-medium text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t('Missing Documents', 'وثائق مفقودة')}
                      </p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        {kybProgress.missingItems.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stage Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('Onboarding Stage', 'مرحلة التسجيل')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {vendor.kybProgress.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="m-0 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">{t('Total Offers', 'العروض')}</p>
                  <p className="text-2xl font-bold">{vendor.totalOffers}</p>
                  <p className="text-xs text-muted-foreground">{vendor.activeOffers} {t('active', 'نشط')}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">{t('Redemptions', 'الاستردادات')}</p>
                  <p className="text-2xl font-bold">{vendor.totalRedemptions.toLocaleString()}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">{t('Rating', 'التقييم')}</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    {vendor.rating > 0 ? vendor.rating.toFixed(1) : '—'}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">{t('Complaint Rate', 'معدل الشكاوى')}</p>
                  <p className={cn("text-2xl font-bold", vendor.complaintRate > 5 ? "text-destructive" : "text-success")}>
                    {vendor.complaintRate.toFixed(1)}%
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="m-0 p-6 space-y-4">
              {/* Reason Template Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('Reason Template', 'قالب السبب')}
                </label>
                <Select value={selectedReason} onValueChange={handleReasonSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select a template...', 'اختر قالبًا...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {applicableTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {language === 'ar' ? template.labelAr : template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('Notes / Reason', 'ملاحظات / السبب')}
                  <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder={t('Required for reject/suspend/request changes...', 'مطلوب للرفض/التعليق/طلب التغييرات...')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                {(vendor.status === 'pending' || vendor.status === 'draft') && (
                  <>
                    <Button 
                      className="w-full bg-success hover:bg-success/90" 
                      onClick={() => handleAction('approve')}
                      disabled={isProcessing || kybProgress.percentage < 100}
                    >
                      <CheckCircle className="w-4 h-4 me-2" />
                      {t('Approve Vendor', 'الموافقة على البائع')}
                    </Button>
                    {kybProgress.percentage < 100 && (
                      <p className="text-xs text-muted-foreground text-center">
                        {t('Complete KYB verification before approval', 'أكمل التحقق من KYB قبل الموافقة')}
                      </p>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleAction('request_changes')}
                      disabled={isProcessing || !notes.trim()}
                    >
                      <MessageSquare className="w-4 h-4 me-2" />
                      {t('Request Changes', 'طلب تغييرات')}
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => handleAction('reject')}
                      disabled={isProcessing || !notes.trim()}
                    >
                      <XCircle className="w-4 h-4 me-2" />
                      {t('Reject', 'رفض')}
                    </Button>
                  </>
                )}
                {vendor.status === 'active' && (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => handleAction('suspend')}
                    disabled={isProcessing || !notes.trim()}
                  >
                    <Ban className="w-4 h-4 me-2" />
                    {t('Suspend Vendor', 'تعليق البائع')}
                  </Button>
                )}
                {vendor.status === 'suspended' && (
                  <Button 
                    className="w-full" 
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 me-2" />
                    {t('Reactivate Vendor', 'إعادة تفعيل البائع')}
                  </Button>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ 
  icon: Icon, 
  label, 
  value,
}: { 
  icon: typeof Building2; 
  label: string; 
  value: string; 
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="p-1.5 rounded bg-muted shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
