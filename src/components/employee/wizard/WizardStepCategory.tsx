/**
 * Wizard Step 1: Category Selection
 * 
 * Allows employee to select benefit category (pre-filled if coming from benefit page).
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BENEFIT_CATEGORIES, BenefitCategoryKey } from '@/lib/benefitCategories';
import { Check } from 'lucide-react';

// Categories that support claims/requests
const CLAIMABLE_CATEGORIES: BenefitCategoryKey[] = [
  'housing', 'schooling', 'health', 'transport', 'wellbeing', 'learning', 'financial'
];

interface WizardStepCategoryProps {
  selectedCategory: BenefitCategoryKey | null;
  onSelect: (category: BenefitCategoryKey) => void;
}

export function WizardStepCategory({ selectedCategory, onSelect }: WizardStepCategoryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">What benefit are you claiming?</h2>
        <p className="text-sm text-muted-foreground">
          Select the benefit category for your claim or request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CLAIMABLE_CATEGORIES.map((key) => {
          const category = BENEFIT_CATEGORIES[key];
          const Icon = category.icon;
          const isSelected = selectedCategory === key;
          
          return (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary border-primary'
              )}
              onClick={() => onSelect(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2.5 rounded-lg text-white flex-shrink-0 bg-gradient-to-br',
                    category.gradientClass
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{category.fullLabel}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary ml-auto flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default WizardStepCategory;
