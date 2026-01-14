import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Download,
  Filter,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import chartColors from '@/lib/chartColors';

const satisfactionTrend = [
  { month: 'Jan', nps: 42, satisfaction: 3.8 },
  { month: 'Feb', nps: 45, satisfaction: 3.9 },
  { month: 'Mar', nps: 48, satisfaction: 4.0 },
  { month: 'Apr', nps: 44, satisfaction: 3.8 },
  { month: 'May', nps: 52, satisfaction: 4.1 },
  { month: 'Jun', nps: 55, satisfaction: 4.2 },
  { month: 'Jul', nps: 58, satisfaction: 4.3 },
  { month: 'Aug', nps: 56, satisfaction: 4.2 },
];

const categoryScores = [
  { category: 'Health', score: 4.5, benchmark: 4.2, change: 0.3 },
  { category: 'Housing', score: 4.2, benchmark: 4.0, change: 0.1 },
  { category: 'Transport', score: 3.8, benchmark: 3.9, change: -0.2 },
  { category: 'Education', score: 4.6, benchmark: 4.1, change: 0.4 },
  { category: 'Wellbeing', score: 3.5, benchmark: 3.8, change: -0.1 },
  { category: 'Financial', score: 4.0, benchmark: 3.7, change: 0.2 },
];

const radarData = categoryScores.map(c => ({
  subject: c.category,
  company: c.score,
  benchmark: c.benchmark,
  fullMark: 5
}));

const recentFeedback = [
  { 
    id: 1, 
    sentiment: 'positive', 
    category: 'Health',
    text: 'The new dental coverage is excellent. My family really appreciates it.',
    date: '2 days ago',
    department: 'Engineering'
  },
  { 
    id: 2, 
    sentiment: 'neutral', 
    category: 'Transport',
    text: 'The fuel allowance is decent but could be higher given current prices.',
    date: '3 days ago',
    department: 'Sales'
  },
  { 
    id: 3, 
    sentiment: 'negative', 
    category: 'Wellbeing',
    text: 'I wish there were more gym options in my area covered by the plan.',
    date: '5 days ago',
    department: 'Marketing'
  },
  { 
    id: 4, 
    sentiment: 'positive', 
    category: 'Education',
    text: 'The school fee coverage has been a lifesaver for my family.',
    date: '1 week ago',
    department: 'HR'
  },
];

export default function SatisfactionPulsePage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [selectedCategory, setSelectedCategory] = useState('all');

  const currentNPS = 56;
  const previousNPS = 48;
  const npsChange = currentNPS - previousNPS;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-emerald-600" />;
      case 'neutral': return <Meh className="w-4 h-4 text-amber-600" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'neutral': return 'bg-amber-500/10 border-amber-500/20';
      case 'negative': return 'bg-red-500/10 border-red-500/20';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        isRTL && "sm:flex-row-reverse"
      )}>
        <div className={isRTL ? "text-right" : ""}>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {isRTL ? "نبض الرضا" : "Satisfaction Pulse"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? "قياس رضا الموظفين عن برنامج المزايا"
              : "Employee satisfaction with the benefits program"
            }
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline" size="sm">
            <Filter className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? "تصفية" : "Filter"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      {/* NPS and Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* NPS Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "صافي نقاط الترويج" : "Net Promoter Score"}
                </span>
              </div>
              <div className={cn("flex items-end gap-3", isRTL && "flex-row-reverse")}>
                <span className="text-4xl font-bold text-primary">{currentNPS}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mb-1",
                    npsChange > 0 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                  )}
                >
                  {npsChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {npsChange > 0 ? '+' : ''}{npsChange}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isRTL ? "مقابل الفترة السابقة" : "vs previous period"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                <MessageSquare className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "معدل الاستجابة" : "Response Rate"}
                </span>
              </div>
              <div className="text-3xl font-bold">78%</div>
              <Progress value={78} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                312 {isRTL ? "من" : "of"} 400 {isRTL ? "موظف" : "employees"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Promoters */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-emerald-500/20">
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "المروجون" : "Promoters"}
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-600">64%</div>
              <p className="text-xs text-muted-foreground mt-2">
                200 {isRTL ? "موظف" : "employees"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detractors */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-red-500/20">
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                <ThumbsDown className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "المنتقدون" : "Detractors"}
                </span>
              </div>
              <div className="text-3xl font-bold text-red-600">8%</div>
              <p className="text-xs text-muted-foreground mt-2">
                25 {isRTL ? "موظف" : "employees"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* NPS Trend */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <TrendingUp className="w-5 h-5 text-primary" />
              {isRTL ? "اتجاه NPS" : "NPS Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={satisfactionTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nps" 
                  stroke={chartColors.primary}
                  strokeWidth={3}
                  dot={{ fill: chartColors.primary, strokeWidth: 2 }}
                  name="NPS"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Radar */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <Star className="w-5 h-5 text-amber-500" />
              {isRTL ? "الرضا حسب الفئة" : "Satisfaction by Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 5]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Radar
                  name="Your Company"
                  dataKey="company"
                  stroke={chartColors.primary}
                  fill={chartColors.primary}
                  fillOpacity={0.3}
                />
                <Radar
                  name="Industry Benchmark"
                  dataKey="benchmark"
                  stroke={chartColors.secondary}
                  fill={chartColors.secondary}
                  fillOpacity={0.1}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className={cn(
              "flex items-center justify-center gap-6 mt-2",
              isRTL && "flex-row-reverse"
            )}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.primary }} />
                <span className="text-xs text-muted-foreground">{isRTL ? "شركتك" : "Your Company"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.secondary }} />
                <span className="text-xs text-muted-foreground">{isRTL ? "المعيار" : "Benchmark"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Scores Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Star className="w-5 h-5 text-primary" />
            {isRTL ? "تفاصيل الفئات" : "Category Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {categoryScores.map((cat, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-lg border",
                  cat.change > 0 ? "border-emerald-500/20 bg-emerald-500/5" : 
                  cat.change < 0 ? "border-red-500/20 bg-red-500/5" : "border-border/50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-between mb-2",
                  isRTL && "flex-row-reverse"
                )}>
                  <span className="font-medium">{cat.category}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      cat.change > 0 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : cat.change < 0 
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : ""
                    )}
                  >
                    {cat.change > 0 ? '+' : ''}{cat.change.toFixed(1)}
                  </Badge>
                </div>
                <div className={cn(
                  "flex items-end gap-2",
                  isRTL && "flex-row-reverse"
                )}>
                  <span className="text-2xl font-bold">{cat.score.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground mb-0.5">/ 5.0</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-xs text-muted-foreground",
                  isRTL && "flex-row-reverse"
                )}>
                  <span>{isRTL ? "المعيار:" : "Benchmark:"}</span>
                  <span className="font-medium">{cat.benchmark.toFixed(1)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className={cn(
            "flex items-center justify-between",
            isRTL && "flex-row-reverse"
          )}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <MessageSquare className="w-5 h-5 text-primary" />
              {isRTL ? "آخر التعليقات" : "Recent Feedback"}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {isRTL ? "مجهول" : "Anonymized"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFeedback.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-lg border",
                  getSentimentBg(feedback.sentiment)
                )}
              >
                <div className={cn(
                  "flex items-start gap-3",
                  isRTL && "flex-row-reverse"
                )}>
                  <div className="mt-0.5">
                    {getSentimentIcon(feedback.sentiment)}
                  </div>
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <p className="text-sm">{feedback.text}</p>
                    <div className={cn(
                      "flex items-center gap-2 mt-2 text-xs text-muted-foreground",
                      isRTL && "flex-row-reverse"
                    )}>
                      <Badge variant="outline" className="text-[10px]">{feedback.category}</Badge>
                      <span>•</span>
                      <span>{feedback.department}</span>
                      <span>•</span>
                      <span>{feedback.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            {isRTL ? "عرض جميع التعليقات" : "View All Feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
