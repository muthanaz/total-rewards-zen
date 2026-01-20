import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Receipt, ShoppingBag, Home, Heart, FileText, MessageCircle,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType = 
  | 'no-claims' 
  | 'no-offers' 
  | 'no-documents' 
  | 'no-vouchers'
  | 'no-activity'
  | 'no-questions';

interface ActionEmptyStateProps {
  type: EmptyStateType;
  className?: string;
  customActions?: ReactNode;
}

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
  suggestions?: string[];
  iconBg: string;
  iconColor: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, EmptyStateConfig> = {
  'no-claims': {
    icon: Receipt,
    title: 'No claims yet',
    description: 'You haven\'t submitted any claims. Start with one of your most-used benefits.',
    primaryAction: { label: 'Submit Housing Claim', to: '/employee/requests?type=claim&category=Housing' },
    secondaryAction: { label: 'Submit Health Claim', to: '/employee/requests?type=claim&category=Health' },
    suggestions: ['Housing and Health are the most commonly used benefits'],
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  'no-offers': {
    icon: ShoppingBag,
    title: 'No offers available yet',
    description: 'Marketplace offers are enabled by your employer based on your eligibility.',
    primaryAction: { label: 'Ask HR about Marketplace', to: '/employee/requests?type=question' },
    suggestions: [
      'Your employer enables offers based on eligibility',
      'New partner offers are added regularly',
      'Check back soon for exclusive discounts',
    ],
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  'no-documents': {
    icon: FileText,
    title: 'No documents yet',
    description: 'Request HR documents like salary certificates, employment letters, and more.',
    primaryAction: { label: 'Request a Document', to: '/employee/documents?action=request' },
    suggestions: ['Salary certificates are typically ready within 2 business days'],
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  'no-vouchers': {
    icon: ShoppingBag,
    title: 'No vouchers yet',
    description: 'Activate offers from the marketplace to get your discount codes here.',
    primaryAction: { label: 'Browse Marketplace', to: '/employee/marketplace' },
    suggestions: ['Vouchers appear here after you redeem an offer'],
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  'no-activity': {
    icon: Home,
    title: 'No recent activity',
    description: 'Your recent claims, requests, and updates will appear here.',
    primaryAction: { label: 'Submit a Claim', to: '/employee/requests?type=claim' },
    secondaryAction: { label: 'Browse Benefits', to: '/employee/benefits' },
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  'no-questions': {
    icon: MessageCircle,
    title: 'No questions yet',
    description: 'Ask HR about your benefits, eligibility, or policies.',
    primaryAction: { label: 'Ask a Question', to: '/employee/requests?type=question' },
    suggestions: ['Get answers within 1-3 business days'],
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
};

export function ActionEmptyState({ type, className, customActions }: ActionEmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-5',
          config.iconBg
        )}
      >
        <Icon className={cn('w-7 h-7', config.iconColor)} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-display font-semibold text-foreground mb-2"
      >
        {config.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground max-w-sm mb-5"
      >
        {config.description}
      </motion.p>

      {config.suggestions && config.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-muted/50 rounded-lg p-3 max-w-sm mb-5 text-left"
        >
          <ul className="text-xs text-muted-foreground space-y-1">
            {config.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-accent">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {customActions ? (
        customActions
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          {config.primaryAction && (
            <Button asChild>
              <Link to={config.primaryAction.to}>
                {config.primaryAction.label}
              </Link>
            </Button>
          )}
          {config.secondaryAction && (
            <Button variant="outline" asChild>
              <Link to={config.secondaryAction.to}>
                {config.secondaryAction.label}
              </Link>
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
