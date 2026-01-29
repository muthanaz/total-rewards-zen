/**
 * Demo Template Manager
 * 
 * Shows policies tagged as "DEMO TEMPLATE" and provides
 * controls for managing demo-specific configuration.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Tag, 
  Copy, 
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';
import { DEMO_BENEFIT_CATEGORIES, DEMO_ORG } from '@/lib/demoData/demoOrganization';

interface DemoPolicy {
  id: string;
  title: string;
  category: string;
  transactionModel: string;
  status: 'published' | 'draft';
  isTemplate: boolean;
}

const DEMO_POLICIES: DemoPolicy[] = DEMO_BENEFIT_CATEGORIES.map(cat => ({
  id: `pol-${cat.id}`,
  title: `${cat.name} Policy`,
  category: cat.name,
  transactionModel: cat.transactionModel.replace('_', ' '),
  status: 'published',
  isTemplate: true,
}));

export function DemoTemplateManager() {
  return (
    <div className="space-y-6">
      {/* Organization Context */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Demo Organization
              </CardTitle>
              <CardDescription>
                Active demo context for all portals
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-info/10 text-info border-info/30">
              DEMO TEMPLATE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Organization</Label>
              <div className="font-semibold">{DEMO_ORG.name}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Region</Label>
              <div className="font-semibold">{DEMO_ORG.city}, {DEMO_ORG.region}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Currency</Label>
              <div className="font-semibold">{DEMO_ORG.currency}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Demo Policy Templates
          </CardTitle>
          <CardDescription>
            Policies pre-configured with realistic UAE benefit structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DEMO_POLICIES.map(policy => (
              <div 
                key={policy.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {policy.title}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-info/10 text-info border-info/30">
                        DEMO
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Tag className="size-3" />
                      {policy.category}
                      <span className="text-muted-foreground/50">•</span>
                      <Clock className="size-3" />
                      {policy.transactionModel}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={policy.status === 'published' ? 'success' : 'secondary'}>
                    {policy.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Behavior Settings</CardTitle>
          <CardDescription>
            Configure how demo mode behaves during presentations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label className="font-medium">Auto-populate forms</Label>
              <p className="text-xs text-muted-foreground">
                Pre-fill claim forms with realistic sample data
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label className="font-medium">Show demo tooltips</Label>
              <p className="text-xs text-muted-foreground">
                Display helpful tips during demo walkthroughs
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label className="font-medium">Realistic claim dates</Label>
              <p className="text-xs text-muted-foreground">
                Spread claim dates over past 60 days for authentic feel
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label className="font-medium">Include edge cases</Label>
              <p className="text-xs text-muted-foreground">
                Add claims with missing docs, overdue SLAs, etc.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
