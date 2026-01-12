import { Outlet } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';

export function EmployerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <EmployerSidebar />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}