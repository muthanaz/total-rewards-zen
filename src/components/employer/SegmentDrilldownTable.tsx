/**
 * Segment Drilldown Table
 * 
 * Sortable table showing segment values with key metrics.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ArrowUpDown, Search, Eye, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { SegmentDimension, SegmentValue } from '@/hooks/useSegmentData';

interface SegmentDrilldownTableProps {
  dimension: SegmentDimension;
  onViewInsights: (valueId: string) => void;
}

type SortField = 'name' | 'headcount' | 'utilizationRate' | 'unusedEntitlement' | 'slaRiskCount';
type SortDirection = 'asc' | 'desc';

export function SegmentDrilldownTable({ dimension, onViewInsights }: SegmentDrilldownTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('headcount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const filteredAndSorted = useMemo(() => {
    let values = dimension.values;
    
    // Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      values = values.filter(v => 
        v.name.toLowerCase().includes(lowerSearch) ||
        v.topCategories.some(c => c.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Sort
    values = [...values].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });
    
    return values;
  }, [dimension.values, search, sortField, sortDirection]);
  
  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          'h-3 w-3',
          sortField === field ? 'text-foreground' : 'text-muted-foreground/50'
        )} />
      </div>
    </TableHead>
  );
  
  // Summary strip
  const totalRiskFlags = dimension.values.reduce((sum, v) => 
    sum + v.slaRiskCount + v.missingDocsCount + v.overLimitCount, 0
  );
  const avgProcessingTime = 2.4; // Mock - would come from claims data
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {dimension.name} Breakdown
              <InfoTooltip 
                formula="Segment value metrics by category" 
                dataSource="profiles + benefit_entitlements + requests" 
              />
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {dimension.values.length} segment values • Click "View insights" for detailed analysis
            </p>
          </div>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search segments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 rounded-lg bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground">Headcount</p>
            <p className="text-lg font-bold">{formatInteger(dimension.headcount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Utilization</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">{formatPercent(dimension.utilizationRate)}</p>
              <Progress value={dimension.utilizationRate} className="h-1.5 w-12" />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unused Entitlement</p>
            <p className="text-lg font-bold text-amber-600">
              {formatCurrencyAED(dimension.unusedEntitlement)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Risk Flags</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">{formatInteger(totalRiskFlags)}</p>
              {totalRiskFlags > 5 && <AlertTriangle className="h-4 w-4 text-warning" />}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <SortHeader field="name">Segment</SortHeader>
                <SortHeader field="headcount">Headcount</SortHeader>
                <SortHeader field="utilizationRate">Utilization</SortHeader>
                <TableHead>Spend</TableHead>
                <SortHeader field="unusedEntitlement">Unused</SortHeader>
                <TableHead>Top Categories</TableHead>
                <SortHeader field="slaRiskCount">Risk</SortHeader>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.map((value) => {
                const totalRisk = value.slaRiskCount + value.missingDocsCount + value.overLimitCount;
                const estimatedSpend = value.unusedEntitlement / (1 - value.utilizationRate / 100 || 0.01) - value.unusedEntitlement;
                
                return (
                  <TableRow key={value.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{value.name}</TableCell>
                    <TableCell>{formatInteger(value.headcount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          value.utilizationRate >= 80 ? 'text-success' :
                          value.utilizationRate >= 60 ? 'text-foreground' :
                          'text-warning'
                        )}>
                          {formatPercent(value.utilizationRate)}
                        </span>
                        {value.utilizationRate >= 85 ? (
                          <TrendingUp className="h-3 w-3 text-success" />
                        ) : value.utilizationRate < 60 ? (
                          <TrendingDown className="h-3 w-3 text-warning" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrencyAED(estimatedSpend, { abbreviate: true })}</TableCell>
                    <TableCell className="text-amber-600 font-medium">
                      {formatCurrencyAED(value.unusedEntitlement, { abbreviate: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {value.topCategories.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {totalRisk > 0 ? (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            totalRisk >= 5 ? 'bg-destructive/10 text-destructive border-destructive/30' :
                            totalRisk >= 2 ? 'bg-warning/10 text-warning border-warning/30' :
                            'bg-muted'
                          )}
                        >
                          {totalRisk} flags
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewInsights(value.id)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View insights
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {filteredAndSorted.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No segments match your search
          </div>
        )}
      </CardContent>
    </Card>
  );
}
