import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Star,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  QrCode,
  Wallet,
  Heart,
  Flag,
  ShieldCheck,
  Building2,
  MapPin,
  Tag,
  Calendar,
  Info,
  AlertCircle,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  getOfferSponsorship,
  getOfferVerificationStatus,
  SPONSORSHIP_CONFIG,
  VERIFICATION_CONFIG,
  type OfferSponsorshipType,
  type OfferVerificationStatus,
} from '@/lib/crossPortalContract';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type RedemptionMethod = 'code' | 'deeplink' | 'voucher' | 'payroll';

interface OfferDetailSheetProps {
  offer: any | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (offer: any) => void;
  isSaved?: boolean;
  onToggleSave?: (offerId: string) => void;
  isActivating?: boolean;
}

const REDEMPTION_CONFIG: Record<RedemptionMethod, { 
  icon: React.ElementType; 
  label: string; 
  labelAr: string;
  description: string;
  descriptionAr: string;
}> = {
  code: {
    icon: Copy,
    label: 'Promo Code',
    labelAr: 'رمز ترويجي',
    description: 'Copy the code and apply at checkout',
    descriptionAr: 'انسخ الرمز وطبقه عند الدفع',
  },
  deeplink: {
    icon: ExternalLink,
    label: 'Direct Link',
    labelAr: 'رابط مباشر',
    description: 'Click to apply discount automatically',
    descriptionAr: 'انقر لتطبيق الخصم تلقائياً',
  },
  voucher: {
    icon: QrCode,
    label: 'E-Voucher',
    labelAr: 'قسيمة إلكترونية',
    description: 'Show voucher QR code in-store',
    descriptionAr: 'أظهر رمز QR للقسيمة في المتجر',
  },
  payroll: {
    icon: Wallet,
    label: 'Payroll Deduction',
    labelAr: 'خصم من الراتب',
    description: 'Amount deducted from your next salary',
    descriptionAr: 'المبلغ يخصم من راتبك القادم',
  },
};

function getRedemptionMethod(offer: any): RedemptionMethod {
  const category = offer?.category?.toLowerCase() || '';
  if (category.includes('fitness') || category.includes('health')) return 'voucher';
  if (category.includes('learning')) return 'deeplink';
  if (category.includes('shopping')) return 'payroll';
  return 'code';
}

export function OfferDetailSheet({
  offer,
  isOpen,
  onClose,
  onActivate,
  isSaved = false,
  onToggleSave,
  isActivating = false,
}: OfferDetailSheetProps) {
  const { language, direction } = useLanguage();
  const { toast } = useToast();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportText, setReportText] = useState('');

  if (!offer) return null;

  const sponsorship = getOfferSponsorship(offer) as OfferSponsorshipType;
  const verification = getOfferVerificationStatus(offer) as OfferVerificationStatus;
  const redemptionMethod = getRedemptionMethod(offer);
  const sponsorConfig = SPONSORSHIP_CONFIG[sponsorship];
  const verifyConfig = VERIFICATION_CONFIG[verification];
  const redemptionConfig = REDEMPTION_CONFIG[redemptionMethod];
  const RedemptionIcon = redemptionConfig.icon;

  const handleActivate = () => {
    onActivate(offer);
    onClose();
  };

  const handleReport = () => {
    toast({
      title: t('Report Submitted', 'تم إرسال البلاغ'),
      description: t(
        'Thank you for your feedback. Our team will review this offer.',
        'شكراً لملاحظاتك. سيقوم فريقنا بمراجعة هذا العرض.'
      ),
    });
    setShowReportDialog(false);
    setReportText('');
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side={isRTL ? 'left' : 'right'} 
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader className="text-left">
            {/* Image */}
            {offer.image_url && (
              <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden">
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                
                {/* Badges on image */}
                <div className={cn('absolute top-3 left-3 right-3 flex gap-2', isRTL && 'flex-row-reverse')}>
                  {offer.discount_percent && (
                    <Badge className="bg-rose-500 hover:bg-rose-500 text-white border-0 font-bold">
                      -{offer.discount_percent}% OFF
                    </Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={cn('border', sponsorConfig.className)}>
                        <Building2 className="w-3 h-3 mr-1" />
                        {t(sponsorConfig.label, sponsorConfig.labelAr)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{t(sponsorConfig.tooltip, sponsorConfig.tooltipAr)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Save button */}
                {onToggleSave && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-3 right-3 h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={() => onToggleSave(offer.id)}
                  >
                    <Heart className={cn('w-4 h-4', isSaved && 'fill-rose-500 text-rose-500')} />
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              {/* Merchant & Verification */}
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <span className="text-sm text-muted-foreground">{offer.merchant}</span>
                {verification === 'verified' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={cn('text-[10px] gap-1', verifyConfig.className)}>
                        <ShieldCheck className="w-3 h-3" />
                        {t(verifyConfig.label, verifyConfig.labelAr)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{verifyConfig.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <SheetTitle className="text-xl">{offer.title}</SheetTitle>
              
              {/* Rating */}
              {offer.rating && (
                <div className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{offer.rating}</span>
                  <span className="text-xs text-muted-foreground">/5</span>
                </div>
              )}
            </div>

            <SheetDescription className="pt-2">
              {offer.description || t('Exclusive offer for employees', 'عرض حصري للموظفين')}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Redemption Method */}
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4">
                <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <RedemptionIcon className="w-5 h-5 text-accent" />
                  </div>
                  <div className={cn('flex-1', isRTL && 'text-right')}>
                    <p className="font-medium">
                      {t(redemptionConfig.label, redemptionConfig.labelAr)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(redemptionConfig.description, redemptionConfig.descriptionAr)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offer Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">
                {t('Offer Details', 'تفاصيل العرض')}
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span>{offer.category}</span>
                </div>
                <div className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{t('UAE Wide', 'جميع أنحاء الإمارات')}</span>
                </div>
                <div className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{t('Valid until Dec 2026', 'صالح حتى ديسمبر 2026')}</span>
                </div>
                <div className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{t('30-day voucher', 'قسيمة 30 يوم')}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Terms & Conditions */}
            {offer.terms && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">
                  {t('Terms & Conditions', 'الشروط والأحكام')}
                </h4>
                <p className="text-sm text-muted-foreground">{offer.terms}</p>
              </div>
            )}

            {/* Estimated Savings */}
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-3">
                <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">
                      {t('Estimated savings', 'التوفير المتوقع')}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600">
                    {formatCurrencyAED((offer.discount_percent || 10) * 5)}+
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleActivate}
                disabled={isActivating}
              >
                <CheckCircle className="w-4 h-4" />
                {isActivating ? t('Activating...', 'جاري التفعيل...') : t('Activate Offer', 'تفعيل العرض')}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground gap-2"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="w-4 h-4" />
                {t('Report an issue', 'الإبلاغ عن مشكلة')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Report Issue Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {t('Report an Issue', 'الإبلاغ عن مشكلة')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'Let us know if there\'s a problem with this offer. We\'ll investigate and take action.',
                'أخبرنا إذا كان هناك مشكلة في هذا العرض. سنحقق ونتخذ الإجراء اللازم.'
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder={t(
                'Describe the issue (e.g., code not working, incorrect terms, expired offer...)',
                'صف المشكلة (مثل: الرمز لا يعمل، شروط غير صحيحة، عرض منتهي...)'
              )}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleReport} disabled={!reportText.trim()}>
              {t('Submit Report', 'إرسال البلاغ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
