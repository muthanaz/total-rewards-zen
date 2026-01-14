import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useMetricDefinitions } from '@/hooks/useMetricDefinition';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, BookOpen, Calculator, Database, User, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function MetricsDictionaryPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');
  
  const { data: metrics, isLoading, error } = useMetricDefinitions();

  const filteredMetrics = metrics?.filter(metric => {
    const query = searchQuery.toLowerCase();
    return (
      metric.key.toLowerCase().includes(query) ||
      metric.name.toLowerCase().includes(query) ||
      metric.definition.toLowerCase().includes(query)
    );
  }) || [];

  const getConfidenceBadge = (rules: Record<string, string>) => {
    const ruleCount = Object.keys(rules).length;
    if (ruleCount === 0) {
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">High</Badge>;
    }
    if (ruleCount <= 2) {
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Medium</Badge>;
    }
    return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Low</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      employer: 'bg-primary/10 text-primary border-primary/20',
      admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      employee: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };
    return <Badge variant="secondary" className={colors[role] || 'bg-muted'}>{role}</Badge>;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isArabic ? 'قاموس المقاييس' : 'Metrics Dictionary'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'مصدر واحد للتعريفات والصيغ' : 'Single source of truth for definitions and formulas'}
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{isArabic ? 'فشل في تحميل تعريفات المقاييس' : 'Failed to load metric definitions'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {isArabic ? 'قاموس المقاييس' : 'Metrics Dictionary'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'مصدر واحد للتعريفات والصيغ ومصادر البيانات' : 'Single source of truth for definitions, formulas, and data sources'}
        </p>
      </div>

      {/* Search & Language Toggle */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isArabic ? 'البحث في المقاييس...' : 'Search metrics...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as 'en' | 'ar')}>
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إجمالي المقاييس' : 'Total Metrics'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {metrics?.filter(m => Object.keys(m.confidenceRules).length === 0).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'ثقة عالية' : 'High Confidence'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(metrics?.map(m => m.source)).size || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'مصادر البيانات' : 'Data Sources'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredMetrics.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isArabic ? 'لم يتم العثور على مقاييس' : 'No metrics found'}</p>
            </CardContent>
          </Card>
        ) : (
          filteredMetrics.map((metric) => (
            <Card key={metric.key} className="card-elevated hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {metric.key}
                      </span>
                      <span>{metric.name}</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {metric.definition}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {getRoleBadge(metric.ownerRole)}
                    {getConfidenceBadge(metric.confidenceRules)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {/* Formula */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calculator className="h-3.5 w-3.5" />
                      <span className="font-medium">{isArabic ? 'الصيغة' : 'Formula'}</span>
                    </div>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      {metric.formula}
                    </p>
                  </div>

                  {/* Source */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Database className="h-3.5 w-3.5" />
                      <span className="font-medium">{isArabic ? 'المصدر' : 'Data Source'}</span>
                    </div>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      {metric.source}
                    </p>
                  </div>

                  {/* Min Sample Size */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium">{isArabic ? 'الحد الأدنى للعينة' : 'Min Sample'}</span>
                    </div>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      {metric.minSampleSize} {isArabic ? 'سجلات' : 'records'}
                    </p>
                  </div>

                  {/* Last Updated */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">{isArabic ? 'آخر تحديث' : 'Last Updated'}</span>
                    </div>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      {format(new Date(metric.lastUpdated), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Confidence Rules */}
                {Object.keys(metric.confidenceRules).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {isArabic ? 'قواعد الثقة' : 'Confidence Rules'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(metric.confidenceRules).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
