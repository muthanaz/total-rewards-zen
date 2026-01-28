import { Campaign, CommunicationTemplate, AudienceSegment, CampaignPurpose } from './types';

export const mockSegments: AudienceSegment[] = [
  {
    id: 'seg-001',
    name: 'High Engagement / Low Cost',
    description: 'Employees actively using benefits with low average claim amounts',
    estimatedCount: 124,
    filters: { grades: ['G4', 'G5'], benefitEligibility: ['Healthcare', 'Education'] },
  },
  {
    id: 'seg-002',
    name: 'Concentrated Spend',
    description: 'Small group with high-value benefit usage',
    estimatedCount: 32,
    filters: { grades: ['G6', 'G7', 'G8'] },
  },
  {
    id: 'seg-003',
    name: 'Low Participation',
    description: 'Employees with no claims in last 6 months',
    estimatedCount: 89,
    filters: { lastActivityDays: 180 },
  },
  {
    id: 'seg-004',
    name: 'New Joiners',
    description: 'Employees in first 90 days of employment',
    estimatedCount: 18,
    filters: { tenureMonths: { max: 3 } },
  },
];

export const mockTemplates: CommunicationTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Education Benefit Reminder',
    purpose: 'reminder',
    subject: '📚 Don\'t forget your Education Allowance, {first_name}!',
    bodyHtml: `
      <p>Hi {first_name},</p>
      <p>You still have <strong>{remaining_balance}</strong> available in your Education Allowance for this year.</p>
      <p>The deadline to submit claims is <strong>{deadline}</strong>.</p>
      <p><a href="{claim_link}">Submit a claim now →</a></p>
      <p>Questions? Check our <a href="{policy_link}">Education Policy</a>.</p>
    `,
    bodyPlain: 'Hi {first_name}, You still have {remaining_balance} available in your Education Allowance. Deadline: {deadline}.',
    variables: [
      { key: 'first_name', label: 'First Name', example: 'Ahmed', required: true },
      { key: 'remaining_balance', label: 'Remaining Balance', example: 'AED 5,000', required: true },
      { key: 'deadline', label: 'Deadline', example: 'March 31, 2026', required: true },
      { key: 'claim_link', label: 'Claim Link', example: 'https://...', required: true },
      { key: 'policy_link', label: 'Policy Link', example: 'https://...', required: false },
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    isActive: true,
  },
  {
    id: 'tpl-002',
    name: 'New Policy Announcement',
    purpose: 'policy_update',
    subject: '📋 Important Update: {benefit_name} Policy Changes',
    bodyHtml: `
      <p>Dear {first_name},</p>
      <p>We've updated our <strong>{benefit_name}</strong> policy to better serve you.</p>
      <p>Key changes take effect on <strong>{deadline}</strong>.</p>
      <p><a href="{policy_link}">View the updated policy →</a></p>
      <p>If you have questions, please contact HR.</p>
    `,
    bodyPlain: 'Dear {first_name}, We\'ve updated our {benefit_name} policy. Changes take effect on {deadline}. View: {policy_link}',
    variables: [
      { key: 'first_name', label: 'First Name', example: 'Ahmed', required: true },
      { key: 'benefit_name', label: 'Benefit Name', example: 'Healthcare', required: true },
      { key: 'deadline', label: 'Effective Date', example: 'February 1, 2026', required: true },
      { key: 'policy_link', label: 'Policy Link', example: 'https://...', required: true },
    ],
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
    isActive: true,
  },
  {
    id: 'tpl-003',
    name: 'Welcome New Joiner',
    purpose: 'enrollment',
    subject: '👋 Welcome to {company_name} Benefits, {first_name}!',
    bodyHtml: `
      <p>Hi {first_name},</p>
      <p>Welcome to {company_name}! We're excited to have you on board.</p>
      <p>You now have access to our comprehensive benefits package. Here's what's available:</p>
      <ul>
        <li>Healthcare coverage</li>
        <li>Education allowance</li>
        <li>Housing support</li>
        <li>And more!</li>
      </ul>
      <p><a href="{policy_link}">Explore your benefits →</a></p>
    `,
    bodyPlain: 'Hi {first_name}, Welcome to {company_name}! Explore your benefits: {policy_link}',
    variables: [
      { key: 'first_name', label: 'First Name', example: 'Ahmed', required: true },
      { key: 'company_name', label: 'Company Name', example: 'Acme Corp', required: true },
      { key: 'policy_link', label: 'Benefits Portal Link', example: 'https://...', required: true },
    ],
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    isActive: true,
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Q1 Education Reminder',
    purpose: 'reminder',
    status: 'sent',
    channels: ['email', 'in_app'],
    templateId: 'tpl-001',
    template: mockTemplates[0],
    audienceType: 'segment',
    segmentId: 'seg-003',
    segment: mockSegments[2],
    estimatedRecipients: 89,
    scheduledAt: '2026-01-20T09:00:00Z',
    sentAt: '2026-01-20T09:00:00Z',
    requiresPreview: true,
    previewApprovedBy: 'Fatima Al-Rashid',
    previewApprovedAt: '2026-01-19T16:00:00Z',
    optOutHandling: 'respect',
    createdBy: 'Mohammed Khalil',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z',
    metrics: {
      totalRecipients: 89,
      sent: 89,
      delivered: 87,
      opened: 62,
      clicked: 28,
      actionsStarted: 12,
      optedOut: 2,
      bounced: 2,
      openRate: 71.3,
      clickRate: 32.2,
      actionRate: 13.8,
    },
  },
  {
    id: 'camp-002',
    name: 'Healthcare Policy Update',
    purpose: 'policy_update',
    status: 'scheduled',
    channels: ['email'],
    templateId: 'tpl-002',
    template: mockTemplates[1],
    audienceType: 'all',
    estimatedRecipients: 342,
    scheduledAt: '2026-02-01T08:00:00Z',
    requiresPreview: true,
    previewApprovedBy: 'CEO Office',
    previewApprovedAt: '2026-01-27T14:00:00Z',
    optOutHandling: 'override_critical',
    createdBy: 'Fatima Al-Rashid',
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-01-27T14:00:00Z',
  },
  {
    id: 'camp-003',
    name: 'January New Joiners Welcome',
    purpose: 'enrollment',
    status: 'sent',
    channels: ['email', 'push'],
    templateId: 'tpl-003',
    template: mockTemplates[2],
    audienceType: 'segment',
    segmentId: 'seg-004',
    segment: mockSegments[3],
    estimatedRecipients: 18,
    sentAt: '2026-01-15T08:00:00Z',
    requiresPreview: true,
    previewApprovedBy: 'HR Team',
    previewApprovedAt: '2026-01-14T17:00:00Z',
    optOutHandling: 'respect',
    createdBy: 'Mohammed Khalil',
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
    metrics: {
      totalRecipients: 18,
      sent: 18,
      delivered: 18,
      opened: 16,
      clicked: 14,
      actionsStarted: 8,
      optedOut: 0,
      bounced: 0,
      openRate: 88.9,
      clickRate: 77.8,
      actionRate: 44.4,
    },
  },
  {
    id: 'camp-004',
    name: 'Year-End Benefits Deadline',
    purpose: 'deadline',
    status: 'draft',
    channels: ['email', 'sms', 'push'],
    templateId: 'tpl-001',
    template: mockTemplates[0],
    audienceType: 'filter',
    filters: { grades: ['G4', 'G5', 'G6'], benefitEligibility: ['Education', 'Professional Development'] },
    estimatedRecipients: 156,
    requiresPreview: true,
    optOutHandling: 'respect',
    createdBy: 'Fatima Al-Rashid',
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-01-28T09:00:00Z',
  },
];

export function getCampaignStats(campaigns: Campaign[]) {
  const sent = campaigns.filter(c => c.status === 'sent');
  const scheduled = campaigns.filter(c => c.status === 'scheduled');
  const drafts = campaigns.filter(c => c.status === 'draft');
  
  const totalSent = sent.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0);
  const totalDelivered = sent.reduce((sum, c) => sum + (c.metrics?.delivered || 0), 0);
  const totalOpened = sent.reduce((sum, c) => sum + (c.metrics?.opened || 0), 0);
  const totalActions = sent.reduce((sum, c) => sum + (c.metrics?.actionsStarted || 0), 0);
  
  const avgOpenRate = sent.length > 0 
    ? sent.reduce((sum, c) => sum + (c.metrics?.openRate || 0), 0) / sent.length 
    : 0;
  const avgActionRate = sent.length > 0 
    ? sent.reduce((sum, c) => sum + (c.metrics?.actionRate || 0), 0) / sent.length 
    : 0;

  return {
    totalCampaigns: campaigns.length,
    sentCount: sent.length,
    scheduledCount: scheduled.length,
    draftCount: drafts.length,
    totalSent,
    totalDelivered,
    totalOpened,
    totalActions,
    avgOpenRate,
    avgActionRate,
  };
}
