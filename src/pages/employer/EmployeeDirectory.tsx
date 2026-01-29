/**
 * Employee Directory
 * 
 * Privacy-conscious, operational employee directory with Benefits Snapshot drawer.
 * No salary displayed unless explicit permission flag is present and logged.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StandardPageHeader } from '@/components/shared';
import {
  DirectoryStats,
  DirectoryTable,
  DirectoryFilters,
  BenefitsSnapshotDrawer,
  mockEmployees,
  getMockBenefitsSnapshot,
  DirectoryEmployee,
  EmployeeBenefitsSnapshot,
  EmployeeStatus,
} from '@/components/employer/directory';

export default function EmployeeDirectory() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');

  // Drawer state
  const [selectedSnapshot, setSelectedSnapshot] = useState<EmployeeBenefitsSnapshot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Derive unique values for filters
  const departments = useMemo(() => 
    [...new Set(mockEmployees.map(e => e.department))].sort(),
    []
  );
  const locations = useMemo(() => 
    [...new Set(mockEmployees.map(e => e.location))].sort(),
    []
  );

  const hasActiveFilters = 
    searchQuery !== '' || 
    departmentFilter !== 'all' || 
    locationFilter !== 'all' || 
    statusFilter !== 'all';

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = 
        searchQuery === '' ||
        fullName.includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower);
      
      const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesLocation = locationFilter === 'all' || emp.location === locationFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      
      return matchesSearch && matchesDept && matchesLocation && matchesStatus;
    });
  }, [searchQuery, departmentFilter, locationFilter, statusFilter]);

  // Handle view employee - open Benefits Snapshot drawer
  const handleViewEmployee = (employee: DirectoryEmployee) => {
    const snapshot = getMockBenefitsSnapshot(employee);
    setSelectedSnapshot(snapshot);
    setDrawerOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setLocationFilter('all');
    setStatusFilter('all');
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Standard Page Header - HR Ops variant */}
        <StandardPageHeader
          variant="hr_ops"
          title="Employee Directory"
          helperText={`${filteredEmployees.length} of ${mockEmployees.length} employees`}
          icon={Users}
          iconClassName="from-accent to-accent/80 shadow-accent/25"
          secondaryActions={
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          }
          metaBadges={[
            { label: `${mockEmployees.filter(e => e.status === 'active').length} Active`, variant: 'success' },
            { label: `${mockEmployees.filter(e => e.status === 'on_leave').length} On Leave`, variant: 'warning' },
          ]}
        />

        {/* Stats */}
        <DirectoryStats employees={mockEmployees} />

        {/* Filters */}
        <DirectoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          departmentFilter={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          locationFilter={locationFilter}
          onLocationChange={setLocationFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          departments={departments}
          locations={locations}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Employee Table */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employee Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DirectoryTable 
              employees={filteredEmployees} 
              onViewEmployee={handleViewEmployee}
            />
          </CardContent>
        </Card>

        {/* Benefits Snapshot Drawer */}
        <BenefitsSnapshotDrawer
          snapshot={selectedSnapshot}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </TooltipProvider>
  );
}
