import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

/**
 * SidebarFooter - Sign out button at bottom.
 * Matches Employee sidebar footer exactly.
 */
export function SidebarFooter() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className={cn('p-4 border-t border-sidebar-border', isRTL && 'text-right')}>
      <Button
        variant="ghost"
        onClick={handleSignOut}
        className={cn(
          'w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
          isRTL ? 'justify-start flex-row-reverse' : 'justify-start'
        )}
      >
        <LogOut className={cn('w-4 h-4 shrink-0', isRTL ? 'ml-3' : 'mr-3')} />
        <span className={isRTL ? 'text-right' : 'text-left'}>
          {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
        </span>
      </Button>
    </div>
  );
}
