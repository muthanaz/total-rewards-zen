import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Configuration for a benefit page using the template
 */
export interface BenefitConfig {
  /** Benefit category identifier (housing, health, etc.) */
  category: string;
  
  /** Display name for the benefit */
  name: string;
  
  /** Short one-line definition */
  description: string;
  
  /** Icon component for the benefit */
  icon: LucideIcon;
  
  /** Icon gradient classes */
  iconClassName: string;
  
  /** How it works bullets (max 4) - fallback if not in policy */
  howItWorksBullets?: string[];
  
  /** Category-specific content to render after standard sections */
  customContent?: ReactNode;
  
  /** Whether to show the marketplace offers link */
  showMarketplaceLink?: boolean;
  
  /** Override policy ref display */
  policyRefOverride?: string;
}

/**
 * Props for the BenefitDetailTemplate component
 */
export interface BenefitDetailTemplateProps extends BenefitConfig {
  /** Children to render in the custom content area */
  children?: ReactNode;
}

/**
 * Document item for the required documents checklist
 */
export interface DocumentItem {
  name: string;
  required: boolean;
  description?: string;
}

/**
 * Recent activity item
 */
export interface RecentActivityItem {
  id: string;
  type: 'claim' | 'request';
  category: string;
  status: string;
  amount?: number;
  createdAt: string;
}
