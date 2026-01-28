/**
 * Communications Module Types
 * Template-driven, targeted campaign management
 */

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
export type CampaignPurpose = 'reminder' | 'awareness' | 'enrollment' | 'policy_update' | 'deadline' | 'engagement';
export type ChannelType = 'email' | 'push' | 'sms' | 'in_app';

export interface AudienceFilter {
  grades?: string[];
  departments?: string[];
  locations?: string[];
  benefitEligibility?: string[];
  employmentTypes?: string[];
  tenureMonths?: { min?: number; max?: number };
  hasOpenClaim?: boolean;
  lastActivityDays?: number;
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  estimatedCount: number;
  filters: AudienceFilter;
}

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  required: boolean;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  purpose: CampaignPurpose;
  subject: string;
  bodyHtml: string;
  bodyPlain: string;
  variables: TemplateVariable[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CampaignMetrics {
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  actionsStarted: number; // downstream requests/claims
  optedOut: number;
  bounced: number;
  openRate: number;
  clickRate: number;
  actionRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  purpose: CampaignPurpose;
  status: CampaignStatus;
  channels: ChannelType[];
  templateId: string;
  template?: CommunicationTemplate;
  
  // Audience
  audienceType: 'segment' | 'filter' | 'all';
  segmentId?: string;
  segment?: AudienceSegment;
  filters?: AudienceFilter;
  estimatedRecipients: number;
  
  // Scheduling
  scheduledAt?: string;
  sentAt?: string;
  
  // Guardrails
  requiresPreview: boolean;
  previewApprovedBy?: string;
  previewApprovedAt?: string;
  optOutHandling: 'respect' | 'override_critical';
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Metrics
  metrics?: CampaignMetrics;
}

export interface OptOutPreference {
  userId: string;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    in_app: boolean;
  };
  purposes: {
    reminder: boolean;
    awareness: boolean;
    enrollment: boolean;
    policy_update: boolean;
    deadline: boolean;
    engagement: boolean;
  };
  updatedAt: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'first_name', label: 'First Name', example: 'Ahmed', required: true },
  { key: 'last_name', label: 'Last Name', example: 'Al-Rashid', required: false },
  { key: 'benefit_name', label: 'Benefit Name', example: 'Education Allowance', required: false },
  { key: 'policy_link', label: 'Policy Link', example: 'https://...', required: false },
  { key: 'deadline', label: 'Deadline Date', example: 'March 31, 2026', required: false },
  { key: 'amount', label: 'Amount (AED)', example: 'AED 12,500', required: false },
  { key: 'remaining_balance', label: 'Remaining Balance', example: 'AED 5,000', required: false },
  { key: 'claim_link', label: 'Claim Link', example: 'https://...', required: false },
  { key: 'company_name', label: 'Company Name', example: 'Acme Corp', required: false },
];

export const PURPOSE_CONFIG: Record<CampaignPurpose, { label: string; color: string; icon: string }> = {
  reminder: { label: 'Reminder', color: 'bg-warning/10 text-warning border-warning/30', icon: 'Bell' },
  awareness: { label: 'Awareness', color: 'bg-primary/10 text-primary border-primary/30', icon: 'Info' },
  enrollment: { label: 'Enrollment', color: 'bg-success/10 text-success border-success/30', icon: 'UserPlus' },
  policy_update: { label: 'Policy Update', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: 'FileText' },
  deadline: { label: 'Deadline', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: 'Clock' },
  engagement: { label: 'Engagement', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', icon: 'Heart' },
};
