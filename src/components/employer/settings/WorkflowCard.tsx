import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Star, ChevronRight } from 'lucide-react';

interface WorkflowCardProps {
  workflow: any;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export function WorkflowCard({ workflow, isDefault, onEdit, onDelete, onSetDefault }: WorkflowCardProps) {
  const stepsCount = workflow.workflow_steps?.length || 0;

  return (
    <Card className={isDefault ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{workflow.name}</h3>
                {isDefault && <Badge className="bg-primary/10 text-primary">Default</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stepsCount} step{stepsCount !== 1 ? 's' : ''} • {workflow.enforcement_mode} mode
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isDefault && (
              <Button size="sm" variant="ghost" onClick={onSetDefault}>
                <Star className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
