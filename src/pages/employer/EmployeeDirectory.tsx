/**
 * Employee Directory
 * 
 * Comprehensive employee list with avatar, role, grade, status, total value, and utilization.
 * Includes Employee 360 Drawer for deep-dive profile viewing.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Building2 } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';
import { Employee360Drawer, Employee360Data } from '@/components/employer/Employee360Drawer';

// Employee status type
type EmployeeStatus = 'active' | 'on_leave' | 'probation';

// Employee interface
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  jobTitle: string;
  department: string;
  grade: string;
  status: EmployeeStatus;
  totalValue: number; // Annual total compensation value
  utilizationPercent: number; // YTD benefit utilization 0-100
}

// Nexa Holdings Demo Dataset - realistic employee data
const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    firstName: 'Sarah',
    lastName: 'Ahmed',
    email: 'sarah.ahmed@nexaholdings.ae',
    jobTitle: 'Senior Software Engineer',
    department: 'Technology',
    grade: 'G5',
    status: 'active',
    totalValue: 245000,
    utilizationPercent: 72,
  },
  {
    id: 'emp-002',
    firstName: 'Mohammed',
    lastName: 'Al-Rashid',
    email: 'mohammed.r@nexaholdings.ae',
    jobTitle: 'Finance Director',
    department: 'Finance',
    grade: 'M2',
    status: 'active',
    totalValue: 385000,
    utilizationPercent: 88,
  },
  {
    id: 'emp-003',
    firstName: 'Fatima',
    lastName: 'Khan',
    email: 'fatima.k@nexaholdings.ae',
    jobTitle: 'HR Business Partner',
    department: 'Human Resources',
    grade: 'G4',
    status: 'active',
    totalValue: 185000,
    utilizationPercent: 65,
  },
  {
    id: 'emp-004',
    firstName: 'Ali',
    lastName: 'Hassan',
    email: 'ali.h@nexaholdings.ae',
    jobTitle: 'Operations Manager',
    department: 'Operations',
    grade: 'M1',
    status: 'on_leave',
    totalValue: 295000,
    utilizationPercent: 45,
  },
  {
    id: 'emp-005',
    firstName: 'Layla',
    lastName: 'Omar',
    email: 'layla.o@nexaholdings.ae',
    jobTitle: 'Marketing Lead',
    department: 'Marketing',
    grade: 'G5',
    status: 'active',
    totalValue: 225000,
    utilizationPercent: 82,
  },
  {
    id: 'emp-006',
    firstName: 'Khalid',
    lastName: 'Ibrahim',
    email: 'khalid.i@nexaholdings.ae',
    jobTitle: 'Data Analyst',
    department: 'Technology',
    grade: 'G3',
    status: 'probation',
    totalValue: 145000,
    utilizationPercent: 12,
  },
  {
    id: 'emp-007',
    firstName: 'Amira',
    lastName: 'Saleh',
    email: 'amira.s@nexaholdings.ae',
    jobTitle: 'Legal Counsel',
    department: 'Legal',
    grade: 'M2',
    status: 'active',
    totalValue: 365000,
    utilizationPercent: 91,
  },
  {
    id: 'emp-008',
    firstName: 'Omar',
    lastName: 'Youssef',
    email: 'omar.y@nexaholdings.ae',
    jobTitle: 'IT Support Specialist',
    department: 'Technology',
    grade: 'G2',
    status: 'active',
    totalValue: 125000,
    utilizationPercent: 38,
  },
  {
    id: 'emp-009',
    firstName: 'Nadia',
    lastName: 'Mansour',
    email: 'nadia.m@nexaholdings.ae',
    jobTitle: 'Product Manager',
    department: 'Product',
    grade: 'G5',
    status: 'active',
    totalValue: 275000,
    utilizationPercent: 67,
  },
  {
    id: 'emp-010',
    firstName: 'Yusuf',
    lastName: 'Al-Farsi',
    email: 'yusuf.f@nexaholdings.ae',
    jobTitle: 'Accountant',
    department: 'Finance',
    grade: 'G3',
    status: 'active',
    totalValue: 155000,
    utilizationPercent: 54,
  },
];

// Unique departments for filter
const DEPARTMENTS = ['All Departments', ...new Set(DEMO_EMPLOYEES.map(e => e.department))];

// Status badge configuration
const STATUS_CONFIG: Record<EmployeeStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20',
  },
  on_leave: {
    label: 'On Leave',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  probation: {
    label: 'Probation',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
};

export default function EmployeeDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee360Data | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return DEMO_EMPLOYEES.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.id.toLowerCase().includes(searchLower);
      const matchesDept = departmentFilter === 'All Departments' || emp.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, departmentFilter]);

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Handle view action - open drawer
  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee as Employee360Data);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Employee Directory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredEmployees.length} of {DEMO_EMPLOYEES.length} employees
            </p>
          </div>
          <DemoModeBadge />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employee Table */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Employee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Employee</TableHead>
                <TableHead className="w-[200px]">Role</TableHead>
                <TableHead className="w-[80px]">Grade</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[130px] text-right">Total Value</TableHead>
                <TableHead className="w-[150px]">Utilization</TableHead>
                <TableHead className="w-[80px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(emp => (
                <TableRow 
                  key={emp.id} 
                  className="group cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleView(emp)}
                >
                  {/* Employee: Avatar + Name + Email */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={emp.avatarUrl} alt={`${emp.firstName} ${emp.lastName}`} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {getInitials(emp.firstName, emp.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role: Job Title + Department */}
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {emp.jobTitle}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {emp.department}
                      </p>
                    </div>
                  </TableCell>

                  {/* Grade Badge */}
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {emp.grade}
                    </Badge>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', STATUS_CONFIG[emp.status].className)}
                    >
                      {STATUS_CONFIG[emp.status].label}
                    </Badge>
                  </TableCell>

                  {/* Total Value */}
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrencyAED(emp.totalValue)}
                  </TableCell>

                  {/* Utilization Progress */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={emp.utilizationPercent} 
                        className={cn(
                          "h-2 flex-1",
                          emp.utilizationPercent >= 80 && "[&>div]:bg-success",
                          emp.utilizationPercent >= 50 && emp.utilizationPercent < 80 && "[&>div]:bg-primary",
                          emp.utilizationPercent < 50 && "[&>div]:bg-warning"
                        )}
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                        {emp.utilizationPercent}%
                      </span>
                    </div>
                  </TableCell>

                  {/* Action Button */}
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleView(emp)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View {emp.firstName}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <p className="text-muted-foreground">No employees found matching your criteria.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee 360 Drawer */}
      <Employee360Drawer
        employee={selectedEmployee}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
