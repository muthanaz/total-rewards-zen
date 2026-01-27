import { ExecPageHeader } from '@/components/employer/ExecPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, TrendingUp, Building2, Users } from 'lucide-react';

export default function Benchmarks() {
  return (
    <div className="space-y-6">
      <ExecPageHeader
        title="Benchmarks"
        titleAr="المقارنات المعيارية"
        description="Compare your benefits performance against industry standards"
        descriptionAr="قارن أداء مزاياك بمعايير الصناعة"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Avg Spend</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 42,500</div>
            <p className="text-xs text-muted-foreground">
              Per employee annually
            </p>
            <div className="mt-2 flex items-center text-xs text-success">
              <TrendingUp className="mr-1 h-3 w-3" />
              You're 12% below average (cost efficient)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adoption Rate Benchmark</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              Industry average participation
            </p>
            <div className="mt-2 flex items-center text-xs text-warning">
              Your rate: 54% (room for improvement)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefits Portfolio Score</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">B+</div>
            <p className="text-xs text-muted-foreground">
              Compared to similar companies
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Top quartile in Healthcare coverage
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Coming Soon: Full Benchmark Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed industry comparisons, peer group analysis, and competitive positioning insights 
            will be available here. This includes salary benchmarks, benefits competitiveness scores, 
            and regional market data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
