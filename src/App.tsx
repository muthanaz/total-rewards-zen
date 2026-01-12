import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import { EmployeeLayout } from "./components/layout/EmployeeLayout";
import { EmployerLayout } from "./components/layout/EmployerLayout";

import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployerDashboard from "./pages/employer/Dashboard";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'employee' | 'employer' }) {
  const { user, role, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'employer' ? '/employer' : '/employee'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute allowedRole="employee"><EmployeeLayout /></ProtectedRoute>}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="housing" element={<EmployeeDashboard />} />
        <Route path="schooling" element={<EmployeeDashboard />} />
        <Route path="health" element={<EmployeeDashboard />} />
        <Route path="transport" element={<EmployeeDashboard />} />
        <Route path="wellbeing" element={<EmployeeDashboard />} />
        <Route path="financial" element={<EmployeeDashboard />} />
        <Route path="equity" element={<EmployeeDashboard />} />
        <Route path="learning" element={<EmployeeDashboard />} />
        <Route path="leave" element={<EmployeeDashboard />} />
        <Route path="marketplace" element={<EmployeeDashboard />} />
        <Route path="documents" element={<EmployeeDashboard />} />
        <Route path="gov-connect" element={<EmployeeDashboard />} />
        <Route path="profile" element={<EmployeeDashboard />} />
      </Route>
      
      {/* Employer Routes */}
      <Route path="/employer" element={<ProtectedRoute allowedRole="employer"><EmployerLayout /></ProtectedRoute>}>
        <Route index element={<EmployerDashboard />} />
        <Route path="spend" element={<EmployerDashboard />} />
        <Route path="zombie" element={<EmployerDashboard />} />
        <Route path="segments" element={<EmployerDashboard />} />
        <Route path="claims" element={<EmployerDashboard />} />
        <Route path="marketplace" element={<EmployerDashboard />} />
        <Route path="policies" element={<EmployerDashboard />} />
        <Route path="recommendations" element={<EmployerDashboard />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;