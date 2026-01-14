import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Heart, 
  ThumbsUp, 
  Award,
  Sparkles,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Recognition {
  id: string;
  from: { name: string; avatar?: string; department: string };
  to: { name: string; avatar?: string; department: string };
  message: string;
  messageAr: string;
  value: string;
  valueAr: string;
  timestamp: Date;
  reactions: number;
  type: 'star' | 'heart' | 'award' | 'thumbs';
}

const demoRecognitions: Recognition[] = [
  {
    id: '1',
    from: { name: 'Sarah Ahmed', department: 'Marketing' },
    to: { name: 'Mohammed Ali', department: 'Engineering' },
    message: 'Amazing work on the product launch! Your dedication made all the difference.',
    messageAr: 'عمل رائع على إطلاق المنتج! تفانيك أحدث فرقًا كبيرًا.',
    value: 'Excellence',
    valueAr: 'التميز',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reactions: 12,
    type: 'star',
  },
  {
    id: '2',
    from: { name: 'Ahmed Hassan', department: 'Finance' },
    to: { name: 'Fatima Al Rashid', department: 'HR' },
    message: 'Thank you for going above and beyond to help with the onboarding process.',
    messageAr: 'شكرًا لك على بذل جهد إضافي للمساعدة في عملية التوظيف.',
    value: 'Teamwork',
    valueAr: 'العمل الجماعي',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    reactions: 8,
    type: 'heart',
  },
  {
    id: '3',
    from: { name: 'Layla Mahmoud', department: 'Sales' },
    to: { name: 'Omar Khalid', department: 'Operations' },
    message: 'Your innovative solution saved us weeks of work. Truly impressive!',
    messageAr: 'حلك المبتكر وفر علينا أسابيع من العمل. مثير للإعجاب حقًا!',
    value: 'Innovation',
    valueAr: 'الابتكار',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reactions: 15,
    type: 'award',
  },
];

interface RecognitionStreamProps {
  isRTL?: boolean;
  isArabic?: boolean;
  onGiveRecognition?: () => void;
  onViewAll?: () => void;
}

export function RecognitionStream({
  isRTL = false,
  isArabic = false,
  onGiveRecognition,
  onViewAll,
}: RecognitionStreamProps) {
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const getTypeIcon = (type: Recognition['type']) => {
    switch (type) {
      case 'star': return Star;
      case 'heart': return Heart;
      case 'award': return Award;
      case 'thumbs': return ThumbsUp;
    }
  };

  const getTypeColor = (type: Recognition['type']) => {
    switch (type) {
      case 'star': return 'text-amber-500 bg-amber-500/10';
      case 'heart': return 'text-rose-500 bg-rose-500/10';
      case 'award': return 'text-purple-500 bg-purple-500/10';
      case 'thumbs': return 'text-blue-500 bg-blue-500/10';
    }
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: isArabic ? ar : undefined 
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("text-lg font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            {isArabic ? 'تدفق التقدير' : 'Recognition Stream'}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={onGiveRecognition}
          >
            <Plus className="w-3 h-3" />
            {isArabic ? 'قدم تقدير' : 'Give'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoRecognitions.map((recognition, index) => {
          const TypeIcon = getTypeIcon(recognition.type);
          const typeColor = getTypeColor(recognition.type);
          
          return (
            <motion.div
              key={recognition.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "recognition-card group cursor-pointer hover:shadow-md transition-all",
                isRTL && "border-l-0 border-r-4 border-r-action"
              )}
            >
              <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
                {/* Avatars */}
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {recognition.from.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 p-1 rounded-full",
                    typeColor
                  )}>
                    <TypeIcon className="w-3 h-3" />
                  </div>
                </div>

                {/* Content */}
                <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                  <div className={cn("flex items-center gap-1 text-sm mb-1 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
                    <span className="font-medium text-foreground">{recognition.from.name}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium text-foreground">{recognition.to.name}</span>
                    <Badge variant="secondary" className="text-[10px] ml-1">
                      {isArabic ? recognition.valueAr : recognition.value}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    "{isArabic ? recognition.messageAr : recognition.message}"
                  </p>

                  <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", isRTL && "flex-row-reverse justify-end")}>
                    <span>{formatTime(recognition.timestamp)}</span>
                    <button className={cn(
                      "flex items-center gap-1 hover:text-accent transition-colors",
                      isRTL && "flex-row-reverse"
                    )}>
                      <Heart className="w-3 h-3" />
                      {recognition.reactions}
                    </button>
                    <button className={cn(
                      "flex items-center gap-1 hover:text-accent transition-colors",
                      isRTL && "flex-row-reverse"
                    )}>
                      <MessageCircle className="w-3 h-3" />
                      {isArabic ? 'رد' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* View All Button */}
        <Button
          variant="ghost"
          className="w-full h-9 text-sm text-muted-foreground hover:text-foreground"
          onClick={onViewAll}
        >
          {isArabic ? 'عرض كل التقديرات' : 'View all recognitions'}
          <ChevronIcon className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
