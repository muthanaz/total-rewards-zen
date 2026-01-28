/**
 * Required Documents Section Component
 * 
 * Configure documents required for claims/requests.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import { RequiredDocument, DOCUMENT_TYPES } from './types';

interface RequiredDocsSectionProps {
  documents: RequiredDocument[];
  onChange: (documents: RequiredDocument[]) => void;
}

export function RequiredDocsSection({ documents, onChange }: RequiredDocsSectionProps) {
  const addDocument = () => {
    const newDoc: RequiredDocument = {
      id: `doc-${Date.now()}`,
      docType: 'invoice',
      docName: 'Invoice / Receipt',
      isRequired: true,
      transactionType: 'claim',
    };
    onChange([...documents, newDoc]);
  };

  const updateDocument = (id: string, updates: Partial<RequiredDocument>) => {
    onChange(
      documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    );
  };

  const removeDocument = (id: string) => {
    onChange(documents.filter((doc) => doc.id !== id));
  };

  const handleTypeChange = (id: string, docType: string) => {
    const typeConfig = DOCUMENT_TYPES.find((t) => t.value === docType);
    updateDocument(id, {
      docType,
      docName: typeConfig?.label || docType,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Required Documents
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addDocument} className="gap-1">
            <Plus className="w-3 h-3" />
            Add Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No required documents configured</p>
            <p className="text-xs mt-1">Add documents that employees must submit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20"
              >
                <div className="text-muted-foreground cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Document Type */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select
                      value={doc.docType}
                      onValueChange={(value) => handleTypeChange(doc.id, value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transaction Type */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Required For</Label>
                    <Select
                      value={doc.transactionType}
                      onValueChange={(value: RequiredDocument['transactionType']) =>
                        updateDocument(doc.id, { transactionType: value })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="request">Request Only</SelectItem>
                        <SelectItem value="claim">Claim Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mandatory Toggle */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Mandatory</Label>
                    <div className="flex items-center gap-2 h-8">
                      <Switch
                        checked={doc.isRequired}
                        onCheckedChange={(checked) =>
                          updateDocument(doc.id, { isRequired: checked })
                        }
                      />
                      <Badge variant={doc.isRequired ? 'default' : 'secondary'} className="text-xs">
                        {doc.isRequired ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeDocument(doc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {documents.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <Badge variant="secondary">{documents.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Required:</span>
              <Badge variant="destructive">
                {documents.filter((d) => d.isRequired).length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Optional:</span>
              <Badge variant="outline">
                {documents.filter((d) => !d.isRequired).length}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
