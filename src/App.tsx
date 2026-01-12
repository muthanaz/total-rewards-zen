import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import { EmployeeLayout } from "./components/layout/EmployeeLayout";
import { EmployerLayout } from "./components/layout/EmployerLayout";

import EmployeeDashboard from "./pages/employee/Dashboard";
import HousingPage from "./pages/employee/Housing";
import SchoolingPage from "./pages/employee/Schooling";
import HealthPage from "./pages/employee/Health";
import TransportPage from "./pages/employee/Transport";
import WellbeingPage from "./pages/employee/Wellbeing";
import FinancialPage from "./pages/employee/Financial";
import EquityPage from "./pages/employee/Equity";
import LearningPage from "./pages/employee/Learning";
import LeavePage from "./pages/employee/Leave";
import MarketplacePage from "./pages/employee/Marketplace";
import DocumentsPage from "./pages/employee/Documents";
import GovConnectPage from "./pages/employee/GovConnect";
import ProfilePage from "./pages/employee/Profile";
import BenefitsPage from "./pages/employee/Benefits";
import OnboardingPage from "./pages/employee/Onboarding";

import EmployerDashboard from "./pages/employer/Dashboard";
import SpendPage from "./pages/employer/Spend";
import ZombieSpendPage from "./pages/employer/ZombieSpend";
import SegmentsPage from "./pages/employer/Segments";
import ClaimsPage from "./pages/employer/Claims";
import MarketplaceAnalyticsPage from "./pages/employer/MarketplaceAnalytics";
import PoliciesPage from "./pages/employer/Policies";
import IntegrationsPage from "./pages/employer/Integrations";
import RecommendationsPage from "./pages/employer/Recommendations";

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
        <Route path="benefits" element={<BenefitsPage />} />
        <Route path="housing" element={<HousingPage />} />
        <Route path="schooling" element={<SchoolingPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="wellbeing" element={<WellbeingPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="equity" element={<EquityPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="gov-connect" element={<GovConnectPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>
      
      {/* Employer Routes */}
      <Route path="/employer" element={<ProtectedRoute allowedRole="employer"><EmployerLayout /></ProtectedRoute>}>
        <Route index element={<EmployerDashboard />} />
        <Route path="spend" element={<SpendPage />} />
        <Route path="zombie" element={<ZombieSpendPage />} />
        <Route path="segments" element={<SegmentsPage />} />
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="marketplace" element={<MarketplaceAnalyticsPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
