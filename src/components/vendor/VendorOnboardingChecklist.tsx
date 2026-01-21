import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Circle, Image, FileText, CreditCard, Mail, Phone, 
  ChevronRight, Sparkles, ArrowRight, Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendorProfileCompleteness, VendorProfileCompleteness } from '@/hooks/useVendorDashboard';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: keyof VendorProfileCompleteness;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ElementType;
  action: string;
  route?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'hasLogo',
    label: 'Add Company Logo',
    labelAr: 'إضافة شعار الشركة',
    description: 'Upload a high-quality logo (400x400px recommended)',
    descriptionAr: 'ارفع شعارًا عالي الجودة (400x400 بكسل موصى به)',
    icon: Image,
    action: 'Upload Logo',
    route: '/vendor/profile',
  },
  {
    id: 'hasDescription',
    label: 'Write Company Description',
    labelAr: 'كتابة وصف الشركة',
    description: 'Tell employees about your brand and offerings',
    descriptionAr: 'أخبر الموظفين عن علامتك التجارية وعروضك',
    icon: FileText,
    action: 'Add Description',
    route: '/vendor/profile',
  },
  {
    id: 'hasContactEmail',
    label: 'Add Contact Email',
    labelAr: 'إضافة البريد الإلكتروني للتواصل',
    description: 'Where we can reach you for offer questions',
    descriptionAr: 'حيث يمكننا التواصل معك بخصوص أسئلة العروض',
    icon: Mail,
    action: 'Add Email',
    route: '/vendor/profile',
  },
  {
    id: 'hasContactPhone',
    label: 'Add Contact Phone',
    labelAr: 'إضافة رقم الهاتف للتواصل',
    description: 'For urgent communications',
    descriptionAr: 'للتواصل العاجل',
    icon: Phone,
    action: 'Add Phone',
    route: '/vendor/profile',
  },
  {
    id: 'hasBankDetails',
    label: 'Set Up Payouts',
    labelAr: 'إعداد المدفوعات',
    description: 'Add bank details for commission payments',
    descriptionAr: 'أضف تفاصيل البنك لدفعات العمولات',
    icon: CreditCard,
    action: 'Add Bank Details',
    route: '/vendor/settings',
  },
];

interface VendorOnboardingChecklistProps {
  className?: string;
  compact?: boolean;
}

export function VendorOnboardingChecklist({ className, compact = false }: VendorOnboardingChecklistProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { data: completeness, isLoading } = useVendorProfileCompleteness();
  
  if (isLoading || !completeness) return null;
  
  const isComplete = completeness.completionPercent === 100;
  
  // Get completed count
  const completedItems = CHECKLIST_ITEMS.filter(item => completeness[item.id]);
  const totalItems = CHECKLIST_ITEMS.length;
  
  // Don't show if complete and compact mode
  if (isComplete && compact) return null;

  if (compact) {
    return (
      <Card className={cn('border-warning/30 bg-warning/5', className)}>
        <CardContent className="p-4">
          <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
            <div className="flex-1">
              <div className={cn('flex items-center gap-2 mb-2', isRTL && 'flex-row-reverse')}>
                <Sparkles className="w-4 h-4 text-warning" />
                <span className="font-medium text-sm">
                  {t('Complete Your Profile', 'أكمل ملفك الشخصي')}
                </span>
                <Badge variant="outline" className="text-xs">
                  {completedItems.length}/{totalItems}
                </Badge>
              </div>
              <Progress value={completeness.completionPercent} className="h-2" />
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/vendor/profile')}>
              {t('Complete', 'أكمل')}
              <ChevronRight className={cn('w-4 h-4', isRTL ? 'mr-1 rotate-180' : 'ml-1')} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      isComplete ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5',
      className
    )}>
      <CardHeader className="pb-3">
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Sparkles className="w-5 h-5 text-warning" />
              )}
              {isComplete 
                ? t('Profile Complete!', 'الملف الشخصي مكتمل!')
                : t('Complete Your Profile', 'أكمل ملفك الشخصي')
              }
            </CardTitle>
            <CardDescription className="mt-1">
              {isComplete
                ? t('Your vendor profile is ready. Start creating offers!', 'ملف البائع الخاص بك جاهز. ابدأ بإنشاء العروض!')
                : t('Complete these steps to unlock all features', 'أكمل هذه الخطوات لفتح جميع الميزات')
              }
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'text-sm',
              isComplete ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'
            )}
          >
            {completeness.completionPercent}%
          </Badge>
        </div>
        <Progress 
          value={completeness.completionPercent} 
          className={cn('h-2 mt-3', isComplete && '[&>div]:bg-success')}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {CHECKLIST_ITEMS.map((item, index) => {
          const isItemComplete = completeness[item.id];
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                isItemComplete 
                  ? 'bg-success/5 border-success/20' 
                  : 'bg-background border-border hover:border-primary/30 hover:bg-muted/30 cursor-pointer',
                isRTL && 'flex-row-reverse'
              )}
              onClick={() => !isItemComplete && item.route && navigate(item.route)}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                isItemComplete ? 'bg-success/10' : 'bg-muted'
              )}>
                {isItemComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Icon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                <p className={cn(
                  'text-sm font-medium',
                  isItemComplete && 'text-muted-foreground line-through'
                )}>
                  {t(item.label, item.labelAr)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t(item.description, item.descriptionAr)}
                </p>
              </div>
              {!isItemComplete && (
                <ChevronRight className={cn(
                  'w-4 h-4 text-muted-foreground shrink-0',
                  isRTL && 'rotate-180'
                )} />
              )}
            </motion.div>
          );
        })}

        {/* CTA when incomplete */}
        {!isComplete && (
          <div className="pt-3 border-t">
            <Button className="w-full gap-2" onClick={() => navigate('/vendor/profile')}>
              <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
              {t('Go to Profile Settings', 'اذهب إلى إعدادات الملف الشخصي')}
            </Button>
          </div>
        )}

        {/* CTA when complete */}
        {isComplete && (
          <div className="pt-3 border-t">
            <Button className="w-full gap-2" onClick={() => navigate('/vendor/offers/new')}>
              <Tag className="w-4 h-4" />
              {t('Create Your First Offer', 'أنشئ عرضك الأول')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
