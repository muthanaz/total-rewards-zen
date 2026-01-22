import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, TrendingUp, Users, DollarSign, Heart, GraduationCap,
  Baby, Plane, Car, Briefcase, Shield, ArrowRight, CheckCircle,
  Calculator, Sparkles, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatCurrencyAED } from '@/lib/utils';

interface BenefitSuggestion {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  annualCostPerEmployee: number;
  expectedRetentionImpact: number; // percentage points
  satisfactionImpact: number; // percentage points
  avgRecruitmentCost: number; // cost to replace one employee
  estimatedROI: number; // x multiplier
  marketAdoption: number; // % of companies in market offering this
  employeeInterest: number; // % based on surveys
  description: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

const benefitSuggestions: BenefitSuggestion[] = [
  {
    id: '1',
    name: 'Parental Leave Enhancement',
    icon: Baby,
    category: 'Family',
    annualCostPerEmployee: 8500,
    expectedRetentionImpact: 4.2,
    satisfactionImpact: 8.5,
    avgRecruitmentCost: 45000,
    estimatedROI: 3.2,
    marketAdoption: 42,
    employeeInterest: 78,
    description: 'Extend paid parental leave to 16 weeks for primary caregivers. Market leaders are adopting this to attract top talent.',
    implementationEffort: 'medium',
  },
  {
    id: '2',
    name: 'Mental Health Support',
    icon: Heart,
    category: 'Wellbeing',
    annualCostPerEmployee: 2400,
    expectedRetentionImpact: 3.1,
    satisfactionImpact: 12.0,
    avgRecruitmentCost: 45000,
    estimatedROI: 5.8,
    marketAdoption: 68,
    employeeInterest: 85,
    description: 'Comprehensive mental health coverage including therapy sessions, EAP, and wellness apps.',
    implementationEffort: 'low',
  },
  {
    id: '3',
    name: 'Flexible Work Stipend',
    icon: Briefcase,
    category: 'Work-Life',
    annualCostPerEmployee: 6000,
    expectedRetentionImpact: 2.8,
    satisfactionImpact: 9.2,
    avgRecruitmentCost: 45000,
    estimatedROI: 2.1,
    marketAdoption: 55,
    employeeInterest: 92,
    description: 'Monthly stipend for home office equipment, co-working spaces, or commuting costs.',
    implementationEffort: 'low',
  },
  {
    id: '4',
    name: 'Upskilling & Certification',
    icon: GraduationCap,
    category: 'Growth',
    annualCostPerEmployee: 12000,
    expectedRetentionImpact: 5.5,
    satisfactionImpact: 7.8,
    avgRecruitmentCost: 45000,
    estimatedROI: 2.8,
    marketAdoption: 61,
    employeeInterest: 74,
    description: 'Enhanced L&D budget for professional certifications, courses, and conference attendance.',
    implementationEffort: 'medium',
  },
  {
    id: '5',
    name: 'Emergency Financial Aid',
    icon: Shield,
    category: 'Financial',
    annualCostPerEmployee: 1500,
    expectedRetentionImpact: 1.8,
    satisfactionImpact: 6.5,
    avgRecruitmentCost: 45000,
    estimatedROI: 5.4,
    marketAdoption: 28,
    employeeInterest: 65,
    description: 'Interest-free emergency loans and financial hardship assistance program.',
    implementationEffort: 'high',
  },
];

interface EmployerBenefitRecommendationsProps {
  employeeCount?: number;
  className?: string;
}

export function EmployerBenefitRecommendations({ 
  employeeCount = 156,
  className 
}: EmployerBenefitRecommendationsProps) {
  
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  
  const calculateSavings = (suggestion: BenefitSuggestion) => {
    // Expected employees retained due to benefit
    const retainedEmployees = Math.round(employeeCount * (suggestion.expectedRetentionImpact / 100));
    // Recruitment cost avoided
    const recruitmentSaved = retainedEmployees * suggestion.avgRecruitmentCost;
    // Annual cost of benefit
    const annualCost = employeeCount * suggestion.annualCostPerEmployee;
    // Net savings
    return recruitmentSaved - annualCost;
  };

  const getEffortBadge = (effort: 'low' | 'medium' | 'high') => {
    switch (effort) {
      case 'low':
        return <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 text-[10px]">Quick to Implement</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600 text-[10px]">Moderate Effort</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500/50 text-red-500 text-[10px]">Complex Setup</Badge>;
    }
  };

  // Sort by ROI
  const sortedSuggestions = [...benefitSuggestions].sort((a, b) => b.estimatedROI - a.estimatedROI);
  const topRecommendation = sortedSuggestions[0];

  const totalPotentialSavings = sortedSuggestions
    .slice(0, 3)
    .reduce((sum, s) => sum + Math.max(0, calculateSavings(s)), 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Card */}
      <Card className="border-accent/20 overflow-hidden bg-gradient-to-br from-card via-card to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg font-display">Benefits to Consider</CardTitle>
                <CardDescription>Data-driven suggestions to boost retention & satisfaction</CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
              {formatCurrency(totalPotentialSavings)} potential savings
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Top Recommendation Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-emerald-500/10 overflow-hidden">
          <CardContent className="pt-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 shrink-0">
                <topRecommendation.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-0 text-[10px]">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Top Recommendation
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{topRecommendation.category}</Badge>
                </div>
                <h3 className="font-semibold text-lg">{topRecommendation.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{topRecommendation.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Annual Cost</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(topRecommendation.annualCostPerEmployee * employeeCount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatCurrency(topRecommendation.annualCostPerEmployee)}/employee
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Retention Impact</p>
                    <p className="text-lg font-bold text-emerald-600">
                      +{topRecommendation.expectedRetentionImpact}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ~{Math.round(employeeCount * (topRecommendation.expectedRetentionImpact / 100))} employees retained
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Recruitment Saved</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(Math.round(employeeCount * (topRecommendation.expectedRetentionImpact / 100)) * topRecommendation.avgRecruitmentCost)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      vs {formatCurrency(topRecommendation.avgRecruitmentCost)}/hire
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-muted-foreground">Estimated ROI</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {topRecommendation.estimatedROI}x
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">Net positive impact</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Employee Interest</span>
                      <span className="font-medium">{topRecommendation.employeeInterest}%</span>
                    </div>
                    <Progress value={topRecommendation.employeeInterest} className="h-1.5 [&>div]:bg-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Market Adoption</span>
                      <span className="font-medium">{topRecommendation.marketAdoption}%</span>
                    </div>
                    <Progress value={topRecommendation.marketAdoption} className="h-1.5" />
                  </div>
                </div>

                <Button className="mt-4" size="sm">
                  Explore Implementation
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Other Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSuggestions.slice(1).map((suggestion, index) => {
          const netSavings = calculateSavings(suggestion);
          const isPositiveROI = netSavings > 0;
          
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50 hover:border-accent/30">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                      <suggestion.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{suggestion.category}</Badge>
                        {getEffortBadge(suggestion.implementationEffort)}
                      </div>
                      <h4 className="font-semibold text-sm group-hover:text-accent transition-colors">
                        {suggestion.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Cost/Year</p>
                          <p className="text-xs font-semibold">
                            {formatCurrency(suggestion.annualCostPerEmployee * employeeCount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Retention</p>
                          <p className="text-xs font-semibold text-emerald-600">
                            +{suggestion.expectedRetentionImpact}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">ROI</p>
                          <p className={cn(
                            "text-xs font-semibold",
                            isPositiveROI ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {suggestion.estimatedROI}x
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Employee Interest</span>
                          <span>{suggestion.employeeInterest}%</span>
                        </div>
                        <Progress value={suggestion.employeeInterest} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ROI Calculator Summary */}
      <Card className="border-info/20 bg-gradient-to-r from-info/5 to-card">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-info/10">
              <Calculator className="w-5 h-5 text-info" />
            </div>
            <div>
              <h4 className="font-semibold">Cost vs Value Analysis</h4>
              <p className="text-xs text-muted-foreground">Based on {employeeCount} employees, AED 45,000 avg recruitment cost</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Investment</p>
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(sortedSuggestions.slice(0, 3).reduce((sum, s) => sum + s.annualCostPerEmployee * employeeCount, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">For top 3 benefits/year</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Employees Retained</p>
              </div>
              <p className="text-xl font-bold text-success">
                ~{sortedSuggestions.slice(0, 3).reduce((sum, s) => sum + Math.round(employeeCount * (s.expectedRetentionImpact / 100)), 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Additional retention/year</p>
            </div>
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <p className="text-sm text-success font-medium">Net Savings</p>
              </div>
              <p className="text-xl font-bold text-success">
                {formatCurrency(totalPotentialSavings)}
              </p>
              <p className="text-xs text-success mt-1">Recruitment cost avoided</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
