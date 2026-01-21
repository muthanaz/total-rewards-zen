/**
 * Integration Field Mapping View
 * 
 * Shows mapped/unmapped fields per integration source with preview.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Link2, 
  Unlink, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Eye,
  Save,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldMapping {
  id: string;
  targetField: string;
  targetDescription: string;
  sourceField?: string;
  required: boolean;
  status: 'mapped' | 'unmapped' | 'suggested';
  sampleValue?: string;
}

interface IntegrationFieldMappingViewProps {
  integrationId: string;
  integrationName: string;
  fields: FieldMapping[];
  sourceFields: string[];
  onSaveMapping?: (mappings: Record<string, string>) => void;
}

export function IntegrationFieldMappingView({
  integrationId,
  integrationName,
  fields,
  sourceFields,
  onSaveMapping,
}: IntegrationFieldMappingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mappings, setMappings] = useState<Record<string, string>>(
    Object.fromEntries(
      fields
        .filter(f => f.sourceField)
        .map(f => [f.id, f.sourceField!])
    )
  );
  const [showPreview, setShowPreview] = useState(false);

  const mappedCount = Object.keys(mappings).length;
  const requiredFields = fields.filter(f => f.required);
  const requiredMapped = requiredFields.filter(f => mappings[f.id]).length;
  const coveragePercent = Math.round((mappedCount / fields.length) * 100);

  const filteredFields = fields.filter(f =>
    f.targetField.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.targetDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMappingChange = (fieldId: string, sourceField: string) => {
    setMappings(prev => ({
      ...prev,
      [fieldId]: sourceField,
    }));
  };

  const handleAutoMap = () => {
    // Simple auto-mapping based on field name similarity
    const newMappings = { ...mappings };
    fields.forEach(field => {
      if (!newMappings[field.id]) {
        const match = sourceFields.find(sf => 
          sf.toLowerCase().includes(field.targetField.toLowerCase().split('_')[0]) ||
          field.targetField.toLowerCase().includes(sf.toLowerCase().replace(/_/g, ''))
        );
        if (match) {
          newMappings[field.id] = match;
        }
      }
    });
    setMappings(newMappings);
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Field Coverage</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={coveragePercent} className="w-24 h-2" />
              <span className="text-sm font-medium">{coveragePercent}%</span>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Required Fields</p>
            <p className={cn(
              "text-sm font-medium",
              requiredMapped === requiredFields.length ? "text-success" : "text-warning"
            )}>
              {requiredMapped}/{requiredFields.length} mapped
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoMap} className="gap-1">
            <Sparkles className="w-3 h-3" />
            Auto-map
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1">
            <Eye className="w-3 h-3" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button size="sm" onClick={() => onSaveMapping?.(mappings)} className="gap-1">
            <Save className="w-3 h-3" />
            Save Mappings
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mapping Table */}
      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Target Field</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[200px]">Source Field</TableHead>
              {showPreview && <TableHead>Sample Value</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFields.map((field) => {
              const isMapped = !!mappings[field.id];
              
              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{field.targetField}</span>
                        {field.required && (
                          <Badge variant="outline" className="text-[10px] px-1">Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{field.targetDescription}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isMapped ? (
                      <Badge className="bg-success/10 text-success border-0 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Mapped
                      </Badge>
                    ) : field.required ? (
                      <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <Unlink className="w-3 h-3" />
                        Unmapped
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mappings[field.id] || ''}
                      onValueChange={(v) => handleMappingChange(field.id, v)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select source field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {sourceFields.map((sf) => (
                          <SelectItem key={sf} value={sf}>{sf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  {showPreview && (
                    <TableCell>
                      <span className="text-sm text-muted-foreground font-mono">
                        {field.sampleValue || '—'}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
