/**
 * Employee Knowledge Center
 * 
 * Searchable hub for policies, FAQs, and help articles.
 * Allows employees to browse and ask questions linked to policies.
 */

import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  Heart,
  Home,
  GraduationCap,
  Car,
  Brain,
  Briefcase,
  Calendar,
  Plane,
  DollarSign,
  ChevronRight,
  MessageCircle,
  Clock,
  CheckCircle,
  Users,
  Shield,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolicies, useSearchPolicies, usePolicyArticles, type Policy } from '@/hooks/usePolicies';
import { PolicyDetailSheet } from '@/components/shared/PolicyRefBadge';
import { EmployeeCreateRequestSheet } from '@/components/employee/EmployeeCreateRequestSheet';
import { useLanguage } from '@/contexts/LanguageContext';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Health Insurance': Heart,
  'Housing Allowance': Home,
  'Housing': Home,
  'Education Allowance': GraduationCap,
  'Transport': Car,
  'Learning & Development': Brain,
  'Wellbeing': Sparkles,
  'Leave': Calendar,
  'Per Diem': Plane,
  'Financial': DollarSign,
};

const QUICK_LINKS = [
  { label: 'How to submit a claim', category: 'Health Insurance', icon: FileText },
  { label: 'Education allowance limits', category: 'Education Allowance', icon: GraduationCap },
  { label: 'Annual leave entitlement', category: 'Leave', icon: Calendar },
  { label: 'Per diem rates by destination', category: 'Per Diem', icon: Plane },
];

export default function EmployeeKnowledgeCenter() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [askQuestionOpen, setAskQuestionOpen] = useState(false);
  const [questionCategory, setQuestionCategory] = useState<string>('');
  
  const { data: policies = [], isLoading: policiesLoading } = usePolicies({ status: 'active' });
  const { data: searchResults, isLoading: searchLoading } = useSearchPolicies(searchQuery);
  const { data: faqs = [] } = usePolicyArticles({ isFaq: true });
  
  // Group policies by category
  const policiesByCategory = useMemo(() => {
    const grouped: Record<string, Policy[]> = {};
    policies.forEach(policy => {
      if (!grouped[policy.category]) {
        grouped[policy.category] = [];
      }
      grouped[policy.category].push(policy);
    });
    return grouped;
  }, [policies]);
  
  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setDetailSheetOpen(true);
  };
  
  const handleAskQuestion = (category?: string) => {
    setQuestionCategory(category || '');
    setAskQuestionOpen(true);
  };
  
  const isSearching = searchQuery.length >= 2;
  const hasResults = searchResults && (searchResults.policies.length > 0 || searchResults.articles.length > 0);
  
  return (
    <PageLayout
      title="Knowledge Center"
      description="Find answers to your benefits questions"
      actions={
        <Button onClick={() => handleAskQuestion()} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Ask a Question
        </Button>
      }
    >
      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search policies, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {QUICK_LINKS.map((link) => (
              <Badge
                key={link.label}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setSearchQuery(link.label.split(' ').slice(0, 3).join(' '))}
              >
                {link.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Search Results */}
      {isSearching && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {searchLoading ? 'Searching...' : `Search Results for "${searchQuery}"`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : hasResults ? (
              <div className="space-y-4">
                {searchResults.policies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Policies</h4>
                    <div className="space-y-2">
                      {searchResults.policies.map((policy) => {
                        const Icon = CATEGORY_ICONS[policy.category] || FileText;
                        return (
                          <div
                            key={policy.id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleViewPolicy(policy)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{policy.title}</p>
                                <p className="text-sm text-muted-foreground">{policy.category}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {searchResults.articles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Articles & FAQs</h4>
                    <div className="space-y-2">
                      {searchResults.articles.map((article) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <HelpCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{article.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {article.content.slice(0, 100)}...
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No results found</p>
                <Button
                  variant="link"
                  onClick={() => handleAskQuestion()}
                  className="mt-2"
                >
                  Ask HR a question instead
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Main Content */}
      {!isSearching && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="browse" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Policies
            </TabsTrigger>
            <TabsTrigger value="faqs" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Tips & Guides
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            {/* Policy Categories */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(policiesByCategory).map(([category, categoryPolicies]) => {
                const Icon = CATEGORY_ICONS[category] || FileText;
                const latestPolicy = categoryPolicies[0];
                
                return (
                  <Card 
                    key={category}
                    className="group hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleViewPolicy(latestPolicy)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {latestPolicy.version}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{category}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {latestPolicy.summary || 'View policy details and eligibility information.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {latestPolicy.policy_ref}
                        </code>
                        <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
                          View
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {policiesLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
            
            {!policiesLoading && Object.keys(policiesByCategory).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No policies available</h3>
                  <p className="text-muted-foreground mb-4">
                    Policy documents haven't been published yet.
                  </p>
                  <Button onClick={() => handleAskQuestion()}>
                    Ask HR a question
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Quick answers to common benefits questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample FAQs (would come from policy_articles) */}
                {[
                  {
                    q: 'How do I submit a health insurance claim?',
                    a: 'Go to Claims & Requests, select "Submit Claim", choose Health Insurance category, attach your receipts and medical reports, then submit.',
                    category: 'Health Insurance',
                  },
                  {
                    q: 'What documents are needed for education allowance?',
                    a: 'You need the school fee invoice, school registration certificate, and your child\'s birth certificate.',
                    category: 'Education Allowance',
                  },
                  {
                    q: 'How is my housing allowance calculated?',
                    a: 'Housing allowance is based on your grade level and is paid monthly as part of your salary.',
                    category: 'Housing',
                  },
                  {
                    q: 'Can I carry over annual leave to next year?',
                    a: 'Yes, you can carry over up to 5 days of unused annual leave to the following year.',
                    category: 'Leave',
                  },
                  {
                    q: 'What is the per diem rate for international travel?',
                    a: 'Per diem rates vary by destination region. Check the Per Diem policy for specific rates by country/city.',
                    category: 'Per Diem',
                  },
                ].map((faq, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">{faq.q}</p>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => {
                              const policy = policies.find(p => p.category === faq.category);
                              if (policy) handleViewPolicy(policy);
                            }}
                          >
                            View full policy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Can't find answer */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Can't find what you're looking for?</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask HR directly and get a response within 2 business days.
                    </p>
                  </div>
                  <Button onClick={() => handleAskQuestion()} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Ask a Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4">
            {/* Tips and Guides */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-primary" />
                    Submit Claims Quickly
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Have all documents ready before starting</p>
                  <p>• Take clear photos of receipts</p>
                  <p>• Include prescription if claiming medication</p>
                  <p>• Submit within 30 days for fastest processing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Maximize Your Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Review your entitlements quarterly</p>
                  <p>• Use wellness budget before year-end</p>
                  <p>• Plan L&D courses early for approval</p>
                  <p>• Book air tickets in advance for better rates</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-purple-600" />
                    Dependent Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Register dependents during onboarding</p>
                  <p>• Update family status for life events</p>
                  <p>• Keep birth/marriage certificates ready</p>
                  <p>• Check age limits for children's coverage</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Know Your Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• All permanent employees are eligible</p>
                  <p>• Benefits start from day 1 (most categories)</p>
                  <p>• Unused leave may be encashed on exit</p>
                  <p>• Gratuity vests after 1 year of service</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Policy Detail Sheet */}
      <PolicyDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        policy={selectedPolicy}
        policyRef={selectedPolicy?.policy_ref || ''}
        isLoading={false}
        error={null}
      />
      
      {/* Ask Question Sheet */}
      <EmployeeCreateRequestSheet
        open={askQuestionOpen}
        onOpenChange={setAskQuestionOpen}
        initialType="question"
        initialCategory={questionCategory}
        initialTitle=""
        initialDescription=""
      />
    </PageLayout>
  );
}
