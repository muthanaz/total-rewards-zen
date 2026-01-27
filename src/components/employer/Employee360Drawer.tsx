/**
 * Employee360Drawer - Deep-dive employee profile drawer
 * 
 * Tabs:
 * - Overview: Total Cost, Grade, Location, Visa Expiry
 * - Dependents: Spouse/Children with eligibility status
 * - Document Vault: Passport, Visa, Emirates ID, Marriage Cert with status
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  User,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  Users,
  Briefcase,
  CreditCard,
  Clock,
  Shield,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';

// Employee extended data for 360 view
export interface Employee360Data {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  jobTitle: string;
  department: string;
  grade: string;
  status: 'active' | 'on_leave' | 'probation';
  totalValue: number;
  utilizationPercent: number;
  // Extended fields
  location?: string;
  baseSalary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  otherAllowances?: number;
  visaExpiryDate?: string;
  emiratesIdExpiry?: string;
  passportExpiry?: string;
  joinDate?: string;
  nationality?: string;
}

// Dependent interface
interface Dependent {
  id: string;
  name: string;
  relation: 'spouse' | 'son' | 'daughter';
  dateOfBirth: string;
  isEligibleForBenefits: boolean;
  eligibilityReason?: string;
}

// Document interface
interface EmployeeDocument {
  id: string;
  type: 'passport' | 'visa' | 'emirates_id' | 'marriage_cert' | 'birth_cert';
  label: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'not_uploaded';
  uploadedAt?: string;
}

// Mock extended data keyed by employee ID
const MOCK_EXTENDED_DATA: Record<string, {
  location: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  visaExpiryDate: string;
  emiratesIdExpiry: string;
  passportExpiry: string;
  joinDate: string;
  nationality: string;
}> = {
  'emp-001': {
    location: 'Dubai, UAE',
    baseSalary: 15000,
    housingAllowance: 5000,
    transportAllowance: 1500,
    otherAllowances: 850,
    visaExpiryDate: '2026-03-15', // ~45 days from now
    emiratesIdExpiry: '2026-03-15',
    passportExpiry: '2028-06-20',
    joinDate: '2021-03-01',
    nationality: 'Egyptian',
  },
  'emp-002': {
    location: 'Abu Dhabi, UAE',
    baseSalary: 25000,
    housingAllowance: 8000,
    transportAllowance: 2000,
    otherAllowances: 1500,
    visaExpiryDate: '2027-08-20',
    emiratesIdExpiry: '2027-08-20',
    passportExpiry: '2029-01-15',
    joinDate: '2019-06-15',
    nationality: 'Saudi',
  },
  'emp-003': {
    location: 'Dubai, UAE',
    baseSalary: 12000,
    housingAllowance: 4000,
    transportAllowance: 1200,
    otherAllowances: 500,
    visaExpiryDate: '2026-11-30',
    emiratesIdExpiry: '2026-11-30',
    passportExpiry: '2027-04-10',
    joinDate: '2022-01-10',
    nationality: 'Pakistani',
  },
};

// Mock dependents data
const MOCK_DEPENDENTS: Record<string, Dependent[]> = {
  'emp-001': [
    { id: 'dep-1', name: 'Ahmed Ibrahim', relation: 'spouse', dateOfBirth: '1992-05-14', isEligibleForBenefits: true },
    { id: 'dep-2', name: 'Yusuf Ibrahim', relation: 'son', dateOfBirth: '2018-09-22', isEligibleForBenefits: true },
    { id: 'dep-3', name: 'Layla Ibrahim', relation: 'daughter', dateOfBirth: '2021-03-08', isEligibleForBenefits: true },
  ],
  'emp-002': [
    { id: 'dep-4', name: 'Fatima Al-Rashid', relation: 'spouse', dateOfBirth: '1985-11-02', isEligibleForBenefits: true },
    { id: 'dep-5', name: 'Omar Al-Rashid', relation: 'son', dateOfBirth: '2010-07-15', isEligibleForBenefits: true },
    { id: 'dep-6', name: 'Nadia Al-Rashid', relation: 'daughter', dateOfBirth: '2005-02-28', isEligibleForBenefits: false, eligibilityReason: 'Over 18 years old' },
  ],
  'emp-003': [],
};

// Mock documents data
const MOCK_DOCUMENTS: Record<string, EmployeeDocument[]> = {
  'emp-001': [
    { id: 'doc-1', type: 'passport', label: 'Passport', expiryDate: '2028-06-20', status: 'valid', uploadedAt: '2024-01-15' },
    { id: 'doc-2', type: 'visa', label: 'UAE Residence Visa', expiryDate: '2026-03-15', status: 'expiring_soon', uploadedAt: '2024-01-15' },
    { id: 'doc-3', type: 'emirates_id', label: 'Emirates ID', expiryDate: '2026-03-15', status: 'expiring_soon', uploadedAt: '2024-01-15' },
    { id: 'doc-4', type: 'marriage_cert', label: 'Marriage Certificate', status: 'valid', uploadedAt: '2021-03-05' },
  ],
  'emp-002': [
    { id: 'doc-5', type: 'passport', label: 'Passport', expiryDate: '2029-01-15', status: 'valid', uploadedAt: '2023-08-10' },
    { id: 'doc-6', type: 'visa', label: 'UAE Residence Visa', expiryDate: '2027-08-20', status: 'valid', uploadedAt: '2023-08-10' },
    { id: 'doc-7', type: 'emirates_id', label: 'Emirates ID', expiryDate: '2027-08-20', status: 'valid', uploadedAt: '2023-08-10' },
    { id: 'doc-8', type: 'marriage_cert', label: 'Marriage Certificate', status: 'valid', uploadedAt: '2019-06-20' },
  ],
  'emp-003': [
    { id: 'doc-9', type: 'passport', label: 'Passport', expiryDate: '2027-04-10', status: 'valid', uploadedAt: '2022-01-12' },
    { id: 'doc-10', type: 'visa', label: 'UAE Residence Visa', expiryDate: '2026-11-30', status: 'valid', uploadedAt: '2022-01-12' },
    { id: 'doc-11', type: 'emirates_id', label: 'Emirates ID', expiryDate: '2026-11-30', status: 'valid', uploadedAt: '2022-01-12' },
    { id: 'doc-12', type: 'marriage_cert', label: 'Marriage Certificate', status: 'not_uploaded' },
  ],
};

interface Employee360DrawerProps {
  employee: Employee360Data | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Calculate days until expiry
function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInDays(new Date(expiryDate), new Date());
}

// Get visa expiry warning
function getVisaExpiryWarning(expiryDate?: string): { show: boolean; days: number; severity: 'warning' | 'critical' } | null {
  if (!expiryDate) return null;
  const days = getDaysUntilExpiry(expiryDate);
  if (days <= 30) return { show: true, days, severity: 'critical' };
  if (days <= 90) return { show: true, days, severity: 'warning' };
  return null;
}

// Document status badge
function DocumentStatusBadge({ status }: { status: EmployeeDocument['status'] }) {
  const config = {
    valid: { label: 'Valid', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
    expired: { label: 'Expired', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
    expiring_soon: { label: 'Expiring Soon', className: 'bg-warning/10 text-warning border-warning/20', icon: AlertTriangle },
    not_uploaded: { label: 'Not Uploaded', className: 'bg-muted text-muted-foreground', icon: FileText },
  };
  const { label, className, icon: Icon } = config[status];
  
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

export function Employee360Drawer({ employee, open, onOpenChange }: Employee360DrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!employee) return null;
  
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  
  // Get extended data
  const extendedData = MOCK_EXTENDED_DATA[employee.id] || {
    location: 'Dubai, UAE',
    baseSalary: Math.round(employee.totalValue / 12 * 0.6),
    housingAllowance: Math.round(employee.totalValue / 12 * 0.25),
    transportAllowance: Math.round(employee.totalValue / 12 * 0.1),
    otherAllowances: Math.round(employee.totalValue / 12 * 0.05),
    visaExpiryDate: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
    emiratesIdExpiry: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
    passportExpiry: format(addDays(new Date(), 365 * 3), 'yyyy-MM-dd'),
    joinDate: '2022-01-15',
    nationality: 'UAE National',
  };
  
  const dependents = MOCK_DEPENDENTS[employee.id] || [];
  const documents = MOCK_DOCUMENTS[employee.id] || [
    { id: 'default-1', type: 'passport' as const, label: 'Passport', status: 'not_uploaded' as const },
    { id: 'default-2', type: 'visa' as const, label: 'UAE Residence Visa', status: 'not_uploaded' as const },
    { id: 'default-3', type: 'emirates_id' as const, label: 'Emirates ID', status: 'not_uploaded' as const },
    { id: 'default-4', type: 'marriage_cert' as const, label: 'Marriage Certificate', status: 'not_uploaded' as const },
  ];
  
  const visaWarning = getVisaExpiryWarning(extendedData.visaExpiryDate);
  const totalMonthlyCost = extendedData.baseSalary + extendedData.housingAllowance + extendedData.transportAllowance + extendedData.otherAllowances;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          {/* Header with Employee Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={employee.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-xl">{fullName}</SheetTitle>
                {visaWarning && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'gap-1 text-xs',
                      visaWarning.severity === 'critical' 
                        ? 'bg-destructive/10 text-destructive border-destructive/20' 
                        : 'bg-warning/10 text-warning border-warning/20'
                    )}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Visa Expires in {visaWarning.days} Days
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs font-mono">{employee.grade}</Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{employee.department}</span>
              </div>
            </div>
          </div>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <User className="w-3.5 h-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="dependents" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Dependents
              {dependents.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {dependents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Documents
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Total Cost to Company */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Total Cost to Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">{formatCurrencyAED(totalMonthlyCost)}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Salary</span>
                    <span className="font-medium">{formatCurrencyAED(extendedData.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Housing Allowance</span>
                    <span className="font-medium">{formatCurrencyAED(extendedData.housingAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport Allowance</span>
                    <span className="font-medium">{formatCurrencyAED(extendedData.transportAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other Allowances</span>
                    <span className="font-medium">{formatCurrencyAED(extendedData.otherAllowances)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Annual Total</span>
                    <span className="text-primary">{formatCurrencyAED(employee.totalValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="text-xs">Grade</span>
                </div>
                <p className="font-medium">{employee.grade}</p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">Location</span>
                </div>
                <p className="font-medium text-sm">{extendedData.location}</p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs">Nationality</span>
                </div>
                <p className="font-medium text-sm">{extendedData.nationality}</p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">Tenure</span>
                </div>
                <p className="font-medium text-sm">
                  {Math.round(differenceInDays(new Date(), new Date(extendedData.joinDate)) / 365 * 10) / 10} years
                </p>
              </Card>
            </div>
            
            {/* Critical Dates */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Critical Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Visa Expiry', date: extendedData.visaExpiryDate },
                  { label: 'Emirates ID Expiry', date: extendedData.emiratesIdExpiry },
                  { label: 'Passport Expiry', date: extendedData.passportExpiry },
                  { label: 'Join Date', date: extendedData.joinDate, noExpiry: true },
                ].map(item => {
                  const days = item.noExpiry ? null : getDaysUntilExpiry(item.date);
                  const isExpiring = days !== null && days <= 90;
                  const isExpired = days !== null && days < 0;
                  
                  return (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-medium text-sm',
                          isExpired && 'text-destructive',
                          isExpiring && !isExpired && 'text-warning'
                        )}>
                          {format(new Date(item.date), 'd MMM yyyy')}
                        </span>
                        {days !== null && days <= 90 && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-[10px]',
                              isExpired 
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            )}
                          >
                            {isExpired ? 'Expired' : `${days}d`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Dependents Tab */}
          <TabsContent value="dependents" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Registered Dependents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dependents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No dependents registered</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Relation</TableHead>
                        <TableHead className="text-xs">DOB</TableHead>
                        <TableHead className="text-xs text-center">Eligible</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dependents.map(dep => {
                        const age = Math.floor(differenceInDays(new Date(), new Date(dep.dateOfBirth)) / 365);
                        const relationLabel = {
                          spouse: 'Spouse',
                          son: 'Son',
                          daughter: 'Daughter',
                        }[dep.relation];
                        
                        return (
                          <TableRow key={dep.id}>
                            <TableCell className="font-medium text-sm">{dep.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{relationLabel}</TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(dep.dateOfBirth), 'd MMM yyyy')}
                              <span className="text-xs text-muted-foreground ml-1">({age}y)</span>
                            </TableCell>
                            <TableCell className="text-center">
                              {dep.isEligibleForBenefits ? (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Yes
                                </Badge>
                              ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                                    <XCircle className="w-3 h-3" />
                                    No
                                  </Badge>
                                  {dep.eligibilityReason && (
                                    <span className="text-[10px] text-muted-foreground">{dep.eligibilityReason}</span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            {/* Eligibility Summary */}
            {dependents.length > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Benefits Eligibility Summary</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dependents.filter(d => d.isEligibleForBenefits).length} of {dependents.length} dependents eligible
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {dependents.map(dep => (
                        <div 
                          key={dep.id}
                          className={cn(
                            'w-3 h-3 rounded-full',
                            dep.isEligibleForBenefits ? 'bg-success' : 'bg-destructive'
                          )}
                          title={`${dep.name}: ${dep.isEligibleForBenefits ? 'Eligible' : 'Not Eligible'}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Document Vault
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {documents.map(doc => (
                    <Card key={doc.id} className="p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <DocumentStatusBadge status={doc.status} />
                      </div>
                      <p className="font-medium text-sm mb-0.5">{doc.label}</p>
                      {doc.expiryDate && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {format(new Date(doc.expiryDate), 'd MMM yyyy')}
                        </p>
                      )}
                      {doc.uploadedAt && (
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {format(new Date(doc.uploadedAt), 'd MMM yyyy')}
                        </p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3 h-7 text-xs gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Upload New Version
                      </Button>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default Employee360Drawer;
