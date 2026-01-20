import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function OrgSuspended() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {isRTL ? 'تم تعليق المنظمة' : 'Organization Suspended'}
          </CardTitle>
          <CardDescription className="mt-2">
            {isRTL 
              ? 'تم تعليق وصول منظمتك إلى المنصة مؤقتاً. يرجى التواصل مع المسؤول للحصول على المساعدة.'
              : 'Your organization\'s access to the platform has been temporarily suspended. Please contact your administrator for assistance.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("p-4 rounded-lg bg-muted text-sm", isRTL && "text-right")}>
            <p className="font-medium mb-1">
              {isRTL ? 'هل تحتاج إلى مساعدة؟' : 'Need help?'}
            </p>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع فريق الدعم.'
                : 'If you believe this is an error, please reach out to the support team.'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:support@bnft.app">
                <Mail className="w-4 h-4 me-2" />
                {isRTL ? 'تواصل مع الدعم' : 'Contact Support'}
              </a>
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 me-2" />
              {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
