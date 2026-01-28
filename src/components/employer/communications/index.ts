export type {
  Campaign,
  CommunicationTemplate,
  AudienceSegment,
  AudienceFilter,
  CampaignMetrics,
  CampaignStatus,
  CampaignPurpose,
} from './types';
export { PURPOSE_CONFIG, TEMPLATE_VARIABLES } from './types';
export { mockCampaigns, mockTemplates, mockSegments, getCampaignStats } from './mockData';
export { CommunicationsStats } from './CommunicationsStats';
export { AudienceBuilder } from './AudienceBuilder';
export { TemplateEditor } from './TemplateEditor';
export { CampaignGuardrails } from './CampaignGuardrails';
export { CampaignMetricsCard } from './CampaignMetrics';
export { CampaignTable } from './CampaignTable';
