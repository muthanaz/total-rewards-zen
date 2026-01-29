/**
 * Template Card Component
 * Displays a template with download options and quick info
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, FileSpreadsheet, ChevronDown, ChevronUp, 
  CheckCircle, AlertTriangle, Users, Gift, Wallet, FileText 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { TemplateDefinition } from './templateDefinitions';
import { generateXLSXTemplate, generateCSVTemplate } from './templateGenerator';

const ICONS: Record<string, React.ElementType> = {
  Users,
  Gift,
  Wallet,
  FileText,
};

interface TemplateCardProps {
  template: TemplateDefinition;
  onSelectForUpload: (templateId: string) => void;
}

export function TemplateCard({ template, onSelectForUpload }: TemplateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;
  
  const Icon = ICONS[template.icon] || FileSpreadsheet;
  const requiredFields = template.fields.filter(f => f.required);
  const optionalFields = template.fields.filter(f => !f.required);

  const handleDownloadXLSX = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateXLSXTemplate(template);
  };

  const handleDownloadCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateCSVTemplate(template);
  };

  return (
    <Card 
      className={cn(
        'transition-all cursor-pointer hover:shadow-md',
        isExpanded && 'ring-2 ring-primary/30'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader className="pb-3">
        <div className={cn('flex items-start justify-between gap-4', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <CardTitle className="text-base">
                {t(template.name, template.nameAr)}
              </CardTitle>
              <CardDescription className="mt-0.5">
                {t(template.description, template.descriptionAr)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs">
              {template.fields.length} fields
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t pt-4 space-y-4">
          {/* Required Fields */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-success" />
              Required Fields ({requiredFields.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {requiredFields.map(field => (
                <Badge key={field.name} variant="secondary" className="text-xs font-mono">
                  {field.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Optional Fields ({optionalFields.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {optionalFields.map(field => (
                <Badge key={field.name} variant="outline" className="text-xs font-mono">
                  {field.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes Preview */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-warning" />
              Important Notes
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {template.notes.slice(0, 3).map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground/50">•</span>
                  {note}
                </li>
              ))}
              {template.notes.length > 3 && (
                <li className="text-primary text-xs">
                  +{template.notes.length - 3} more in template
                </li>
              )}
            </ul>
          </div>

          {/* Example Data Preview */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Example Data (included in template)
            </p>
            <div className="overflow-x-auto border rounded-md">
              <table className="text-xs w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {template.fields.slice(0, 5).map(f => (
                      <th key={f.name} className="p-2 text-left font-medium whitespace-nowrap">
                        {f.name}
                        {f.required && <span className="text-destructive ml-0.5">*</span>}
                      </th>
                    ))}
                    {template.fields.length > 5 && (
                      <th className="p-2 text-left font-medium text-muted-foreground">...</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {template.exampleRows.slice(0, 2).map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {template.fields.slice(0, 5).map(f => (
                        <td key={f.name} className="p-2 whitespace-nowrap text-muted-foreground">
                          {String(row[f.name] ?? '')}
                        </td>
                      ))}
                      {template.fields.length > 5 && (
                        <td className="p-2 text-muted-foreground/50">...</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className={cn('flex gap-2 pt-2', isRTL && 'flex-row-reverse')}>
            <Button variant="outline" size="sm" onClick={handleDownloadXLSX}>
              <Download className="w-4 h-4 mr-1.5" />
              Download XLSX
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              CSV
            </Button>
            <Button 
              size="sm" 
              className="ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                onSelectForUpload(template.id);
              }}
            >
              Upload Data
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
