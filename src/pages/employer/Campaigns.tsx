import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Megaphone, 
  Award, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Mail, 
  MessageSquare,
  Gift,
  Heart,
  BookOpen,
  Dumbbell,
  Plus,
  ChevronRight,
  BarChart3,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  type: 'awareness' | 'recognition' | 'enrollment' | 'engagement';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: string;
  startDate: string;
  endDate: string;
  goal: string;
  progress: number;
  participants: number;
  targetParticipants: number;
  channels: string[];
  budget?: number;
  spent?: number;
}

const campaignTypes = [
  { value: 'awareness', label: { en: 'Benefits Awareness', ar: 'التوعية بالمزايا' }, icon: Megaphone, color: 'blue' },
  { value: 'recognition', label: { en: 'Peer Recognition', ar: 'تقدير الزملاء' }, icon: Award, color: 'purple' },
  { value: 'enrollment', label: { en: 'Open Enrollment', ar: 'التسجيل المفتوح' }, icon: Calendar, color: 'emerald' },
  { value: 'engagement', label: { en: 'Engagement Drive', ar: 'تعزيز المشاركة' }, icon: Heart, color: 'rose' },
];

const sampleCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'L&D Budget Awareness',
    type: 'awareness',
    status: 'active',
    targetAudience: 'All Employees',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    goal: 'Increase L&D utilization by 25%',
    progress: 68,
    participants: 89,
    targetParticipants: 156,
    channels: ['Email', 'Slack', 'Dashboard'],
    budget: 5000,
    spent: 2100,
  },
  {
    id: '2',
    name: 'Q1 Peer Recognition Week',
    type: 'recognition',
    status: 'active',
    targetAudience: 'All Teams',
    startDate: '2024-01-20',
    endDate: '2024-01-27',
    goal: '500 recognition moments',
    progress: 72,
    participants: 124,
    targetParticipants: 156,
    channels: ['Dashboard', 'Teams'],
    budget: 10000,
    spent: 7200,
  },
  {
    id: '3',
    name: 'Wellbeing Program Enrollment',
    type: 'enrollment',
    status: 'completed',
    targetAudience: 'New Hires 2024',
    startDate: '2024-01-01',
    endDate: '2024-01-14',
    goal: '100% new hire enrollment',
    progress: 100,
    participants: 12,
    targetParticipants: 12,
    channels: ['Email', 'Onboarding Portal'],
  },
  {
    id: '4',
    name: 'Health Insurance Awareness',
    type: 'awareness',
    status: 'draft',
    targetAudience: 'Engineering Teams',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    goal: 'Increase claims submission by 30%',
    progress: 0,
    participants: 0,
    targetParticipants: 45,
    channels: ['Email', 'Dashboard'],
  },
];

const campaignTemplates = [
  { 
    id: 'lnd-boost', 
    name: { en: 'L&D Budget Boost', ar: 'تعزيز ميزانية التطوير' },
    description: { en: 'Drive learning & development utilization', ar: 'تعزيز استخدام التعلم والتطوير' },
    icon: BookOpen,
    color: 'blue',
    channels: ['Email', 'Slack', 'Dashboard'],
    duration: '4 weeks',
  },
  { 
    id: 'recognition-week', 
    name: { en: 'Recognition Week', ar: 'أسبوع التقدير' },
    description: { en: 'Celebrate team achievements', ar: 'احتفل بإنجازات الفريق' },
    icon: Award,
    color: 'purple',
    channels: ['Dashboard', 'Teams', 'Email'],
    duration: '1 week',
  },
  { 
    id: 'wellbeing-challenge', 
    name: { en: 'Wellbeing Challenge', ar: 'تحدي العافية' },
    description: { en: 'Promote health & wellness programs', ar: 'تعزيز برامج الصحة والعافية' },
    icon: Dumbbell,
    color: 'emerald',
    channels: ['App', 'Email', 'Slack'],
    duration: '2 weeks',
  },
  { 
    id: 'perks-spotlight', 
    name: { en: 'Perks Spotlight', ar: 'تسليط الضوء على المزايا' },
    description: { en: 'Highlight underutilized perks', ar: 'تسليط الضوء على المزايا غير المستخدمة' },
    icon: Gift,
    color: 'amber',
    channels: ['Email', 'Dashboard'],
    duration: '2 weeks',
  },
];

export default function CampaignsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [campaigns, setCampaigns] = useState<Campaign[]>(sampleCampaigns);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'awareness',
    targetAudience: 'all',
    goal: '',
    startDate: '',
    endDate: '',
  });

  const getStatusBadge = (status: Campaign['status']) => {
    const configs = {
      draft: { label: isArabic ? 'مسودة' : 'Draft', className: 'bg-muted text-muted-foreground' },
      active: { label: isArabic ? 'نشط' : 'Active', className: 'bg-emerald-500/10 text-emerald-600' },
      paused: { label: isArabic ? 'متوقف' : 'Paused', className: 'bg-amber-500/10 text-amber-600' },
      completed: { label: isArabic ? 'مكتمل' : 'Completed', className: 'bg-blue-500/10 text-blue-600' },
    };
    const config = configs[status];
    return <Badge className={cn("text-[10px] border-0", config.className)}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: Campaign['type']) => {
    const typeConfig = campaignTypes.find(t => t.value === type);
    if (!typeConfig) return Megaphone;
    return typeConfig.icon;
  };

  const getTypeColor = (type: Campaign['type']) => {
    const colors = {
      awareness: 'blue',
      recognition: 'purple',
      enrollment: 'emerald',
      engagement: 'rose',
    };
    return colors[type];
  };

  const handleCreateCampaign = () => {
    toast.success(isArabic ? 'تم إنشاء الحملة بنجاح' : 'Campaign created successfully');
    setIsCreateOpen(false);
    setSelectedTemplate(null);
    setNewCampaign({
      name: '',
      type: 'awareness',
      targetAudience: 'all',
      goal: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleToggleCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'active' ? 'paused' : 'active';
        toast.success(
          newStatus === 'active' 
            ? (isArabic ? 'تم تفعيل الحملة' : 'Campaign activated')
            : (isArabic ? 'تم إيقاف الحملة' : 'Campaign paused')
        );
        return { ...c, status: newStatus as Campaign['status'] };
      }
      return c;
    }));
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalParticipants = activeCampaigns.reduce((sum, c) => sum + c.participants, 0);
  const avgProgress = activeCampaigns.length > 0 
    ? Math.round(activeCampaigns.reduce((sum, c) => sum + c.progress, 0) / activeCampaigns.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4",
        isRTL && "md:flex-row-reverse"
      )}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            {isArabic ? 'مدير الحملات والتقدير' : 'Campaign & Recognition Manager'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إطلاق حملات التوعية والتقدير وتتبع مشاركة الموظفين' : 'Launch awareness & recognition campaigns, track employee engagement'}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {isArabic ? 'حملة جديدة' : 'New Campaign'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Sparkles className="w-5 h-5 text-primary" />
                {isArabic ? 'إنشاء حملة جديدة' : 'Create New Campaign'}
              </DialogTitle>
              <DialogDescription>
                {isArabic ? 'اختر قالباً أو أنشئ حملة مخصصة' : 'Choose a template or create a custom campaign'}
              </DialogDescription>
            </DialogHeader>
            
            {!selectedTemplate ? (
              <div className="grid grid-cols-2 gap-4 py-4">
                {campaignTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                        <div className={cn(
                          "p-2 rounded-lg",
                          `bg-${template.color}-500/10`
                        )}>
                          <template.icon className={cn("w-5 h-5", `text-${template.color}-500`)} />
                        </div>
                        <div className={cn("flex-1", isRTL && "text-right")}>
                          <h4 className="font-semibold text-sm">
                            {isArabic ? template.name.ar : template.name.en}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isArabic ? template.description.ar : template.description.en}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">
                              {template.duration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'اسم الحملة' : 'Campaign Name'}</Label>
                    <Input 
                      placeholder={isArabic ? 'أدخل اسم الحملة' : 'Enter campaign name'}
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'نوع الحملة' : 'Campaign Type'}</Label>
                    <Select 
                      value={newCampaign.type}
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {isArabic ? type.label.ar : type.label.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{isArabic ? 'الجمهور المستهدف' : 'Target Audience'}</Label>
                  <Select 
                    value={newCampaign.targetAudience}
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetAudience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'جميع الموظفين' : 'All Employees'}</SelectItem>
                      <SelectItem value="engineering">{isArabic ? 'فريق الهندسة' : 'Engineering Team'}</SelectItem>
                      <SelectItem value="sales">{isArabic ? 'فريق المبيعات' : 'Sales Team'}</SelectItem>
                      <SelectItem value="new-hires">{isArabic ? 'الموظفين الجدد' : 'New Hires'}</SelectItem>
                      <SelectItem value="managers">{isArabic ? 'المدراء' : 'Managers'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{isArabic ? 'هدف الحملة' : 'Campaign Goal'}</Label>
                  <Textarea 
                    placeholder={isArabic ? 'ما الذي تريد تحقيقه؟' : 'What do you want to achieve?'}
                    value={newCampaign.goal}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, goal: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'تاريخ البدء' : 'Start Date'}</Label>
                    <Input 
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                    <Input 
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              {selectedTemplate && (
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  {isArabic ? 'رجوع' : 'Back'}
                </Button>
              )}
              <Button 
                onClick={handleCreateCampaign}
                disabled={selectedTemplate && !newCampaign.name}
              >
                {selectedTemplate 
                  ? (isArabic ? 'إنشاء الحملة' : 'Create Campaign')
                  : (isArabic ? 'إنشاء مخصص' : 'Create Custom')
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">{activeCampaigns.length}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'حملات نشطة' : 'Active Campaigns'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">{totalParticipants}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'مشارك' : 'Participants'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'متوسط التقدم' : 'Avg Progress'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">324</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'لحظات تقدير' : 'Recognition Moments'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className={cn("text-lg font-display font-semibold", isRTL && "text-right")}>
          {isArabic ? 'جميع الحملات' : 'All Campaigns'}
        </h2>
        
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const TypeIcon = getTypeIcon(campaign.type);
            const color = getTypeColor(campaign.type);
            
            return (
              <Card key={campaign.id} className="border-border/50 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className={cn("flex flex-col lg:flex-row lg:items-center gap-4", isRTL && "lg:flex-row-reverse")}>
                    {/* Campaign Info */}
                    <div className={cn("flex items-start gap-3 flex-1", isRTL && "flex-row-reverse")}>
                      <div className={cn("p-2 rounded-lg", `bg-${color}-500/10`)}>
                        <TypeIcon className={cn("w-5 h-5", `text-${color}-500`)} />
                      </div>
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{campaign.goal}</p>
                        <div className={cn("flex items-center gap-4 mt-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                          <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                            <Users className="w-3 h-3" />
                            {campaign.targetAudience}
                          </span>
                          <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                            <Calendar className="w-3 h-3" />
                            {campaign.startDate} - {campaign.endDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress & Actions */}
                    <div className={cn("flex items-center gap-6", isRTL && "flex-row-reverse")}>
                      <div className="w-32">
                        <div className={cn("flex items-center justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                          <span className="text-muted-foreground">{isArabic ? 'التقدم' : 'Progress'}</span>
                          <span className="font-medium">{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                        <p className="text-[10px] text-muted-foreground mt-1 text-center">
                          {campaign.participants}/{campaign.targetParticipants} {isArabic ? 'مشارك' : 'participants'}
                        </p>
                      </div>
                      
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        {campaign.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleCampaign(campaign.id)}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleCampaign(campaign.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === 'draft' && (
                          <Button size="sm" className="gap-1">
                            <Play className="w-4 h-4" />
                            {isArabic ? 'إطلاق' : 'Launch'}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
