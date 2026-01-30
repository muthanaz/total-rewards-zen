/**
 * TransportComponentBoxes
 * 
 * Three boxes for Transport benefit: Fuel, Transportation, Flight Tickets
 * Each box has its own workflow steps and submit claim/request button.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fuel, 
  Car, 
  Plane,
  Send,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { EmployeeCreateRequestSheet } from '@/components/employee/EmployeeCreateRequestSheet';

interface TransportComponent {
  id: 'fuel' | 'car' | 'flight';
  icon: LucideIcon;
  title: string;
  description: string;
  amount: number | null;
  frequency: string;
  status: 'active' | 'pending' | 'not_applicable';
  isAutoCredit: boolean;
  workflowSteps: string[];
  claimLabel: string;
}

interface TransportComponentBoxesProps {
  fuelAllowance?: number | null;
  carAllowance?: number | null;
  flightAllowance?: number | null;
  flightClass?: string;
  dependentTickets?: number;
}

export function TransportComponentBoxes({
  fuelAllowance = 1500,
  carAllowance = 2500,
  flightAllowance = 15000,
  flightClass = 'Economy',
  dependentTickets = 2,
}: TransportComponentBoxesProps) {
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('');

  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const components: TransportComponent[] = [
    {
      id: 'fuel',
      icon: Fuel,
      title: 'Fuel Allowance',
      description: 'Monthly fuel allowance for your personal vehicle',
      amount: fuelAllowance,
      frequency: 'Monthly',
      status: fuelAllowance ? 'active' : 'not_applicable',
      isAutoCredit: true,
      workflowSteps: [
        'Allowance is auto-credited to your salary on the 25th of each month',
        'No receipts or claims required for monthly fuel benefit',
        'Amount is fixed based on your grade and policy',
      ],
      claimLabel: 'Auto-credited',
    },
    {
      id: 'car',
      icon: Car,
      title: 'Car Allowance',
      description: 'Vehicle loan, lease, or maintenance reimbursement',
      amount: carAllowance,
      frequency: 'Monthly',
      status: carAllowance ? 'active' : 'not_applicable',
      isAutoCredit: false,
      workflowSteps: [
        'Submit your car loan statement or lease agreement',
        'Attach payment proof (bank statement or receipt)',
        'HR reviews and approves within 72 hours',
        'Reimbursement added to next salary cycle',
      ],
      claimLabel: 'Submit Claim',
    },
    {
      id: 'flight',
      icon: Plane,
      title: 'Annual Flight Tickets',
      description: `${flightClass} class return flights • ${dependentTickets > 0 ? `Employee + ${dependentTickets} dependents` : 'Employee only'}`,
      amount: flightAllowance,
      frequency: 'Annual',
      status: flightAllowance ? 'active' : 'pending',
      isAutoCredit: false,
      workflowSteps: [
        'Book tickets through approved travel portal OR purchase directly',
        'Submit booking confirmation and payment receipt',
        'Include passport copies for dependent tickets',
        'HR reviews and processes reimbursement within 5 days',
      ],
      claimLabel: 'Submit Claim',
    },
  ];

  const handleClaimClick = (componentTitle: string) => {
    setSelectedComponent(componentTitle);
    setRequestSheetOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-base font-display font-semibold">Transport components</h3>
        
        <div className="grid lg:grid-cols-3 gap-4">
          {components.map((comp) => {
            const IconComp = comp.icon;
            const isActive = comp.status === 'active';
            
            return (
              <Card 
                key={comp.id} 
                className={cn(
                  "flex flex-col",
                  !isActive && "opacity-70"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isActive ? "bg-primary/10" : "bg-muted"
                      )}>
                        <IconComp className={cn(
                          "w-4 h-4",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-display">{comp.title}</CardTitle>
                      </div>
                    </div>
                    <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {comp.frequency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{comp.description}</p>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Amount */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-xl font-bold tabular-nums">
                      {comp.amount != null ? formatCurrency(comp.amount) : '—'}
                    </span>
                    {comp.amount != null && (
                      <span className="text-xs text-muted-foreground">
                        /{comp.frequency.toLowerCase()}
                      </span>
                    )}
                  </div>

                  {/* Workflow Steps */}
                  <div className="space-y-2 flex-1 mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      How it works
                    </p>
                    <ul className="space-y-1.5">
                      {comp.workflowSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {comp.isAutoCredit ? (
                    <div className="flex items-center justify-center gap-2 py-2 rounded-md bg-success/10 text-success text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">{comp.claimLabel}</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleClaimClick(comp.title)}
                      disabled={!isActive}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {comp.claimLabel}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <EmployeeCreateRequestSheet
        open={requestSheetOpen}
        onOpenChange={setRequestSheetOpen}
        initialType="claim"
        initialCategory={`Transport & Mobility - ${selectedComponent}`}
      />
    </>
  );
}
