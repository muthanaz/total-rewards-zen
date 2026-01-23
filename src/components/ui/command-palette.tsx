/**
 * Global Command Palette (Cmd+K)
 * 
 * Quick navigation and actions across the entire platform.
 * Supports role-based commands and bilingual search.
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Home, 
  FileText, 
  Users, 
  Settings, 
  Building2,
  Receipt,
  Gift,
  GraduationCap,
  Heart,
  Car,
  Dumbbell,
  BookOpen,
  Wallet,
  LayoutDashboard,
  ChartBar,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;
  keywords?: string[];
  roles?: string[];
}

const EMPLOYEE_COMMANDS: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard, path: '/employee', keywords: ['home', 'main'] },
  { id: 'my-actions', label: 'My Actions', labelAr: 'إجراءاتي', icon: Bell, path: '/employee/my-actions', keywords: ['tasks', 'todo'] },
  { id: 'benefits', label: 'Benefits Overview', labelAr: 'نظرة عامة على المزايا', icon: Gift, path: '/employee/benefits', keywords: ['allowances', 'perks'] },
  { id: 'housing', label: 'Housing Allowance', labelAr: 'بدل السكن', icon: Home, path: '/employee/housing', keywords: ['rent', 'accommodation'] },
  { id: 'schooling', label: 'Schooling Allowance', labelAr: 'بدل التعليم', icon: GraduationCap, path: '/employee/schooling', keywords: ['education', 'children', 'school'] },
  { id: 'health', label: 'Health Insurance', labelAr: 'التأمين الصحي', icon: Heart, path: '/employee/health', keywords: ['medical', 'insurance', 'doctor'] },
  { id: 'transport', label: 'Transport & Mobility', labelAr: 'النقل والتنقل', icon: Car, path: '/employee/transport', keywords: ['car', 'travel', 'flight'] },
  { id: 'wellbeing', label: 'Wellbeing Program', labelAr: 'برنامج الرفاهية', icon: Dumbbell, path: '/employee/wellbeing', keywords: ['gym', 'fitness', 'wellness'] },
  { id: 'learning', label: 'Learning & Development', labelAr: 'التعلم والتطوير', icon: BookOpen, path: '/employee/learning', keywords: ['training', 'courses', 'certification'] },
  { id: 'financial', label: 'Long-Term Financials', labelAr: 'الشؤون المالية', icon: Wallet, path: '/employee/long-term-financials', keywords: ['gratuity', 'savings', 'retirement'] },
  { id: 'claims', label: 'My Claims', labelAr: 'مطالباتي', icon: Receipt, path: '/employee/claims', keywords: ['requests', 'reimbursement', 'submit'] },
  { id: 'documents', label: 'HR Documents', labelAr: 'مستندات الموارد البشرية', icon: FileText, path: '/employee/documents', keywords: ['letters', 'certificates', 'salary'] },
  { id: 'leave', label: 'Leave Management', labelAr: 'إدارة الإجازات', icon: FileText, path: '/employee/leave', keywords: ['vacation', 'holiday', 'annual'] },
  { id: 'profile', label: 'My Profile', labelAr: 'ملفي الشخصي', icon: Users, path: '/employee/profile', keywords: ['account', 'settings', 'personal'] },
];

const EMPLOYER_COMMANDS: CommandItem[] = [
  { id: 'emp-dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard, path: '/employer', keywords: ['home', 'main'] },
  { id: 'emp-claims', label: 'Claims Management', labelAr: 'إدارة المطالبات', icon: Receipt, path: '/employer/claims', keywords: ['requests', 'approvals', 'queue'] },
  { id: 'emp-policies', label: 'Policies', labelAr: 'السياسات', icon: Shield, path: '/employer/policies', keywords: ['rules', 'benefits', 'governance'] },
  { id: 'emp-analytics', label: 'Spend Analytics', labelAr: 'تحليلات الإنفاق', icon: ChartBar, path: '/employer/spend', keywords: ['budget', 'costs', 'reports'] },
  { id: 'emp-segments', label: 'Employee Segments', labelAr: 'شرائح الموظفين', icon: Users, path: '/employer/segments', keywords: ['groups', 'cohorts'] },
  { id: 'emp-integrations', label: 'Integrations', labelAr: 'التكاملات', icon: Settings, path: '/employer/integrations', keywords: ['hris', 'payroll', 'sync'] },
];

const ADMIN_COMMANDS: CommandItem[] = [
  { id: 'admin-dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard, path: '/admin', keywords: ['home', 'main'] },
  { id: 'admin-orgs', label: 'Organizations', labelAr: 'المنظمات', icon: Building2, path: '/admin/organizations', keywords: ['clients', 'companies'] },
  { id: 'admin-users', label: 'Users & Roles', labelAr: 'المستخدمون والأدوار', icon: Users, path: '/admin/users', keywords: ['accounts', 'permissions'] },
  { id: 'admin-policies', label: 'Policy Library', labelAr: 'مكتبة السياسات', icon: Shield, path: '/admin/policies', keywords: ['templates', 'rules'] },
  { id: 'admin-audit', label: 'Audit Logs', labelAr: 'سجلات التدقيق', icon: FileText, path: '/admin/audit', keywords: ['history', 'logs', 'activity'] },
  { id: 'admin-vendors', label: 'Vendors', labelAr: 'البائعون', icon: Building2, path: '/admin/vendors', keywords: ['partners', 'suppliers'] },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Determine user role for filtering commands
  const userRole = React.useMemo(() => {
    // This would come from user profile in real app
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/employer')) return 'employer';
    if (path.startsWith('/vendor')) return 'vendor';
    return 'employee';
  }, []);

  const commands = React.useMemo(() => {
    switch (userRole) {
      case 'admin':
        return ADMIN_COMMANDS;
      case 'employer':
        return EMPLOYER_COMMANDS;
      default:
        return EMPLOYEE_COMMANDS;
    }
  }, [userRole]);

  // Global keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder={t('Search commands...', 'ابحث عن الأوامر...')} 
      />
      <CommandList>
        <CommandEmpty>
          {t('No results found.', 'لم يتم العثور على نتائج.')}
        </CommandEmpty>
        
        <CommandGroup heading={t('Navigation', 'التنقل')}>
          {commands.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.labelAr} ${item.keywords?.join(' ') || ''}`}
              onSelect={() => handleSelect(item)}
              className="gap-3"
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span>{language === 'ar' ? item.labelAr : item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('Actions', 'الإجراءات')}>
          <CommandItem
            value="help support"
            onSelect={() => {
              setOpen(false);
              // Could open help modal
            }}
            className="gap-3"
          >
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span>{t('Help & Support', 'المساعدة والدعم')}</span>
          </CommandItem>
          <CommandItem
            value="logout signout"
            onSelect={handleLogout}
            className="gap-3"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            <span>{t('Sign Out', 'تسجيل الخروج')}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook to open command palette programmatically
export function useCommandPalette() {
  const [, forceUpdate] = React.useState({});
  
  const open = React.useCallback(() => {
    // Dispatch keyboard event to open palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  return { open };
}
