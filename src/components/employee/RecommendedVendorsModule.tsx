import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Building2, Star, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendedVendor {
  id: string;
  name: string;
  category: string;
  discountPercent?: number;
  rating?: number;
  isSponsored?: boolean;
}

interface RecommendedVendorsModuleProps {
  benefitCategory: string;
  title?: string;
  className?: string;
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
};

// Demo vendors by benefit category
const DEMO_VENDORS: Record<string, RecommendedVendor[]> = {
  'Housing': [
    { id: '1', name: 'Homebox', category: 'Home & Living', discountPercent: 15, rating: 4.5, isSponsored: true },
    { id: '2', name: 'IKEA UAE', category: 'Home & Living', discountPercent: 10, rating: 4.3 },
    { id: '3', name: 'Danube Home', category: 'Home & Living', discountPercent: 20, rating: 4.1 },
  ],
  'Schooling': [
    { id: '4', name: 'Mathnasium', category: 'Learning', discountPercent: 20, rating: 4.7, isSponsored: true },
    { id: '5', name: 'Kumon', category: 'Learning', discountPercent: 15, rating: 4.4 },
    { id: '6', name: 'British Orchard Nursery', category: 'Learning', discountPercent: 10, rating: 4.6 },
  ],
  'Health Insurance': [
    { id: '7', name: 'Mediclinic', category: 'Health', discountPercent: 10, rating: 4.8, isSponsored: true },
    { id: '8', name: 'Aster Pharmacy', category: 'Health', discountPercent: 15, rating: 4.2 },
    { id: '9', name: 'Life Pharmacy', category: 'Health', discountPercent: 20, rating: 4.3 },
  ],
  'Health': [
    { id: '7', name: 'Mediclinic', category: 'Health', discountPercent: 10, rating: 4.8, isSponsored: true },
    { id: '8', name: 'Aster Pharmacy', category: 'Health', discountPercent: 15, rating: 4.2 },
    { id: '9', name: 'Life Pharmacy', category: 'Health', discountPercent: 20, rating: 4.3 },
  ],
  'Transport': [
    { id: '10', name: 'Emirates Fuel', category: 'Transport', discountPercent: 5, rating: 4.5, isSponsored: true },
    { id: '11', name: 'Dynatrade', category: 'Transport', discountPercent: 15, rating: 4.2 },
    { id: '12', name: 'ENOC', category: 'Transport', discountPercent: 3, rating: 4.4 },
  ],
  'Wellbeing': [
    { id: '13', name: 'Fitness First', category: 'Fitness', discountPercent: 25, rating: 4.6, isSponsored: true },
    { id: '14', name: 'GymNation', category: 'Fitness', discountPercent: 30, rating: 4.3 },
    { id: '15', name: 'Calm (App)', category: 'Wellness', discountPercent: 40, rating: 4.8 },
  ],
  'Learning & Development': [
    { id: '16', name: 'Coursera', category: 'Learning', discountPercent: 30, rating: 4.7, isSponsored: true },
    { id: '17', name: 'LinkedIn Learning', category: 'Learning', discountPercent: 25, rating: 4.5 },
    { id: '18', name: 'Udemy', category: 'Learning', discountPercent: 40, rating: 4.4 },
  ],
};

export function RecommendedVendorsModule({ benefitCategory, title, className }: RecommendedVendorsModuleProps) {
  const vendors = DEMO_VENDORS[benefitCategory] || [];
  const marketplaceCategory = BENEFIT_TO_MARKETPLACE_MAP[benefitCategory];

  if (vendors.length === 0) return null;

  return (
    <Card className={cn("border-accent/20 bg-gradient-to-r from-accent/5 to-transparent", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            {title || 'Recommended Partners'}
          </CardTitle>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
            <Link to={`/employee/marketplace?category=${encodeURIComponent(marketplaceCategory || 'All')}`}>
              Browse All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Partner vendors offering exclusive discounts for this benefit
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-3">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              to={`/employee/marketplace?search=${encodeURIComponent(vendor.name)}`}
              className="block"
            >
              <div className="p-3 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-accent transition-colors line-clamp-1">
                        {vendor.name}
                      </p>
                      {vendor.isSponsored && (
                        <Badge className="text-[9px] px-1.5 py-0 h-4 bg-accent/10 text-accent border-0">
                          Sponsored
                        </Badge>
                      )}
                    </div>
                  </div>
                  {vendor.discountPercent && (
                    <Badge className="bg-success/10 text-success border-0 text-xs shrink-0">
                      -{vendor.discountPercent}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {vendor.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {vendor.rating}
                    </span>
                  )}
                  <span className="flex items-center gap-1 group-hover:text-accent transition-colors">
                    View offer
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
