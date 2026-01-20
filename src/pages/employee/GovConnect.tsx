import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink, Fingerprint, Briefcase, MapPin, Heart, Phone, AlertTriangle, Info } from 'lucide-react';
import { GOV_CONNECT_CATEGORIES } from '@/lib/constants';
import { DataDisclaimer } from '@/components/employee/DataConfidenceChip';
import { PageHeader } from '@/components/shared/PageHeader';

const icons: Record<string, any> = { identity: Fingerprint, employment: Briefcase, local: MapPin, health: Heart, telecom: Phone };

export default function GovConnectPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gov Connect"
        description="Quick access to UAE government and service portals"
        icon={Building2}
        iconClassName="from-accent to-accent/80 shadow-accent/25"
      />

      {/* Disclaimer */}
      <DataDisclaimer>
        <strong>Informational only.</strong> This page provides links to external government portals for your convenience. 
        For any actions requiring HR assistance (visa processing, work permit renewals, dependent sponsorship), 
        please <a href="/employee/requests?type=request" className="text-accent underline">submit a request</a> to your HR team.
      </DataDisclaimer>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GOV_CONNECT_CATEGORIES.map((category) => {
          const Icon = icons[category.id] || Building2;
          return (
            <Card key={category.id} className="benefit-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10"><Icon className="w-5 h-5 text-accent" /></div>
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <div className="space-y-2">
                  {category.links.map((link) => (
                    <Button key={link.name} size="sm" variant="outline" className="w-full justify-between" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <span>{link.name}</span><ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* HR Action Card */}
      <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Need HR assistance?</p>
              <p className="text-xs text-muted-foreground mt-1">
                For visa processing, work permit renewals, or dependent sponsorship, HR action is required.
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href="/employee/requests?type=request&category=Other">Request HR Help</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
