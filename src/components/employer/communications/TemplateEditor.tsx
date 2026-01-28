import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Variable, 
  Eye,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommunicationTemplate, TEMPLATE_VARIABLES, PURPOSE_CONFIG } from './types';

interface TemplateEditorProps {
  templates: CommunicationTemplate[];
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  customSubject?: string;
  customBody?: string;
  onCustomSubjectChange?: (subject: string) => void;
  onCustomBodyChange?: (body: string) => void;
  showPreview?: boolean;
}

export function TemplateEditor({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  customSubject,
  customBody,
  onCustomSubjectChange,
  onCustomBodyChange,
  showPreview = false,
}: TemplateEditorProps) {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  
  const subject = customSubject ?? selectedTemplate?.subject ?? '';
  const body = customBody ?? selectedTemplate?.bodyHtml ?? '';

  const copyVariable = (key: string) => {
    navigator.clipboard.writeText(`{${key}}`);
    setCopiedVar(key);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  // Simple preview with example values
  const previewContent = useMemo(() => {
    let previewSubject = subject;
    let previewBody = body;
    
    TEMPLATE_VARIABLES.forEach(v => {
      const regex = new RegExp(`\\{${v.key}\\}`, 'g');
      previewSubject = previewSubject.replace(regex, v.example);
      previewBody = previewBody.replace(regex, v.example);
    });
    
    return { subject: previewSubject, body: previewBody };
  }, [subject, body]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Message Template
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-3 h-3" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Choose Template</Label>
          <Select value={selectedTemplateId} onValueChange={onTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(tpl => {
                const config = PURPOSE_CONFIG[tpl.purpose];
                return (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                        {config.label}
                      </Badge>
                      <span>{tpl.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Variable Chips */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Variable className="w-3 h-3" />
            Available Variables (click to copy)
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARIABLES.map(v => (
              <Badge
                key={v.key}
                variant="secondary"
                className="cursor-pointer gap-1 hover:bg-primary/20"
                onClick={() => copyVariable(v.key)}
              >
                {copiedVar === v.key ? (
                  <Check className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {`{${v.key}}`}
              </Badge>
            ))}
          </div>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Subject</p>
              <p className="font-medium">{previewContent.subject}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Body</p>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewContent.body }}
              />
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => onCustomSubjectChange?.(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                value={body.replace(/<[^>]*>/g, '')} // Strip HTML for plain editing
                onChange={(e) => onCustomBodyChange?.(e.target.value)}
                placeholder="Enter message content..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Use variables like {'{first_name}'} which will be replaced with actual values
              </p>
            </div>
          </>
        )}

        {/* Template Variables Info */}
        {selectedTemplate && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Required Variables</p>
            <div className="flex flex-wrap gap-1">
              {selectedTemplate.variables
                .filter(v => v.required)
                .map(v => (
                  <Badge key={v.key} variant="destructive" className="text-[10px]">
                    {v.label}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
