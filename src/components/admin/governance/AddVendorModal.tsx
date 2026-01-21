/**
 * AddVendorModal
 * 
 * Modal to create a new vendor in draft/pending state with KYB checklist.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Plus, Building2, Phone, Mail, MapPin, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_KYB_DOCUMENTS } from '@/lib/governanceTypes';

interface AddVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (vendorData: VendorFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface VendorFormData {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  categories: string[];
  commissionRate: number;
  notes?: string;
}

const CATEGORIES = [
  'Health', 'Wellness', 'Fitness', 'Education', 'Travel', 
  'Electronics', 'Lifestyle', 'Food & Beverage', 'Entertainment', 'Services'
];

export function AddVendorModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddVendorModalProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [formData, setFormData] = useState<VendorFormData>({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    categories: [],
    commissionRate: 10,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VendorFormData, string>>>({});

  const handleChange = (field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VendorFormData, string>> = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = t('Company name is required', 'اسم الشركة مطلوب');
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = t('Email is required', 'البريد الإلكتروني مطلوب');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = t('Invalid email format', 'تنسيق البريد الإلكتروني غير صالح');
    }
    if (formData.categories.length === 0) {
      newErrors.categories = t('Select at least one category', 'اختر فئة واحدة على الأقل');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    await onSubmit(formData);
    setFormData({
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      categories: [],
      commissionRate: 10,
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Store className="w-5 h-5" />
            {t('Add New Vendor', 'إضافة بائع جديد')}
          </DialogTitle>
          <DialogDescription>
            {t('Create a vendor in draft status. They will need to complete KYB verification.', 
               'إنشاء بائع في حالة مسودة. سيحتاجون إلى إكمال التحقق من KYB.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className={cn(isRTL && "text-right block")}>
              {t('Company Name', 'اسم الشركة')} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Building2 className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder={t('Enter company name...', 'أدخل اسم الشركة...')}
                className={cn(isRTL ? "pr-9" : "pl-9", errors.companyName && "border-destructive")}
              />
            </div>
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className={cn(isRTL && "text-right block")}>
              {t('Contact Email', 'البريد الإلكتروني')} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="vendor@company.com"
                className={cn(isRTL ? "pr-9" : "pl-9", errors.contactEmail && "border-destructive")}
              />
            </div>
            {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className={cn(isRTL && "text-right block")}>
              {t('Contact Phone', 'رقم الهاتف')}
            </Label>
            <div className="relative">
              <Phone className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+971 4 123 4567"
                className={cn(isRTL ? "pr-9" : "pl-9")}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className={cn(isRTL && "text-right block")}>
              {t('Business Address', 'عنوان العمل')}
            </Label>
            <div className="relative">
              <MapPin className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder={t('Enter address...', 'أدخل العنوان...')}
                className={cn(isRTL ? "pr-9" : "pl-9")}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>
              {t('Categories', 'الفئات')} <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Badge
                  key={cat}
                  variant={formData.categories.includes(cat) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            {errors.categories && <p className="text-xs text-destructive">{errors.categories}</p>}
          </div>

          {/* Commission Rate */}
          <div className="space-y-2">
            <Label htmlFor="commissionRate" className={cn(isRTL && "text-right block")}>
              {t('Commission Rate (%)', 'نسبة العمولة (%)')}
            </Label>
            <Select
              value={formData.commissionRate.toString()}
              onValueChange={(v) => handleChange('commissionRate', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 6, 7, 8, 9, 10, 12, 15, 20].map(rate => (
                  <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className={cn(isRTL && "text-right block")}>
              {t('Internal Notes', 'ملاحظات داخلية')}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={t('Optional notes...', 'ملاحظات اختيارية...')}
              rows={3}
            />
          </div>

          {/* KYB Reminder */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4" />
              {t('KYB Checklist', 'قائمة التحقق')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(
                'After creation, the vendor will need to submit: Trade License, Owner ID, Bank Details, Address Proof, VAT/TRN, and Contact Information.',
                'بعد الإنشاء، سيحتاج البائع إلى تقديم: الرخصة التجارية، هوية المالك، تفاصيل البنك، إثبات العنوان، الضريبة، ومعلومات الاتصال.'
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('Cancel', 'إلغاء')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Plus className="w-4 h-4 me-2" />
            {t('Create Vendor', 'إنشاء البائع')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
