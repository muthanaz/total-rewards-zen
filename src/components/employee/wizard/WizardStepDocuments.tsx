/**
 * Wizard Step 4: Documents
 * 
 * Shows required documents checklist from policy logic_json.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PolicyRequiredDoc } from '@/lib/policyEngine';
import { FileText, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface UploadedDoc {
  docType: string;
  fileName: string;
  uploaded: boolean;
}

interface WizardStepDocumentsProps {
  requiredDocs: PolicyRequiredDoc[];
  transactionType: 'request' | 'claim';
  enforcementMode: 'soft' | 'strict';
  uploadedDocs: UploadedDoc[];
  onUpload: (docType: string, fileName: string) => void;
}

export function WizardStepDocuments({
  requiredDocs,
  transactionType,
  enforcementMode,
  uploadedDocs,
  onUpload,
}: WizardStepDocumentsProps) {
  // Filter docs by transaction type
  const applicableDocs = requiredDocs.filter(
    (d) => d.transaction_type === transactionType || d.transaction_type === 'both'
  );

  const requiredDocsFiltered = applicableDocs.filter((d) => d.is_required);
  const optionalDocs = applicableDocs.filter((d) => !d.is_required);

  const isDocUploaded = (docType: string) => 
    uploadedDocs.some((d) => d.docType === docType && d.uploaded);

  const requiredMissing = requiredDocsFiltered.filter((d) => !isDocUploaded(d.doc_type));
  const isStrict = enforcementMode === 'strict';

  const handleMockUpload = (docType: string) => {
    // Simulate file upload
    onUpload(docType, `${docType}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Required Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload the required documents for your {transactionType}.
        </p>
      </div>

      {/* Enforcement mode info */}
      {isStrict && requiredMissing.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            All required documents must be uploaded before submitting (strict enforcement).
          </AlertDescription>
        </Alert>
      )}

      {!isStrict && requiredMissing.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can submit without all documents, but missing items may delay processing.
          </AlertDescription>
        </Alert>
      )}

      {/* Required Documents */}
      {requiredDocsFiltered.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Required</h3>
          {requiredDocsFiltered.map((doc) => {
            const uploaded = isDocUploaded(doc.doc_type);
            const uploadInfo = uploadedDocs.find((d) => d.docType === doc.doc_type);

            return (
              <Card 
                key={doc.doc_type} 
                className={cn(
                  'transition-all',
                  uploaded && 'border-success/50 bg-success/5'
                )}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    'p-2 rounded-lg',
                    uploaded ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                  )}>
                    {uploaded ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{doc.doc_name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/50 text-destructive">
                        Required
                      </Badge>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    )}
                    {uploaded && uploadInfo && (
                      <p className="text-xs text-success mt-1">{uploadInfo.fileName}</p>
                    )}
                  </div>

                  <Button
                    variant={uploaded ? 'ghost' : 'outline'}
                    size="sm"
                    onClick={() => handleMockUpload(doc.doc_type)}
                    className="flex-shrink-0"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {uploaded ? 'Replace' : 'Upload'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Optional</h3>
          {optionalDocs.map((doc) => {
            const uploaded = isDocUploaded(doc.doc_type);
            const uploadInfo = uploadedDocs.find((d) => d.docType === doc.doc_type);

            return (
              <Card key={doc.doc_type} className={cn(uploaded && 'border-success/50 bg-success/5')}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    'p-2 rounded-lg',
                    uploaded ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                  )}>
                    {uploaded ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{doc.doc_name}</span>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    )}
                    {uploaded && uploadInfo && (
                      <p className="text-xs text-success mt-1">{uploadInfo.fileName}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMockUpload(doc.doc_type)}
                    className="flex-shrink-0"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {uploaded ? 'Replace' : 'Upload'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* No docs required */}
      {applicableDocs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
            <p>No documents required for this {transactionType}.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WizardStepDocuments;
