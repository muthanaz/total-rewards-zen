import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Receipt, Send, Upload, Heart, Home, GraduationCap, Car, Dumbbell, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SubmitClaimButtonProps {
  category: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

// Category-specific configurations for more relevant claim dialogs
const categoryConfigs: Record<string, {
  icon: React.ElementType;
  claimTypes: { value: string; label: string; description: string }[];
  subjectPlaceholder: string;
  descriptionPlaceholder: string;
  amountLabel?: string;
}> = {
  'Health Insurance': {
    icon: Heart,
    claimTypes: [
      { value: 'reimbursement', label: 'Medical Reimbursement', description: 'Claim refund for out-of-network medical expenses' },
      { value: 'pharmacy', label: 'Pharmacy Claim', description: 'Claim for prescription medication costs' },
      { value: 'dental', label: 'Dental Claim', description: 'Claim for dental treatment expenses' },
      { value: 'optical', label: 'Optical Claim', description: 'Claim for eye care and glasses/lenses' },
    ],
    subjectPlaceholder: 'e.g., Hospital consultation on 15 Jan',
    descriptionPlaceholder: 'Provider name, date of service, and treatment details...',
  },
  'Housing': {
    icon: Home,
    claimTypes: [
      { value: 'rent-receipt', label: 'Rent Receipt Submission', description: 'Submit rent receipts for tax-free treatment' },
      { value: 'lease-renewal', label: 'Lease Renewal', description: 'Submit new tenancy contract for annual renewal' },
      { value: 'utility-claim', label: 'Utility Reimbursement', description: 'Claim for covered utility expenses' },
    ],
    subjectPlaceholder: 'e.g., January 2026 rent receipt',
    descriptionPlaceholder: 'Property address, landlord details, and payment period...',
    amountLabel: 'Rent Amount (AED)',
  },
  'Education': {
    icon: GraduationCap,
    claimTypes: [
      { value: 'tuition', label: 'Tuition Fee Claim', description: 'Claim reimbursement for school tuition fees' },
      { value: 'registration', label: 'Registration Fee', description: 'Claim for school registration/enrollment fees' },
      { value: 'exam-fees', label: 'Examination Fees', description: 'Claim for exam and certification fees' },
    ],
    subjectPlaceholder: 'e.g., Term 2 tuition for Sarah',
    descriptionPlaceholder: 'Child name, school name, term/semester, and payment details...',
    amountLabel: 'Tuition Amount (AED)',
  },
  'Wellbeing': {
    icon: Dumbbell,
    claimTypes: [
      { value: 'gym', label: 'Gym Membership', description: 'Claim for gym or fitness club membership' },
      { value: 'wellness-app', label: 'Wellness App Subscription', description: 'Claim for mental health or wellness app' },
      { value: 'therapy', label: 'Counseling Session', description: 'Claim for mental health counseling' },
      { value: 'nutrition', label: 'Nutrition Consultation', description: 'Claim for dietitian or nutrition services' },
    ],
    subjectPlaceholder: 'e.g., Fitness First annual membership',
    descriptionPlaceholder: 'Provider/service name, subscription period, and details...',
  },
  'Learning & Development': {
    icon: BookOpen,
    claimTypes: [
      { value: 'course-reimbursement', label: 'Course Reimbursement', description: 'Claim refund for completed course fees' },
      { value: 'certification', label: 'Certification Exam Fee', description: 'Claim for professional certification exam' },
      { value: 'conference', label: 'Conference/Workshop', description: 'Claim for industry conference attendance' },
      { value: 'books', label: 'Learning Materials', description: 'Claim for books and learning resources' },
    ],
    subjectPlaceholder: 'e.g., AWS Solutions Architect certification',
    descriptionPlaceholder: 'Course/certification name, provider, completion date, and how it relates to your role...',
  },
  'Fuel Allowance': {
    icon: Car,
    claimTypes: [
      { value: 'fuel-receipt', label: 'Fuel Receipt', description: 'Submit fuel receipts for record keeping' },
      { value: 'maintenance', label: 'Vehicle Maintenance', description: 'Claim for covered maintenance expenses' },
    ],
    subjectPlaceholder: 'e.g., January fuel expenses',
    descriptionPlaceholder: 'Vehicle registration, fuel station, and dates...',
    amountLabel: 'Fuel Amount (AED)',
  },
  'Car Allowance': {
    icon: Car,
    claimTypes: [
      { value: 'car-lease', label: 'Car Lease Payment', description: 'Submit lease payment documentation' },
      { value: 'car-loan', label: 'Car Loan Payment', description: 'Submit car loan payment documentation' },
      { value: 'insurance', label: 'Car Insurance', description: 'Claim for vehicle insurance payment' },
    ],
    subjectPlaceholder: 'e.g., February car lease payment',
    descriptionPlaceholder: 'Vehicle details, payment amount, and period...',
    amountLabel: 'Payment Amount (AED)',
  },
  'Annual Flight Tickets': {
    icon: Car,
    claimTypes: [
      { value: 'flight-booking', label: 'Flight Booking Request', description: 'Request booking of annual flight tickets' },
      { value: 'reimbursement', label: 'Flight Reimbursement', description: 'Claim refund for self-booked flights' },
    ],
    subjectPlaceholder: 'e.g., Annual leave flights to London',
    descriptionPlaceholder: 'Destination, travel dates, number of passengers (family members)...',
    amountLabel: 'Ticket Cost (AED)',
  },
};

const defaultClaimTypes = [
  { value: 'reimbursement', label: 'Reimbursement', description: 'Request refund for expenses paid' },
  { value: 'pre-approval', label: 'Pre-Approval', description: 'Get approval before making a purchase' },
  { value: 'direct-billing', label: 'Direct Billing Request', description: 'Request direct payment to vendor' },
];

export function SubmitClaimButton({
  category,
  buttonText = 'Submit Claim',
  buttonVariant = 'default',
  buttonSize = 'default',
  className,
  showIcon = true,
}: SubmitClaimButtonProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    claimType: '',
    subject: '',
    description: '',
    amount: '',
  });
  const { toast } = useToast();

  const config = categoryConfigs[category] || {
    icon: Receipt,
    claimTypes: defaultClaimTypes,
    subjectPlaceholder: `e.g., ${category} expense`,
    descriptionPlaceholder: 'Provide details about your claim...',
    amountLabel: 'Amount (AED)',
  };

  const IconComponent = config.icon;

  const handleSubmit = () => {
    if (!formData.claimType || !formData.subject || !formData.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Claim Submitted',
      description: `Your ${category} claim has been submitted for review. Track it in Documents & Claims.`,
    });

    setFormData({ claimType: '', subject: '', description: '', amount: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={cn(className)}>
          {showIcon && <Receipt className="w-4 h-4 mr-2" />}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-accent" />
            Submit {category} Claim
          </DialogTitle>
          <DialogDescription>
            Submit a claim or request related to your {category.toLowerCase()} benefit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Claim Type *</Label>
            <Select
              value={formData.claimType}
              onValueChange={(v) => setFormData({ ...formData, claimType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select claim type..." />
              </SelectTrigger>
              <SelectContent>
                {config.claimTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              placeholder={config.subjectPlaceholder}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{config.amountLabel || 'Amount (AED)'} *</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder={config.descriptionPlaceholder}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent/50 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload receipts or documents
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Submit Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
