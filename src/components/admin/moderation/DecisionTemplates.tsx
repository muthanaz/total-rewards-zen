/**
 * DecisionTemplates
 * 
 * Quick-fill templates for common moderation decisions.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  FileText, 
  ChevronDown,
  FileX,
  AlertTriangle,
  Ban,
  ImageOff,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface Template {
  id: string;
  label: string;
  labelAr: string;
  icon: typeof FileText;
  text: string;
  category: 'kyb' | 'terms' | 'discount' | 'content' | 'image';
}

interface DecisionTemplatesProps {
  type: 'reject' | 'changes';
  itemType: 'vendor' | 'offer' | 'image' | 'copy';
  onSelect: (text: string) => void;
}

const TEMPLATES: Template[] = [
  // KYB Templates
  { 
    id: 'kyb-missing', 
    label: 'Missing KYB Documents', 
    labelAr: 'وثائق KYB مفقودة',
    icon: FileX,
    text: 'The following KYB documents are required before approval:\n- Trade license (valid and unexpired)\n- Owner/Authorized signatory ID\n- Bank account verification letter\n\nPlease upload the missing documents and resubmit.',
    category: 'kyb',
  },
  { 
    id: 'kyb-expired', 
    label: 'Expired Documents', 
    labelAr: 'وثائق منتهية الصلاحية',
    icon: FileX,
    text: 'One or more submitted documents have expired. Please provide updated versions of:\n- [Document name]\n\nEnsure all documents are valid for at least 30 days from submission.',
    category: 'kyb',
  },
  // Terms Templates
  { 
    id: 'terms-unclear', 
    label: 'Unclear Terms', 
    labelAr: 'شروط غير واضحة',
    icon: Scale,
    text: 'The offer terms and conditions require clarification:\n- [Specific issue]\n\nPlease provide clear, unambiguous terms that specify eligibility, limitations, and redemption process.',
    category: 'terms',
  },
  { 
    id: 'terms-missing', 
    label: 'Missing Terms', 
    labelAr: 'شروط مفقودة',
    icon: FileText,
    text: 'The offer is missing required terms and conditions. All offers must include:\n- Validity period\n- Eligibility criteria\n- Any exclusions or limitations\n- Redemption instructions',
    category: 'terms',
  },
  // Discount Templates
  { 
    id: 'discount-invalid', 
    label: 'Invalid Discount', 
    labelAr: 'خصم غير صالح',
    icon: AlertTriangle,
    text: 'The discount structure cannot be verified:\n- Original price appears inflated\n- Discount percentage exceeds maximum allowed (50%)\n- Pricing does not match market rates\n\nPlease provide documentation supporting the original price claim.',
    category: 'discount',
  },
  // Content Templates
  { 
    id: 'content-prohibited', 
    label: 'Prohibited Content', 
    labelAr: 'محتوى محظور',
    icon: Ban,
    text: 'The submission contains content that violates our marketplace guidelines:\n- [Specific violation]\n\nPlease review our content policy and resubmit compliant materials.',
    category: 'content',
  },
  // Image Templates
  { 
    id: 'image-quality', 
    label: 'Low Image Quality', 
    labelAr: 'جودة صورة منخفضة',
    icon: ImageOff,
    text: 'The submitted image does not meet quality requirements:\n- Minimum resolution: 1080p\n- Acceptable formats: JPEG, PNG, WebP\n- Maximum file size: 5MB\n\nPlease upload a higher quality image.',
    category: 'image',
  },
  { 
    id: 'image-inappropriate', 
    label: 'Inappropriate Image', 
    labelAr: 'صورة غير مناسبة',
    icon: ImageOff,
    text: 'The submitted image is not appropriate for the marketplace:\n- [Specific issue]\n\nPlease submit an image that aligns with professional standards and our content guidelines.',
    category: 'image',
  },
];

export function DecisionTemplates({ type, itemType, onSelect }: DecisionTemplatesProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Filter templates based on item type
  const relevantTemplates = TEMPLATES.filter(template => {
    if (itemType === 'vendor') return template.category === 'kyb';
    if (itemType === 'offer') return ['terms', 'discount', 'content'].includes(template.category);
    if (itemType === 'image') return template.category === 'image';
    if (itemType === 'copy') return ['terms', 'content'].includes(template.category);
    return true;
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <FileText className="w-3.5 h-3.5 me-1.5" />
          {t('Templates', 'القوالب')}
          <ChevronDown className="w-3 h-3 ms-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">
            {type === 'reject' 
              ? t('Rejection Reasons', 'أسباب الرفض')
              : t('Change Requests', 'طلبات التغيير')
            }
          </p>
          {relevantTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => onSelect(template.text)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded-md text-left hover:bg-muted transition-colors",
                  isRTL && "flex-row-reverse text-right"
                )}
              >
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {language === 'ar' ? template.labelAr : template.label}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
