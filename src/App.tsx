import { useState, useEffect } from "react";
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
import { PrivacyProvider } from "@/components/ui/privacy-toggle";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { DemoDataProvider } from "@/contexts/DemoDataContext";
import { DemoModeBadge } from "@/components/demo";
import { CommandPalette } from "@/components/ui/command-palette";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import OrgSuspended from "./pages/OrgSuspended";

import { EmployeeLayout } from "./components/layout/EmployeeLayout";
import { EmployerLayout } from "./components/layout/EmployerLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { VendorLayout } from "./components/layout/VendorLayout";

import EmployeeDashboard from "./pages/employee/Dashboard";
import ClaimsListPage from "./pages/employee/ClaimsList";
import UniversalRequestWizard from "./pages/employee/UniversalRequestWizard";
import ClaimDetailPage from "./pages/employee/ClaimDetail";
import HousingPage from "./pages/employee/Housing";
import SchoolingPage from "./pages/employee/Schooling";
import HealthPage from "./pages/employee/Health";
import LeavePage from "./pages/employee/Leave";
import MarketplacePage from "./pages/employee/Marketplace";
import DocumentsPage from "./pages/employee/Documents";
import GovConnectPage from "./pages/employee/GovConnect";
import ProfilePage from "./pages/employee/Profile";
import BenefitsPage from "./pages/employee/Benefits";
import BenefitsOverviewPage from "./pages/employee/BenefitsOverview";
import OnboardingPage from "./pages/employee/Onboarding";
import KnowledgeHubPage from "./pages/employee/KnowledgeHub";
import BenefitsAnalysisPage from "./pages/employee/BenefitsAnalysis";
import MyActionsPage from "./pages/employee/MyActions";
import OutOfPocketOptimizerPage from "./pages/employee/OutOfPocketOptimizer";
import MoneyPlannerPage from "./pages/employee/MoneyPlanner";
// Standardized benefit pages using BenefitDetailTemplate
import {
  HousingBenefitPage,
  SchoolingBenefitPage,
  HealthBenefitPage,
  TransportBenefitPage,
  WellbeingBenefitPage,
  LearningBenefitPage,
  LongTermFinancialsBenefitPage,
} from "./pages/employee/benefits";
import HousingMarketPage from "./pages/employee/benefits/HousingMarket";

import EmployerDashboard from "./pages/employer/Dashboard";
import SpendPage from "./pages/employer/Spend";
import ZombieSpendPage from "./pages/employer/ZombieSpend";
import SegmentsPage from "./pages/employer/Segments";
import BenchmarksPage from "./pages/employer/Benchmarks";
import ClaimsPage from "./pages/employer/Claims";
import SettlementsPage from "./pages/employer/Settlements";
import ReportsPage from "./pages/employer/Reports";
import CommunicationsPage from "./pages/employer/Communications";
import CalendarPage from "./pages/employer/Calendar";
import OpsPage from "./pages/employer/Ops";
import MarketplaceAnalyticsPage from "./pages/employer/MarketplaceAnalytics";
import PoliciesPage from "./pages/employer/Policies";
import IntegrationsPage from "./pages/employer/Integrations";
import RecommendationsPage from "./pages/employer/Recommendations";
import ActionPlanPage from "./pages/employer/ActionPlan";
import EmployerDataQualityRules from "./pages/employer/DataQualityRules";
import EmployerSyncMonitor from "./pages/employer/SyncMonitor";
import EmployeeDirectoryPage from "./pages/employer/EmployeeDirectory";
import AuditLogsPage from "./pages/employer/AuditLogs";
import DataQualityControlsPage from "./pages/employer/DataQualityControls";
import SecurityAuditLogsPage from "./pages/employer/SecurityAuditLogs";
import ActionWorkflowsPage from "./pages/employer/settings/ActionWorkflows";
import ApproverGroupsPage from "./pages/employer/settings/ApproverGroups";
import SetupPage from "./pages/employer/Setup";
import TemplatesPage from "./pages/employer/Templates";

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
import AdminUsersRoles from "./pages/admin/UsersRoles";
import AdminAuditLog from "./pages/admin/AuditLog";
import AdminVendors from "./pages/admin/Vendors";
import AdminOffers from "./pages/admin/Offers";
import AdminModeration from "./pages/admin/Moderation";
import AdminDataSources from "./pages/admin/DataSources";
import AdminSyncMonitor from "./pages/admin/SyncMonitor";
import AdminSecuritySettings from "./pages/admin/SecuritySettings";
import AdminFeatureFlags from "./pages/admin/FeatureFlags";
import AdminBilling from "./pages/admin/Billing";
import AdminDataQualityRules from "./pages/admin/DataQualityRules";
import AdminPolicyLibrary from "./pages/admin/PolicyLibrary";
import AdminPolicyTemplates from "./pages/admin/PolicyTemplates";
import AdminAlertsCenter from "./pages/admin/AlertsCenter";
import AdminSessionManagement from "./pages/admin/SessionManagement";
import AdminOnboarding from "./pages/admin/Onboarding";
import AdminIntegrationReadiness from "./pages/admin/IntegrationReadiness";
import DemoScriptPage from "./pages/Demo";
import AdminDemoTools from "./pages/admin/DemoTools";
import AdminQAChecklist from "./pages/admin/QAChecklist";

import VendorDashboard from "./pages/vendor/Dashboard";
import VendorOffers from "./pages/vendor/Offers";
import VendorTransactions from "./pages/vendor/Transactions";
import VendorEarnings from "./pages/vendor/Earnings";
import VendorAnalytics from "./pages/vendor/Analytics";
import VendorCreateOffer from "./pages/vendor/CreateOffer";
import VendorRedemptions from "./pages/vendor/Redemptions";
import VendorProfile from "./pages/vendor/Profile";
import VendorSettings from "./pages/vendor/Settings";

const queryClient = new QueryClient();

type UserRole = "employee" | "employer" | "admin" | "vendor";

function ProtectedRoute({
  children,
  allowedRoles,
  checkSuspension = true,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  checkSuspension?: boolean;
}) {
  const { user, role, loading } = useAuth();
  const [orgStatus, setOrgStatus] = useState<'active' | 'suspended' | 'loading'>('loading');

  // Check org suspension status
  useEffect(() => {
    async function checkOrgStatus() {
      if (!user || role === 'admin' || !checkSuspension) {
        setOrgStatus('active');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile?.organization_id) {
          setOrgStatus('active');
          return;
        }

        const { data: org } = await supabase
          .from('organizations')
          .select('status')
          .eq('id', profile.organization_id)
          .maybeSingle();

        setOrgStatus((org?.status as 'active' | 'suspended') || 'active');
      } catch {
        setOrgStatus('active');
      }
    }

    if (user && !loading) {
      checkOrgStatus();
    }
  }, [user, role, loading, checkSuspension]);

  if (loading || orgStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Block suspended orgs (except admins)
  if (orgStatus === 'suspended' && role !== 'admin') {
    return <OrgSuspended />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const roleRedirects: Record<UserRole, string> = {
      admin: "/admin",
      vendor: "/vendor",
      employer: "/employer",
      employee: "/employee",
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
      <Route path="/demo" element={<DemoScriptPage />} />

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="my-actions" element={<MyActionsPage />} />
        <Route path="benefits-analysis" element={<BenefitsAnalysisPage />} />
        <Route path="out-of-pocket" element={<OutOfPocketOptimizerPage />} />
        <Route path="money-planner" element={<MoneyPlannerPage />} />
        <Route path="benefits" element={<BenefitsOverviewPage />} />

        {/* Requests/Claims - new routes */}
        <Route path="requests" element={<ClaimsListPage />} />
        <Route path="requests/new" element={<UniversalRequestWizard />} />
        <Route path="requests/:id" element={<ClaimDetailPage />} />
        
        <Route path="housing" element={<HousingPage />} />
        <Route path="housing/market" element={<HousingMarketPage />} />
        <Route path="schooling" element={<SchoolingPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="transport" element={<TransportBenefitPage />} />
        <Route path="wellbeing" element={<WellbeingBenefitPage />} />
        <Route path="long-term-financials" element={<LongTermFinancialsBenefitPage />} />
        <Route path="learning" element={<LearningBenefitPage />} />
        {/* Legacy routes - redirect to consolidated page */}
        <Route path="bonus" element={<Navigate to="/employee/long-term-financials" replace />} />
        <Route path="equity" element={<Navigate to="/employee/long-term-financials" replace />} />
        <Route path="financial" element={<Navigate to="/employee/long-term-financials" replace />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="gov-connect" element={<GovConnectPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="knowledge" element={<KnowledgeHubPage />} />
        
        {/* Standardized benefit routes using BenefitDetailTemplate */}
        <Route path="benefits/overview" element={<BenefitsOverviewPage />} />
        <Route path="benefits/housing" element={<HousingBenefitPage />} />
        <Route path="benefits/schooling" element={<SchoolingBenefitPage />} />
        <Route path="benefits/health" element={<HealthBenefitPage />} />
        <Route path="benefits/transport" element={<TransportBenefitPage />} />
        <Route path="benefits/wellbeing" element={<WellbeingBenefitPage />} />
        <Route path="benefits/learning" element={<LearningBenefitPage />} />
        <Route path="benefits/long-term-financials" element={<LongTermFinancialsBenefitPage />} />

        {/* Keep as-is for now */}
        <Route path="security" element={<Navigate to="/employee/profile" replace />} />
      </Route>

      {/* Employer Routes */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployerDashboard />} />
        <Route path="spend" element={<SpendPage />} />
        <Route path="optimization" element={<ZombieSpendPage />} />
        <Route path="zombie" element={<ZombieSpendPage />} />
        <Route path="actions" element={<ActionPlanPage />} />
        <Route path="segments" element={<SegmentsPage />} />
        <Route path="benchmarks" element={<BenchmarksPage />} />
        <Route path="claims" element={<Navigate to="/employer/ops" replace />} />
        <Route path="settlements" element={<SettlementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="communications" element={<CommunicationsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="ops" element={<OpsPage />} />
        <Route path="employees" element={<EmployeeDirectoryPage />} />
        <Route path="audit" element={<SecurityAuditLogsPage />} />
        <Route path="audit-legacy" element={<AuditLogsPage />} />
        <Route path="data-controls" element={<DataQualityControlsPage />} />
        <Route path="marketplace" element={<MarketplaceAnalyticsPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="data-quality" element={<EmployerDataQualityRules />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="data-quality/rules" element={<EmployerDataQualityRules />} />
        <Route path="data-quality/sync" element={<EmployerSyncMonitor />} />
        <Route path="settings/workflows" element={<ActionWorkflowsPage />} />
        <Route path="settings/approver-groups" element={<ApproverGroupsPage />} />
        <Route path="setup" element={<SetupPage />} />
        <Route path="templates" element={<TemplatesPage />} />
      </Route>

      {/* Admin Routes - Platform owner only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="benchmarks" element={<AdminBenchmarks />} />
        <Route path="market" element={<AdminMarketIntelligence />} />
        <Route path="spending" element={<AdminSpendingPatterns />} />
        <Route path="reports" element={<AdminSavedReports />} />
        <Route path="organizations" element={<AdminOrganizations />} />
        <Route path="organizations/:orgId/settings" element={<AdminOrganizationSettings />} />
        <Route path="onboarding" element={<AdminOnboarding />} />
        <Route path="integration-readiness" element={<AdminIntegrationReadiness />} />
        <Route path="users" element={<AdminUsersRoles />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="ui-config" element={<AdminUIConfiguration />} />
        <Route path="data-migration" element={<AdminDataMigration />} />
        {/* Marketplace Governance */}
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="moderation" element={<AdminModeration />} />
        {/* Data & Integrations */}
        <Route path="data-sources" element={<AdminDataSources />} />
        <Route path="data-quality" element={<AdminDataMigration />} />
        <Route path="data-quality-rules" element={<AdminDataQualityRules />} />
        <Route path="sync-monitor" element={<AdminSyncMonitor />} />
        {/* Security & Configuration */}
        <Route path="security" element={<AdminSecuritySettings />} />
        <Route path="sessions" element={<AdminSessionManagement />} />
        <Route path="feature-flags" element={<AdminFeatureFlags />} />
        <Route path="billing" element={<AdminBilling />} />
        {/* Content & Alerts */}
        <Route path="policy-templates" element={<AdminPolicyTemplates />} />
        <Route path="policy-library" element={<AdminPolicyLibrary />} />
        <Route path="alerts" element={<AdminAlertsCenter />} />
        {/* Demo & QA Tools */}
        <Route path="demo-tools" element={<AdminDemoTools />} />
        <Route path="qa-checklist" element={<AdminQAChecklist />} />
      </Route>

      {/* Vendor Routes */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboard />} />
        <Route path="offers" element={<VendorOffers />} />
        <Route path="offers/new" element={<VendorCreateOffer />} />
        <Route path="redemptions" element={<VendorRedemptions />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="transactions" element={<VendorTransactions />} />
        <Route path="earnings" element={<VendorEarnings />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="settings" element={<VendorSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <ProfileProvider>
              <PrivacyProvider>
                <DemoModeProvider>
                  <DemoDataProvider>
                    <UIVisibilityProvider>
                      <SecurityProvider enableSessionTimeout={true}>
                        <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <CommandPalette />
                          <AppRoutes />
                          <DemoModeBadge />
                        </TooltipProvider>
                      </SecurityProvider>
                    </UIVisibilityProvider>
                  </DemoDataProvider>
                </DemoModeProvider>
              </PrivacyProvider>
            </ProfileProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
