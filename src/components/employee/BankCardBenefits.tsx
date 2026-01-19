import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, ChevronRight, Gift, Star, ExternalLink,
  Plane, ShoppingBag, Coffee, Car, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BankCard, BANK_CARD_BENEFITS } from '@/components/shared/BankCardsSection';
import { Link } from 'react-router-dom';

interface BankCardBenefitsProps {
  cards: BankCard[];
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Travel: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-500/30' },
  Transport: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  Shopping: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-500/30' },
  Food: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500/30' },
  Entertainment: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-500/30' },
  Home: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500/30' },
  Lifestyle: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', border: 'border-fuchsia-500/30' },
  Fitness: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-500/30' },
  Electronics: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500/30' },
  Groceries: { bg: 'bg-lime-500', text: 'text-lime-600', border: 'border-lime-500/30' },
};

export function BankCardBenefits({ cards }: BankCardBenefitsProps) {
  // Get all benefits from linked cards
  const allBenefits = cards.flatMap(card => {
    const bankData = BANK_CARD_BENEFITS[card.bank];
    if (!bankData) return [];
    return bankData.benefits.map(benefit => ({
      ...benefit,
      bank: card.bank,
      cardName: card.cardName,
      cardId: card.id,
    }));
  });

  if (cards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Unlock Bank Card Benefits</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Link your bank cards in your profile to see exclusive discounts and cashback offers available to you.
          </p>
          <Button asChild>
            <Link to="/employee/profile">
              <CreditCard className="w-4 h-4 mr-2" />
              Link Your Cards
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              Your Bank Card Benefits
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                {allBenefits.length} offers
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Exclusive discounts from your {cards.length} linked card{cards.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1" asChild>
          <Link to="/employee/profile">
            Manage Cards
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {allBenefits.map((benefit, index) => {
          const color = categoryColors[benefit.category] || categoryColors.Shopping;
          const Icon = benefit.icon;
          
          return (
            <Card 
              key={`${benefit.cardId}-${index}`}
              className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-0.5",
                "bg-gradient-to-br from-background to-muted/30"
              )}
            >
              {/* Top color bar */}
              <div className={cn("h-1", color.bg)} />
              
              <CardContent className="p-4 space-y-3">
                {/* Icon and discount */}
                <div className="flex items-start justify-between">
                  <div className={cn("p-2 rounded-lg", `${color.bg}/10`)}>
                    <Icon className={cn("w-4 h-4", color.text)} />
                  </div>
                  <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold">
                    {benefit.discount}
                  </Badge>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-medium text-sm leading-snug">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{benefit.bank}</p>
                </div>

                {/* Category */}
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px]", color.border, `${color.bg}/10`, color.text)}
                >
                  {benefit.category}
                </Badge>

                {/* Action */}
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                  <ExternalLink className="w-3 h-3" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tip */}
      <Card className="border-dashed border-muted-foreground/20 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background border border-border/50">
              <Gift className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">Maximize your savings</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Use your linked bank cards when activating marketplace offers to stack discounts and earn additional cashback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
