/**
 * LongTermFinancialsTabs
 * 
 * Tabbed interface for Long-Term Financials showing:
 * - End of Service (EOSB)
 * - Annual Bonus
 * - Savings/Pension
 * - Equity/Options
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Landmark, 
  Award, 
  Coins, 
  TrendingUp,
  Calendar,
  Clock,
  Info,
  ArrowRight
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface LongTermFinancialsTabsProps {
  yearsOfService?: number;
  basicSalary?: number;
  performanceRating?: string;
  equityGrants?: number;
  vestedShares?: number;
}

export function LongTermFinancialsTabs({
  yearsOfService = 3,
  basicSalary = 25000,
  performanceRating = 'Exceeds Expectations',
  equityGrants = 0,
  vestedShares = 0,
}: LongTermFinancialsTabsProps) {
  const [activeTab, setActiveTab] = useState('eosb');
  
  const formatCurrency = (value: number | null) => 
    value != null ? formatCurrencyAED(value, { abbreviate: false }) : '—';

  // EOSB Calculation (UAE Labor Law simplified)
  const eosbAccrued = yearsOfService <= 5 
    ? yearsOfService * basicSalary * (21 / 30) 
    : 5 * basicSalary * (21 / 30) + (yearsOfService - 5) * basicSalary;

  // Bonus calculation (example: 15% target)
  const bonusTarget = basicSalary * 12 * 0.15;

  const renderValueOrPending = (value: number | string | null, tooltip?: string) => {
    if (value === null || value === undefined || value === '') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-help">—</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tooltip || 'Definition pending'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return typeof value === 'number' ? formatCurrency(value) : value;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-display font-semibold">Your long-term components</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="eosb" className="gap-1.5 text-xs">
            <Landmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End of Service</span>
            <span className="sm:hidden">EOSB</span>
          </TabsTrigger>
          <TabsTrigger value="bonus" className="gap-1.5 text-xs">
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Annual Bonus</span>
            <span className="sm:hidden">Bonus</span>
          </TabsTrigger>
          <TabsTrigger value="savings" className="gap-1.5 text-xs">
            <Coins className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Savings</span>
            <span className="sm:hidden">Savings</span>
          </TabsTrigger>
          <TabsTrigger value="equity" className="gap-1.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Equity</span>
            <span className="sm:hidden">Equity</span>
          </TabsTrigger>
        </TabsList>

        {/* EOSB Tab */}
        <TabsContent value="eosb" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-primary" />
                    End-of-Service Gratuity (EOSB)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Calculated per UAE Labor Law based on years of service
                  </CardDescription>
                </div>
                <Badge className="bg-success/10 text-success border-0">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Accrued Value */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Accrued value (estimated)</p>
                <p className="text-3xl font-bold tabular-nums">{formatCurrency(eosbAccrued)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {yearsOfService} years of continuous service
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Calculation basis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Years of service</span>
                      <span className="font-medium tabular-nums">{yearsOfService} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic salary</span>
                      <span className="font-medium tabular-nums">{formatCurrency(basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Formula</span>
                      <span className="font-medium">UAE Labor Law</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Formula details</h4>
                  <div className="p-3 rounded-md bg-muted/50 text-xs text-muted-foreground space-y-1">
                    <p>• First 5 years: 21 days salary per year</p>
                    <p>• After 5 years: 30 days salary per year</p>
                    <p>• Payable upon employment termination</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonus Tab */}
        <TabsContent value="bonus" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Annual Performance Bonus
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Based on individual and company performance
                  </CardDescription>
                </div>
                <Badge className="bg-success/10 text-success border-0">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Value */}
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p className="text-sm text-muted-foreground mb-1">Target bonus (100% achievement)</p>
                <p className="text-3xl font-bold tabular-nums">{formatCurrency(bonusTarget)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  15% of annual basic salary
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Bonus details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target %</span>
                      <span className="font-medium">15% of annual salary</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last rating</span>
                      <span className="font-medium">{performanceRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payout cycle</span>
                      <span className="font-medium">March annually</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Multiplier tiers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exceptional</span>
                      <span className="font-medium text-success">150%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exceeds</span>
                      <span className="font-medium">120%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meets</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Below</span>
                      <span className="font-medium text-warning">50-75%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Payout */}
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Next payout: March 2026</p>
                  <p className="text-xs text-muted-foreground">Based on 2025 performance year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Coins className="w-5 h-5 text-green-500" />
                    Pension / Savings Contributions
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Employer-matched savings and retirement contributions
                  </CardDescription>
                </div>
                <Badge className="bg-warning/10 text-warning border-0">Pending Setup</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Coins className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Savings plan not yet configured</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your organization is setting up the savings/pension plan. 
                  Details will appear here once configured.
                </p>
              </div>

              {/* Example structure when configured */}
              <div className="grid sm:grid-cols-3 gap-4 opacity-50">
                <div className="p-3 rounded-md border border-dashed text-center">
                  <p className="text-xs text-muted-foreground mb-1">Employee contribution</p>
                  <p className="font-medium">—</p>
                </div>
                <div className="p-3 rounded-md border border-dashed text-center">
                  <p className="text-xs text-muted-foreground mb-1">Employer match</p>
                  <p className="font-medium">—</p>
                </div>
                <div className="p-3 rounded-md border border-dashed text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total balance</p>
                  <p className="font-medium">—</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equity Tab */}
        <TabsContent value="equity" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Equity / Stock Options
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Company shares and stock option grants
                  </CardDescription>
                </div>
                <Badge className="bg-muted text-muted-foreground border-0">Not Eligible</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Equity not included in your package</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Equity compensation is available for certain roles and grades. 
                  Contact HR for eligibility details.
                </p>
              </div>

              {/* Example structure when eligible */}
              <div className="grid sm:grid-cols-3 gap-4 opacity-50">
                <div className="p-3 rounded-md border border-dashed text-center">
                  <p className="text-xs text-muted-foreground mb-1">Granted</p>
                  <p className="font-medium">—</p>
                </div>
                <div className="p-3 rounded-md border border-dashed text-center">
                  <p className="text-xs text-muted-foreground mb-1">Vested</p>
                  <p className="font-medium">—</p>
                </div>
                <div className="p-3 rounded-md border border-dashed text-center">
                  <p className="text-xs text-muted-foreground mb-1">Next vesting</p>
                  <p className="font-medium">—</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
