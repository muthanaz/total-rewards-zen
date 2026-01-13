import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Gift, Receipt, AlertCircle, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action';
  category?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const isRTL = direction === 'rtl';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
      setIsLoading(false);
    }

    if (isOpen) {
      fetchNotifications();
    }
  }, [user?.id, isOpen]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string, category?: string) => {
    if (category === 'benefits') return <Gift className="w-4 h-4" />;
    if (category === 'claims') return <Receipt className="w-4 h-4" />;
    if (category === 'survey') return <Sparkles className="w-4 h-4" />;
    
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'action':
        return <Bell className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600';
      case 'action':
        return 'bg-violet-500/10 text-violet-600';
      default:
        return 'bg-accent/10 text-accent';
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: language === 'ar' ? ar : undefined,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={t('Notifications', 'الإشعارات')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-80 sm:w-96 p-0", isRTL && "text-right")}
        align={isRTL ? "start" : "end"}
        sideOffset={8}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-3 border-b",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <h3 className="font-semibold text-sm">{t('Notifications', 'الإشعارات')}</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} {t('new', 'جديد')}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              {t('Mark all read', 'تعليم الكل مقروء')}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">{t('No notifications yet', 'لا توجد إشعارات بعد')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                    !notification.is_read && "bg-accent/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
                    <div className={cn(
                      "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type, notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.is_read && "text-foreground",
                          notification.is_read && "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => {
                // Could navigate to a full notifications page
                setIsOpen(false);
              }}
            >
              {t('View all notifications', 'عرض جميع الإشعارات')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
