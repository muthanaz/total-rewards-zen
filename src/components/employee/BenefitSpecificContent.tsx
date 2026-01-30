/**
 * Benefit-Specific Content Components
 * 
 * Individual modules for each benefit type's unique content:
 * - Housing: Market link card
 * - Transport: Fuel, Car, Flight cards
 * - Schooling: Per-child breakdown
 * - Health: Network providers
 * - Wellbeing: Program categories
 * - Learning: Course categories
 * - Long-term: EOSB, Bonus, Pension, Equity
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  ArrowRight, 
  Fuel, 
  Car, 
  Plane,
  Users,
  Dumbbell,
  Brain,
  Apple,
  Stethoscope,
  BookOpen,
  Award,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrencyAED } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ============================================================================
// HOUSING - Market Link Card
// ============================================================================

export function HousingMarketCard() {
  return (
    <Card className="border-border/40 hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base">Explore housing market</h3>
              <p className="text-sm text-muted-foreground">
                Browse listings and compare rental prices across Dubai areas
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/employee/housing/market" className="gap-2">
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TRANSPORT - Component Cards
// ============================================================================

interface TransportComponent {
  icon: LucideIcon;
  title: string;
  description: string;
  amount?: number | null;
  frequency?: string;
  status?: 'active' | 'pending' | 'not_applicable';
  note?: string;
}

export interface TransportBenefitCardsProps {
  fuelAllowance?: number | null;
  carAllowance?: number | null;
  flightAllowance?: number | null;
  flightClass?: string;
  dependentTickets?: number;
}

export function TransportBenefitCards({
  fuelAllowance,
  carAllowance,
  flightAllowance,
  flightClass = 'Economy',
  dependentTickets = 0,
}: TransportBenefitCardsProps) {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const components: TransportComponent[] = [
    {
      icon: Fuel,
      title: 'Fuel Allowance',
      description: 'Monthly auto-credited fuel benefit',
      amount: fuelAllowance,
      frequency: 'Monthly',
      status: fuelAllowance ? 'active' : 'not_applicable',
      note: 'Credited automatically on the 25th',
    },
    {
      icon: Car,
      title: 'Car Allowance',
      description: 'Vehicle loan or lease contribution',
      amount: carAllowance,
      frequency: 'Monthly',
      status: carAllowance ? 'active' : 'not_applicable',
      note: 'Submit loan statement for reimbursement',
    },
    {
      icon: Plane,
      title: 'Annual Flight Tickets',
      description: 'Return flights to home country',
      amount: flightAllowance,
      frequency: 'Annual',
      status: flightAllowance ? 'active' : 'pending',
      note: `${flightClass} class • ${dependentTickets > 0 ? `+${dependentTickets} dependents` : 'Employee only'}`,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-display font-semibold">Transport components</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {components.map((comp, i) => {
          const IconComp = comp.icon;
          return (
            <Card key={i} className={cn(
              "transition-all",
              comp.status === 'not_applicable' && "opacity-60"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      comp.status === 'active' ? "bg-success/10" : "bg-muted"
                    )}>
                      <IconComp className={cn(
                        "w-4 h-4",
                        comp.status === 'active' ? "text-success" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-display">{comp.title}</CardTitle>
                    </div>
                  </div>
                  <Badge variant={comp.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {comp.frequency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-xs text-muted-foreground">{comp.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold tabular-nums">
                    {comp.amount != null ? formatCurrency(comp.amount) : '—'}
                  </span>
                  {comp.amount != null && (
                    <span className="text-xs text-muted-foreground">/{comp.frequency?.toLowerCase()}</span>
                  )}
                </div>
                {comp.note && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5 pt-2 border-t">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    {comp.note}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// WELLBEING - Program Categories
// ============================================================================

interface WellbeingCategory {
  icon: LucideIcon;
  title: string;
  description: string;
  examples: string[];
}

export function WellbeingProgramCards() {
  const categories: WellbeingCategory[] = [
    {
      icon: Dumbbell,
      title: 'Fitness & Gym',
      description: 'Gym memberships and fitness classes',
      examples: ['Gym membership', 'Personal training', 'Group fitness'],
    },
    {
      icon: Brain,
      title: 'Mental Health',
      description: 'Counseling and mindfulness programs',
      examples: ['Therapy sessions', 'Meditation apps', 'Stress management'],
    },
    {
      icon: Apple,
      title: 'Nutrition',
      description: 'Diet consultation and healthy eating',
      examples: ['Nutritionist visits', 'Meal planning', 'Health coaching'],
    },
    {
      icon: Stethoscope,
      title: 'Preventive Care',
      description: 'Wellness checkups and screenings',
      examples: ['Annual checkup', 'Vaccinations', 'Health assessments'],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-display font-semibold">Program categories</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((cat, i) => {
          const IconComp = cat.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <IconComp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold">{cat.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cat.examples.map((ex, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          {ex}
                        </Badge>
                      ))}
                    </div>
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

// ============================================================================
// LEARNING - Course Categories
// ============================================================================

export function LearningCategoryCards() {
  const categories = [
    {
      icon: BookOpen,
      title: 'Online Courses',
      platforms: ['Coursera', 'LinkedIn Learning', 'Udemy'],
      typical: 'AED 500 - 2,000',
    },
    {
      icon: Award,
      title: 'Professional Certifications',
      platforms: ['PMP', 'AWS', 'CFA', 'SHRM'],
      typical: 'AED 2,000 - 8,000',
    },
    {
      icon: Users,
      title: 'Conferences & Workshops',
      platforms: ['Industry events', 'Seminars', 'Bootcamps'],
      typical: 'AED 1,000 - 5,000',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-display font-semibold">Learning categories</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {categories.map((cat, i) => {
          const IconComp = cat.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <IconComp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold">{cat.title}</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cat.platforms.map((p, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Typical cost: {cat.typical}
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

// ============================================================================
// HEALTH - Network Providers Card
// ============================================================================

export function HealthNetworkCard() {
  return (
    <Card className="border-border/40 hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <Stethoscope className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base">Find in-network providers</h3>
              <p className="text-sm text-muted-foreground">
                Search hospitals, clinics, and pharmacies in your network
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/employee/health/providers" className="gap-2">
              Find providers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SCHOOLING - Children Overview
// ============================================================================

interface ChildInfo {
  name: string;
  grade?: string;
  school?: string;
  allowanceUsed?: number;
  allowanceTotal?: number;
}

export interface SchoolingChildrenCardsProps {
  children: ChildInfo[];
  perChildAllowance?: number;
}

export function SchoolingChildrenCards({
  children,
  perChildAllowance = 30000,
}: SchoolingChildrenCardsProps) {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  if (children.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <h4 className="font-semibold text-sm">No dependents registered</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Add your children to track their education allowance
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link to="/employee/profile/dependents">Add dependent</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-display font-semibold">Your dependents</h3>
        <Badge variant="secondary">{children.length} registered</Badge>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {children.map((child, i) => {
          const used = child.allowanceUsed ?? 0;
          const total = child.allowanceTotal ?? perChildAllowance;
          const remaining = total - used;
          const percent = Math.round((used / total) * 100);
          
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{child.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {child.grade || 'Grade not set'} • {child.school || 'School not set'}
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-medium tabular-nums">{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(used)} used</span>
                    <span>{formatCurrency(remaining)} remaining</span>
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
