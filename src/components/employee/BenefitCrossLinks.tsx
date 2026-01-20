import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Receipt, FileText, ShoppingBag, ArrowRight, 
  ClipboardList, HelpCircle, ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenefitCrossLinksProps {
  benefitCategory: string;
  showClaimLink?: boolean;
  showPolicyLink?: boolean;
  showMarketplaceLink?: boolean;
  className?: string;
  compact?: boolean;
}

// Maps benefit categories to marketplace filter categories
const BENEFIT_TO_MARKETPLACE_MAP: Record<string, string> = {
  'Housing': 'Home & Living',
  'Schooling': 'Learning',
  'Health Insurance': 'Wellness',
  'Health': 'Wellness',
  'Transport': 'Transport',
  'Wellbeing': 'Fitness',
  'Learning & Development': 'Learning',
  'Learning': 'Learning',
  'Financial Planning': 'Financial',
  'Long-Term Financials': 'Financial',
};

export function BenefitCrossLinks({
  benefitCategory,
  showClaimLink = true,
  showPolicyLink = true,
  showMarketplaceLink = true,
  className,
  compact = false,
}: BenefitCrossLinksProps) {
  const marketplaceCategory = BENEFIT_TO_MARKETPLACE_MAP[benefitCategory] || 'All';

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {showClaimLink && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <Link to={`/employee/requests?category=${encodeURIComponent(benefitCategory)}&type=claim`}>
              <Receipt className="w-3 h-3" />
              Submit Claim
            </Link>
          </Button>
        )}
        {showPolicyLink && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
            <Link to={`/employee/knowledge-hub?search=${encodeURIComponent(benefitCategory + ' policy')}`}>
              <FileText className="w-3 h-3" />
              View Policy
            </Link>
          </Button>
        )}
        {showMarketplaceLink && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
            <Link to={`/employee/marketplace?category=${encodeURIComponent(marketplaceCategory)}`}>
              <ShoppingBag className="w-3 h-3" />
              Browse Offers
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3", className)}>
      {showClaimLink && (
        <Link
          to={`/employee/requests?category=${encodeURIComponent(benefitCategory)}&type=claim`}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all group"
        >
          <div className="p-2 rounded-lg bg-accent/10 shrink-0">
            <Receipt className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm group-hover:text-accent transition-colors">Submit a Claim</p>
            <p className="text-xs text-muted-foreground">Start a reimbursement request</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
        </Link>
      )}

      {showPolicyLink && (
        <Link
          to={`/employee/knowledge-hub?search=${encodeURIComponent(benefitCategory + ' policy')}`}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all group"
        >
          <div className="p-2 rounded-lg bg-muted shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm group-hover:text-accent transition-colors">View Full Policy</p>
            <p className="text-xs text-muted-foreground">Eligibility, limits & rules</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
        </Link>
      )}

      {showMarketplaceLink && (
        <Link
          to={`/employee/marketplace?category=${encodeURIComponent(marketplaceCategory)}`}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all group"
        >
          <div className="p-2 rounded-lg bg-success/10 shrink-0">
            <ShoppingBag className="w-4 h-4 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm group-hover:text-accent transition-colors">Partner Offers</p>
            <p className="text-xs text-muted-foreground">Exclusive discounts available</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
        </Link>
      )}
    </div>
  );
}

// Compact version for Claims page - links back to benefit + docs
interface ClaimCrossLinksProps {
  benefitCategory: string;
  requestId?: string;
  className?: string;
}

export function ClaimCrossLinks({ benefitCategory, requestId, className }: ClaimCrossLinksProps) {
  const benefitRoute = benefitCategory.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
  
  return (
    <div className={cn("flex flex-wrap gap-2 pt-2 border-t", className)}>
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" asChild>
        <Link to={`/employee/${benefitRoute}`}>
          <ExternalLink className="w-3 h-3" />
          {benefitCategory} Benefit
        </Link>
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" asChild>
        <Link to={`/employee/knowledge-hub?search=required+documents+${encodeURIComponent(benefitCategory)}`}>
          <ClipboardList className="w-3 h-3" />
          Required Documents
        </Link>
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" asChild>
        <Link to={`/employee/requests?category=${encodeURIComponent(benefitCategory)}&type=question`}>
          <HelpCircle className="w-3 h-3" />
          Ask HR
        </Link>
      </Button>
    </div>
  );
}
