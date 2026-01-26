import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface WorkflowSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowType: string;
  workflows: any[];
}

export function WorkflowSimulator({ open, onOpenChange, workflowType, workflows }: WorkflowSimulatorProps) {
  const [amount, setAmount] = useState('5000');
  const [result, setResult] = useState<string | null>(null);

  const handleSimulate = () => {
    const defaultWorkflow = workflows.find(w => w.is_default) || workflows[0];
    if (defaultWorkflow) {
      setResult(`Request will be routed through "${defaultWorkflow.name}" workflow`);
    } else {
      setResult('No workflow configured - request will go to default queue');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Workflow Simulator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter sample request attributes to see which workflow it will follow.
          </p>
          <div>
            <Label>Amount (AED)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <Button onClick={handleSimulate} className="w-full gap-2">
            <Play className="w-4 h-4" />
            Simulate
          </Button>
          {result && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <p className="text-sm">{result}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
