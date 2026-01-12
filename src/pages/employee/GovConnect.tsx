import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ExternalLink, Fingerprint, Briefcase, MapPin, Heart, Phone } from 'lucide-react';
import { GOV_CONNECT_CATEGORIES } from '@/lib/constants';

const icons: Record<string, any> = { identity: Fingerprint, employment: Briefcase, local: MapPin, health: Heart, telecom: Phone };

export default function GovConnectPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-3"><Building2 className="w-7 h-7 text-accent" />Gov Connect</h1>
        <p className="text-muted-foreground mt-1">Quick access to UAE government and service portals</p>
      </div>
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
    </div>
  );
}
