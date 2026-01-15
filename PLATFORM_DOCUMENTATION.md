# bnft. Platform - Complete Technical Documentation

> **Version:** 3.0 | **Last Updated:** January 2026  
> **Purpose:** Comprehensive technical specification for AI assistants and developers  
> **Format:** Optimized for ChatGPT/AI consumption with full platform details

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Complete Database Schema](#4-complete-database-schema)
5. [Security & RLS Policies](#5-security--rls-policies)
6. [User Portals & Pages](#6-user-portals--pages)
7. [Navigation Architecture](#7-navigation-architecture)
8. [Key Components Library](#8-key-components-library)
9. [Design System](#9-design-system)
10. [Data Hooks & State Management](#10-data-hooks--state-management)
11. [Authentication & Demo Accounts](#11-authentication--demo-accounts)
12. [Feature Workflows](#12-feature-workflows)
13. [UI Patterns & UX Guidelines](#13-ui-patterns--ux-guidelines)
14. [API & Database Functions](#14-api--database-functions)
15. [Responsive Design](#15-responsive-design)

---

## 1. Executive Summary

### Platform Purpose
**bnft.** is a Total Rewards & Benefits Management SaaS platform designed for UAE-based enterprises. It provides:
- **Employee Portal:** Full visibility into compensation, benefits, and entitlements with self-service claims
- **Employer Portal:** Analytics, claims management, strategic planning, and data-driven insights
- **Admin Portal:** Platform-wide benchmarking, data quality management, and configuration
- **Vendor Portal:** Marketplace offer management, performance analytics, and payout tracking

### Core Value Proposition
- Complete benefits visibility and self-service for employees
- Employer analytics with confidence-based metrics and AI insights
- Multi-tenant architecture with strict organization isolation via RLS
- Bilingual support (English/Arabic) with full RTL layout support
- Role-based access control (employee, employer, admin, vendor)

### Target Users
- UAE-based enterprises (SME to Enterprise)
- HR/Benefits administrators
- Employees seeking benefits transparency
- Marketplace vendors offering corporate perks

### Live URLs
- Preview: `https://id-preview--1b3e81ee-6249-4528-9b3d-dd306a1bae24.lovable.app`
- Published: `https://total-rewards-zen.lovable.app`

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | 50+ accessible UI components |
| TanStack React Query | 5.83.0 | Data fetching, caching, synchronization |
| React Router | 6.30.3 | Client-side routing |
| Framer Motion | 12.25.0 | Animations & transitions |
| Recharts | 2.15.4 | Data visualization |
| date-fns | 3.6.0 | Date manipulation |
| Zod | 3.25.76 | Schema validation |
| React Hook Form | 7.61.1 | Form state management |

### Backend (Supabase/Lovable Cloud)
| Service | Purpose |
|---------|---------|
| PostgreSQL 14.x | Primary database |
| Supabase Auth | User authentication & session management |
| Edge Functions (Deno) | Serverless APIs |
| Row Level Security (RLS) | Multi-tenant data isolation |
| Realtime | Live data subscriptions |

### Project Structure
```
src/
├── components/
│   ├── admin/          # Admin-specific components (DataImportWizard, etc.)
│   ├── auth/           # MFA, password strength, challenges
│   ├── charts/         # 7 animated chart components
│   ├── dashboard/      # Shared dashboard widgets
│   ├── employee/       # Employee-specific components
│   ├── employer/       # Employer-specific components (20+ components)
│   ├── layout/         # 4 role-specific layouts + sidebars
│   ├── notifications/  # NotificationCenter
│   ├── security/       # Privacy, session management
│   └── ui/             # 60+ shadcn/ui components + custom
├── contexts/           # 7 React contexts
├── hooks/              # 15+ custom React hooks
├── integrations/       # Supabase client & auto-generated types
├── lib/                # Utilities, constants, color system
├── pages/
│   ├── admin/          # 13 admin pages
│   ├── employee/       # 21 employee pages
│   ├── employer/       # 15 employer pages
│   └── vendor/         # 10 vendor pages
├── App.tsx             # Root component with routing
└── main.tsx            # App entry point

supabase/
├── config.toml         # Supabase configuration
└── functions/          # Edge functions (rate-limit-auth, account-lockout)
```

---

## 3. Application Architecture

### Context Providers (Wrapper Order)
```tsx
<QueryClientProvider>        // React Query
  <BrowserRouter>            // Routing
    <LanguageProvider>       // i18n (en/ar)
      <AuthProvider>         // User auth state
        <ProfileProvider>    // User profile data
          <PrivacyProvider>  // Salary visibility
            <PeriodProvider> // Date range (MTD/QTD/YTD)
              <UIVisibilityProvider> // Element visibility
                <SecurityProvider>   // Session timeout
                  <TooltipProvider>
                    {/* App Content */}
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
```

### Role-Based Routing
```tsx
// Protected route with role enforcement
<Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLayout /></ProtectedRoute>}>
  <Route index element={<EmployeeDashboard />} />
  // ... child routes
</Route>

// Role redirects when accessing wrong portal
const roleRedirects = {
  admin: '/admin',
  vendor: '/vendor',
  employer: '/employer',
  employee: '/employee',
};
```

### Layout Components
| Layout | Sidebar | Features |
|--------|---------|----------|
| EmployeeLayout | EmployeeSidebar | Breadcrumbs, PageTransition |
| EmployerLayout | EmployerSidebar | Breadcrumbs, PageTransition, ViewToggle |
| AdminLayout | AdminSidebar | Clean navigation |
| VendorLayout | VendorSidebar | Offer management focus |

---

## 4. Complete Database Schema

### 4.1 Core Tables (37 Total)

#### `profiles` - User profile data
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL UNIQUE           -- Links to auth.users
organization_id UUID                   -- Multi-tenant link
email TEXT
first_name TEXT, last_name TEXT
phone TEXT, nationality TEXT
date_of_birth DATE
emirates_id TEXT                       -- Sensitive
passport_number TEXT                   -- Sensitive
blood_type TEXT
employment_date DATE
monthly_salary NUMERIC                 -- Sensitive
grade TEXT                             -- 'G1', 'G2', 'M1', 'M2', etc.
position TEXT, department TEXT
manager_name TEXT
work_location TEXT, home_location TEXT
marital_status TEXT
spouse_name TEXT, spouse_employer TEXT
emergency_contact_name TEXT, emergency_contact_phone TEXT
interests TEXT[], pets TEXT[], cars TEXT[]
avatar_url TEXT
preferred_language TEXT DEFAULT 'en'
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

#### `organizations` - Multi-tenant configuration
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
domain TEXT
logo_url TEXT
primary_color TEXT DEFAULT '#0f766e'
secondary_color TEXT DEFAULT '#115e59'
accent_color TEXT DEFAULT '#2dd4bf'
welcome_message TEXT, footer_text TEXT
survey_start_month INTEGER DEFAULT 10
survey_end_month INTEGER DEFAULT 12
settings JSONB DEFAULT '{}'
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

#### `user_roles` - Role assignments
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL UNIQUE
role user_role NOT NULL DEFAULT 'employee'
created_at TIMESTAMPTZ

-- Enum: user_role = 'employee' | 'employer' | 'admin' | 'vendor'
```

#### `benefits` - Benefit catalog
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
description TEXT
benefit_type benefit_type NOT NULL     -- Enum
life_area life_area NOT NULL           -- Enum
icon TEXT
annual_value NUMERIC
policy_bullets TEXT[]
is_active BOOLEAN DEFAULT true
created_at TIMESTAMPTZ

-- benefit_type: 'cash_allowances' | 'health_protection' | 'time_off_flex' | 'growth_career' | 'wealth_ownership' | 'wellbeing'
-- life_area: 'home_living' | 'family_parenting' | 'health' | 'money' | 'career' | 'lifestyle' | 'mobility'
```

#### `benefit_entitlements` - User allocations
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
benefit_id UUID REFERENCES benefits(id)
organization_id UUID REFERENCES organizations(id)
annual_allowance NUMERIC NOT NULL
utilized_amount NUMERIC DEFAULT 0
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

#### `benefit_grade_eligibility` - Grade-based rules
```sql
id UUID PRIMARY KEY
benefit_id UUID REFERENCES benefits(id)
grade TEXT NOT NULL
is_eligible BOOLEAN DEFAULT true
annual_allowance NUMERIC
coverage_percent NUMERIC
max_claim_per_transaction NUMERIC
max_dependents INTEGER
dependent_coverage TEXT
waiting_period_days INTEGER DEFAULT 0
requires_documentation BOOLEAN DEFAULT true
notes TEXT
```

#### `requests` - Claims, requests, questions
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
organization_id UUID REFERENCES organizations(id)
request_type request_type NOT NULL
subject TEXT NOT NULL
category TEXT NOT NULL
description TEXT
amount NUMERIC
status request_status DEFAULT 'pending'
priority TEXT DEFAULT 'medium'
assigned_to UUID
sla_due_at TIMESTAMPTZ
reviewed_by UUID
reviewed_at TIMESTAMPTZ
reviewer_notes TEXT
last_status_change_at TIMESTAMPTZ
created_at TIMESTAMPTZ

-- request_type: 'claim' | 'request' | 'question'
-- request_status: 'pending' | 'approved' | 'rejected' | 'draft' | 'submitted' | 'in_review' | 'paid' | 'closed'
```

#### `request_events` - Status change audit
```sql
id UUID PRIMARY KEY
request_id UUID REFERENCES requests(id)
actor_user_id UUID NOT NULL
from_status TEXT
to_status TEXT NOT NULL
notes_internal TEXT                    -- Employer-only
notes_employee_visible TEXT            -- Shared with employee
created_at TIMESTAMPTZ
```

### 4.2 Supporting Tables

#### Leave Management
```sql
TABLE leave_balances:
  id, user_id, organization_id
  leave_type TEXT  -- 'annual', 'sick', 'maternity', 'paternity', 'personal', 'compassionate'
  total_days INTEGER, used_days INTEGER DEFAULT 0
  year INTEGER, created_at
```

#### Children & Dependents
```sql
TABLE children:
  id, user_id, organization_id
  name TEXT, date_of_birth DATE
  grade TEXT, school_name TEXT
  created_at
```

#### Housing
```sql
TABLE housing_areas:
  id, name TEXT
  avg_rent_studio, avg_rent_1br, avg_rent_2br, avg_rent_3br NUMERIC
  commute_to_difc_mins INTEGER

TABLE housing_listings:
  id, title TEXT, area TEXT
  bedrooms INTEGER, bathrooms INTEGER
  annual_rent NUMERIC
  amenities TEXT[], rating NUMERIC
  property_finder_url, bayut_url, dubizzle_url TEXT
```

#### Education
```sql
TABLE schools:
  id, name TEXT
  curriculum TEXT  -- 'British', 'American', 'IB', 'Indian', etc.
  location TEXT, grade_range TEXT
  annual_fee NUMERIC
  facilities TEXT[], rating NUMERIC
  website_url TEXT
```

#### Healthcare
```sql
TABLE health_providers:
  id, name TEXT
  provider_type TEXT  -- 'hospital', 'clinic', 'pharmacy', 'dental'
  specialty TEXT, area TEXT
  address TEXT, phone TEXT
  in_network BOOLEAN DEFAULT true
  rating NUMERIC
```

### 4.3 Per Diem & Travel
```sql
TABLE per_diem_rates:
  id, grade TEXT
  destination_type TEXT  -- 'domestic', 'gcc', 'international'
  region TEXT, country TEXT, city TEXT
  daily_accommodation, daily_meals, daily_transport, daily_incidentals NUMERIC
  daily_total NUMERIC
  currency TEXT DEFAULT 'AED'
  effective_from DATE, effective_until DATE
  is_active BOOLEAN DEFAULT true

TABLE per_diem_claims:
  id, user_id, organization_id, rate_id
  trip_purpose TEXT, trip_reference TEXT
  destination_country TEXT, destination_city TEXT
  departure_date DATE, return_date DATE
  number_of_days INTEGER
  total_amount NUMERIC
  status TEXT DEFAULT 'pending'
```

### 4.4 Employer Tables
```sql
TABLE employer_actions:
  id, organization_id UUID NOT NULL
  title TEXT NOT NULL, description TEXT
  status TEXT DEFAULT 'planned'  -- 'planned', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium'
  due_date DATE, owner_user_id UUID
  source_insight TEXT
  metric_keys TEXT[] DEFAULT '{}'
  expected_impact JSONB DEFAULT '{}'
  completed_at, created_at, updated_at

TABLE org_budgets:
  id, organization_id UUID NOT NULL
  fiscal_year INTEGER NOT NULL
  annual_budget NUMERIC DEFAULT 0
  budget_allocated JSONB DEFAULT '{}'

TABLE employee_satisfaction_ratings:
  id, user_id UUID NOT NULL
  category TEXT DEFAULT 'overall'  -- 'overall', 'benefits', 'culture', 'compensation'
  rating INTEGER NOT NULL  -- 1-5
  feedback TEXT
  period_month INTEGER, period_year INTEGER
```

### 4.5 Marketplace & Vendor
```sql
TABLE marketplace_offers:
  id, vendor_id UUID
  title TEXT, merchant TEXT, category TEXT
  description TEXT, discount_percent INTEGER
  image_url TEXT, terms TEXT
  tags TEXT[], rating NUMERIC
  is_active BOOLEAN DEFAULT true

TABLE perk_activations:
  id, user_id UUID, offer_id UUID, organization_id UUID
  activated_at TIMESTAMPTZ

TABLE vendors:
  id, user_id UUID NOT NULL UNIQUE
  company_name TEXT NOT NULL
  description TEXT, logo_url TEXT
  website_url TEXT, contact_email TEXT
  commission_rate NUMERIC
  total_transactions INTEGER DEFAULT 0
  total_revenue NUMERIC DEFAULT 0
  is_active BOOLEAN DEFAULT true

TABLE vendor_transactions:
  id, vendor_id UUID, user_id UUID, offer_id UUID
  transaction_type TEXT DEFAULT 'redemption'
  original_amount NUMERIC, discount_amount NUMERIC
  commission_amount NUMERIC NOT NULL
  status TEXT DEFAULT 'pending'  -- 'pending', 'confirmed', 'settled'
```

### 4.6 Platform & Analytics
```sql
TABLE platform_analytics:
  id, metric_name TEXT, metric_type TEXT
  metric_value NUMERIC
  period_start DATE, period_end DATE
  industry TEXT, region TEXT, company_size TEXT

TABLE metric_definitions:
  key TEXT PRIMARY KEY
  name_en TEXT, name_ar TEXT
  definition_en TEXT, definition_ar TEXT
  formula_en TEXT, formula_ar TEXT
  source TEXT
  owner_role TEXT DEFAULT 'employer'
  min_sample_size INTEGER DEFAULT 1
  confidence_rules JSONB DEFAULT '{}'
```

### 4.7 Security Tables
```sql
TABLE audit_logs:
  id, user_id UUID NOT NULL
  action TEXT  -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'
  resource_type TEXT, resource_id TEXT
  details JSONB
  ip_address TEXT, user_agent TEXT

TABLE login_attempts:
  id, email TEXT NOT NULL
  success BOOLEAN DEFAULT false
  ip_address TEXT, attempt_time

TABLE account_lockouts:
  id, email TEXT NOT NULL
  failed_attempts INTEGER DEFAULT 0
  locked_at, locked_until TIMESTAMPTZ
  notification_sent BOOLEAN DEFAULT false

TABLE user_sessions:
  id, user_id UUID NOT NULL
  session_token_hash TEXT
  device_info JSONB
  is_active BOOLEAN DEFAULT true
  last_activity, expires_at

TABLE mfa_settings:
  id, user_id UUID NOT NULL UNIQUE
  mfa_enabled BOOLEAN DEFAULT false
  enrolled_at, updated_at

TABLE sensitive_employee_data:
  id, user_id UUID NOT NULL UNIQUE
  emirates_id_encrypted TEXT
  passport_number_encrypted TEXT
  monthly_salary_encrypted TEXT
```

### 4.8 UI & Notifications
```sql
TABLE notifications:
  id, user_id UUID NOT NULL
  title TEXT, message TEXT
  type TEXT DEFAULT 'info'  -- 'info', 'success', 'warning', 'error'
  category TEXT, action_url TEXT
  is_read BOOLEAN DEFAULT false
  expires_at

TABLE ui_visibility_settings:
  id, organization_id UUID
  role TEXT, page_key TEXT, element_key TEXT
  is_visible BOOLEAN DEFAULT true
  updated_by UUID

TABLE admin_saved_reports:
  id, admin_user_id UUID
  report_name TEXT, report_type TEXT
  filters JSONB, data_snapshot JSONB

TABLE data_access_requests:
  id, user_id UUID
  request_type TEXT  -- 'export', 'delete', 'access'
  status TEXT DEFAULT 'pending'
  processed_by UUID, processed_at
```

---

## 5. Security & RLS Policies

### 5.1 Core Security Functions
```sql
-- Check user role
CREATE FUNCTION has_role(_user_id UUID, _role user_role) RETURNS BOOLEAN
-- Returns true if user has specified role

-- Get user's organization
CREATE FUNCTION get_user_organization_id(_user_id UUID) RETURNS UUID
-- Returns organization_id from profiles table

-- Check same organization
CREATE FUNCTION is_same_organization(_target_user_id UUID) RETURNS BOOLEAN
-- Returns true if current user and target are in same org
```

### 5.2 RLS Policy Patterns (103 Total Policies)

#### Pattern 1: Self-Access
```sql
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);
```

#### Pattern 2: Organization Isolation
```sql
CREATE POLICY "Employers can view org profiles" ON profiles
FOR SELECT USING (
  has_role(auth.uid(), 'employer') AND 
  organization_id = get_user_organization_id(auth.uid())
);
```

#### Pattern 3: Role-Based Access
```sql
CREATE POLICY "Admins can manage organizations" ON organizations
FOR ALL USING (has_role(auth.uid(), 'admin'));
```

#### Pattern 4: Restrictive (Service Role Only)
```sql
CREATE POLICY "Service role only" ON account_lockouts
FOR ALL USING (false);
```

### 5.3 RLS Summary by Table
| Table | Policies | Access Pattern |
|-------|----------|----------------|
| profiles | 4 | Self + Employer org |
| organizations | 3 | Self-org + Admin |
| user_roles | 1 | Self-view |
| benefits | 1 | Public read |
| benefit_entitlements | 2 | Self + Employer org |
| requests | 4 | Self + Employer org |
| request_events | 4 | Self + Employer org + Admin |
| marketplace_offers | 5 | Public + Vendor manage |
| vendors | 2 | Self-manage |
| employer_actions | 4 | Org + Role based |
| audit_logs | 2 | System insert + Admin view |
| notifications | 4 | Self-manage |
| account_lockouts | 1 | Service role only |

---

## 6. User Portals & Pages

### 6.1 Employee Portal (21 Pages)

| Section | Page | Route | Key Features |
|---------|------|-------|--------------|
| Home | Dashboard | `/employee` | Benefits Maximizer, Suggested Actions, Package Snapshot |
| My Money | Benefits Analysis | `/employee/benefits-analysis` | Utilization charts, spending breakdown |
| My Money | Financial | `/employee/financial` | Salary breakdown, tax info, allowances |
| My Money | Bonus | `/employee/bonus` | Performance bonus tracking, targets |
| My Money | Equity | `/employee/equity` | Stock options, vesting schedule |
| My Money | Gratuity | `/employee/gratuity` | End of service calculation |
| Benefits | Housing | `/employee/housing` | Allowance, area explorer, listings |
| Benefits | Schooling | `/employee/schooling` | Education allowance, school finder |
| Benefits | Health | `/employee/health` | Insurance coverage, provider network |
| Benefits | Transport | `/employee/transport` | Car/fuel allowance, flights |
| Benefits | Wellbeing | `/employee/wellbeing` | Wellness programs, gym perks |
| Benefits | Learning | `/employee/learning` | Training budget, courses |
| Actions | Leave | `/employee/leave` | Balance, calendar, request |
| Actions | Documents | `/employee/documents` | Certificates, letters, claims |
| Actions | Benefits | `/employee/benefits` | Claims & requests |
| Services | Marketplace | `/employee/marketplace` | Vendor offers, perks |
| Services | Gov Connect | `/employee/gov-connect` | UAE government links |
| Services | Knowledge Hub | `/employee/knowledge` | FAQs, guides |
| Settings | Profile | `/employee/profile` | Personal info, family, interests |
| Onboarding | Onboarding | `/employee/onboarding` | New joiner wizard |

### 6.2 Employer Portal (15 Pages)

| Section | Page | Route | Key Features |
|---------|------|-------|--------------|
| Home | Command Center | `/employer` | Executive KPIs, Data Quality, MoneyFlow |
| Actions | Claims | `/employer/claims` | Bulk approve/reject, SLA tracking, filters |
| Actions | Recommendations | `/employer/recommendations` | AI insights, priority actions |
| Actions | Action Plan | `/employer/actions` | Strategic initiatives tracker |
| Financial | Spend | `/employer/spend` | Budget tracking, category breakdown |
| Financial | Forecasting | `/employer/forecasting` | Year-end projections |
| Financial | Waste Recovery | `/employer/zombie` | Unrealized benefits, recovery |
| People | Segments | `/employer/segments` | Employee groups, demographics |
| People | Satisfaction | `/employer/satisfaction` | Survey results, trends |
| People | Marketplace | `/employer/marketplace` | Perk usage analytics |
| Governance | Policy Hub | `/employer/policies` | Policy versions, acknowledgements |
| Governance | Compliance | `/employer/compliance` | Audit trail, reports |
| Governance | Metrics | `/employer/metrics` | KPI dictionary |
| Config | Integrations | `/employer/integrations` | HRIS connections, data status |
| Config | Knowledge | `/employer/knowledge` | Documentation center |

### 6.3 Admin Portal (13 Pages)

| Section | Page | Route |
|---------|------|-------|
| Home | Dashboard | `/admin` |
| Data | Data Quality | `/admin/data-quality` |
| Data | Benchmark Methodology | `/admin/benchmark-methodology` |
| Benchmarking | Benchmarks | `/admin/benchmarks` |
| Benchmarking | Spending Patterns | `/admin/spending` |
| Benchmarking | Market Intelligence | `/admin/market` |
| Platform | Organizations | `/admin/organizations` |
| Platform | Saved Reports | `/admin/reports` |
| Config | UI Configuration | `/admin/ui-config` |
| Config | Data Migration | `/admin/data-migration` |
| Config | Org Settings | `/admin/organizations/:orgId/settings` |
| Config | Tenant Test | `/admin/tenant-test` |
| Config | Settings | `/admin/settings` |

### 6.4 Vendor Portal (10 Pages)

| Section | Page | Route |
|---------|------|-------|
| Home | Dashboard | `/vendor` |
| Offers | My Offers | `/vendor/offers` |
| Offers | Create Offer | `/vendor/offers/new` |
| Offers | Offer Quality | `/vendor/offer-quality` |
| Performance | Analytics | `/vendor/analytics` |
| Performance | Transactions | `/vendor/transactions` |
| Finance | Earnings | `/vendor/earnings` |
| Finance | Payouts | `/vendor/payouts` |
| Account | Profile | `/vendor/profile` |
| Account | Settings | `/vendor/settings` |

---

## 7. Navigation Architecture

### 7.1 Employee Sidebar (Task-Based)
```
├── 🏠 Home
├── 💰 My Money ▼
│   ├── Compensation (Benefits Analysis)
│   ├── Bonus
│   ├── Equity
│   └── Gratuity
├── 🎁 My Benefits ▼
│   ├── Housing
│   ├── Schooling
│   ├── Health
│   ├── Transport
│   ├── Wellbeing
│   └── Learning
├── ✅ Do Stuff ▼
│   ├── Leave
│   ├── Documents
│   └── Claims & Requests
├── 🛒 Marketplace
├── 🔧 Services ▼
│   ├── Gov Connect
│   └── Knowledge Hub
└── ⚙️ Settings ▼
    └── Profile
```

### 7.2 Employer Sidebar (Dual-Mode Toggle)
```
[Strategic | Operational Toggle]

├── 📊 Command Center
├── 📋 Action Queue ▼
│   ├── Claims (with pending count)
│   ├── Recommendations
│   └── Action Plan
├── 💵 Financial Intelligence ▼
│   ├── Spend & Utilization
│   ├── Forecasting
│   └── Unrealized Benefits
├── 👥 People Intelligence ▼
│   ├── Segments
│   └── Satisfaction Pulse
├── 📜 Governance ▼
│   ├── Policy Hub
│   ├── Compliance
│   └── Metrics Dictionary
└── ⚙️ Configuration
    └── Integrations
```

### 7.3 Admin Sidebar
```
├── 📊 Dashboard
├── 🔍 Data Integrity ▼
│   ├── Data Quality
│   └── Benchmark Methodology
├── 📈 Benchmarking ▼
│   ├── Benchmarks
│   ├── Spending Patterns
│   └── Market Intelligence
├── 🏢 Platform Management ▼
│   ├── Organizations
│   └── Saved Reports
└── ⚙️ Configuration ▼
    ├── UI Configuration
    ├── Data Migration
    ├── Org Settings
    ├── Tenant Test
    └── Settings
```

### 7.4 Vendor Sidebar
```
├── 📊 Dashboard
├── 🎁 Offers ▼
│   ├── My Offers
│   ├── Create Offer
│   └── Offer Quality
├── 📈 Performance ▼
│   ├── Analytics
│   └── Transactions
├── 💰 Finance ▼
│   ├── Earnings
│   └── Payouts
└── 👤 Account ▼
    ├── Profile
    └── Settings
```

---

## 8. Key Components Library

### 8.1 Dashboard Components

#### StatusStrip
Displays data confidence, freshness, period, and source at page top.
```tsx
<StatusStrip
  confidence="high" | "medium" | "low" | "not_integrated"
  lastUpdated={Date | string}
  dataSource="HRIS Integration"
  sampleSize={45}
  minSampleSize={30}
  showPeriod={true}
/>
```

#### PrimaryInsight
Hero metric card with tooltip, confidence, and action.
```tsx
<PrimaryInsight
  title="Benefits Maximizer"
  value="AED 125,000"
  subtitle="85% used of total"
  icon={Sparkles}
  confidence="high"
  source="Estimated unused value"
  formula="Total - Utilized"
  action={{ label: "View Opportunities", onClick: () => {} }}
/>
```

#### ActionQueue
List of prioritized action items with icons and navigation.
```tsx
<ActionQueue
  title="Suggested Actions"
  actions={[
    { id: "1", title: "Use Learning Budget", icon: BookOpen, route: "/employee/learning", value: "AED 7,500" }
  ]}
  maxItems={3}
  allLink="/employee/insights"
/>
```

### 8.2 Employer Components

#### MoneyFlowVisualization
Visual flow from budget → utilized → effective spend → waste.
```tsx
<MoneyFlowVisualization
  allocatedBudget={5000000}
  utilizedAmount={3200000}
  wasteIdentified={480000}
  recoverableAmount={288000}
  satisfactionScore={4.2}
/>
```

#### ConfidenceGate
Wraps content with confidence-based rendering.
```tsx
<ConfidenceGate 
  confidence="high" | "medium" | "low" | "not_integrated"
  showEstimatedLabel={true}
  metricName="Utilization Rate"
>
  <MetricValue>{utilizationRate}%</MetricValue>
</ConfidenceGate>
```

#### DataQualityPanel
Shows data completeness metrics for employers.
- Profile completeness percentage
- Missing critical fields count
- Budget configuration status
- Satisfaction sample size vs required

#### ViewToggle
Strategic/Operational mode switch with localStorage persistence.
```tsx
<ViewToggle
  defaultView="strategic"
  onViewChange={(mode) => {}}
  storageKey="employer-view-mode"
/>
```

#### QuickActionsBar
Floating bulk action bar for claims management.
- Bulk approve (low-risk claims under threshold)
- Bulk reject with template selection
- Selection count and clear action

#### PeriodSelector
Date range picker with MTD/QTD/YTD/Custom options.
```tsx
<PeriodSelector
  onPeriodChange={(period, range) => {}}
  onComparisonChange={(type) => {}}
  showComparison={true}
/>
```

### 8.3 Chart Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| AnimatedLineChart | Time series | data, xKey, yKey, color, showArea |
| AnimatedBarChart | Category comparison | data, xKey, yKey, color, layout |
| AnimatedDonutChart | Proportions | data, centerLabel, innerRadius |
| AnimatedRadarChart | Multi-dimensional | data, metrics, colors |
| StackedAreaChart | Cumulative trends | data, series, colors |
| ProgressBarList | Progress indicators | items, showValue, animated |
| ChartContainer | Wrapper with loading | title, subtitle, isLoading |

### 8.4 Form & Input Components
- SummaryStatsCard - 4 metric summary row
- MetricTooltip - Hover with definition, formula, source
- BenefitGuide - Steps and policy bullets layout
- PageHeader - Title, subtitle, icon, actions
- PaginationControls - Table pagination
- EmptyState - No data messaging

---

## 9. Design System

### 9.1 Color Palette (HSL Variables)
```css
/* Light Mode */
--background: 220 20% 97%;       /* Soft gray */
--foreground: 222 47% 11%;       /* Navy text */
--primary: 222 47% 11%;          /* Navy */
--accent: 174 60% 45%;           /* Teal */
--success: 160 84% 39%;          /* Green */
--warning: 38 92% 50%;           /* Amber */
--destructive: 0 84% 60%;        /* Red */
--info: 199 89% 48%;             /* Blue */

/* Dark Mode */
--background: 222 47% 6%;        /* Deep navy */
--primary: 174 60% 45%;          /* Teal becomes primary */
--card: 222 47% 10%;             /* Elevated surfaces */
```

### 9.2 Sidebar Palette
```css
--sidebar-background: 222 47% 8%;
--sidebar-foreground: 220 14% 96%;
--sidebar-primary: 174 60% 45%;
--sidebar-accent: 222 47% 14%;
```

### 9.3 Chart Colors (8 colors)
```css
--chart-1: 174 60% 45%;   /* Teal */
--chart-2: 199 89% 48%;   /* Blue */
--chart-3: 262 52% 55%;   /* Purple */
--chart-4: 38 92% 50%;    /* Amber */
--chart-5: 340 65% 55%;   /* Pink */
--chart-6: 160 84% 39%;   /* Green */
--chart-7: 24 75% 55%;    /* Orange */
--chart-8: 280 55% 55%;   /* Violet */
```

### 9.4 Benefit Type Tags
```css
.tag-cash      /* Emerald */
.tag-health    /* Rose */
.tag-time      /* Blue */
.tag-growth    /* Purple */
.tag-wealth    /* Amber */
.tag-wellbeing /* Cyan */
```

### 9.5 Typography
```css
/* Display (Headings) */
font-family: 'DM Sans', system-ui, sans-serif;

/* Body Text */
font-family: 'Inter', system-ui, sans-serif;

/* Arabic */
font-family: 'Noto Sans Arabic', system-ui, sans-serif;
```

### 9.6 Spacing & Layout
```css
--radius: 0.75rem;           /* Border radius */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08);
--shadow-glow: 0 0 20px hsl(174 60% 45% / 0.3);
```

### 9.7 RTL Support
- Full Arabic translations via LanguageContext
- Automatic layout mirroring with `flex-row-reverse`
- Sidebar positioning: `lg:pr-64` (RTL) vs `lg:pl-64` (LTR)
- Text alignment: `text-right` in RTL mode
- Custom RTL CSS classes in index.css

---

## 10. Data Hooks & State Management

### 10.1 Context Providers

| Context | Purpose | Key Values |
|---------|---------|------------|
| AuthContext | Authentication | user, role, loading, signIn, signOut |
| LanguageContext | Internationalization | language ('en'|'ar'), direction, setLanguage |
| ProfileContext | User profile | profile, children, pets, interests, updateProfile |
| PeriodContext | Date filtering | period (MTD|QTD|YTD|Custom), dateRange, formatPeriodLabel |
| UIVisibilityContext | Element visibility | isElementVisible(role, page, element) |
| PrivacyContext | Salary masking | salaryHidden, toggleSalaryVisibility |

### 10.2 Employee Data Hooks
```typescript
useProfile()                    // Current user profile
useChildren()                   // User's children
useLeaveBalances()              // Leave entitlements
useBenefits()                   // All active benefits
useBenefitEntitlements()        // User's entitlements
useRequests()                   // User's claims/requests
useRequestEvents(requestId)     // Request timeline
useMarketplaceOffers()          // Active marketplace offers
usePerkActivations()            // User's perk activations
useHousingAreas()               // Housing area data
useHousingListings()            // Property listings
useSchools()                    // School directory
useHealthProviders()            // Healthcare network
```

### 10.3 Employer Data Hooks
```typescript
useEmployerDashboardMetrics(orgId?)   // Full dashboard metrics
useBenefitUtilizationStats(orgId?)    // Per-benefit utilization
useOrgRequests()                      // All org requests
useUpdateRequest()                    // Mutation for status changes
useRequestStats()                     // Counts by status
useEmployerActions()                  // Strategic actions
useCreateAction()                     // Create new action
useUpdateAction()                     // Update action
useDeleteAction()                     // Delete action
useActionStats()                      // Action statistics
```

### 10.4 Shared Utility Hooks
```typescript
useMetricDefinitions()          // All metric definitions
useMetricDefinition(key)        // Single metric with localization
useAuditLog()                   // logEvent, logLogin, logLogout
useSessionSecurity()            // Activity tracking, timeout
usePagination(data, pageSize)   // Table pagination
useMobile()                     // Mobile breakpoint detection
useToast()                      // Toast notifications
```

---

## 11. Authentication & Demo Accounts

### 11.1 Auth Flow
1. Email/password via Supabase Auth
2. `handle_new_user()` trigger creates profile and role
3. Role fetched from `user_roles` table
4. Organization from `profiles.organization_id`
5. Session managed by Supabase with refresh

### 11.2 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | `demo.employee@bnft.ae` | `demo123456` |
| Employer | `demo.employer@bnft.ae` | `demo123456` |
| Admin | `demo.admin@bnft.ae` | `demo123456` |
| Vendor | `demo.vendor@bnft.ae` | `demo123456` |

### 11.3 Security Features
- MFA enrollment via TOTP
- Session timeout with warning
- Account lockout after failed attempts
- Audit logging for sensitive actions
- Rate limiting edge functions

---

## 12. Feature Workflows

### 12.1 Employee Claims Workflow
```
Draft → Submitted → In Review → Approved/Rejected → Paid/Closed
```
- Status changes logged in `request_events`
- SLA timer starts on submission
- Employee sees `notes_employee_visible`
- Employer sees `notes_internal`

### 12.2 Employer Claims Processing
1. View Claims page with filters (status, type, SLA)
2. Select individual or bulk claims
3. Review with decision templates
4. Approve/Reject with notes
5. Mark as Paid when processed
6. Close completed claims

### 12.3 Policy Hub Workflow
1. Create policy with version number
2. Set effective dates
3. Require acknowledgement by role/department
4. Track acknowledgement progress
5. View version history
6. Archive old versions

### 12.4 Vendor Payout Workflow
1. Track commissions from redemptions
2. View earnings accumulation
3. Request payout (minimum threshold)
4. Admin processes payment
5. Settlement confirmation

---

## 13. UI Patterns & UX Guidelines

### 13.1 Page Structure Pattern
```tsx
<div className="space-y-6">
  {/* 1. Page Header */}
  <PageHeader title="..." subtitle="..." icon={...} />
  
  {/* 2. Status Strip */}
  <StatusStrip confidence="high" lastUpdated={...} dataSource="..." />
  
  {/* 3. Primary Insight (Hero Metric) */}
  <PrimaryInsight title="..." value="..." ... />
  
  {/* 4. Action Queue / Summary Cards */}
  <ActionQueue ... />
  
  {/* 5. Main Content */}
  <Card>...</Card>
</div>
```

### 13.2 Data Quality Indicators
- **High Confidence**: Green checkmark, full data display
- **Medium Confidence**: Amber "Estimated" badge, show with caveat
- **Low Confidence**: Red warning, limited display
- **Not Integrated**: Gray, prompt to connect data source

### 13.3 Filter Patterns
- Status filters at page top
- Search with debounce
- SLA filter for time-sensitive items
- Type filter (claim/request/question)
- Period selector for date ranges

### 13.4 Bulk Action Patterns
- Checkbox column for selection
- Floating action bar on selection
- Confirmation dialogs
- Progress feedback
- Success/error toast

---

## 14. API & Database Functions

### 14.1 Dashboard Metrics Function
```sql
get_employer_dashboard_metrics(
  p_org_id UUID,
  p_period_start DATE,
  p_period_end DATE
) RETURNS JSONB
```
Returns:
- totalEmployees, annualBudget, budgetUsed
- utilizationRate, wasteSpend, effectiveSpend
- projectedYearEndSpend, monthlySpendRate
- satisfactionScore, satisfactionSampleSize
- pendingClaims, avgProcessingDays
- confidence levels for each metric

### 14.2 Benefit Utilization Stats
```sql
get_benefit_utilization_stats(
  p_org_id UUID,
  p_period_start DATE,
  p_period_end DATE
) RETURNS JSONB
```
Returns array of:
- benefitName, benefitType
- totalAllocated, totalUtilized
- utilizationRate, employeeCount

### 14.3 Audit Logging
```sql
log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_details JSONB,
  p_ip_address TEXT,
  p_user_agent TEXT
) RETURNS UUID
```

### 14.4 Organization Stats
```sql
get_org_benefit_stats(org_id UUID) RETURNS TABLE
get_org_leave_stats(org_id UUID) RETURNS TABLE
get_org_satisfaction_stats(org_id UUID) RETURNS TABLE
get_org_employee_directory(org_id UUID) RETURNS TABLE
```

---

## 15. Responsive Design

### 15.1 Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape / Small desktop */
xl: 1280px  /* Desktop */
2xl: 1400px /* Large desktop */
```

### 15.2 Mobile Patterns
- Collapsible sidebar with hamburger menu
- Stacked cards on mobile (grid-cols-1)
- Touch-friendly 44px minimum targets
- Sheet components for mobile modals
- Sticky headers for tables

### 15.3 Layout Classes
```css
/* Sidebar offset */
lg:ml-64  /* LTR desktop */
lg:mr-64  /* RTL desktop */

/* Content padding */
p-4 lg:p-8 pt-16 lg:pt-8
```

---

## Appendix A: Constants & Enums

### Benefit Types
```typescript
const BENEFIT_TYPE_LABELS = {
  cash_allowances: 'Cash & Allowances',
  health_protection: 'Health & Protection',
  time_off_flex: 'Time Off & Flex',
  growth_career: 'Growth & Career',
  wealth_ownership: 'Wealth & Ownership',
  wellbeing: 'Wellbeing',
};
```

### Life Areas
```typescript
const LIFE_AREA_LABELS = {
  home_living: 'Home & Living',
  family_parenting: 'Family & Parenting',
  health: 'Health',
  money: 'Money',
  career: 'Career',
  lifestyle: 'Lifestyle',
  mobility: 'Mobility',
};
```

### Leave Types
```typescript
const LEAVE_TYPES = [
  { id: 'annual', name: 'Annual Leave', color: 'bg-blue-500' },
  { id: 'sick', name: 'Sick Leave', color: 'bg-rose-500' },
  { id: 'personal', name: 'Personal Leave', color: 'bg-purple-500' },
  { id: 'maternity', name: 'Maternity Leave', color: 'bg-pink-500' },
  { id: 'paternity', name: 'Paternity Leave', color: 'bg-cyan-500' },
  { id: 'compassionate', name: 'Compassionate Leave', color: 'bg-amber-500' },
];
```

### Marketplace Categories
```typescript
const MARKETPLACE_CATEGORIES = [
  'Everyday Essentials',
  'Food & Coffee',
  'Health & Fitness',
  'Family & Parenting',
  'Learning & Skills',
  'Home & Living',
  'Mobility',
  'Lifestyle & Shopping',
  'Travel & Experiences',
];
```

### Document Types
```typescript
const DOCUMENT_TYPES = [
  { id: 'salary_certificate_bank', name: 'Salary Certificate (Bank)' },
  { id: 'salary_certificate_embassy', name: 'Salary Certificate (Embassy)' },
  { id: 'employment_letter', name: 'Employment Letter' },
  { id: 'noc_letter', name: 'No Objection Letter' },
  { id: 'leave_balance', name: 'Leave Balance Statement' },
  { id: 'insurance_confirmation', name: 'Insurance Confirmation' },
  { id: 'experience_letter', name: 'Experience Letter' },
];
```

---

## Appendix B: Edge Functions

### rate-limit-auth
Rate limits authentication attempts to prevent brute force.

### account-lockout
Handles account lockout after failed attempts and notification.

---

*Document Version 3.0 - Generated for AI Assistant consumption*
*Last Updated: January 2026*
*Platform: bnft. Total Rewards Management*
