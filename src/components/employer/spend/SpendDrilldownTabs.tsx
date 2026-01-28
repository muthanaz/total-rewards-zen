/**
 * SpendDrilldownTabs - Actionable drilldown views
 * 
 * Tab A: By Benefit Pillar
 * Tab B: By Benefit Category  
 * Tab C: By Org Segment (grade/department/location)
 * 
 * Every row has CTAs: "Open Policy", "Open Optimization", "Create Action"
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Layers, 
  FolderTree, 
  Users2,
  BookOpen,
  Lightbulb,
  PlusCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { BudgetStackCell } from '@/components/charts/BudgetStackChart';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';

// Types
interface DrilldownRow {
  id: string;
  name: string;
  budget: number;
  ytdSpend: number;
  forecast: number;
  utilization: number;
  variance: number;
  variancePercent: number;
  employeeCount?: number;
  policyId?: string;
}

interface SpendDrilldownTabsProps {
  byPillar: DrilldownRow[];
  byCategory: DrilldownRow[];
  bySegment: DrilldownRow[];
  onCreateAction?: (row: DrilldownRow, source: string) => void;
}

// Action Buttons Component
function RowActions({ 
  row, 
  source,
  onCreateAction 
}: { 
  row: DrilldownRow; 
  source: string;
  onCreateAction?: (row: DrilldownRow, source: string) => void;
}) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-1 justify-end">
      {/* Primary CTAs - visible on hover/focus */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/employer/policies?search=${encodeURIComponent(row.name)}`);
          }}
        >
          <BookOpen className="w-3 h-3" />
          Policy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/employer/optimization?category=${encodeURIComponent(row.id)}`);
          }}
        >
          <Lightbulb className="w-3 h-3" />
          Optimize
        </Button>
      </div>
      
      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          <DropdownMenuItem onClick={() => navigate(`/employer/policies?search=${encodeURIComponent(row.name)}`)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Open Policy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/employer/optimization?category=${encodeURIComponent(row.id)}`)}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Open Optimization
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateAction?.(row, source)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Action
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Drilldown Table Component
function DrilldownTable({ 
  data, 
  source,
  nameLabel,
  onCreateAction,
}: { 
  data: DrilldownRow[]; 
  source: string;
  nameLabel: string;
  onCreateAction?: (row: DrilldownRow, source: string) => void;
}) {
  // Sort by variance (highest impact first)
  const sortedData = [...data].sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">{nameLabel}</TableHead>
          <TableHead className="text-right">Budget</TableHead>
          <TableHead className="text-right">YTD Spend</TableHead>
          <TableHead className="text-right">Forecast</TableHead>
          <TableHead className="text-right">Variance</TableHead>
          <TableHead className="w-[140px]">Budget Stack</TableHead>
          <TableHead className="text-right w-[160px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row) => {
          const isOverBudget = row.variance > 0;
          return (
            <TableRow key={row.id} className="group">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {row.name}
                  {row.employeeCount && (
                    <Badge variant="secondary" className="text-[10px]">
                      {row.employeeCount} emp
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyAED(row.budget, { abbreviate: true })}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyAED(row.ytdSpend, { abbreviate: true })}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyAED(row.forecast, { abbreviate: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {isOverBudget ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-success" />
                  )}
                  <span className={cn(
                    "tabular-nums font-medium",
                    isOverBudget ? "text-destructive" : "text-success"
                  )}>
                    {isOverBudget ? '+' : ''}{formatPercent(row.variancePercent)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <BudgetStackCell
                  allocated={row.budget}
                  utilized={row.ytdSpend}
                  runRateProjection={row.forecast}
                  width={120}
                />
              </TableCell>
              <TableCell>
                <RowActions 
                  row={row} 
                  source={source}
                  onCreateAction={onCreateAction}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function SpendDrilldownTabs({ 
  byPillar, 
  byCategory, 
  bySegment,
  onCreateAction,
}: SpendDrilldownTabsProps) {
  const [activeTab, setActiveTab] = useState('pillar');

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Spend Drilldown</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pillar" className="gap-1.5">
              <Layers className="w-4 h-4" />
              By Benefit Pillar
            </TabsTrigger>
            <TabsTrigger value="category" className="gap-1.5">
              <FolderTree className="w-4 h-4" />
              By Benefit Category
            </TabsTrigger>
            <TabsTrigger value="segment" className="gap-1.5">
              <Users2 className="w-4 h-4" />
              By Org Segment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pillar" className="mt-0">
            <DrilldownTable 
              data={byPillar} 
              source="pillar"
              nameLabel="Benefit Pillar"
              onCreateAction={onCreateAction}
            />
          </TabsContent>

          <TabsContent value="category" className="mt-0">
            <DrilldownTable 
              data={byCategory} 
              source="category"
              nameLabel="Benefit Category"
              onCreateAction={onCreateAction}
            />
          </TabsContent>

          <TabsContent value="segment" className="mt-0">
            <DrilldownTable 
              data={bySegment} 
              source="segment"
              nameLabel="Organization Segment"
              onCreateAction={onCreateAction}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
