/**
 * Centralized Toast Patterns
 * 
 * Bilingual toast messages for all common actions across the platform.
 * Ensures consistent UX and proper localization.
 */

import { toast } from '@/hooks/use-toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
}

// Get current language from document or default to 'en'
function getLanguage(): 'en' | 'ar' {
  return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

function t(en: string, ar: string): string {
  return getLanguage() === 'ar' ? ar : en;
}

function showToast(config: ToastConfig, type: ToastType = 'success') {
  const lang = getLanguage();
  
  toast({
    title: lang === 'ar' ? config.titleAr : config.title,
    description: config.description 
      ? (lang === 'ar' ? config.descriptionAr : config.description)
      : undefined,
    variant: type === 'error' ? 'destructive' : 'default',
  });
}

// ========================
// Profile & Account
// ========================

export const profileToasts = {
  saved: () => showToast({
    title: 'Profile updated',
    titleAr: 'تم تحديث الملف الشخصي',
    description: 'Your changes have been saved successfully.',
    descriptionAr: 'تم حفظ التغييرات بنجاح.',
  }),
  
  saveFailed: () => showToast({
    title: 'Failed to save',
    titleAr: 'فشل في الحفظ',
    description: 'Please try again or contact support.',
    descriptionAr: 'يرجى المحاولة مرة أخرى أو الاتصال بالدعم.',
  }, 'error'),

  photoUpdated: () => showToast({
    title: 'Photo updated',
    titleAr: 'تم تحديث الصورة',
  }),
};

// ========================
// Documents
// ========================

export const documentToasts = {
  generated: (docType?: string) => showToast({
    title: 'Document generated',
    titleAr: 'تم إنشاء المستند',
    description: docType ? `Your ${docType} is ready for download.` : 'Your document is ready for download.',
    descriptionAr: docType ? `${docType} جاهز للتنزيل.` : 'المستند جاهز للتنزيل.',
  }),

  downloadStarted: () => showToast({
    title: 'Download started',
    titleAr: 'بدأ التنزيل',
  }),

  generationFailed: () => showToast({
    title: 'Generation failed',
    titleAr: 'فشل إنشاء المستند',
    description: 'Please try again later.',
    descriptionAr: 'يرجى المحاولة لاحقاً.',
  }, 'error'),
};

// ========================
// Claims & Requests
// ========================

export const claimToasts = {
  submitted: () => showToast({
    title: 'Claim submitted',
    titleAr: 'تم تقديم المطالبة',
    description: 'You will be notified once it is reviewed.',
    descriptionAr: 'سيتم إخطارك بمجرد مراجعتها.',
  }),

  approved: () => showToast({
    title: 'Claim approved',
    titleAr: 'تمت الموافقة على المطالبة',
  }),

  rejected: (reason?: string) => showToast({
    title: 'Claim rejected',
    titleAr: 'تم رفض المطالبة',
    description: reason || 'Please review the rejection reason.',
    descriptionAr: reason || 'يرجى مراجعة سبب الرفض.',
  }, 'warning'),

  documentUploaded: () => showToast({
    title: 'Document uploaded',
    titleAr: 'تم رفع المستند',
    description: 'Your document has been attached to the claim.',
    descriptionAr: 'تم إرفاق المستند بالمطالبة.',
  }),

  saveDraft: () => showToast({
    title: 'Draft saved',
    titleAr: 'تم حفظ المسودة',
    description: 'You can continue later.',
    descriptionAr: 'يمكنك المتابعة لاحقاً.',
  }),
};

// ========================
// Leave Management
// ========================

export const leaveToasts = {
  submitted: () => showToast({
    title: 'Leave request submitted',
    titleAr: 'تم تقديم طلب الإجازة',
    description: 'Pending manager approval.',
    descriptionAr: 'في انتظار موافقة المدير.',
  }),

  approved: () => showToast({
    title: 'Leave approved',
    titleAr: 'تمت الموافقة على الإجازة',
  }),

  cancelled: () => showToast({
    title: 'Leave cancelled',
    titleAr: 'تم إلغاء الإجازة',
  }),
};

// ========================
// General Actions
// ========================

export const generalToasts = {
  copied: (label?: string) => showToast({
    title: 'Copied to clipboard',
    titleAr: 'تم النسخ',
    description: label,
    descriptionAr: label,
  }),

  saved: () => showToast({
    title: 'Changes saved',
    titleAr: 'تم حفظ التغييرات',
  }),

  deleted: () => showToast({
    title: 'Deleted successfully',
    titleAr: 'تم الحذف بنجاح',
  }),

  error: (message?: string) => showToast({
    title: 'Something went wrong',
    titleAr: 'حدث خطأ ما',
    description: message || 'Please try again.',
    descriptionAr: message || 'يرجى المحاولة مرة أخرى.',
  }, 'error'),

  networkError: () => showToast({
    title: 'Connection error',
    titleAr: 'خطأ في الاتصال',
    description: 'Please check your internet connection.',
    descriptionAr: 'يرجى التحقق من اتصالك بالإنترنت.',
  }, 'error'),

  unauthorized: () => showToast({
    title: 'Access denied',
    titleAr: 'تم رفض الوصول',
    description: 'You do not have permission to perform this action.',
    descriptionAr: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
  }, 'error'),

  sessionExpired: () => showToast({
    title: 'Session expired',
    titleAr: 'انتهت الجلسة',
    description: 'Please sign in again.',
    descriptionAr: 'يرجى تسجيل الدخول مرة أخرى.',
  }, 'warning'),
};

// ========================
// Admin/Employer Actions
// ========================

export const adminToasts = {
  userCreated: () => showToast({
    title: 'User created',
    titleAr: 'تم إنشاء المستخدم',
    description: 'An invitation email has been sent.',
    descriptionAr: 'تم إرسال بريد الدعوة.',
  }),

  userUpdated: () => showToast({
    title: 'User updated',
    titleAr: 'تم تحديث المستخدم',
  }),

  userDeactivated: () => showToast({
    title: 'User deactivated',
    titleAr: 'تم تعطيل المستخدم',
  }),

  policyPublished: () => showToast({
    title: 'Policy published',
    titleAr: 'تم نشر السياسة',
    description: 'The policy is now active.',
    descriptionAr: 'السياسة مفعلة الآن.',
  }),

  settingsSaved: () => showToast({
    title: 'Settings saved',
    titleAr: 'تم حفظ الإعدادات',
  }),

  integrationConnected: () => showToast({
    title: 'Integration connected',
    titleAr: 'تم ربط التكامل',
    description: 'Data sync will begin shortly.',
    descriptionAr: 'ستبدأ مزامنة البيانات قريباً.',
  }),

  syncStarted: () => showToast({
    title: 'Sync started',
    titleAr: 'بدأت المزامنة',
    description: 'This may take a few minutes.',
    descriptionAr: 'قد يستغرق هذا بضع دقائق.',
  }),
};

// Default export for convenient importing
export const actionToasts = {
  profile: profileToasts,
  document: documentToasts,
  claim: claimToasts,
  leave: leaveToasts,
  general: generalToasts,
  admin: adminToasts,
};
