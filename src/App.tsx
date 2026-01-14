import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { UIVisibilityProvider } from "@/contexts/UIVisibilityContext";
import { PeriodProvider } from "@/contexts/PeriodContext";
import { PrivacyProvider } from "@/components/ui/privacy-toggle";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import { EmployeeLayout } from "./components/layout/EmployeeLayout";
import { EmployerLayout } from "./components/layout/EmployerLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { VendorLayout } from "./components/layout/VendorLayout";

import EmployeeDashboard from "./pages/employee/Dashboard";
import HousingPage from "./pages/employee/Housing";
import SchoolingPage from "./pages/employee/Schooling";
import HealthPage from "./pages/employee/Health";
import TransportPage from "./pages/employee/Transport";
import WellbeingPage from "./pages/employee/Wellbeing";
import FinancialPage from "./pages/employee/Financial";
import GratuityPage from "./pages/employee/Gratuity";
import BonusPage from "./pages/employee/Bonus";
import EquityPage from "./pages/employee/Equity";
import LearningPage from "./pages/employee/Learning";
import LeavePage from "./pages/employee/Leave";
import MarketplacePage from "./pages/employee/Marketplace";
import DocumentsPage from "./pages/employee/Documents";
import GovConnectPage from "./pages/employee/GovConnect";
import ProfilePage from "./pages/employee/Profile";
import BenefitsPage from "./pages/employee/Benefits";
import OnboardingPage from "./pages/employee/Onboarding";
import KnowledgeHubPage from "./pages/employee/KnowledgeHub";
import BenefitsAnalysisPage from "./pages/employee/BenefitsAnalysis";

import EmployerDashboard from "./pages/employer/Dashboard";
import SpendPage from "./pages/employer/Spend";
import WasteRecoveryPage from "./pages/employer/WasteRecovery";
import SegmentsPage from "./pages/employer/Segments";
import ClaimsPage from "./pages/employer/Claims";
import MarketplaceAnalyticsPage from "./pages/employer/MarketplaceAnalytics";
import PolicyHubPage from "./pages/employer/PolicyHub";
import IntegrationsPage from "./pages/employer/Integrations";
import RecommendationsPage from "./pages/employer/Recommendations";
import ForecastingPage from "./pages/employer/Forecasting";
import SatisfactionPulsePage from "./pages/employer/SatisfactionPulse";
import ComplianceAuditPage from "./pages/employer/ComplianceAudit";
import KnowledgeCenterPage from "./pages/employer/KnowledgeCenter";

import MetricsDictionaryPage from "./pages/employer/MetricsDictionary";
import ActionPlanPage from "./pages/employer/ActionPlan";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminBenchmarks from "./pages/admin/Benchmarks";
import AdminMarketIntelligence from "./pages/admin/MarketIntelligence";
import AdminSpendingPatterns from "./pages/admin/SpendingPatterns";
import AdminSavedReports from "./pages/admin/SavedReports";
import AdminSettings from "./pages/admin/Settings";
import AdminOrganizations from "./pages/admin/Organizations";
import AdminOrganizationSettings from "./pages/admin/OrganizationSettings";
import AdminUIConfiguration from "./pages/admin/UIConfiguration";
import AdminDataMigration from "./pages/admin/DataMigration";
import AdminTenantIsolationTest from "./pages/admin/TenantIsolationTest";
import AdminDataQualityPage from "./pages/admin/DataQuality";
import AdminBenchmarkMethodologyPage from "./pages/admin/BenchmarkMethodology";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorOffers from "./pages/vendor/Offers";
import VendorTransactions from "./pages/vendor/Transactions";
import VendorEarnings from "./pages/vendor/Earnings";
import VendorAnalytics from "./pages/vendor/Analytics";
import VendorCreateOffer from "./pages/vendor/CreateOffer";
import VendorProfile from "./pages/vendor/Profile";
import VendorSettings from "./pages/vendor/Settings";
import VendorPayouts from "./pages/vendor/Payouts";
import VendorOfferQuality from "./pages/vendor/OfferQuality";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes default
    },
  },
});

type UserRole = 'employee' | 'employer' | 'admin' | 'vendor';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { user, role, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<UserRole, string> = {
      admin: '/admin',
      vendor: '/vendor',
      employer: '/employer',
      employee: '/employee',
    };
    return <Navigate to={roleRedirects[role]} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLayout /></ProtectedRoute>}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="benefits-analysis" element={<BenefitsAnalysisPage />} />
        <Route path="benefits" element={<BenefitsPage />} />
        <Route path="housing" element={<HousingPage />} />
        <Route path="schooling" element={<SchoolingPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="wellbeing" element={<WellbeingPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="gratuity" element={<GratuityPage />} />
        <Route path="bonus" element={<BonusPage />} />
        <Route path="equity" element={<EquityPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="gov-connect" element={<GovConnectPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="knowledge" element={<KnowledgeHubPage />} />
        <Route path="security" element={<Navigate to="/employee/profile" replace />} />
      </Route>
      
      {/* Employer Routes */}
      <Route path="/employer" element={<ProtectedRoute allowedRoles={['employer']}><EmployerLayout /></ProtectedRoute>}>
        <Route index element={<EmployerDashboard />} />
        <Route path="spend" element={<SpendPage />} />
        <Route path="zombie" element={<WasteRecoveryPage />} />
        <Route path="segments" element={<SegmentsPage />} />
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="marketplace" element={<MarketplaceAnalyticsPage />} />
        <Route path="policies" element={<PolicyHubPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="forecasting" element={<ForecastingPage />} />
        <Route path="satisfaction" element={<SatisfactionPulsePage />} />
        <Route path="compliance" element={<ComplianceAuditPage />} />
        <Route path="knowledge" element={<KnowledgeCenterPage />} />
        <Route path="metrics" element={<MetricsDictionaryPage />} />
        <Route path="actions" element={<ActionPlanPage />} />
      </Route>
      
      {/* Admin Routes - Platform owner only */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="benchmarks" element={<AdminBenchmarks />} />
        <Route path="market" element={<AdminMarketIntelligence />} />
        <Route path="spending" element={<AdminSpendingPatterns />} />
        <Route path="reports" element={<AdminSavedReports />} />
        <Route path="organizations" element={<AdminOrganizations />} />
        <Route path="organizations/:orgId/settings" element={<AdminOrganizationSettings />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="ui-config" element={<AdminUIConfiguration />} />
        <Route path="data-migration" element={<AdminDataMigration />} />
        <Route path="tenant-test" element={<AdminTenantIsolationTest />} />
        <Route path="data-quality" element={<AdminDataQualityPage />} />
        <Route path="benchmark-methodology" element={<AdminBenchmarkMethodologyPage />} />
      </Route>
      
      {/* Vendor Routes */}
      <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorLayout /></ProtectedRoute>}>
        <Route index element={<VendorDashboard />} />
        <Route path="offers" element={<VendorOffers />} />
        <Route path="offers/new" element={<VendorCreateOffer />} />
        <Route path="offer-quality" element={<VendorOfferQuality />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="transactions" element={<VendorTransactions />} />
        <Route path="earnings" element={<VendorEarnings />} />
        <Route path="payouts" element={<VendorPayouts />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="settings" element={<VendorSettings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ProfileProvider>
            <PrivacyProvider>
              <PeriodProvider>
                <UIVisibilityProvider>
                  <SecurityProvider enableSessionTimeout={true}>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <AppRoutes />
                    </TooltipProvider>
                  </SecurityProvider>
                </UIVisibilityProvider>
              </PeriodProvider>
            </PrivacyProvider>
          </ProfileProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;