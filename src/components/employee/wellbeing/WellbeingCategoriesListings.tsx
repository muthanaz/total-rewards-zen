/**
 * WellbeingCategoriesListings
 * 
 * Displays wellbeing program categories with associated services/listings.
 * Clean grid layout with category icons and service examples.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell, 
  Brain, 
  Apple, 
  Stethoscope,
  Heart,
  Leaf,
  ExternalLink,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WellbeingCategory {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  listings: {
    name: string;
    provider?: string;
    typical?: string;
  }[];
}

export function WellbeingCategoriesListings() {
  const categories: WellbeingCategory[] = [
    {
      icon: Dumbbell,
      title: 'Fitness & Gym',
      description: 'Gym memberships, personal training, and fitness classes',
      color: 'text-orange-500 bg-orange-500/10',
      listings: [
        { name: 'Gym Membership', provider: 'Fitness First, Gold\'s Gym', typical: 'AED 300-800/mo' },
        { name: 'Personal Training', provider: 'Certified trainers', typical: 'AED 200-400/session' },
        { name: 'Group Classes', provider: 'Yoga, Pilates, CrossFit', typical: 'AED 100-250/class' },
      ],
    },
    {
      icon: Brain,
      title: 'Mental Health',
      description: 'Therapy, counseling, and mindfulness programs',
      color: 'text-purple-500 bg-purple-500/10',
      listings: [
        { name: 'Therapy Sessions', provider: 'Licensed therapists', typical: 'AED 400-800/session' },
        { name: 'Meditation Apps', provider: 'Calm, Headspace', typical: 'AED 200-400/year' },
        { name: 'Stress Management', provider: 'Workshops & coaching', typical: 'AED 500-1,500' },
      ],
    },
    {
      icon: Apple,
      title: 'Nutrition',
      description: 'Diet consultation, meal planning, and health coaching',
      color: 'text-green-500 bg-green-500/10',
      listings: [
        { name: 'Nutritionist Visits', provider: 'Registered dietitians', typical: 'AED 300-600/session' },
        { name: 'Meal Plans', provider: 'Custom diet programs', typical: 'AED 500-1,500/mo' },
        { name: 'Health Coaching', provider: 'Lifestyle coaches', typical: 'AED 400-800/session' },
      ],
    },
    {
      icon: Stethoscope,
      title: 'Preventive Care',
      description: 'Health screenings, checkups, and vaccinations',
      color: 'text-blue-500 bg-blue-500/10',
      listings: [
        { name: 'Annual Checkup', provider: 'In-network clinics', typical: 'AED 500-1,500' },
        { name: 'Health Screening', provider: 'Comprehensive panels', typical: 'AED 800-2,500' },
        { name: 'Vaccinations', provider: 'Flu, travel vaccines', typical: 'AED 100-400' },
      ],
    },
    {
      icon: Heart,
      title: 'Wellness Programs',
      description: 'Corporate wellness initiatives and challenges',
      color: 'text-red-500 bg-red-500/10',
      listings: [
        { name: 'Step Challenges', provider: 'Company-wide programs', typical: 'Free' },
        { name: 'Wellness Retreats', provider: 'Organized events', typical: 'AED 500-2,000' },
        { name: 'Health Workshops', provider: 'Expert-led sessions', typical: 'Free - AED 200' },
      ],
    },
    {
      icon: Leaf,
      title: 'Alternative Therapies',
      description: 'Acupuncture, massage, and holistic treatments',
      color: 'text-teal-500 bg-teal-500/10',
      listings: [
        { name: 'Massage Therapy', provider: 'Licensed therapists', typical: 'AED 200-500/session' },
        { name: 'Acupuncture', provider: 'Certified practitioners', typical: 'AED 300-600/session' },
        { name: 'Spa Treatments', provider: 'Wellness centers', typical: 'AED 300-800' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-display font-semibold">Program categories</h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, i) => {
          const IconComp = category.icon;
          
          return (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Category Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg shrink-0", category.color)}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm">{category.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Listings */}
                <div className="space-y-2">
                  {category.listings.map((listing, j) => (
                    <div 
                      key={j} 
                      className="p-2 rounded-md bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium">{listing.name}</p>
                          {listing.provider && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {listing.provider}
                            </p>
                          )}
                        </div>
                        {listing.typical && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {listing.typical}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
