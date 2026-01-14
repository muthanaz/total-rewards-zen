import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Image,
  FileText,
  Tag,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for offer quality
const offers = [
  {
    id: '1',
    title: 'Premium Gym Membership',
    score: 95,
    status: 'approved',
    issues: [],
    tips: ['Consider adding seasonal promotions'],
    conversions: 45,
  },
  {
    id: '2',
    title: 'Spa Treatment Package',
    score: 72,
    status: 'needs_improvement',
    issues: ['Missing terms & conditions', 'Image quality low'],
    tips: ['Add expiry date', 'Include more service details'],
    conversions: 12,
  },
  {
    id: '3',
    title: 'Online Learning Discount',
    score: 58,
    status: 'rejected',
    issues: ['No description', 'Missing category', 'Invalid discount format'],
    tips: ['Add complete course list', 'Specify valid platforms'],
    conversions: 0,
  },
  {
    id: '4',
    title: 'Restaurant 20% Off',
    score: 88,
    status: 'approved',
    issues: ['Terms could be clearer'],
    tips: ['Add peak hour restrictions if any'],
    conversions: 67,
  },
];

const qualityChecks = [
  { name: 'Title & Description', icon: FileText, passed: 3, total: 4 },
  { name: 'Image Quality', icon: Image, passed: 2, total: 4 },
  { name: 'Terms & Conditions', icon: FileCheck, passed: 3, total: 4 },
  { name: 'Category & Tags', icon: Tag, passed: 4, total: 4 },
];

export default function VendorOfferQualityPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const averageScore = Math.round(offers.reduce((sum, o) => sum + o.score, 0) / offers.length);
  const approvedCount = offers.filter(o => o.status === 'approved').length;
  const needsWorkCount = offers.filter(o => o.status === 'needs_improvement').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" />{isArabic ? 'معتمد' : 'Approved'}</Badge>;
      case 'needs_improvement':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><AlertTriangle className="w-3 h-3 mr-1" />{isArabic ? 'يحتاج تحسين' : 'Needs Work'}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />{isArabic ? 'مرفوض' : 'Rejected'}</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isArabic ? 'جودة العروض' : 'Offer Quality'}
        subtitle={isArabic ? 'راجع جودة عروضك واحصل على نصائح للتحسين' : 'Review offer compliance and get improvement tips'}
        icon={FileCheck}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className={cn("text-2xl font-bold", getScoreColor(averageScore))}>{averageScore}%</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'متوسط الجودة' : 'Avg Quality Score'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-emerald-500/20">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'عروض معتمدة' : 'Approved Offers'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-amber-500/20">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold text-amber-600">{needsWorkCount}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'تحتاج تحسين' : 'Needs Improvement'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">{offers.reduce((sum, o) => sum + o.conversions, 0)}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'إجمالي التحويلات' : 'Total Conversions'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Checks Overview */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">{isArabic ? 'فحوصات الجودة' : 'Quality Checks'}</CardTitle>
          <CardDescription>{isArabic ? 'ملخص متطلبات الامتثال عبر جميع العروض' : 'Compliance requirements summary across all offers'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {qualityChecks.map((check, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <check.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{check.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(check.passed / check.total) * 100} className="flex-1 h-2" />
                  <span className={cn(
                    "text-sm font-bold",
                    check.passed === check.total ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {check.passed}/{check.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offers Detail */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{isArabic ? 'تفاصيل العروض' : 'Offer Details'}</h3>
        {offers.map((offer) => (
          <Card key={offer.id} className={cn(
            "card-elevated",
            offer.status === 'rejected' && 'border-red-500/20',
            offer.status === 'needs_improvement' && 'border-amber-500/20'
          )}>
            <CardContent className="py-4">
              <div className={cn("flex flex-col lg:flex-row lg:items-start justify-between gap-4", isRTL && "lg:flex-row-reverse")}>
                <div className="flex-1">
                  <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                      offer.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                      offer.score >= 60 ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-500'
                    )}>
                      {offer.score}
                    </div>
                    <div className={cn(isRTL && "text-right")}>
                      <h4 className="font-semibold">{offer.title}</h4>
                      <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                        {getStatusBadge(offer.status)}
                        <span className="text-xs text-muted-foreground">
                          {offer.conversions} {isArabic ? 'تحويل' : 'conversions'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {offer.issues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-red-600 mb-1">{isArabic ? 'المشاكل:' : 'Issues:'}</p>
                      <div className="flex flex-wrap gap-2">
                        {offer.issues.map((issue, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-500/30">
                            <XCircle className="w-3 h-3 mr-1" />
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {offer.tips.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 mb-1">{isArabic ? 'نصائح للتحسين:' : 'Improvement Tips:'}</p>
                      <div className="flex flex-wrap gap-2">
                        {offer.tips.map((tip, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-amber-600 border-amber-500/30">
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {tip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm" className="shrink-0">
                  {isArabic ? 'تعديل العرض' : 'Edit Offer'}
                  <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "mr-1 ml-0 rotate-180")} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}