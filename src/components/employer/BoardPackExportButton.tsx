/**
 * Board Pack Export Button
 * 
 * Generates a board-ready export of executive metrics.
 * Supports PDF and PowerPoint formats.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  FileText, 
  Presentation,
  Mail,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrencyAED } from '@/lib/utils';

interface BoardPackExportButtonProps {
  metrics: {
    totalInvestment: number;
    utilizationRate: number;
    unrealizedValue: number;
    satisfactionScore: number;
    budgetVariance?: number;
  };
  period?: string;
}

export function BoardPackExportButton({ metrics, period = 'FY 2024' }: BoardPackExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'pptx' | 'email') => {
    setIsExporting(true);
    
    // Simulate export generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const formatLabels = {
      pdf: 'PDF Report',
      pptx: 'PowerPoint Deck',
      email: 'Email Summary',
    };
    
    // In production, this would generate actual files
    const exportData = {
      title: `Total Rewards Executive Summary - ${period}`,
      generatedAt: new Date().toISOString(),
      metrics: {
        investment: formatCurrencyAED(metrics.totalInvestment),
        utilization: `${metrics.utilizationRate}%`,
        unrealizedValue: formatCurrencyAED(metrics.unrealizedValue),
        satisfaction: `${metrics.satisfactionScore}%`,
      },
    };
    
    console.log(`Exporting ${format}:`, exportData);
    
    setIsExporting(false);
    setLastExport(format);
    
    toast.success(`${formatLabels[format]} generated`, {
      description: format === 'email' 
        ? 'Summary sent to your email' 
        : 'Download will start shortly',
    });
    
    // Reset last export indicator after 3 seconds
    setTimeout(() => setLastExport(null), 3000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : lastExport ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Board Pack
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Export executive summary
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
          <FileText className="w-4 h-4" />
          <div className="flex flex-col">
            <span>PDF Report</span>
            <span className="text-xs text-muted-foreground">Print-ready format</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pptx')} className="gap-2">
          <Presentation className="w-4 h-4" />
          <div className="flex flex-col">
            <span>PowerPoint Deck</span>
            <span className="text-xs text-muted-foreground">Editable slides</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('email')} className="gap-2">
          <Mail className="w-4 h-4" />
          <div className="flex flex-col">
            <span>Email Summary</span>
            <span className="text-xs text-muted-foreground">Send to stakeholders</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
