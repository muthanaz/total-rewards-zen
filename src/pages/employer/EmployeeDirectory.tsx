import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Building2, MapPin, Filter, Download, UserPlus } from 'lucide-react';
import { cn, formatInteger } from '@/lib/utils';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';

// Demo employee data
const DEMO_EMPLOYEES = [
  { id: '1', name: 'Sarah Ahmed', email: 'sarah.ahmed@company.com', department: 'Engineering', location: 'Dubai HQ', grade: 'G5', status: 'active', startDate: '2021-03-15' },
  { id: '2', name: 'Mohammed Al-Rashid', email: 'mohammed.r@company.com', department: 'Finance', location: 'Dubai HQ', grade: 'G6', status: 'active', startDate: '2020-08-01' },
  { id: '3', name: 'Fatima Khan', email: 'fatima.k@company.com', department: 'HR', location: 'Abu Dhabi', grade: 'G4', status: 'active', startDate: '2022-01-10' },
  { id: '4', name: 'Ali Hassan', email: 'ali.h@company.com', department: 'Operations', location: 'Field Ops', grade: 'G3', status: 'active', startDate: '2019-06-20' },
  { id: '5', name: 'Layla Omar', email: 'layla.o@company.com', department: 'Marketing', location: 'Dubai HQ', grade: 'G5', status: 'on_leave', startDate: '2021-11-05' },
  { id: '6', name: 'Khalid Ibrahim', email: 'khalid.i@company.com', department: 'Engineering', location: 'Remote', grade: 'G4', status: 'active', startDate: '2023-02-14' },
  { id: '7', name: 'Amira Saleh', email: 'amira.s@company.com', department: 'Legal', location: 'Dubai HQ', grade: 'G7', status: 'active', startDate: '2018-04-22' },
  { id: '8', name: 'Omar Youssef', email: 'omar.y@company.com', department: 'IT', location: 'Abu Dhabi', grade: 'G5', status: 'probation', startDate: '2024-01-08' },
];

const DEPARTMENTS = ['All', 'Engineering', 'Finance', 'HR', 'Operations', 'Marketing', 'Legal', 'IT'];
const LOCATIONS = ['All', 'Dubai HQ', 'Abu Dhabi', 'Field Ops', 'Remote'];
const STATUSES = ['All', 'active', 'on_leave', 'probation'];

export default function EmployeeDirectory() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredEmployees = DEMO_EMPLOYEES.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
    const matchesLoc = locationFilter === 'All' || emp.location === locationFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesLoc && matchesStatus;
  });

  const stats = {
    total: DEMO_EMPLOYEES.length,
    active: DEMO_EMPLOYEES.filter(e => e.status === 'active').length,
    onLeave: DEMO_EMPLOYEES.filter(e => e.status === 'on_leave').length,
    probation: DEMO_EMPLOYEES.filter(e => e.status === 'probation').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'on_leave':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">On Leave</Badge>;
      case 'probation':
        return <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">Probation</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {language === 'ar' ? 'دليل الموظفين' : 'Employee Directory'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' ? 'عرض وإدارة سجلات الموظفين' : 'View and manage employee records'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DemoModeBadge />
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.total)}</p>
                  <p className="text-xs text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.active)}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Users className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.onLeave)}</p>
                  <p className="text-xs text-muted-foreground">On Leave</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.probation)}</p>
                  <p className="text-xs text-muted-foreground">Probation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
              <div className="relative flex-1">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                <Input
                  placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn('h-9', isRTL ? 'pr-10' : 'pl-10')}
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s === 'All' ? 'All' : s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              {language === 'ar' ? 'سجلات الموظفين' : 'Employee Records'}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredEmployees.length} of {DEMO_EMPLOYEES.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(emp => (
                  <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.location}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{emp.grade}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(emp.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.startDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
