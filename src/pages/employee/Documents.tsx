import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Eye, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DOCUMENT_TYPES } from '@/lib/constants';

export default function DocumentsPage() {
  const { toast } = useToast();
  const [previewDoc, setPreviewDoc] = useState<typeof DOCUMENT_TYPES[0] | null>(null);
  const recentDocs = [
    { type: 'Salary Certificate (Bank)', date: 'Jan 5, 2026' },
    { type: 'Employment Letter', date: 'Dec 15, 2025' },
  ];

  const handleDownload = (doc: typeof DOCUMENT_TYPES[0]) => {
    toast({ title: "Document Generated", description: `${doc.name} has been generated and downloaded.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-3"><FileText className="w-7 h-7 text-accent" />HR Documents</h1>
        <p className="text-muted-foreground mt-1">Generate and download official documents</p>
      </div>
      
      {recentDocs.length > 0 && (
        <Card><CardHeader><CardTitle className="text-base font-display">Recent Documents</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">
            {recentDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-success" /><span className="text-sm font-medium">{doc.type}</span></div>
                <span className="text-xs text-muted-foreground">{doc.date}</span>
              </div>
            ))}
          </div></CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((doc) => (
          <Card key={doc.id} className="benefit-card">
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10"><FileText className="w-5 h-5 text-accent" /></div>
                <div><h3 className="font-medium text-sm">{doc.name}</h3><p className="text-xs text-muted-foreground">{doc.description}</p></div>
              </div>
              <div className="flex gap-2">
                <Dialog><DialogTrigger asChild><Button size="sm" variant="outline" className="flex-1"><Eye className="w-3.5 h-3.5 mr-1" />Preview</Button></DialogTrigger>
                  <DialogContent><DialogHeader><DialogTitle>{doc.name}</DialogTitle></DialogHeader>
                    <div className="p-6 bg-muted rounded-lg text-sm space-y-4">
                      <p className="font-medium">DEMO COMPANY LLC</p>
                      <p>To Whom It May Concern,</p>
                      <p>This is to certify that <strong>John Smith</strong> is employed with Demo Company LLC as <strong>Senior Product Manager</strong> since <strong>January 2023</strong>.</p>
                      <p>Monthly Salary: <strong>AED 35,000</strong></p>
                      <p className="text-muted-foreground text-xs mt-4">This document is auto-generated for demonstration purposes.</p>
                    </div>
                    <Button onClick={() => handleDownload(doc)}><Download className="w-4 h-4 mr-2" />Download PDF</Button>
                  </DialogContent>
                </Dialog>
                <Button size="sm" className="flex-1" onClick={() => handleDownload(doc)}><Download className="w-3.5 h-3.5 mr-1" />Download</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
