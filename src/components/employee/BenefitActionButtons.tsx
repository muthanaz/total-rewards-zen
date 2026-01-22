import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Star, Send, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BenefitActionButtonsProps {
  benefitName: string;
  benefitCategory: string;
  isRTL?: boolean;
  compact?: boolean;
  onClaimSubmit?: (claim: ClaimData) => void;
  onRatingSubmit?: (rating: number) => void;
}

interface ClaimData {
  benefitName: string;
  category: string;
  type: 'claim' | 'request' | 'question';
  subject: string;
  description: string;
  amount?: number;
}

export function BenefitActionButtons({ 
  benefitName, 
  benefitCategory, 
  isRTL = false,
  compact = true,
  onClaimSubmit,
  onRatingSubmit 
}: BenefitActionButtonsProps) {
  const [claimOpen, setClaimOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    type: 'claim' as 'claim' | 'request' | 'question',
    subject: '',
    description: '',
    amount: '',
  });
  const { toast } = useToast();

  const handleClaimSubmit = () => {
    if (!formData.subject) {
      toast({
        title: isRTL ? 'معلومات ناقصة' : 'Missing Information',
        description: isRTL ? 'يرجى ملء الموضوع' : 'Please fill in the subject.',
        variant: 'destructive',
      });
      return;
    }

    const claimData: ClaimData = {
      benefitName,
      category: benefitCategory,
      type: formData.type,
      subject: formData.subject,
      description: formData.description,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
    };

    onClaimSubmit?.(claimData);
    setFormData({ type: 'claim', subject: '', description: '', amount: '' });
    setClaimOpen(false);

    toast({
      title: isRTL ? 'تم الإرسال' : 'Submitted',
      description: isRTL ? 'تم إرسال طلبك للمراجعة' : 'Your request has been submitted for review.',
    });
  };

  const handleRatingSubmit = () => {
    if (rating === 0) {
      toast({
        title: isRTL ? 'يرجى التقييم' : 'Please Rate',
        description: isRTL ? 'اختر تقييماً قبل الإرسال' : 'Select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    onRatingSubmit?.(rating);
    setRatingOpen(false);
    setRating(0);

    toast({
      title: isRTL ? 'شكراً لك' : 'Thank You',
      description: isRTL ? 'تم حفظ تقييمك' : 'Your rating has been saved.',
    });
  };

  const requestTypes = [
    { value: 'claim', label: isRTL ? 'مطالبة' : 'Claim', icon: Receipt },
    { value: 'request', label: isRTL ? 'طلب' : 'Request', icon: Send },
    { value: 'question', label: isRTL ? 'سؤال' : 'Question', icon: HelpCircle },
  ];

  return (
    <div className={cn("flex gap-1", isRTL && "flex-row-reverse")} onClick={(e) => e.stopPropagation()}>
      {/* Claim/Request Button */}
      <Button
        variant="ghost"
        size="xs"
        className={cn(
          "text-muted-foreground hover:text-primary hover:bg-primary/10",
          compact && "gap-0.5"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setClaimOpen(true);
        }}
      >
        <Receipt className="w-3 h-3" />
        {!compact && (isRTL ? 'مطالبة' : 'Claim')}
      </Button>

      {/* Rate Button */}
      <Button
        variant="ghost"
        size="xs"
        className={cn(
          "text-muted-foreground hover:text-warning hover:bg-warning/10",
          compact && "gap-0.5"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setRatingOpen(true);
        }}
      >
        <Star className="w-3 h-3" />
        {!compact && (isRTL ? 'تقييم' : 'Rate')}
      </Button>

      {/* Claim Dialog */}
      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn(isRTL && "text-right")}>
              {isRTL ? `طلب لـ ${benefitName}` : `Request for ${benefitName}`}
            </DialogTitle>
            <DialogDescription className={cn(isRTL && "text-right")}>
              {isRTL ? 'إرسال مطالبة أو طلب أو سؤال' : 'Submit a claim, request, or question'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className={cn(isRTL && "block text-right")}>{isRTL ? 'النوع' : 'Type'}</Label>
              <div className="flex gap-2 mt-1.5">
                {requestTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={formData.type === type.value ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                  >
                    <type.icon className="w-3 h-3" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className={cn(isRTL && "block text-right")}>{isRTL ? 'الموضوع *' : 'Subject *'}</Label>
              <Input
                placeholder={isRTL ? 'موضوع مختصر...' : 'Brief subject...'}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={cn(isRTL && "text-right")}
              />
            </div>

            <div>
              <Label className={cn(isRTL && "block text-right")}>{isRTL ? 'التفاصيل' : 'Details'}</Label>
              <Textarea
                placeholder={isRTL ? 'أضف التفاصيل...' : 'Add details...'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className={cn(isRTL && "text-right")}
              />
            </div>

            {formData.type === 'claim' && (
              <div>
                <Label className={cn(isRTL && "block text-right")}>{isRTL ? 'المبلغ (AED)' : 'Amount (AED)'}</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={cn(isRTL && "text-right")}
                />
              </div>
            )}
          </div>

          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setClaimOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleClaimSubmit}>
              <Send className="w-3 h-3 mr-1" />
              {isRTL ? 'إرسال' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className={cn("text-center", isRTL && "text-right")}>
              {isRTL ? `تقييم ${benefitName}` : `Rate ${benefitName}`}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              {rating === 0
                ? (isRTL ? 'اضغط لتقييم' : 'Click to rate')
                : rating <= 2
                ? (isRTL ? 'نقدر ملاحظاتك' : 'We appreciate your feedback')
                : rating <= 4
                ? (isRTL ? 'شكراً لتقييمك' : 'Thanks for your rating')
                : (isRTL ? 'رائع! شكراً جزيلاً' : 'Great! Thank you!')}
            </p>
          </div>

          <DialogFooter className="justify-center">
            <Button onClick={handleRatingSubmit} disabled={rating === 0}>
              {isRTL ? 'إرسال التقييم' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
