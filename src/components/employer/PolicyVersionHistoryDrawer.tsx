/**
 * Policy Version History Drawer
 * 
 * Shows complete version history with:
 * - All versions (draft, published, archived)
 * - Change summaries
 * - Version comparison
 * - Editor and timestamp for each version
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle,
  Clock,
  Archive,
  GitCompare,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';

interface PolicyVersionHistoryDrawerProps {
  policyId: string;
  policyTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PolicyVersionRow {
  id: string;
  version_number: number;
  status: string;
  effective_from: string | null;
  effective_to: string | null;
  created_at: string;
  last_updated_at: string;
  created_by: string | null;
  content_json: any;
  logic_json: any;
  change_summary?: string;
}

export function PolicyVersionHistoryDrawer({
  policyId,
  policyTitle,
  open,
  onOpenChange,
}: PolicyVersionHistoryDrawerProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // Fetch all versions for this policy
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['policy_versions_history', policyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('policy_id', policyId)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data as PolicyVersionRow[];
    },
    enabled: !!policyId && open,
  });

  // Fetch editor profiles
  const editorIds = [...new Set(versions.map(v => v.created_by).filter(Boolean))];
  const { data: editors = [] } = useQuery({
    queryKey: ['policy_editors', editorIds],
    queryFn: async () => {
      if (editorIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', editorIds);
      if (error) throw error;
      return data || [];
    },
    enabled: editorIds.length > 0 && open,
  });

  const getEditorName = (userId: string | null) => {
    if (!userId) return 'System';
    const editor = editors.find(e => e.user_id === userId);
    if (!editor) return 'Unknown';
    return editor.first_name && editor.last_name 
      ? `${editor.first_name} ${editor.last_name}`
      : editor.email || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" /> Published</Badge>;
      case 'draft':
        return <Badge className="bg-warning/10 text-warning border-warning/20"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-info/10 text-info border-info/20"><Clock className="w-3 h-3 mr-1" /> Pending Approval</Badge>;
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'archived':
        return <Badge className="bg-muted text-muted-foreground"><Archive className="w-3 h-3 mr-1" /> Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(prev => prev.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionId]);
    }
  };

  const getChangeSummary = (version: PolicyVersionRow, prevVersion?: PolicyVersionRow) => {
    if (!prevVersion) return 'Initial version created';
    
    const changes: string[] = [];
    
    // Compare content
    const currContent = version.content_json || {};
    const prevContent = prevVersion.content_json || {};
    
    if (JSON.stringify(currContent.summary) !== JSON.stringify(prevContent.summary)) {
      changes.push('Summary bullets updated');
    }
    if (currContent.details !== prevContent.details) {
      changes.push('Details modified');
    }
    if (JSON.stringify(currContent.faqs) !== JSON.stringify(prevContent.faqs)) {
      changes.push('FAQs updated');
    }
    
    // Compare logic
    const currLogic = version.logic_json || {};
    const prevLogic = prevVersion.logic_json || {};
    
    if (JSON.stringify(currLogic.eligibility_rules) !== JSON.stringify(prevLogic.eligibility_rules)) {
      changes.push('Eligibility rules changed');
    }
    if (JSON.stringify(currLogic.limits_caps) !== JSON.stringify(prevLogic.limits_caps)) {
      changes.push('Limits/caps modified');
    }
    if (currLogic.transaction_model !== prevLogic.transaction_model) {
      changes.push('Transaction model changed');
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Minor updates';
  };

  const publishedVersion = versions.find(v => v.status === 'published');
  const currentDraft = versions.find(v => v.status === 'draft' || v.status === 'submitted' || v.status === 'approved');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <SheetTitle>Version History</SheetTitle>
          </div>
          <SheetDescription>{policyTitle}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Compare mode toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </div>
            <Button 
              variant={compareMode ? 'default' : 'outline'} 
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedVersions([]);
              }}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              {compareMode ? 'Exit Compare' : 'Compare Versions'}
            </Button>
          </div>

          {compareMode && selectedVersions.length === 2 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">v{versions.find(v => v.id === selectedVersions[0])?.version_number}</Badge>
                  <ArrowRight className="w-4 h-4" />
                  <Badge variant="outline">v{versions.find(v => v.id === selectedVersions[1])?.version_number}</Badge>
                  <Button size="sm" className="ml-auto">View Diff</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading versions...</div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No versions found</div>
              ) : (
                versions.map((version, idx) => {
                  const prevVersion = versions[idx + 1];
                  const isSelected = selectedVersions.includes(version.id);
                  
                  return (
                    <Card 
                      key={version.id}
                      className={`relative ${isSelected ? 'ring-2 ring-primary' : ''} ${compareMode ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                      onClick={() => compareMode && toggleVersionSelection(version.id)}
                    >
                      {compareMode && (
                        <div className="absolute top-3 right-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </div>
                      )}
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">v{version.version_number}</Badge>
                            {getStatusBadge(version.status)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {/* Change summary */}
                        <div className="text-sm text-muted-foreground">
                          {getChangeSummary(version, prevVersion)}
                        </div>
                        
                        {/* Effective dates */}
                        {version.effective_from && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Effective: {format(new Date(version.effective_from), 'MMM d, yyyy')}</span>
                            {version.effective_to && (
                              <span>→ {format(new Date(version.effective_to), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        )}
                        
                        {/* Editor and timestamp */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{getEditorName(version.created_by)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(version.last_updated_at || version.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
