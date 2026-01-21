/**
 * VendorReviewPanel
 * 
 * Evidence-first review panel for vendor KYB verification.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileCheck, 
  FileX, 
  Clock, 
  Building2, 
  User, 
  CreditCard,
  MapPin,
  Phone,
  Receipt,
  ExternalLink,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface KYBDocument {
  id: string;
  name: string;
  nameAr: string;
  status: 'verified' | 'pending' | 'missing' | 'expired';
  uploadedAt?: Date;
  expiresAt?: Date;
  url?: string;
}

interface VendorReviewPanelProps {
  vendorName: string;
  documents: KYBDocument[];
  vendorDetails: {
    tradeLicense?: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

const STATUS_CONFIG = {
  verified: { icon: FileCheck, color: 'text-success', bgColor: 'bg-success/10', label: 'Verified', labelAr: 'تم التحقق' },
  pending: { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Pending', labelAr: 'معلق' },
  missing: { icon: FileX, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Missing', labelAr: 'مفقود' },
  expired: { icon: FileX, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Expired', labelAr: 'منتهي' },
};

// Demo data for KYB documents
const DEFAULT_KYB_DOCS: KYBDocument[] = [
  { id: '1', name: 'Trade License', nameAr: 'الرخصة التجارية', status: 'verified', uploadedAt: new Date(Date.now() - 86400000 * 5) },
  { id: '2', name: 'Owner/Signatory ID', nameAr: 'هوية المالك/المفوض', status: 'verified', uploadedAt: new Date(Date.now() - 86400000 * 5) },
  { id: '3', name: 'Bank Account Details', nameAr: 'تفاصيل الحساب البنكي', status: 'pending', uploadedAt: new Date(Date.now() - 86400000 * 2) },
  { id: '4', name: 'Business Address Proof', nameAr: 'إثبات عنوان العمل', status: 'verified', uploadedAt: new Date(Date.now() - 86400000 * 4) },
  { id: '5', name: 'VAT/TRN Certificate', nameAr: 'شهادة ضريبة القيمة المضافة', status: 'missing' },
  { id: '6', name: 'Contact Information', nameAr: 'معلومات الاتصال', status: 'verified', uploadedAt: new Date(Date.now() - 86400000 * 5) },
];

export function VendorReviewPanel({ 
  vendorName, 
  documents = DEFAULT_KYB_DOCS,
  vendorDetails = {},
}: VendorReviewPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const completeness = Math.round((verifiedCount / documents.length) * 100);

  const getStatusBadge = (status: KYBDocument['status']) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={cn("text-xs", config.bgColor, config.color)}>
        <config.icon className="w-3 h-3 me-1" />
        {language === 'ar' ? config.labelAr : config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* KYB Completeness */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-sm flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span>{t('KYB Verification', 'التحقق من الأعمال')}</span>
            <Badge variant={completeness === 100 ? 'default' : 'secondary'}>
              {completeness}% {t('Complete', 'مكتمل')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={completeness} className="h-2 mb-4" />
          
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg border",
                  doc.status === 'missing' || doc.status === 'expired' 
                    ? "border-destructive/30 bg-destructive/5" 
                    : "bg-muted/30",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  {getStatusBadge(doc.status)}
                  <span className="text-sm font-medium">
                    {language === 'ar' ? doc.nameAr : doc.name}
                  </span>
                </div>
                {doc.url && (
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('Vendor Details', 'تفاصيل البائع')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <DetailRow 
              icon={Building2} 
              label={t('Trade License', 'الرخصة التجارية')} 
              value={vendorDetails.tradeLicense || 'TL-2024-12345'} 
              isRTL={isRTL} 
            />
            <DetailRow 
              icon={Receipt} 
              label={t('VAT/TRN', 'الرقم الضريبي')} 
              value={vendorDetails.vatNumber || '100123456789012'} 
              isRTL={isRTL} 
            />
            <DetailRow 
              icon={MapPin} 
              label={t('Address', 'العنوان')} 
              value={vendorDetails.address || 'Dubai Marina, Tower A, Office 1205'} 
              isRTL={isRTL} 
            />
            <DetailRow 
              icon={Phone} 
              label={t('Contact', 'الاتصال')} 
              value={vendorDetails.phone || '+971 4 123 4567'} 
              isRTL={isRTL} 
            />
            <DetailRow 
              icon={CreditCard} 
              label={t('Bank', 'البنك')} 
              value={vendorDetails.bankName || 'Emirates NBD - ****4567'} 
              isRTL={isRTL} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ 
  icon: Icon, 
  label, 
  value, 
  isRTL 
}: { 
  icon: typeof Building2; 
  label: string; 
  value: string; 
  isRTL: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", isRTL && "flex-row-reverse")}>
      <div className="p-1.5 rounded bg-muted">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className={cn("flex-1", isRTL && "text-right")}>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
