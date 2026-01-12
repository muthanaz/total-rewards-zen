import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from './EmployeeSidebar';

export function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-background">
      <EmployeeSidebar />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}