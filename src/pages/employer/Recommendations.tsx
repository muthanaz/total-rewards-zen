import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { PrimaryInsight } from '@/components/ui/primary-insight';
import { ConfidenceGate, ConfidenceBadge } from '@/components/employer/ConfidenceGate';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateAction } from '@/hooks/useEmployerActions';
import { cn } from '@/lib/utils';
import { Lightbulb, TrendingUp, Users, DollarSign, MessageSquare, Target, ArrowRight, CheckCircle, Plus, Database, Sparkles, User, Calendar, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'utilization' | 'cost' | 'engagement' | 'policy';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  affectedEmployees?: number;
  action: string;
  rationale: string;
  link?: string;
  triggerData: string;
  confidence: 'high' | 'medium' | 'low';
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Launch L&D Awareness Campaign',
    description: 'Learning & Development has only 50% utilization. Many employees are unaware of available courses and budget.',
    category: 'utilization',
    impact: 'high',
    effort: 'low',
    potentialSavings: 75000,
    affectedEmployees: 45,
    action: 'Create internal newsletter featuring top courses and success stories',
    rationale: 'Low-effort campaign can increase utilization by 20-30% based on industry benchmarks.',
    triggerData: 'L&D utilization: 50% vs target 70% (6-month trend: declining)',
    confidence: 'high',
    link: '/employer/zombie',
  },
  {
    id: '2',
    title: 'Simplify Wellbeing Redemption Process',
    description: 'Wellbeing program has complex redemption causing 47% of budget to remain unused.',
    category: 'policy',
    impact: 'high',
    effort: 'medium',
    potentialSavings: 35000,
    affectedEmployees: 60,
    action: 'Implement one-click app-based wellness rewards system',
    rationale: 'Current 5-step process has 60% drop-off. Simplification expected to recover 60% of zombie spend.',
    triggerData: 'Wellbeing utilization: 53% | Redemption drop-off: 60%',
    confidence: 'high',
    link: '/employer/policies',
  },
  {
    id: '3',
    title: 'Targeted Comms for Parents',
    description: 'Parents segment has highest utilization (89%). Share best practices with other segments.',
    category: 'engagement',
    impact: 'medium',
    effort: 'low',
    affectedEmployees: 42,
    action: 'Create "Benefits Champion" program with parent employees as advocates',
    rationale: 'Peer-to-peer learning more effective than corporate communications.',
    triggerData: 'Parents utilization: 89% vs avg 64% | Non-parents: 52%',
    confidence: 'medium',
    link: '/employer/segments',
  },
  {
    id: '4',
    title: 'Convert Unused Flight Tickets to Vouchers',
    description: '30% of annual flight ticket allowance unused by single employees without dependents.',
    category: 'cost',
    impact: 'medium',
    effort: 'medium',
    potentialSavings: 60000,
    affectedEmployees: 15,
    action: 'Allow conversion to travel/experience vouchers at 80% value',
    rationale: 'Increases perceived value while reducing zombie spend. Net positive for employer and employee.',
    triggerData: 'Single employees flight utilization: 70% | AED 60K unused annually',
    confidence: 'medium',
    link: '/employer/zombie',
  },
  {
    id: '5',
    title: 'Expand Gym Network Partnership',
    description: 'Current gym partners have limited locations causing 40% non-utilization.',
    category: 'utilization',
    impact: 'medium',
    effort: 'high',
    potentialSavings: 32000,
    affectedEmployees: 32,
    action: 'Negotiate with 3 additional gym chains or add home fitness alternatives',
    rationale: 'Location proximity is #1 factor in gym membership usage.',
    triggerData: 'Gym utilization: 60% | Employee survey: 45% cite distance as barrier',
    confidence: 'medium',
    link: '/employer/marketplace',
  },
  {
    id: '6',
    title: 'Update Health Insurance Policy Documentation',
    description: 'Health policy has 72% clarity score with 8 employee questions monthly.',
    category: 'policy',
    impact: 'medium',
    effort: 'low',
    affectedEmployees: 130,
    action: 'Add FAQ section, flowcharts for pre-approval, and video explainers',
    rationale: 'Reduce HR ticket volume by 50% and improve employee satisfaction.',
    triggerData: 'Policy clarity score: 72% | Monthly questions: 8 avg',
    confidence: 'high',
    link: '/employer/policies',
  },
  {
    id: '7',
    title: 'Renegotiate Underused Add-on Benefits',
    description: 'Paid add-ons like executive health screening have <30% uptake.',
    category: 'cost',
    impact: 'high',
    effort: 'high',
    potentialSavings: 45000,
    action: 'Renegotiate contracts or convert to opt-in with company matching',
    rationale: 'Current blanket coverage is inefficient. Opt-in model aligns cost with actual demand.',
    triggerData: 'Add-on utilization: 28% | AED 45K annual spend on unused coverage',
    confidence: 'high',
    link: '/employer/spend',
  },
];

export default function RecommendationsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const { toast } = useToast();
  const createAction = useCreateAction();

  const totalPotentialSavings = recommendations
    .filter(r => r.potentialSavings)
    .reduce((sum, r) => sum + (r.potentialSavings || 0), 0);

  const quickWins = recommendations.filter(r => r.impact === 'high' && r.effort === 'low');
  const highImpact = recommendations.filter(r => r.impact === 'high');

  const handleCreateAction = async (rec: Recommendation) => {
    try {
      await createAction.mutateAsync({
        title: rec.title,
        description: rec.action,
        priority: rec.impact === 'high' ? 'high' : rec.impact === 'medium' ? 'medium' : 'low',
        source_insight: rec.triggerData,
        expected_impact: rec.potentialSavings ? { savings: rec.potentialSavings } : {},
        metric_keys: [rec.category],
      });
      toast({
        title: isArabic ? 'تم إنشاء الإجراء' : 'Action Created',
        description: isArabic ? 'تم إضافة الإجراء إلى خطة العمل' : 'Action added to your action plan',
      });
    } catch (e) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في إنشاء الإجراء' : 'Failed to create action',
        variant: 'destructive',
      });
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{isArabic ? 'تأثير مرتفع' : 'High Impact'}</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{isArabic ? 'تأثير متوسط' : 'Medium Impact'}</Badge>;
      case 'low':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{isArabic ? 'تأثير منخفض' : 'Low Impact'}</Badge>;
      default:
        return null;
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low':
        return <Badge variant="outline" className="border-green-500/50 text-green-600">{isArabic ? 'سريع' : 'Quick Win'}</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600">{isArabic ? 'جهد معتدل' : 'Some Effort'}</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500/50 text-red-500">{isArabic ? 'مشروع كبير' : 'Major Project'}</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'utilization':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'cost':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'engagement':
        return <Users className="h-5 w-5 text-accent" />;
      case 'policy':
        return <MessageSquare className="h-5 w-5 text-chart-2" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={isArabic ? 'التوصيات الذكية' : 'Smart Recommendations'}
        titleAr="التوصيات الذكية"
        subtitle={isArabic ? 'اقتراحات مبنية على البيانات لتحسين برنامج المزايا' : 'Data-driven suggestions to optimize your benefits program'}
        subtitleAr="اقتراحات مبنية على البيانات لتحسين برنامج المزايا"
        icon={Lightbulb}
        primaryAction={{
          label: 'View Action Plan',
          labelAr: 'عرض خطة العمل',
          onClick: () => navigate('/employer/actions'),
        }}
      />

      {/* Status Strip */}
      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource="AI Analytics"
        dataSourceAr="تحليلات الذكاء الاصطناعي"
      />

      {/* Primary Insight */}
      <PrimaryInsight
        title={isArabic ? 'إجمالي الوفورات المحتملة' : 'Total Potential Savings'}
        titleAr="إجمالي الوفورات المحتملة"
        value={`AED ${(totalPotentialSavings / 1000).toFixed(0)}K`}
        subtitle={`${recommendations.length} ${isArabic ? 'توصيات فعالة' : 'active recommendations'}`}
        subtitleAr={`${recommendations.length} توصيات فعالة`}
        icon={Wallet}
        iconColor="text-emerald-500"
        variant="success"
        confidence="high"
        source={isArabic ? 'محرك الذكاء الاصطناعي' : 'AI Analytics Engine'}
        sourceAr="محرك الذكاء الاصطناعي"
        formula="Sum of estimated savings if all recommendations implemented"
        formulaAr="مجموع الوفورات المقدرة إذا تم تنفيذ جميع التوصيات"
        action={{
          label: isArabic ? 'بدء التنفيذ' : 'Start Implementing',
          labelAr: 'بدء التنفيذ',
          onClick: () => navigate('/employer/actions'),
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Target className="h-8 w-8 text-primary shrink-0" />
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-2xl font-bold">{recommendations.length}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'توصيات نشطة' : 'Active Recommendations'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated border-green-500/20">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-2xl font-bold text-green-600">{quickWins.length}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'انتصارات سريعة' : 'Quick Wins'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated border-amber-500/20">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <TrendingUp className="h-8 w-8 text-amber-500 shrink-0" />
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-2xl font-bold text-amber-600">{highImpact.length}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'تأثير مرتفع' : 'High Impact'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated border-blue-500/20">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Users className="h-8 w-8 text-blue-500 shrink-0" />
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-2xl font-bold text-blue-600">
                  {recommendations.reduce((sum, r) => sum + (r.affectedEmployees || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'موظفون متأثرون' : 'Employees Affected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Matrix */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Priority Matrix</CardTitle>
              <CardDescription>Recommendations sorted by impact vs effort</CardDescription>
            </div>
            <InfoTooltip formula="Recommendations categorized by impact (potential value) and effort (implementation complexity)." dataSource="AI Analytics" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Quick Wins (High Impact, Low Effort)
              </h3>
              <div className="space-y-2">
                {recommendations.filter(r => r.impact === 'high' && r.effort === 'low').map(r => (
                  <Link key={r.id} to={r.link || '#'}>
                    <div className="text-sm p-2 bg-background rounded hover:bg-muted/50 transition-colors cursor-pointer">
                      {r.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <h3 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Major Projects (High Impact, High Effort)
              </h3>
              <div className="space-y-2">
                {recommendations.filter(r => r.impact === 'high' && r.effort === 'high').map(r => (
                  <Link key={r.id} to={r.link || '#'}>
                    <div className="text-sm p-2 bg-background rounded hover:bg-muted/50 transition-colors cursor-pointer">
                      {r.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">All Recommendations</CardTitle>
              <CardDescription>Actionable insights based on your benefits data</CardDescription>
            </div>
            <InfoTooltip formula="AI-generated recommendations based on utilization patterns, employee feedback, and industry benchmarks." dataSource="AI Analytics Engine" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-muted/50">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        {getImpactBadge(rec.impact)}
                        {getEffortBadge(rec.effort)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      
                      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3", isRTL && "text-right")}>
                        {rec.potentialSavings && (
                          <div>
                            <p className="text-muted-foreground text-xs">{isArabic ? 'الوفورات المحتملة' : 'Potential Savings'}</p>
                            <p className="font-medium text-green-600">AED {rec.potentialSavings.toLocaleString()}</p>
                          </div>
                        )}
                        {rec.affectedEmployees && (
                          <div>
                            <p className="text-muted-foreground text-xs">{isArabic ? 'الموظفون المتأثرون' : 'Affected Employees'}</p>
                            <p className="font-medium">{rec.affectedEmployees}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground text-xs">{isArabic ? 'الفئة' : 'Category'}</p>
                          <p className="font-medium capitalize">{rec.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">{isArabic ? 'الثقة' : 'Confidence'}</p>
                          <ConfidenceBadge confidence={rec.confidence} />
                        </div>
                      </div>

                      {/* Trigger Data - Evidence */}
                      <div className="p-2 rounded-lg bg-muted/30 border border-border/50 mb-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          <span className="font-medium">{isArabic ? 'مصدر البيانات:' : 'Evidence:'}</span>
                          {rec.triggerData}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                        <p className="text-sm">
                          <span className="font-medium text-accent">{isArabic ? 'الإجراء الموصى به:' : 'Recommended Action:'} </span>
                          {rec.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">{isArabic ? 'المبررات:' : 'Rationale:'} </span>
                          {rec.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={cn("flex flex-col gap-2 shrink-0", isRTL && "items-start")}>
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateAction(rec)}
                      disabled={createAction.isPending}
                      className="gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isArabic ? 'إنشاء إجراء' : 'Create Action'}
                    </Button>
                    {rec.link && (
                      <Link to={rec.link}>
                        <Button variant="outline" size="sm" className="w-full gap-1.5">
                          {isArabic ? 'عرض التفاصيل' : 'View Details'}
                          <ArrowRight className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
