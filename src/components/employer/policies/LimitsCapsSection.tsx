/**
 * Limits & Caps Section Component
 * 
 * Configure financial limits and caps for the policy.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { LimitsCaps } from './types';

interface LimitsCapsSectionProps {
  limits: LimitsCaps;
  onChange: (limits: LimitsCaps) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'annual', label: 'Annual (per year)' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'per_event', label: 'Per Event (no reset)' },
];

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function LimitsCapsSection({ limits, onChange }: LimitsCapsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Limits & Caps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Annual Cap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Annual Cap</Label>
            <p className="text-xs text-muted-foreground">
              Maximum amount per employee per period
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">AED</span>
              <Input
                type="number"
                min={0}
                placeholder="No limit"
                value={limits.annualCap || ''}
                onChange={(e) =>
                  onChange({
                    ...limits,
                    annualCap: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Per-Transaction Cap</Label>
            <p className="text-xs text-muted-foreground">
              Maximum per single claim/request
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">AED</span>
              <Input
                type="number"
                min={0}
                placeholder="No limit"
                value={limits.perTransactionCap || ''}
                onChange={(e) =>
                  onChange({
                    ...limits,
                    perTransactionCap: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-40"
              />
            </div>
          </div>
        </div>

        {/* Frequency & Reset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              Frequency
            </Label>
            <Select
              value={limits.frequency}
              onValueChange={(value: LimitsCaps['frequency']) =>
                onChange({ ...limits, frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Reset Month
            </Label>
            <Select
              value={limits.resetMonth.toString()}
              onValueChange={(value) =>
                onChange({ ...limits, resetMonth: parseInt(value) })
              }
              disabled={limits.frequency === 'per_event'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pre-Approval Threshold */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            Pre-Approval Threshold
          </Label>
          <p className="text-xs text-muted-foreground">
            Claims above this amount require pre-approval before incurring expense
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">AED</span>
            <Input
              type="number"
              min={0}
              placeholder="No threshold"
              value={limits.preApprovalThreshold || ''}
              onChange={(e) =>
                onChange({
                  ...limits,
                  preApprovalThreshold: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-40"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
