import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Building2, 
  Store, 
  Tag, 
  FileText,
  CheckCircle2,
  Loader2,
  Trash2,
  Play,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedAdminData, checkIfSeeded, clearSeedData, DEMO_ORG_IDS } from '@/lib/adminSeedData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminSeedData() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSeeded, setIsSeeded] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string; counts: Record<string, number> } | null>(null);

  useEffect(() => {
    checkSeedStatus();
  }, []);

  const checkSeedStatus = async () => {
    const seeded = await checkIfSeeded();
    setIsSeeded(seeded);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 200);

    const seedResult = await seedAdminData();

    clearInterval(progressInterval);
    setProgress(100);
    setResult(seedResult);
    setIsSeeding(false);

    if (seedResult.success) {
      setIsSeeded(true);
      toast({
        title: 'Seed Data Inserted',
        description: seedResult.message,
      });
    } else {
      toast({
        title: 'Seeding Failed',
        description: seedResult.message,
        variant: 'destructive',
      });
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    const clearResult = await clearSeedData();
    setIsClearing(false);

    if (clearResult.success) {
      setIsSeeded(false);
      setResult(null);
      toast({
        title: 'Seed Data Cleared',
        description: 'All demo organizations, vendors, and offers have been removed.',
      });
    } else {
      toast({
        title: 'Clear Failed',
        description: clearResult.message,
        variant: 'destructive',
      });
    }
  };

  const seedItems = [
    {
      icon: Building2,
      label: 'Organizations',
      count: 3,
      description: '2 active (AD, DXB) + 1 suspended',
      color: 'text-primary',
    },
    {
      icon: Store,
      label: 'Vendors',
      count: 6,
      description: '4 active, 1 pending, 1 suspended',
      color: 'text-accent',
    },
    {
      icon: Tag,
      label: 'Marketplace Offers',
      count: 20,
      description: 'Wellness, Learning, Family, Transport, Food',
      color: 'text-success',
    },
    {
      icon: FileText,
      label: 'Audit Logs',
      count: 12,
      description: 'Flag toggles, approvals, suspensions',
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Admin Demo Seed Data</CardTitle>
              <CardDescription>
                Pre-configured organizations, vendors, offers, and audit logs for realistic demos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Banner */}
          {isSeeded === true && (
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">Seed Data Active</AlertTitle>
              <AlertDescription className="text-success/80">
                Demo data is present in the database. You can view it in Organizations, Vendors, and Audit Log pages.
              </AlertDescription>
            </Alert>
          )}

          {isSeeded === false && (
            <Alert className="bg-muted border-border">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <AlertTitle>No Seed Data</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                The database does not contain demo seed data. Click "Seed Database" to populate.
              </AlertDescription>
            </Alert>
          )}

          {/* What Gets Seeded */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seedItems.map((item) => (
              <div key={item.label} className="p-4 rounded-lg border bg-card hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                <p className="text-2xl font-bold mb-1">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Feature Flags Preview */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <h3 className="font-semibold text-sm">Feature Flag Configuration</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="font-medium text-sm">bnft.demo (AD)</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">marketplace</Badge>
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">govconnect</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">bnft.demo (DXB)</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">marketplace</Badge>
                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">govconnect ✗</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">bnft.demo (Suspended)</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">blocked by suspension</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Offer Validity Preview */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <h3 className="font-semibold text-sm">Offer Validity Testing</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-success/10 text-success border-success/30">Active</Badge>
                <span className="text-muted-foreground">15 offers within valid window</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-destructive/10 text-destructive border-destructive/30">Expired</Badge>
                <span className="text-muted-foreground">2 offers past valid_to date</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/30">Upcoming</Badge>
                <span className="text-muted-foreground">3 offers with future valid_from</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          {isSeeding && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Inserting demo data... {progress}%
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg border ${result.success ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                )}
                <span className={`font-medium ${result.success ? 'text-success' : 'text-destructive'}`}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{result.message}</p>
              {result.success && Object.keys(result.counts).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(result.counts).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleSeed} 
              disabled={isSeeding || isClearing}
              className="gap-2"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Seed Database
                </>
              )}
            </Button>

            {isSeeded && (
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={isSeeding || isClearing}
                className="gap-2 text-destructive hover:text-destructive"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Clear Seed Data
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Organization IDs for Reference */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-medium text-sm mb-2">Organization IDs (for testing)</h4>
            <div className="font-mono text-xs space-y-1 text-muted-foreground">
              <p>AD: <span className="text-foreground">{DEMO_ORG_IDS.AD}</span></p>
              <p>DXB: <span className="text-foreground">{DEMO_ORG_IDS.DXB}</span></p>
              <p>Suspended: <span className="text-foreground">{DEMO_ORG_IDS.SUSPENDED}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
