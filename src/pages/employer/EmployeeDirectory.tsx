/**
 * Employee Directory
 * 
 * Privacy-conscious, operational employee directory with Benefits Snapshot drawer.
 * No salary displayed unless explicit permission flag is present and logged.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Employee Directory
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredEmployees.length} of {mockEmployees.length} employees
              </p>
            </div>
            <DemoModeBadge />
          </div>
        </div>

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
