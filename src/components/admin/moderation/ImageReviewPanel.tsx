/**
 * ImageReviewPanel
 * 
 * Evidence-first review panel for image submissions with quality checks.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  CheckCircle, 
  AlertTriangle,
  Maximize,
  RefreshCw,
  Download,
  ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface QualityCheck {
  id: string;
  name: string;
  nameAr: string;
  status: 'pass' | 'warning' | 'fail';
  value?: string;
  recommendation?: string;
}

interface ImageReviewPanelProps {
  imageName: string;
  imageUrl?: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size?: string;
    uploadedBy?: string;
  };
}

const QUALITY_CHECKS: QualityCheck[] = [
  { id: '1', name: 'Resolution', nameAr: 'الدقة', status: 'pass', value: '1920 x 1080', recommendation: 'Meets minimum 1080p requirement' },
  { id: '2', name: 'Aspect Ratio', nameAr: 'نسبة العرض للارتفاع', status: 'pass', value: '16:9', recommendation: 'Standard aspect ratio' },
  { id: '3', name: 'File Size', nameAr: 'حجم الملف', status: 'warning', value: '2.4 MB', recommendation: 'Consider compression for faster loading' },
  { id: '4', name: 'Format', nameAr: 'التنسيق', status: 'pass', value: 'JPEG', recommendation: 'Supported format' },
  { id: '5', name: 'Color Profile', nameAr: 'ملف الألوان', status: 'pass', value: 'sRGB', recommendation: 'Web-compatible color space' },
];

export function ImageReviewPanel({ 
  imageName,
  imageUrl = '/placeholder.svg',
  metadata = {},
}: ImageReviewPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const getStatusIcon = (status: QualityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const passCount = QUALITY_CHECKS.filter(c => c.status === 'pass').length;

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <Card className="overflow-hidden">
        <div className="relative group">
          <div className="aspect-video bg-muted flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt={imageName}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary">
              <ZoomIn className="w-4 h-4 me-1" />
              {t('View Full', 'عرض كامل')}
            </Button>
            <Button size="sm" variant="secondary">
              <Download className="w-4 h-4 me-1" />
              {t('Download', 'تحميل')}
            </Button>
          </div>
        </div>
        
        <CardContent className="pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{imageName}</p>
              <p className="text-xs text-muted-foreground">
                {metadata.width || 1920} × {metadata.height || 1080} · {metadata.format || 'JPEG'} · {metadata.size || '2.4 MB'}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {metadata.uploadedBy || 'vendor@example.com'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-sm flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span>{t('Quality Checks', 'فحوصات الجودة')}</span>
            <Badge variant={passCount === QUALITY_CHECKS.length ? 'default' : 'secondary'}>
              {passCount}/{QUALITY_CHECKS.length} {t('Passed', 'ناجح')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {QUALITY_CHECKS.map((check) => (
              <div
                key={check.id}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-lg",
                  check.status === 'fail' ? "bg-destructive/5" : "bg-muted/30",
                  isRTL && "flex-row-reverse"
                )}
              >
                {getStatusIcon(check.status)}
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <p className="text-sm font-medium">
                      {language === 'ar' ? check.nameAr : check.name}
                    </p>
                    {check.value && (
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {check.value}
                      </span>
                    )}
                  </div>
                  {check.recommendation && (
                    <p className="text-xs text-muted-foreground mt-0.5">{check.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Replacement */}
      <Button variant="outline" className="w-full">
        <RefreshCw className="w-4 h-4 me-2" />
        {t('Request Image Replacement', 'طلب استبدال الصورة')}
      </Button>
    </div>
  );
}
