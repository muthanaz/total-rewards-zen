import { useState } from 'react';
import { Beaker, Lightbulb, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDemoMode, DemoScenario } from '@/contexts/DemoModeContext';
import { cn } from '@/lib/utils';

interface DemoModeToggleProps {
  variant?: 'button' | 'switch' | 'dropdown';
  className?: string;
}

export function DemoModeToggle({ variant = 'dropdown', className }: DemoModeToggleProps) {
  const { 
    isDemoMode, 
    toggleDemoMode, 
    showDemoTips, 
    toggleDemoTips,
    demoScenario,
    setDemoScenario,
  } = useDemoMode();

  const scenarios: { value: DemoScenario; label: string; description: string }[] = [
    { value: 'default', label: 'Default', description: 'Standard demo with balanced metrics' },
    { value: 'high_utilization', label: 'High Utilization', description: 'Showcase 90%+ utilization' },
    { value: 'low_engagement', label: 'Low Engagement', description: 'Highlight improvement opportunities' },
    { value: 'policy_review', label: 'Policy Review', description: 'Focus on policy management flow' },
  ];

  if (variant === 'button') {
    return (
      <Button
        variant={isDemoMode ? 'default' : 'outline'}
        size="sm"
        onClick={toggleDemoMode}
        className={cn('gap-2', className)}
      >
        <Beaker className="w-4 h-4" />
        {isDemoMode ? 'Demo Mode ON' : 'Demo Mode'}
      </Button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Switch
          checked={isDemoMode}
          onCheckedChange={toggleDemoMode}
          id="demo-mode"
        />
        <label htmlFor="demo-mode" className="text-sm cursor-pointer">
          Demo Mode
        </label>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isDemoMode ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-2', className)}
        >
          <Beaker className="w-4 h-4" />
          Demo Mode
          {isDemoMode && (
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              ON
            </Badge>
          )}
          <ChevronDown className="w-3.5 h-3.5 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Demo Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Demo Mode</span>
            </div>
            <Switch
              checked={isDemoMode}
              onCheckedChange={toggleDemoMode}
            />
          </div>
        </div>

        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Show Tips</span>
            </div>
            <Switch
              checked={showDemoTips}
              onCheckedChange={toggleDemoTips}
              disabled={!isDemoMode}
            />
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Scenario
        </DropdownMenuLabel>
        
        {scenarios.map((scenario) => (
          <DropdownMenuItem
            key={scenario.value}
            onClick={() => setDemoScenario(scenario.value)}
            className={cn(
              'flex flex-col items-start gap-0.5',
              demoScenario === scenario.value && 'bg-accent/10'
            )}
          >
            <span className="font-medium">{scenario.label}</span>
            <span className="text-xs text-muted-foreground">{scenario.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Floating Demo Mode indicator
export function DemoModeBadge() {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant="outline" 
        className="bg-info/10 text-info border-info/30 shadow-lg px-3 py-1.5"
      >
        <Beaker className="w-3.5 h-3.5 mr-1.5" />
        Demo Mode
      </Badge>
    </div>
  );
}
