import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, Star, Phone, MapPin, CheckCircle, HelpCircle, Stethoscope, Pill, Eye, Smile, Shield, Users, Activity, FileText, Clock, AlertCircle } from 'lucide-react';
import { useHealthProviders } from '@/hooks/useSupabaseData';
import { BenefitCrossLinks } from '@/components/employee/BenefitCrossLinks';
import { BenefitValueTypeChip } from '@/components/shared/BenefitValueTypeChip';
import { formatCurrencyAED, formatInteger } from '@/lib/utils';

// Coverage-type benefit: Show plan/network info, NOT AED remaining
const EMPLOYER_INVESTMENT = 45000; // What employer pays for coverage
const CLAIMS_COUNT = 8;
const NETWORK_PROVIDERS = 245;
const DEPENDENTS_COVERED = 3;

const policyCategories = [
  {
    name: 'Inpatient',
    icon: Heart,
    coverage: 'Up to AED 1,000,000',
    items: ['Room & Board (private)', 'ICU coverage', 'Surgery & anesthesia', 'Doctor visits'],
  },
  {
    name: 'Outpatient',
    icon: Stethoscope,
    coverage: 'Up to AED 100,000',
    items: ['Consultations (AED 0 co-pay)', 'Diagnostics & lab tests', 'Physiotherapy', 'Minor procedures'],
  },
  {
    name: 'Dental',
    icon: Smile,
    coverage: 'Up to AED 5,000',
    items: ['Cleanings & check-ups', 'Fillings & extractions', 'X-rays', 'Root canal (80% covered)'],
  },
  {
    name: 'Optical',
    icon: Eye,
    coverage: 'Up to AED 2,000',
    items: ['Eye exams', 'Prescription glasses', 'Contact lenses', 'Frame allowance'],
  },
  {
    name: 'Maternity',
    icon: Heart,
    coverage: 'Up to AED 30,000',
    items: ['Pre-natal care', 'Delivery (normal/C-section)', 'Post-natal care', 'Newborn coverage (first 30 days)'],
  },
  {
    name: 'Pharmacy',
    icon: Pill,
    coverage: '80% covered',
    items: ['Prescription medications', 'Chronic medication', 'Pre-authorized drugs', 'Generic alternatives'],
  },
];

const faqs = [
  { q: 'How do I find a network provider?', a: 'Use the provider directory below. All listed providers are in-network with direct billing.' },
  { q: 'What is the pre-authorization process?', a: 'For planned procedures, submit a pre-authorization request through your insurer app or call the hotline.' },
  { q: 'How do I claim for out-of-network services?', a: 'Pay upfront, then submit claim forms with receipts within 60 days for 50% reimbursement.' },
  { q: 'Are my dependents covered?', a: 'Yes, spouse and children under 18 are covered under your policy at the same benefit levels.' },
];

const healthPolicies = [
  'Comprehensive coverage up to AED 1,000,000',
  'Spouse and children covered at same levels',
  'Pre-existing conditions covered after 6 months',
  'Direct billing at network providers',
  '24/7 emergency helpline available',
  'Annual health check-up included',
];

export default function HealthPage() {
  const { data: providers = [] } = useHealthProviders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [providerType, setProviderType] = useState<string>('all');
  const [specialty, setSpecialty] = useState<string>('all');
  const [area, setArea] = useState<string>('all');

  const providerTypes = useMemo(() => {
    const unique = [...new Set(providers.map(p => p.provider_type))];
    return unique.sort();
  }, [providers]);

  const specialties = useMemo(() => {
    const unique = [...new Set(providers.map(p => p.specialty).filter(Boolean))];
    return unique.sort();
  }, [providers]);

  const areas = useMemo(() => {
    const unique = [...new Set(providers.map(p => p.area))];
    return unique.sort();
  }, [providers]);

  const filteredProviders = useMemo(() => {
    let filtered = [...providers];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.specialty && p.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (providerType !== 'all') {
      filtered = filtered.filter(p => p.provider_type === providerType);
    }

    if (specialty !== 'all') {
      filtered = filtered.filter(p => p.specialty === specialty);
    }

    if (area !== 'all') {
      filtered = filtered.filter(p => p.area === area);
    }

    return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [providers, searchTerm, providerType, specialty, area]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Using PageHeader pattern */}
      <PageHeader
        title="Health Insurance"
        description="Comprehensive coverage for you and your family"
        icon={Heart}
        iconClassName="from-chart-5 to-chart-5/80 shadow-chart-5/25"
        partnerOffersCategory="Health Insurance"
      />

      {/* Coverage Type Banner - This is NOT cash/reimbursement */}
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">This is a Coverage benefit</span>
                <BenefitValueTypeChip valueType="coverage" size="sm" showTooltip={false} />
              </div>
              <p className="text-xs text-muted-foreground">
                Your employer invests {formatCurrencyAED(EMPLOYER_INVESTMENT)} annually for your health coverage. 
                This is <strong>not cash you can spend</strong> — it's insurance that covers your medical expenses when you need care.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Coverage Summary Cards - Service metrics, NOT AED balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStatsCard
          icon={Shield}
          value="Active"
          label="Coverage Status"
          formula="Current policy status"
          dataSource="Insurance Provider"
          variant="primary"
        />
        <SummaryStatsCard
          icon={Users}
          value={formatInteger(DEPENDENTS_COVERED)}
          label="Dependents Covered"
          formula="You + family members"
          dataSource="Policy"
          variant="utilized"
        />
        <SummaryStatsCard
          icon={Activity}
          value={formatInteger(CLAIMS_COUNT)}
          label="Claims This Year"
          formula="Claims processed YTD"
          dataSource="Claims System"
          variant="remaining"
        />
        <SummaryStatsCard
          icon={Heart}
          value={formatInteger(NETWORK_PROVIDERS)}
          label="Network Providers"
          formula="In-network facilities"
          dataSource="Provider Directory"
          variant="info"
        />
      </div>

      {/* 2. Policy Highlights with Action Buttons - Tips integrated */}
      <PolicyHighlightsCard
        title="Insurance Policy Highlights"
        policies={[
          ...healthPolicies,
          '💡 In-network = no upfront cost (show insurance card)',
          '📋 Pre-auth required 48hrs before planned surgeries',
          '⏱️ Claims processed in 5-7 business days',
        ]}
        category="Health Insurance"
        actionLabel="Submit Claim"
        policyLabel="View Full Policy"
      />

      {/* 3. How It Works */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            How Your Health Insurance Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-medium text-sm">In-Network Care</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Visit any in-network provider for <span className="font-semibold text-accent">direct billing</span> — no upfront payment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-medium text-sm">Family Covered</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Spouse and children under 18 are covered at the same benefit levels
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-medium text-sm">Claims Reimbursement</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Out-of-network? Submit receipts within 60 days for 50% reimbursement
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Coverage Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Coverage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policyCategories.map((category) => (
              <div key={category.name} className="p-4 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <category.icon className="w-5 h-5 text-accent" />
                  <h3 className="font-medium">{category.name}</h3>
                </div>
                <p className="text-sm font-medium text-accent mb-2">{category.coverage}</p>
                <ul className="space-y-1">
                  {category.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-success mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Provider Directory and Policy Helper */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Provider Directory</TabsTrigger>
          <TabsTrigger value="helper">Policy Helper (Demo)</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={providerType} onValueChange={setProviderType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {providerTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s!}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Providers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="benefit-card">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm">{provider.name}</h3>
                    {provider.rating && (
                      <span className="flex items-center gap-1 text-sm text-warning shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {provider.rating}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{provider.provider_type}</Badge>
                    {provider.specialty && <Badge variant="outline">{provider.specialty}</Badge>}
                    {provider.in_network && (
                      <Badge className="bg-success/10 text-success border-0">In-Network</Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {provider.area}
                    </p>
                    {provider.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        {provider.phone}
                      </p>
                    )}
                    {provider.address && (
                      <p className="text-xs line-clamp-1">{provider.address}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredProviders.length === 0 && (
            <Card className="p-12 text-center">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No providers match your filters</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="helper" className="space-y-4">
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent" />
                Policy Helper (Demo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Get quick answers about your health insurance coverage. This demo shows common questions - 
                in the full version, you can ask any question about your policy.
              </p>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-4 rounded-lg bg-card border border-border/50">
                    <p className="font-medium text-sm mb-2 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      {faq.q}
                    </p>
                    <p className="text-sm text-muted-foreground pl-6">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
