import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, Search, ChevronRight, Filter, Gift, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS, BENEFIT_TYPE_LABELS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const benefits = [
  { name: 'Housing Allowance', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', area: 'home_living', route: '/employee/housing', description: 'Monthly housing allowance paid with salary', bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'] },
  { name: 'Education Allowance', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', area: 'family_parenting', route: '/employee/schooling', description: 'Education support for dependents', bullets: ['Per child up to 18 years', 'Covers tuition fees only'] },
  { name: 'Health Insurance', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', area: 'health', route: '/employee/health', description: 'Comprehensive health coverage', bullets: ['Includes dental and optical', 'Covers spouse and children'] },
  { name: 'Transport & Mobility', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', area: 'mobility', route: '/employee/transport', description: 'Monthly transport and flight tickets', bullets: ['Paid monthly with salary', 'Includes annual flight tickets'] },
  { name: 'Annual Bonus', icon: Gift, value: 70000, utilized: 0, type: 'cash_allowances', area: 'money', route: '/employee/bonus', description: 'Performance-based annual bonus', bullets: ['Performance-based (0-200%)', 'Target: 2 months salary'] },
  { name: 'Financial Planning', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', area: 'money', route: '/employee/financial', description: 'Retirement savings with employer match', bullets: ['5% employer match', 'Multiple fund options'] },
  { name: 'Wellbeing Program', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', area: 'health', route: '/employee/wellbeing', description: 'Health and wellness benefits', bullets: ['Gym membership covered', 'Wellness app subscription'] },
  { name: 'Learning & Development', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', area: 'career', route: '/employee/learning', description: 'Professional development budget', bullets: ['Courses and certifications', 'Pre-approval required'] },
];

const benefitTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'cash_allowances', label: 'Cash & Allowances' },
  { value: 'health_protection', label: 'Health & Protection' },
  { value: 'wealth_ownership', label: 'Wealth & Ownership' },
  { value: 'growth_career', label: 'Growth & Career' },
  { value: 'wellbeing', label: 'Wellbeing' },
];

const utilizationFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'fully-utilized', label: 'Fully Utilized' },
  { value: 'partial', label: 'Partially Used' },
  { value: 'unused', label: 'Not Used' },
];

export default function BenefitsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [utilizationFilter, setUtilizationFilter] = useState('all');

  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  // Calculate benefit highlights (merged from dashboard)
  const benefitHighlights = useMemo(() => {
    const fullyUtilized = benefits.filter(b => (b.utilized / b.value) >= 1);
    const roomToUse = benefits.filter(b => (b.utilized / b.value) < 1 && (b.value - b.utilized) > 1000);
    const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    
    return {
      fullyUtilized,
      roomToUse,
      fullyUtilizedCount: fullyUtilized.length,
      roomToUseCount: roomToUse.length,
      totalRemaining: totalValue - totalUtilized,
    };
  }, []);

  const filteredBenefits = benefits.filter(benefit => {
    const matchesSearch = benefit.name.toLowerCase().includes(search.toLowerCase()) ||
                         benefit.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || benefit.type === typeFilter;
    
    const utilization = benefit.utilized / benefit.value;
    let matchesUtilization = true;
    if (utilizationFilter === 'fully-utilized') {
      matchesUtilization = utilization >= 1;
    } else if (utilizationFilter === 'partial') {
      matchesUtilization = utilization > 0 && utilization < 1;
    } else if (utilizationFilter === 'unused') {
      matchesUtilization = utilization === 0;
    }

    return matchesSearch && matchesType && matchesUtilization;
  });

  const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
  const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
  const overallUtilization = Math.round((totalUtilized / totalValue) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">All Benefits</h1>
          <p className="text-muted-foreground">
            {benefits.length} benefits • {formatCurrency(totalValue)} total value • {overallUtilization}% utilized
          </p>
        </div>
      </div>

      {/* Benefit Highlights - Merged from Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Fully Utilized Card */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-300 overflow-hidden group",
            "bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-md"
          )}
          onClick={() => setUtilizationFilter('fully-utilized')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">Fully Utilized</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                    {benefitHighlights.fullyUtilizedCount} benefits
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Great job! These benefits are at 100% utilization.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {benefitHighlights.fullyUtilized.slice(0, 3).map((b) => (
                    <Badge key={b.name} variant="secondary" className="text-[10px] py-0 bg-emerald-500/5">
                      {b.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>

        {/* Room to Use Card */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-300 overflow-hidden group",
            "bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 hover:border-amber-500/40 hover:shadow-md"
          )}
          onClick={() => setUtilizationFilter('partial')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-400">Room to Use</h3>
                  <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs">
                    {formatCurrency(benefitHighlights.totalRemaining)} available
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {benefitHighlights.roomToUseCount} benefits with remaining allocation to claim.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {benefitHighlights.roomToUse.slice(0, 3).map((b) => (
                    <Badge key={b.name} variant="secondary" className="text-[10px] py-0 bg-amber-500/5">
                      {b.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search benefits..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {benefitTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={utilizationFilter} onValueChange={setUtilizationFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {utilizationFilters.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Benefits Grid */}
      {filteredBenefits.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No benefits match your filters</p>
          <Button variant="link" onClick={() => { setSearch(''); setTypeFilter('all'); setUtilizationFilter('all'); }}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBenefits.map((benefit, index) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            const isFullyUsed = utilization >= 100;
            
            return (
              <Card 
                key={benefit.name} 
                className="group cursor-pointer hover:border-accent/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(benefit.route)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                      <benefit.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{benefit.name}</h3>
                          <Badge variant="secondary" className={`${BENEFIT_TYPE_COLORS[benefit.type]} mt-1 text-[10px]`}>
                            {BENEFIT_TYPE_LABELS[benefit.type]}
                          </Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{benefit.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Utilized</span>
                      <span className="font-semibold">{formatCurrency(benefit.utilized)}</span>
                    </div>
                    <Progress 
                      value={utilization} 
                      className={`h-2 ${isFullyUsed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-accent'}`}
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {isFullyUsed ? 'Fully utilized' : `Remaining: ${formatCurrency(remaining)}`}
                      </span>
                      <span className={`font-medium ${isFullyUsed ? 'text-emerald-600' : 'text-accent'}`}>
                        {utilization}%
                      </span>
                    </div>
                  </div>

                  <ul className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    {benefit.bullets.map((bullet, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-accent mt-0.5 text-[8px]">●</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
