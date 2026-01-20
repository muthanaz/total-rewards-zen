import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Upload, 
  Eye, 
  CheckCircle, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Info,
  Lightbulb
} from 'lucide-react';
import { BenefitPolicy, usePublishPolicyVersion } from '@/hooks/useSharedPolicies';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PolicyEditorSheetProps {
  policy: BenefitPolicy | null;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PolicyDraft {
  bullets: string[];
  eligibility: string;
  limits: string;
  faqs: Array<{ question: string; answer: string }>;
  examples: string[];
  pitfalls: string[];
  attachmentUrl?: string;
}

export function PolicyEditorSheet({ policy, organizationId, open, onOpenChange }: PolicyEditorSheetProps) {
  const [step, setStep] = useState<'edit' | 'preview' | 'publish'>('edit');
  const [draft, setDraft] = useState<PolicyDraft>({
    bullets: policy?.currentVersion?.policy_text?.split('\n').filter(Boolean) || [
      'Coverage applies to employee and registered dependents',
      'Annual allowance resets on January 1st',
      'Claims must be submitted within 30 days of expense',
    ],
    eligibility: 'All permanent employees are eligible after completing probation period.',
    limits: 'Maximum claim per transaction: AED 5,000\nAnnual limit: As per grade entitlement',
    faqs: [
      { question: 'How do I submit a claim?', answer: 'Submit through the employee portal with required documents.' },
      { question: 'What documents are required?', answer: 'Original receipts, prescription (if applicable), and claim form.' },
    ],
    examples: [
      'Example 1: An employee claims AED 500 for a dental checkup - approved within 3 days.',
      'Example 2: An employee claims AED 2,000 for eyewear - requires prescription copy.',
    ],
    pitfalls: [
      'Claims without original receipts will be rejected',
      'Pre-approval required for amounts over AED 3,000',
      'Cosmetic procedures are not covered',
    ],
    attachmentUrl: policy?.currentVersion?.attachment_url || undefined,
  });

  const publishMutation = usePublishPolicyVersion();

  const handleAddBullet = () => {
    setDraft(prev => ({ ...prev, bullets: [...prev.bullets, ''] }));
  };

  const handleRemoveBullet = (index: number) => {
    setDraft(prev => ({ 
      ...prev, 
      bullets: prev.bullets.filter((_, i) => i !== index) 
    }));
  };

  const handleBulletChange = (index: number, value: string) => {
    setDraft(prev => {
      const newBullets = [...prev.bullets];
      newBullets[index] = value;
      return { ...prev, bullets: newBullets };
    });
  };

  const handleAddFaq = () => {
    setDraft(prev => ({ 
      ...prev, 
      faqs: [...prev.faqs, { question: '', answer: '' }] 
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setDraft(prev => ({ 
      ...prev, 
      faqs: prev.faqs.filter((_, i) => i !== index) 
    }));
  };

  const handleAddExample = () => {
    setDraft(prev => ({ ...prev, examples: [...prev.examples, ''] }));
  };

  const handleAddPitfall = () => {
    setDraft(prev => ({ ...prev, pitfalls: [...prev.pitfalls, ''] }));
  };

  const handlePublish = async () => {
    if (!policy?.benefit.id) return;
    
    try {
      // Combine all content into policy_text
      const policyText = [
        '## Summary',
        ...draft.bullets.filter(Boolean).map(b => `• ${b}`),
        '',
        '## Eligibility',
        draft.eligibility,
        '',
        '## Limits',
        draft.limits,
        '',
        '## Examples',
        ...draft.examples.filter(Boolean).map(e => `• ${e}`),
        '',
        '## Common Pitfalls',
        ...draft.pitfalls.filter(Boolean).map(p => `⚠️ ${p}`),
        '',
        '## FAQs',
        ...draft.faqs.filter(f => f.question && f.answer).map(f => `Q: ${f.question}\nA: ${f.answer}`),
      ].join('\n');

      await publishMutation.mutateAsync({
        benefitId: policy.benefit.id,
        organizationId,
        policyText,
        attachmentUrl: draft.attachmentUrl,
      });

      toast.success('Policy published successfully', {
        description: 'Employee-facing views have been updated immediately.',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to publish policy');
    }
  };

  if (!policy) return null;

  const currentVersion = policy.currentVersion;
  const newVersion = (currentVersion?.version || 0) + 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <SheetTitle>{policy.benefit.name} Policy</SheetTitle>
          </div>
          <SheetDescription>
            {step === 'edit' && 'Edit policy content, eligibility, and required documents'}
            {step === 'preview' && 'Preview how employees will see this policy'}
            {step === 'publish' && 'Confirm and publish this version'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 my-4">
          <Badge variant="outline">
            Current: v{currentVersion?.version || '—'}
          </Badge>
          <span className="text-muted-foreground">→</span>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Draft: v{newVersion}
          </Badge>
          {currentVersion && (
            <span className="text-xs text-muted-foreground ml-auto">
              Last published: {format(new Date(currentVersion.updated_at), 'MMM d, yyyy')}
            </span>
          )}
        </div>

        <Separator className="my-4" />

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-6">
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

        {step === 'edit' && (
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
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
                  {draft.bullets.map((bullet, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      <Input
                        value={bullet}
                        onChange={(e) => handleBulletChange(index, e.target.value)}
                        placeholder="Enter policy bullet point..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBullet(index)}
                        disabled={draft.bullets.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  {draft.bullets.length < 10 && (
                    <Button variant="outline" size="sm" onClick={handleAddBullet}>
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
                  <Label>Eligibility Criteria</Label>
                  <Textarea
                    value={draft.eligibility}
                    onChange={(e) => setDraft(prev => ({ ...prev, eligibility: e.target.value }))}
                    placeholder="Describe who is eligible for this benefit..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limits & Caps</Label>
                  <Textarea
                    value={draft.limits}
                    onChange={(e) => setDraft(prev => ({ ...prev, limits: e.target.value }))}
                    placeholder="Describe any limits, caps, or maximum amounts..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attach PDF (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={draft.attachmentUrl || ''}
                      onChange={(e) => setDraft(prev => ({ ...prev, attachmentUrl: e.target.value }))}
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
                    Real-World Examples (2-3 recommended)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {draft.examples.map((example, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Textarea
                        value={example}
                        onChange={(e) => {
                          const newExamples = [...draft.examples];
                          newExamples[index] = e.target.value;
                          setDraft(prev => ({ ...prev, examples: newExamples }));
                        }}
                        placeholder="Describe a realistic example scenario..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDraft(prev => ({
                            ...prev,
                            examples: prev.examples.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddExample}>
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
                  {draft.pitfalls.map((pitfall, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-red-500">⚠️</span>
                      <Input
                        value={pitfall}
                        onChange={(e) => {
                          const newPitfalls = [...draft.pitfalls];
                          newPitfalls[index] = e.target.value;
                          setDraft(prev => ({ ...prev, pitfalls: newPitfalls }));
                        }}
                        placeholder="What should employees avoid or be aware of..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDraft(prev => ({
                            ...prev,
                            pitfalls: prev.pitfalls.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddPitfall}>
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
                  {draft.faqs.map((faq, index) => (
                    <div key={index} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Question {index + 1}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFaq(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...draft.faqs];
                          newFaqs[index].question = e.target.value;
                          setDraft(prev => ({ ...prev, faqs: newFaqs }));
                        }}
                        placeholder="Enter question..."
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...draft.faqs];
                          newFaqs[index].answer = e.target.value;
                          setDraft(prev => ({ ...prev, faqs: newFaqs }));
                        }}
                        placeholder="Enter answer..."
                        rows={2}
                      />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddFaq}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </CardContent>
              </Card>
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
              <CardContent className="pt-4">
                <h3 className="font-semibold text-lg mb-3">{policy.benefit.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Points</h4>
                    <ul className="space-y-1">
                      {draft.bullets.filter(Boolean).map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {draft.examples.filter(Boolean).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Examples</h4>
                      <div className="space-y-2">
                        {draft.examples.filter(Boolean).map((example, i) => (
                          <div key={i} className="p-2 rounded bg-muted/30 text-sm">
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {draft.pitfalls.filter(Boolean).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Watch Out For</h4>
                      <div className="space-y-1">
                        {draft.pitfalls.filter(Boolean).map((pitfall, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-amber-600">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            {pitfall}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'publish' && (
          <div className="space-y-6">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Confirm Publication
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This will immediately update the employee-facing view of this policy. 
                      The current version (v{currentVersion?.version || '—'}) will be archived.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-lg border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">New Version</p>
                  <p className="font-medium">v{newVersion}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Effective From</p>
                  <p className="font-medium">Immediately</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Summary Points</p>
                  <p className="font-medium">{draft.bullets.filter(Boolean).length} bullets</p>
                </div>
                <div>
                  <p className="text-muted-foreground">FAQs</p>
                  <p className="font-medium">{draft.faqs.filter(f => f.question && f.answer).length} items</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <SheetFooter className="mt-6">
          {step === 'edit' && (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep('preview')}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          )}
          {step === 'preview' && (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setStep('edit')}>
                Back to Edit
              </Button>
              <Button onClick={() => setStep('publish')}>
                Continue to Publish
              </Button>
            </div>
          )}
          {step === 'publish' && (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setStep('preview')}>
                Back
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {publishMutation.isPending ? 'Publishing...' : 'Publish Now'}
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
