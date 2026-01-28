/**
 * Benchmark Types
 * 
 * Type definitions for the executive benchmarking module.
 */

export interface PeerGroupDefinition {
  industry: string;
  industryCode?: string;
  companySize: string;
  headcountRange: string;
  region: string;
  countries: string[];
  sampleSize: number;
}

export interface BenchmarkDataSource {
  name: string;
  provider: string;
  lastUpdated: Date;
  nextUpdate?: Date;
  methodology?: string;
}

export interface ConfidenceIndicator {
  level: 'high' | 'medium' | 'low';
  coveragePercent: number;
  completenessPercent: number;
  reason: string;
}

export interface PercentileBand {
  p25: number;
  p50: number;
  p75: number;
  p90?: number;
  p10?: number;
}

export interface BenchmarkMetric {
  key: string;
  name: string;
  nameAr?: string;
  description: string;
  unit: 'currency' | 'percent' | 'days' | 'ratio' | 'count';
  category: 'spend' | 'utilization' | 'operational' | 'satisfaction';
  yourValue: number;
  percentileBand: PercentileBand;
  yourPercentile: number; // Where your org falls (0-100)
  trend?: 'improving' | 'declining' | 'stable';
  trendValue?: number;
}

export interface GapDriver {
  id: string;
  name: string;
  impact: 'high' | 'medium' | 'low';
  contribution: number; // Percentage contribution to gap
  direction: 'above' | 'below';
  explanation: string;
  actionType: 'policy' | 'spend' | 'operational' | 'communication';
}

export interface BenchmarkCategory {
  id: string;
  name: string;
  nameAr?: string;
  icon: string;
  metrics: BenchmarkMetric[];
  peerGroup: PeerGroupDefinition;
  dataSource: BenchmarkDataSource;
  confidence: ConfidenceIndicator;
}
