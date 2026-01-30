/**
 * LearningCategoriesListings
 * 
 * Displays learning & development categories with course platforms and certifications.
 * Grid layout with category cards showing platforms, typical costs, and examples.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Award, 
  Users,
  Monitor,
  GraduationCap,
  Languages,
  ExternalLink,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningCategory {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  approvalThreshold: string;
  listings: {
    name: string;
    provider?: string;
    typical?: string;
  }[];
}

export function LearningCategoriesListings() {
  const categories: LearningCategory[] = [
    {
      icon: Monitor,
      title: 'Online Courses',
      description: 'Self-paced courses from top e-learning platforms',
      color: 'text-blue-500 bg-blue-500/10',
      approvalThreshold: 'Auto-approved under AED 2,000',
      listings: [
        { name: 'Coursera', provider: 'University courses', typical: 'AED 200-1,500' },
        { name: 'LinkedIn Learning', provider: 'Business & tech skills', typical: 'AED 500-1,200/yr' },
        { name: 'Udemy', provider: 'Practical skills courses', typical: 'AED 50-400' },
        { name: 'Pluralsight', provider: 'Tech & creative', typical: 'AED 1,000-1,800/yr' },
      ],
    },
    {
      icon: Award,
      title: 'Professional Certifications',
      description: 'Industry-recognized credentials and certifications',
      color: 'text-amber-500 bg-amber-500/10',
      approvalThreshold: 'Pre-approval required',
      listings: [
        { name: 'PMP', provider: 'Project Management Institute', typical: 'AED 2,500-4,000' },
        { name: 'AWS Certifications', provider: 'Amazon Web Services', typical: 'AED 500-1,500' },
        { name: 'CFA', provider: 'CFA Institute', typical: 'AED 4,000-8,000' },
        { name: 'SHRM', provider: 'HR Certification', typical: 'AED 2,000-3,500' },
      ],
    },
    {
      icon: Users,
      title: 'Conferences & Events',
      description: 'Industry conferences, workshops, and networking events',
      color: 'text-green-500 bg-green-500/10',
      approvalThreshold: 'Pre-approval required',
      listings: [
        { name: 'Industry Conferences', provider: 'Various organizers', typical: 'AED 2,000-8,000' },
        { name: 'Workshops', provider: 'Expert-led sessions', typical: 'AED 500-2,500' },
        { name: 'Bootcamps', provider: 'Intensive programs', typical: 'AED 3,000-12,000' },
        { name: 'Seminars', provider: 'Half-day events', typical: 'AED 200-1,000' },
      ],
    },
    {
      icon: Languages,
      title: 'Language Learning',
      description: 'Foreign language courses and proficiency certifications',
      color: 'text-purple-500 bg-purple-500/10',
      approvalThreshold: 'Auto-approved under AED 2,000',
      listings: [
        { name: 'Arabic Courses', provider: 'Local institutes', typical: 'AED 1,500-4,000' },
        { name: 'Business English', provider: 'British Council', typical: 'AED 2,000-5,000' },
        { name: 'Language Apps', provider: 'Babbel, Rosetta Stone', typical: 'AED 400-800/yr' },
        { name: 'IELTS/TOEFL Prep', provider: 'Test preparation', typical: 'AED 1,500-3,000' },
      ],
    },
    {
      icon: GraduationCap,
      title: 'Academic Programs',
      description: 'Degree programs, diplomas, and executive education',
      color: 'text-red-500 bg-red-500/10',
      approvalThreshold: 'Special approval required',
      listings: [
        { name: 'MBA Programs', provider: 'Business schools', typical: 'AED 50,000-150,000' },
        { name: 'Executive Diplomas', provider: 'Universities', typical: 'AED 15,000-40,000' },
        { name: 'Master\'s Degrees', provider: 'Online & hybrid', typical: 'AED 30,000-80,000' },
        { name: 'Micro-credentials', provider: 'University certificates', typical: 'AED 3,000-8,000' },
      ],
    },
    {
      icon: BookOpen,
      title: 'Books & Resources',
      description: 'Professional books, subscriptions, and learning materials',
      color: 'text-teal-500 bg-teal-500/10',
      approvalThreshold: 'Auto-approved',
      listings: [
        { name: 'Technical Books', provider: 'O\'Reilly, Safari', typical: 'AED 100-500' },
        { name: 'Subscriptions', provider: 'HBR, Medium Premium', typical: 'AED 200-800/yr' },
        { name: 'Audiobooks', provider: 'Audible, Blinkist', typical: 'AED 300-600/yr' },
        { name: 'Research Access', provider: 'Journals & papers', typical: 'AED 500-1,500/yr' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-display font-semibold">Learning categories</h3>
      
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm">{category.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {category.description}
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-1.5">
                      {category.approvalThreshold}
                    </Badge>
                  </div>
                </div>

                {/* Listings */}
                <div className="space-y-1.5">
                  {category.listings.map((listing, j) => (
                    <div 
                      key={j} 
                      className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{listing.name}</p>
                        {listing.provider && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {listing.provider}
                          </p>
                        )}
                      </div>
                      {listing.typical && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {listing.typical}
                        </span>
                      )}
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
