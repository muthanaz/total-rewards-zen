import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, Search, ChevronRight, Filter, CheckCircle2, TrendingUp, Award
} from 'lucide-react';
import { BENEFIT_CATEGORIES } from '@/lib/benefitCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const benefits = [
  { name: 'Housing Allowance', nameKey: 'benefit.housing', icon: Home, value: 120000, utilized: 120000, category: 'housing', route: '/employee/housing', description: 'Monthly housing allowance paid with salary', bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'] },
  { name: 'Education Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, category: 'education', route: '/employee/schooling', description: 'Education support for dependents', bullets: ['Per child up to 18 years', 'Covers tuition fees only'] },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, category: 'health', route: '/employee/health', description: 'Comprehensive health coverage', bullets: ['Includes dental and optical', 'Covers spouse and children'] },
  { name: 'Transport & Mobility', nameKey: 'benefit.transport', icon: Car, value: 39000, utilized: 33000, category: 'transport', route: '/employee/transport', description: 'Monthly transport and flight tickets', bullets: ['Paid monthly with salary', 'Includes annual flight tickets'] },
  { name: 'Annual Bonus', nameKey: 'benefit.bonus', icon: Award, value: 70000, utilized: 0, category: 'rewards', route: '/employee/bonus', description: 'Performance-based annual bonus', bullets: ['Performance-based (0-200%)', 'Target: 2 months salary'] },
  { name: 'Financial Planning', nameKey: 'benefit.financial', icon: PiggyBank, value: 36000, utilized: 18000, category: 'financial', route: '/employee/financial', description: 'Retirement savings with employer match', bullets: ['5% employer match', 'Multiple fund options'] },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeing', icon: Dumbbell, value: 6000, utilized: 3200, category: 'wellbeing', route: '/employee/wellbeing', description: 'Health and wellness benefits', bullets: ['Gym membership covered', 'Wellness app subscription'] },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, category: 'learning', route: '/employee/learning', description: 'Professional development budget', bullets: ['Courses and certifications', 'Pre-approval required'] },
];

const categoryFilters = [
  { value: 'all', label: 'All Categories' },
  ...Object.entries(BENEFIT_CATEGORIES).map(([key, cat]) => ({ value: key, label: cat.label })),
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [utilizationFilter, setUtilizationFilter] = useState('all');

  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  const benefitHighlights = useMemo(() => {
    const fullyUtilized = benefits.filter(b => (b.utilized / b.value) >= 1);
    const roomToUse = benefits.filter(b => (b.utilized / b.value) < 1 && (b.value - b.utilized) > 1000);
    const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    return { fullyUtilized, roomToUse, fullyUtilizedCount: fullyUtilized.length, roomToUseCount: roomToUse.length, totalRemaining: totalValue - totalUtilized };
  }, []);

  const filteredBenefits = benefits.filter(benefit => {
    const matchesSearch = benefit.name.toLowerCase().includes(search.toLowerCase()) || benefit.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || benefit.category === categoryFilter;
    const utilization = benefit.utilized / benefit.value;
    let matchesUtilization = true;
    if (utilizationFilter === 'fully-utilized') matchesUtilization = utilization >= 1;
    else if (utilizationFilter === 'partial') matchesUtilization = utilization > 0 && utilization < 1;
    else if (utilizationFilter === 'unused') matchesUtilization = utilization === 0;
    return matchesSearch && matchesCategory && matchesUtilization;
  });

  const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
  const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
  const overallUtilization = Math.round((totalUtilized / totalValue) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold">All Benefits</h1>
        <p className="text-muted-foreground">{benefits.length} benefits • {formatCurrency(totalValue)} total value • {overallUtilization}% utilized</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="cursor-pointer bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40" onClick={() => setUtilizationFilter('fully-utilized')}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">Fully Utilized</h3>
              <p className="text-xs text-muted-foreground">{benefitHighlights.fullyUtilizedCount} benefits at 100%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 hover:border-amber-500/40" onClick={() => setUtilizationFilter('partial')}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-400">Room to Use</h3>
              <p className="text-xs text-muted-foreground">{formatCurrency(benefitHighlights.totalRemaining)} available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search benefits..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{categoryFilters.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={utilizationFilter} onValueChange={setUtilizationFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{utilizationFilters.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filteredBenefits.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No benefits match your filters</p>
          <Button variant="link" onClick={() => { setSearch(''); setCategoryFilter('all'); setUtilizationFilter('all'); }}>Clear filters</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBenefits.map((benefit, index) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            const isFullyUsed = utilization >= 100;
            const cat = BENEFIT_CATEGORIES[benefit.category as keyof typeof BENEFIT_CATEGORIES];
            
            return (
              <Card key={benefit.name} className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden" onClick={() => navigate(benefit.route)} style={{ animationDelay: `${index * 50}ms` }}>
                <div className={cn("h-1", cat?.bgClass)} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2.5 rounded-xl shrink-0", cat?.bgLightClass)}>
                      <benefit.icon className={cn("w-5 h-5", cat?.textClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base group-hover:text-accent transition-colors">{benefit.name}</h3>
                      <Badge variant="secondary" className={cn("mt-1.5 text-xs", cat?.bgLightClass, cat?.textClass)}>{cat?.label}</Badge>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{benefit.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Utilized</span><span className="font-semibold">{formatCurrency(benefit.utilized)}</span></div>
                    <Progress value={utilization} className={cn("h-2", isFullyUsed ? '[&>div]:bg-emerald-500' : '')} />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{isFullyUsed ? 'Fully utilized' : `Remaining: ${formatCurrency(remaining)}`}</span>
                      <span className={cn("font-medium", isFullyUsed ? 'text-emerald-600' : cat?.textClass)}>{utilization}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}