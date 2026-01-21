/**
 * Policy Editor Sheet V2
 * 
 * Complete policy editor with:
 * - Summary/Details/Examples/FAQs tabs (content)
 * - Policy Logic tab (business rules)
 * - Preview and Publish workflow
 */

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Upload, 
  Eye, 
  CheckCircle, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Info,
  Lightbulb,
  Settings2,
  Loader2,
  Calendar
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PolicyLogicEditor } from './PolicyLogicEditor';
import { useAuditLog } from '@/hooks/useAuditLog';
import {
  PolicyContent,
  PolicyLogic,
  PolicyRequiredDoc,
  DEFAULT_POLICY_CONTENT,
  DEFAULT_POLICY_LOGIC,
} from '@/lib/policyEngine';

interface PolicyEditorSheetV2Props {
  policyId: string;
  versionId: string | null;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PolicyEditorSheetV2({ 
  policyId, 
  versionId, 
  organizationId, 
  open, 
  onOpenChange 
}: PolicyEditorSheetV2Props) {
  const [step, setStep] = useState<'edit' | 'preview' | 'publish'>('edit');
  const [activeTab, setActiveTab] = useState('summary');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  
  // Content state
  const [content, setContent] = useState<PolicyContent>(DEFAULT_POLICY_CONTENT);
  const [logic, setLogic] = useState<PolicyLogic>(DEFAULT_POLICY_LOGIC);
  const [requiredDocs, setRequiredDocs] = useState<PolicyRequiredDoc[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logEvent } = useAuditLog();

  // Fetch policy
  const { data: policy } = useQuery({
    queryKey: ['policy_edit', policyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', policyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!policyId && open,
  });

  // Fetch version
  const { data: version, refetch: refetchVersion } = useQuery({
    queryKey: ['policy_version_edit', versionId],
    queryFn: async () => {
      if (!versionId) return null;
      const { data, error } = await (supabase
        .from('policy_versions' as any)
        .select('*')
        .eq('id', versionId)
        .single()) as any;
      if (error) throw error;
      return data;
    },
    enabled: !!versionId && open,
  });

  // Fetch all versions for this policy
  const { data: allVersions = [] } = useQuery({
    queryKey: ['policy_versions_list', policyId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('policy_versions' as any)
        .select('*')
        .eq('policy_id', policyId)
        .order('version_number', { ascending: false })) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!policyId && open,
  });

  // Load version data into state
  useEffect(() => {
    if (version) {
      const versionContent = version.content_json || DEFAULT_POLICY_CONTENT;
      const versionLogic = version.logic_json || DEFAULT_POLICY_LOGIC;
      
      setContent({
        summary: versionContent.summary || [],
        details: versionContent.details || '',
        examples: versionContent.examples || [],
        faqs: versionContent.faqs || [],
        pitfalls: versionContent.pitfalls || [],
      });
      
      setLogic({
        transaction_model: versionLogic.transaction_model || 'claim_only',
        eligibility_rules: {
          ...DEFAULT_POLICY_LOGIC.eligibility_rules,
          ...versionLogic.eligibility_rules,
        },
        limits_caps: {
          ...DEFAULT_POLICY_LOGIC.limits_caps,
          ...versionLogic.limits_caps,
        },
        workflow: {
          ...DEFAULT_POLICY_LOGIC.workflow,
          ...versionLogic.workflow,
        },
      });
      
      setAttachmentUrl(version.attachment_url || '');
      if (version.effective_from) {
        setEffectiveFrom(version.effective_from);
      }
    }
  }, [version]);

  // Fetch required docs
  useEffect(() => {
    if (versionId && open) {
      (supabase
        .from('policy_required_docs' as any)
        .select('*')
        .eq('policy_version_id', versionId) as any)
        .then(({ data }: any) => {
          setRequiredDocs((data || []) as PolicyRequiredDoc[]);
        });
    }
  }, [versionId, open]);

  const handleSave = async () => {
    if (!versionId) return;
    setIsSaving(true);

    try {
      // Update version content and logic
      const { error: updateError } = await (supabase
        .from('policy_versions' as any)
        .update({
          content_json: content,
          logic_json: logic,
          attachment_url: attachmentUrl || null,
          last_updated_at: new Date().toISOString(),
        } as any)
        .eq('id', versionId)) as any;

      if (updateError) throw updateError;

      // Update required docs
      await (supabase
        .from('policy_required_docs' as any)
        .delete()
        .eq('policy_version_id', versionId)) as any;

      if (requiredDocs.length > 0) {
        await (supabase
          .from('policy_required_docs' as any)
          .insert(requiredDocs.map(d => ({
            policy_version_id: versionId,
            transaction_type: d.transaction_type,
            doc_type: d.doc_type,
            doc_name: d.doc_name,
            is_required: d.is_required,
            conditions_json: d.conditions_json || {},
            description: d.description,
          })) as any)) as any;
      }

      queryClient.invalidateQueries({ queryKey: ['policy_version_edit'] });
      
      // Audit log for save draft
      await logEvent({
        action: 'POLICY_SAVE_DRAFT',
        resourceType: 'policy',
        resourceId: policyId,
        details: {
          version_id: versionId,
          transaction_model: logic.transaction_model,
        },
      });
      
      toast.success('Draft saved');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!versionId || !policyId) return;
    setIsPublishing(true);

    try {
      // First, save current changes
      await handleSave();

      // Archive any currently published version
      const { error: archiveError } = await (supabase
        .from('policy_versions' as any)
        .update({
          status: 'archived',
          effective_to: effectiveFrom,
        } as any)
        .eq('policy_id', policyId)
        .eq('status', 'published')) as any;

      if (archiveError) throw archiveError;

      // Publish this version
      const { error: publishError } = await (supabase
        .from('policy_versions' as any)
        .update({
          status: 'published',
          effective_from: effectiveFrom,
          last_updated_at: new Date().toISOString(),
        } as any)
        .eq('id', versionId)) as any;

      if (publishError) throw publishError;

      // Update parent policy
      await supabase
        .from('policies')
        .update({
          status: 'active',
          effective_from: effectiveFrom,
        })
        .eq('id', policyId);

      queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      
      // Audit log for publish
      await logEvent({
        action: 'POLICY_PUBLISH',
        resourceType: 'policy',
        resourceId: policyId,
        details: {
          version_id: versionId,
          effective_from: effectiveFrom,
          transaction_model: logic.transaction_model,
          organization_id: organizationId,
        },
      });
      
      toast.success('Policy published!', {
        description: 'Employees can now see this policy.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogicChange = (newLogic: PolicyLogic, newDocs: PolicyRequiredDoc[]) => {
    setLogic(newLogic);
    setRequiredDocs(newDocs);
  };

  // Content handlers
  const addSummaryBullet = () => setContent(c => ({ ...c, summary: [...c.summary, ''] }));
  const removeSummaryBullet = (i: number) => setContent(c => ({ ...c, summary: c.summary.filter((_, idx) => idx !== i) }));
  const updateSummaryBullet = (i: number, v: string) => {
    const newSummary = [...content.summary];
    newSummary[i] = v;
    setContent(c => ({ ...c, summary: newSummary }));
  };

  const addExample = () => setContent(c => ({ ...c, examples: [...c.examples, ''] }));
  const removeExample = (i: number) => setContent(c => ({ ...c, examples: c.examples.filter((_, idx) => idx !== i) }));
  const updateExample = (i: number, v: string) => {
    const newExamples = [...content.examples];
    newExamples[i] = v;
    setContent(c => ({ ...c, examples: newExamples }));
  };

  const addPitfall = () => setContent(c => ({ ...c, pitfalls: [...c.pitfalls, ''] }));
  const removePitfall = (i: number) => setContent(c => ({ ...c, pitfalls: c.pitfalls.filter((_, idx) => idx !== i) }));
  const updatePitfall = (i: number, v: string) => {
    const newPitfalls = [...content.pitfalls];
    newPitfalls[i] = v;
    setContent(c => ({ ...c, pitfalls: newPitfalls }));
  };

  const addFaq = () => setContent(c => ({ ...c, faqs: [...c.faqs, { question: '', answer: '' }] }));
  const removeFaq = (i: number) => setContent(c => ({ ...c, faqs: c.faqs.filter((_, idx) => idx !== i) }));
  const updateFaq = (i: number, field: 'question' | 'answer', v: string) => {
    const newFaqs = [...content.faqs];
    newFaqs[i] = { ...newFaqs[i], [field]: v };
    setContent(c => ({ ...c, faqs: newFaqs }));
  };

  const currentVersionNumber = version?.version_number || 1;
  const publishedVersion = allVersions.find((v: any) => v.status === 'published');
  const isDraft = version?.status === 'draft';

  if (!policy) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl p-0 flex flex-col h-full">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <SheetTitle>{policy.title}</SheetTitle>
          </div>
          <SheetDescription>
            {step === 'edit' && 'Edit policy content and business rules'}
            {step === 'preview' && 'Preview how employees will see this policy'}
            {step === 'publish' && 'Confirm and publish this version'}
          </SheetDescription>

          <div className="flex items-center gap-2 mt-2">
            {publishedVersion && (
              <Badge variant="outline">
                Published: v{publishedVersion.version_number}
              </Badge>
            )}
            <Badge className={isDraft ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}>
              Editing: v{currentVersionNumber} {isDraft ? '(Draft)' : ''}
            </Badge>
          </div>
        </SheetHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-4 px-6 py-3 border-b bg-muted/30">
          {['edit', 'preview', 'publish'].map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(s as typeof step)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === s 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                {i + 1}
              </span>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {step === 'edit' && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                  <TabsTrigger value="logic" className="gap-1">
                    <Settings2 className="w-3 h-3" />
                    Logic
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Employee-Facing Summary (6-10 bullets)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {content.summary.map((bullet, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-primary">•</span>
                          <Input
                            value={bullet}
                            onChange={(e) => updateSummaryBullet(i, e.target.value)}
                            placeholder="Enter policy bullet point..."
                            className="flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeSummaryBullet(i)} disabled={content.summary.length <= 1}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      {content.summary.length < 10 && (
                        <Button variant="outline" size="sm" onClick={addSummaryBullet}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Bullet
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Policy Details / Full Description</Label>
                      <Textarea
                        value={content.details}
                        onChange={(e) => setContent(c => ({ ...c, details: e.target.value }))}
                        placeholder="Detailed policy description, eligibility criteria, terms and conditions..."
                        rows={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Attach PDF (optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={attachmentUrl}
                          onChange={(e) => setAttachmentUrl(e.target.value)}
                          placeholder="https://storage.example.com/policy.pdf"
                        />
                        <Button variant="outline" size="icon">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="examples" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Real-World Examples
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {content.examples.map((ex, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Textarea
                            value={ex}
                            onChange={(e) => updateExample(i, e.target.value)}
                            placeholder="Describe a realistic example..."
                            rows={2}
                            className="flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeExample(i)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addExample}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Example
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Common Pitfalls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {content.pitfalls.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-red-500">⚠️</span>
                          <Input
                            value={p}
                            onChange={(e) => updatePitfall(i, e.target.value)}
                            placeholder="What should employees avoid..."
                            className="flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removePitfall(i)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addPitfall}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Pitfall
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="faqs" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {content.faqs.map((faq, i) => (
                        <div key={i} className="p-3 rounded-lg border space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Question {i + 1}</Label>
                            <Button variant="ghost" size="sm" onClick={() => removeFaq(i)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFaq(i, 'question', e.target.value)}
                            placeholder="Enter question..."
                          />
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                            placeholder="Enter answer..."
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addFaq}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add FAQ
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logic" className="space-y-4">
                  <PolicyLogicEditor
                    logic={logic}
                    requiredDocs={requiredDocs}
                    onChange={handleLogicChange}
                  />
                </TabsContent>
              </Tabs>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                <Card className="border-primary/20">
                  <CardHeader className="pb-3 bg-primary/5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Employee View Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">{policy.title}</h3>
                      <ul className="space-y-2">
                        {content.summary.filter(Boolean).map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {content.details && (
                      <div>
                        <h4 className="font-medium mb-2">Details</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content.details}</p>
                      </div>
                    )}

                    {content.examples.filter(Boolean).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Examples</h4>
                        <div className="space-y-2">
                          {content.examples.filter(Boolean).map((ex, i) => (
                            <p key={i} className="text-sm bg-muted/50 p-2 rounded">{ex}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {content.faqs.filter(f => f.question && f.answer).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">FAQs</h4>
                        <div className="space-y-3">
                          {content.faqs.filter(f => f.question && f.answer).map((faq, i) => (
                            <div key={i} className="text-sm">
                              <p className="font-medium">Q: {faq.question}</p>
                              <p className="text-muted-foreground">A: {faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 'publish' && (
              <div className="space-y-6">
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    You are about to publish version {currentVersionNumber} of this policy.
                    {publishedVersion && ` Version ${publishedVersion.version_number} will be archived.`}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="effectiveFrom" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Effective From
                    </Label>
                    <Input
                      id="effectiveFrom"
                      type="date"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Employees will see this policy starting from this date
                    </p>
                  </div>
                </div>

                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="pt-4">
                    <p className="text-sm">
                      <strong>Note:</strong> Once published, this policy will be immediately visible to all employees.
                      The previous published version (if any) will be archived.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t bg-background">
          <div className="flex w-full justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              {step === 'edit' && (
                <>
                  <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Draft
                  </Button>
                  <Button onClick={() => setStep('preview')}>
                    Preview
                  </Button>
                </>
              )}
              {step === 'preview' && (
                <>
                  <Button variant="outline" onClick={() => setStep('edit')}>
                    Back to Edit
                  </Button>
                  <Button onClick={() => setStep('publish')}>
                    Continue to Publish
                  </Button>
                </>
              )}
              {step === 'publish' && (
                <>
                  <Button variant="outline" onClick={() => setStep('preview')}>
                    Back
                  </Button>
                  <Button onClick={handlePublish} disabled={isPublishing}>
                    {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Publish v{currentVersionNumber}
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
