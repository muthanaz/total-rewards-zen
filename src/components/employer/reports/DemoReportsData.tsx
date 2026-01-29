/**
 * Demo Reports Data Generator
 * 
 * Generates 3 demo reports that work without external integrations:
 * A) Claims volume by category
 * B) Total payable by category (paid vs pending)
 * C) SLA performance summary
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Hourglass,
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';

// Demo data for Claims Volume by Category
const CLAIMS_VOLUME_DATA = [
  { category: 'Housing', submitted: 45, approved: 38, rejected: 3, pending: 4 },
  { category: 'Schooling', submitted: 89, approved: 72, rejected: 8, pending: 9 },
  { category: 'Health', submitted: 156, approved: 142, rejected: 6, pending: 8 },
  { category: 'Transport', submitted: 23, approved: 21, rejected: 1, pending: 1 },
  { category: 'Wellbeing', submitted: 67, approved: 58, rejected: 4, pending: 5 },
  { category: 'Learning', submitted: 34, approved: 28, rejected: 2, pending: 4 },
];

// Demo data for Payable by Category
const PAYABLE_BY_CATEGORY_DATA = [
  { category: 'Housing', paid: 684000, pending: 45000 },
  { category: 'Schooling', paid: 892500, pending: 112500 },
  { category: 'Health', paid: 284000, pending: 32000 },
  { category: 'Transport', paid: 42000, pending: 3600 },
  { category: 'Wellbeing', paid: 87000, pending: 12000 },
  { category: 'Learning', paid: 56000, pending: 15000 },
];

// Demo data for SLA Performance
const SLA_PERFORMANCE_DATA = {
  onTime: 342,
  atRisk: 18,
  breached: 7,
  avgProcessingHours: 28.4,
  targetHours: 72,
  medianCycleTime: 2.3,
  percentOnTime: 93.2,
};

const CHART_COLORS = {
  approved: 'hsl(var(--success))',
  rejected: 'hsl(var(--destructive))',
  pending: 'hsl(var(--warning))',
  submitted: 'hsl(var(--primary))',
  paid: 'hsl(var(--success))',
  pendingPayment: 'hsl(var(--warning))',
};

export function ClaimsVolumeReport() {
  const totals = useMemo(() => {
    return CLAIMS_VOLUME_DATA.reduce(
      (acc, row) => ({
        submitted: acc.submitted + row.submitted,
        approved: acc.approved + row.approved,
        rejected: acc.rejected + row.rejected,
        pending: acc.pending + row.pending,
      }),
      { submitted: 0, approved: 0, rejected: 0, pending: 0 }
    );
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-4 h-4 text-primary" />
          Claims Volume by Category
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          January 2026 • All benefit categories
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold tabular-nums">{totals.submitted}</p>
            <p className="text-xs text-muted-foreground">Submitted</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold tabular-nums text-success">{totals.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold tabular-nums text-destructive">{totals.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning/10">
            <p className="text-2xl font-bold tabular-nums text-warning">{totals.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CLAIMS_VOLUME_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="approved" stackId="a" fill={CHART_COLORS.approved} name="Approved" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill={CHART_COLORS.pending} name="Pending" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rejected" stackId="a" fill={CHART_COLORS.rejected} name="Rejected" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PayableByCategoryReport() {
  const totals = useMemo(() => {
    return PAYABLE_BY_CATEGORY_DATA.reduce(
      (acc, row) => ({
        paid: acc.paid + row.paid,
        pending: acc.pending + row.pending,
      }),
      { paid: 0, pending: 0 }
    );
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4 text-primary" />
          Total Payable by Category
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Paid vs Pending • YTD 2026
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-xl font-bold tabular-nums text-success">
              {formatCurrencyAED(totals.paid)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-muted-foreground">Pending Payment</p>
            <p className="text-xl font-bold tabular-nums text-warning">
              {formatCurrencyAED(totals.pending)}
            </p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PAYABLE_BY_CATEGORY_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrencyAED(value)}
              />
              <Legend />
              <Bar dataKey="paid" fill={CHART_COLORS.paid} name="Paid" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" fill={CHART_COLORS.pendingPayment} name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="space-y-2">
          {PAYABLE_BY_CATEGORY_DATA.map((row) => (
            <div key={row.category} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.category}</span>
              <div className="flex items-center gap-4">
                <span className="tabular-nums text-success">{formatCurrencyAED(row.paid)}</span>
                <span className="tabular-nums text-warning w-24 text-right">
                  {formatCurrencyAED(row.pending)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SLAPerformanceReport() {
  const pieData = [
    { name: 'On Time', value: SLA_PERFORMANCE_DATA.onTime, color: CHART_COLORS.approved },
    { name: 'At Risk', value: SLA_PERFORMANCE_DATA.atRisk, color: CHART_COLORS.pending },
    { name: 'Breached', value: SLA_PERFORMANCE_DATA.breached, color: CHART_COLORS.rejected },
  ];

  const total = SLA_PERFORMANCE_DATA.onTime + SLA_PERFORMANCE_DATA.atRisk + SLA_PERFORMANCE_DATA.breached;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4 text-primary" />
          SLA Performance Summary
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Target: {SLA_PERFORMANCE_DATA.targetHours}h • January 2026
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border bg-success/5 border-success/20 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums text-success">{SLA_PERFORMANCE_DATA.onTime}</p>
            <p className="text-[10px] text-muted-foreground">On Time</p>
          </div>
          <div className="p-3 rounded-lg border bg-warning/5 border-warning/20 text-center">
            <Hourglass className="w-5 h-5 mx-auto mb-1 text-warning" />
            <p className="text-xl font-bold tabular-nums text-warning">{SLA_PERFORMANCE_DATA.atRisk}</p>
            <p className="text-[10px] text-muted-foreground">At Risk</p>
          </div>
          <div className="p-3 rounded-lg border bg-destructive/5 border-destructive/20 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <p className="text-xl font-bold tabular-nums text-destructive">{SLA_PERFORMANCE_DATA.breached}</p>
            <p className="text-[10px] text-muted-foreground">Breached</p>
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-3xl font-bold tabular-nums">{SLA_PERFORMANCE_DATA.percentOnTime}%</p>
          <p className="text-sm text-muted-foreground">SLA Compliance Rate</p>
          <Badge className="mt-2 bg-success/10 text-success border-success/30" variant="outline">
            Above 90% Target
          </Badge>
        </div>

        {/* Pie Chart */}
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} claims`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-lg border">
            <p className="text-lg font-bold tabular-nums">{SLA_PERFORMANCE_DATA.avgProcessingHours}h</p>
            <p className="text-xs text-muted-foreground">Avg. Processing Time</p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="text-lg font-bold tabular-nums">{SLA_PERFORMANCE_DATA.medianCycleTime} days</p>
            <p className="text-xs text-muted-foreground">Median Cycle Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
