/**
 * OfferDetailsDrawer
 * 
 * Full offer details drawer with governance checklist and actions.
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tag, CheckCircle, XCircle, Clock, Ban, Percent, Calendar,
  Store, Users, AlertTriangle, MessageSquare, Image, FileText,
  Ticket, DollarSign, Globe, MapPin, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import type { OfferDisplay, ReasonTemplate, GovernanceCheck } from '@/lib/governanceTypes';
import { REASON_TEMPLATES, getOfferGovernanceChecklist } from '@/lib/governanceTypes';

interface OfferDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: OfferDisplay | null;
  onActivate: (offer: OfferDisplay) => Promise<void>;
  onSuspend: (offer: OfferDisplay, reason: string) => Promise<void>;
  onReject: (offer: OfferDisplay, reason: string) => Promise<void>;
  onSubmitForReview: (offer: OfferDisplay) => Promise<void>;
  onExpire: (offer: OfferDisplay) => Promise<void>;
  onFlagImage: (offer: OfferDisplay) => Promise<void>;
  isProcessing?: boolean;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-muted text-muted-foreground', icon: Clock },
  pending_review: { label: 'Pending Review', labelAr: 'بانتظار المراجعة', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  suspended: { label: 'Suspended', labelAr: 'معلق', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Ban },
  expired: { label: 'Expired', labelAr: 'منتهي', color: 'bg-muted text-muted-foreground', icon: Clock },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

export function OfferDetailsDrawer({
  open,
  onOpenChange,
  offer,
  onActivate,
  onSuspend,
  onReject,
  onSubmitForReview,
  onExpire,
  onFlagImage,
  isProcessing = false,
}: OfferDetailsDrawerProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  if (!offer) return null;

  const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.draft;
  const applicableTemplates = REASON_TEMPLATES.filter(t => t.applicableTo.includes('offer'));
  const governanceChecklist = getOfferGovernanceChecklist(offer);
  const allChecksPassed = governanceChecklist.filter(c => c.required).every(c => c.status === 'pass');

  const handleReasonSelect = (reasonId: string) => {
    const template = REASON_TEMPLATES.find(t => t.id === reasonId);
    if (template) {
      setNotes(language === 'ar' ? template.textAr : template.text);
      setSelectedReason(reasonId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full p-0">
        <SheetHeader className="p-6 pb-0">
          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
              <Tag className="w-6 h-6" />
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <SheetTitle className="text-xl">{offer.title}</SheetTitle>
              <SheetDescription className={cn("flex items-center gap-2 mt-1 flex-wrap", isRTL && "flex-row-reverse")}>
                <Badge variant="outline" className={statusConfig.color}>
                  <statusConfig.icon className="w-3 h-3 me-1" />
                  {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                </Badge>
                <span className="text-sm">{offer.vendorName}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full justify-start px-6 border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto flex-nowrap">
            {['summary', 'pricing', 'redemption', 'governance', 'actions'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2.5 whitespace-nowrap text-sm"
              >
                {t(
                  tab === 'summary' ? 'Summary' : 
                  tab === 'pricing' ? 'Pricing' : 
                  tab === 'redemption' ? 'Redemption' : 
                  tab === 'governance' ? 'Checklist' : 'Actions',
                  tab === 'summary' ? 'ملخص' : 
                  tab === 'pricing' ? 'التسعير' : 
                  tab === 'redemption' ? 'الاسترداد' : 
                  tab === 'governance' ? 'قائمة التحقق' : 'الإجراءات'
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[calc(100vh-180px)]">
            {/* Summary Tab */}
            <TabsContent value="summary" className="m-0 p-6 space-y-4">
              {/* Offer Preview */}
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-accent/20 to-primary/20">
                {offer.imageUrl ? (
                  <img src={offer.imageUrl} alt={offer.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="h-40 flex items-center justify-center">
                    <Image className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-success text-success-foreground text-lg px-3 py-1">
                    <Percent className="w-4 h-4 me-1" />
                    {offer.discountValue}% OFF
                  </Badge>
                </div>
                {offer.imageUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-3 right-3"
                    onClick={() => onFlagImage(offer)}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 me-1" />
                    {t('Flag Image', 'الإبلاغ عن الصورة')}
                  </Button>
                )}
              </div>

              {/* Basic Info */}
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('Category', 'الفئة')}</span>
                    <Badge variant="secondary">{offer.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('Vendor', 'البائع')}</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Store className="w-3.5 h-3.5" />
                      {offer.vendorName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('Rating', 'التقييم')}</span>
                    <span className="font-medium">{offer.rating ? `${offer.rating}★` : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('Redemptions', 'الاستردادات')}</span>
                    <span className="font-medium">{offer.totalRedemptions.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Validity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('Validity Period', 'فترة الصلاحية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{offer.validFrom ? format(offer.validFrom, 'MMM d, yyyy') : 'Not set'}</span>
                    <span>→</span>
                    <span>{offer.validTo ? format(offer.validTo, 'MMM d, yyyy') : 'Not set'}</span>
                  </div>
                  {offer.blackoutDates && offer.blackoutDates.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {offer.blackoutDates.length} blackout dates
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Terms */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('Terms & Conditions', 'الشروط والأحكام')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {offer.terms ? (
                    <p className="text-sm text-muted-foreground">{offer.terms}</p>
                  ) : (
                    <Alert variant="destructive" className="bg-destructive/10">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        {t('Terms are required before activation', 'الشروط مطلوبة قبل التفعيل')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="m-0 p-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('Discount & Pricing', 'الخصم والتسعير')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">{t('Discount Type', 'نوع الخصم')}</p>
                      <p className="font-medium capitalize">{offer.discountType}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/10">
                      <p className="text-xs text-muted-foreground">{t('Discount Value', 'قيمة الخصم')}</p>
                      <p className="font-bold text-success text-lg">
                        {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `AED ${offer.discountValue}`}
                      </p>
                    </div>
                  </div>

                  {(offer.originalPrice || offer.discountedPrice) && (
                    <div className="flex items-center gap-4 p-3 rounded-lg border">
                      {offer.originalPrice && (
                        <div>
                          <p className="text-xs text-muted-foreground">{t('Was', 'كان')}</p>
                          <p className="line-through text-muted-foreground">AED {offer.originalPrice}</p>
                        </div>
                      )}
                      {offer.discountedPrice && (
                        <div>
                          <p className="text-xs text-muted-foreground">{t('Now', 'الآن')}</p>
                          <p className="font-bold text-success">AED {offer.discountedPrice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {offer.minSpend && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{t('Minimum spend:', 'الحد الأدنى:')} AED {offer.minSpend}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Redemption Tab */}
            <TabsContent value="redemption" className="m-0 p-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('Redemption Rules', 'قواعد الاسترداد')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {offer.redemptionMethod === 'online' && <Globe className="w-4 h-4" />}
                    {offer.redemptionMethod === 'in_store' && <MapPin className="w-4 h-4" />}
                    {offer.redemptionMethod === 'both' && <><Globe className="w-4 h-4" /><MapPin className="w-4 h-4" /></>}
                    <span className="capitalize">{offer.redemptionMethod.replace('_', ' ')}</span>
                  </div>
                  
                  {offer.redemptionCapPerUser && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{t('Cap per user:', 'الحد لكل مستخدم:')} {offer.redemptionCapPerUser}</span>
                    </div>
                  )}
                  
                  {offer.redemptionCapTotal && (
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket className="w-4 h-4 text-muted-foreground" />
                      <span>{t('Total cap:', 'الحد الإجمالي:')} {offer.redemptionCapTotal}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('Voucher Handling', 'التعامل مع القسائم')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline">
                    {offer.voucherType === 'public_code' ? t('Public Code', 'رمز عام') : t('Unique Codes', 'رموز فريدة')}
                  </Badge>
                  
                  {offer.voucherType === 'public_code' && offer.voucherCode && (
                    <div className="p-3 rounded-lg bg-muted font-mono text-center">
                      {offer.voucherCode}
                    </div>
                  )}
                  
                  {offer.voucherType === 'unique_codes' && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {offer.uniqueCodesCount || 0} {t('codes uploaded', 'رمز تم رفعه')}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="w-4 h-4 me-2" />
                        {t('Upload Codes', 'رفع الرموز')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance" className="m-0 p-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className={cn("text-sm flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span>{t('Governance Checklist', 'قائمة التحقق')}</span>
                    <Badge variant={allChecksPassed ? 'default' : 'destructive'}>
                      {governanceChecklist.filter(c => c.status === 'pass').length}/{governanceChecklist.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {governanceChecklist.map(check => (
                    <div
                      key={check.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg",
                        check.status === 'fail' ? "bg-destructive/10" : 
                        check.status === 'warning' ? "bg-warning/10" : "bg-muted/30"
                      )}
                    >
                      {check.status === 'pass' && <CheckCircle className="w-4 h-4 text-success mt-0.5" />}
                      {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />}
                      {check.status === 'fail' && <XCircle className="w-4 h-4 text-destructive mt-0.5" />}
                      {check.status === 'pending' && <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {language === 'ar' ? check.nameAr : check.name}
                          {check.required && <span className="text-destructive ms-1">*</span>}
                        </p>
                        {check.message && (
                          <p className="text-xs text-muted-foreground">{check.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {!allChecksPassed && (
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    {t('All required checks must pass before activation', 'يجب اجتياز جميع الفحوصات المطلوبة قبل التفعيل')}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="m-0 p-6 space-y-4">
              {/* Reason Template */}
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

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('Notes / Reason', 'ملاحظات / السبب')}
                </label>
                <Textarea
                  placeholder={t('Enter notes...', 'أدخل ملاحظات...')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Separator />

              {/* Action Buttons based on status */}
              <div className="space-y-2">
                {offer.status === 'draft' && (
                  <Button 
                    className="w-full" 
                    onClick={() => onSubmitForReview(offer)}
                    disabled={isProcessing}
                  >
                    <Clock className="w-4 h-4 me-2" />
                    {t('Submit for Review', 'إرسال للمراجعة')}
                  </Button>
                )}

                {offer.status === 'pending_review' && (
                  <>
                    <Button 
                      className="w-full bg-success hover:bg-success/90" 
                      onClick={() => onActivate(offer)}
                      disabled={isProcessing || !allChecksPassed}
                    >
                      <CheckCircle className="w-4 h-4 me-2" />
                      {t('Activate Offer', 'تفعيل العرض')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => onSuspend(offer, notes)}
                      disabled={isProcessing || !notes.trim()}
                    >
                      <MessageSquare className="w-4 h-4 me-2" />
                      {t('Request Changes', 'طلب تغييرات')}
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => onReject(offer, notes)}
                      disabled={isProcessing || !notes.trim()}
                    >
                      <XCircle className="w-4 h-4 me-2" />
                      {t('Reject', 'رفض')}
                    </Button>
                  </>
                )}

                {offer.status === 'active' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => onSuspend(offer, notes)}
                      disabled={isProcessing || !notes.trim()}
                    >
                      <Ban className="w-4 h-4 me-2" />
                      {t('Suspend Offer', 'تعليق العرض')}
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full" 
                      onClick={() => onExpire(offer)}
                      disabled={isProcessing}
                    >
                      <Clock className="w-4 h-4 me-2" />
                      {t('Expire Now', 'انتهاء الصلاحية الآن')}
                    </Button>
                  </>
                )}

                {offer.status === 'suspended' && (
                  <Button 
                    className="w-full" 
                    onClick={() => onActivate(offer)}
                    disabled={isProcessing || !allChecksPassed}
                  >
                    <CheckCircle className="w-4 h-4 me-2" />
                    {t('Reactivate Offer', 'إعادة تفعيل العرض')}
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
