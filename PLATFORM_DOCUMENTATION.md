# bnft. Platform - Complete Technical Documentation

> **Version:** 2.0 | **Last Updated:** January 2026  
> **Purpose:** Comprehensive technical specification for AI assistants and developers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Complete Database Schema](#3-complete-database-schema)
4. [Security & RLS Policies](#4-security--rls-policies)
5. [User Portals & Pages](#5-user-portals--pages)
6. [Navigation Architecture](#6-navigation-architecture)
7. [Key Components](#7-key-components)
8. [Design System](#8-design-system)
9. [Data Hooks & State Management](#9-data-hooks--state-management)
10. [Authentication & Demo Accounts](#10-authentication--demo-accounts)
11. [Feature Workflows](#11-feature-workflows)
12. [Responsive Design](#12-responsive-design)

---

## 1. Executive Summary

### Platform Purpose
**bnft.** is a Total Rewards & Benefits Management SaaS platform designed for UAE-based enterprises. It provides:
- **Employee Portal:** Full visibility into compensation, benefits, and entitlements
- **Employer Portal:** Analytics, claims management, and strategic planning tools
- **Admin Portal:** Platform-wide benchmarking, data quality, and configuration
- **Vendor Portal:** Marketplace offer management and performance analytics

### Core Value Proposition
- Employee benefits visibility and self-service
- Employer analytics with confidence-based metrics
- Multi-tenant architecture with organization isolation
- Bilingual support (English/Arabic with RTL)

### Target Users
- UAE-based enterprises (SME to Enterprise)
- HR/Benefits administrators
- Employees seeking benefits transparency
- Marketplace vendors offering perks

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | Latest | 50+ UI components |
| TanStack React Query | 5.83.0 | Data fetching & caching |
| React Router | 6.30.3 | Routing |
| Framer Motion | 12.25.0 | Animations |
| Recharts | 2.15.4 | Charts |

### Backend (Supabase/Lovable Cloud)
| Service | Purpose |
|---------|---------|
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Edge Functions | Serverless APIs |
| Row Level Security | Data isolation |

### Project Structure
```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── auth/           # MFA, password strength
│   ├── charts/         # Animated chart components
│   ├── dashboard/      # Shared dashboard widgets
│   ├── employee/       # Employee-specific components
│   ├── employer/       # Employer-specific components
│   ├── layout/         # Sidebars, layouts
│   ├── notifications/  # Notification center
│   ├── security/       # Privacy, session management
│   └── ui/             # shadcn/ui components (50+)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # Supabase client & types
├── lib/                # Utilities, constants
├── pages/
│   ├── admin/          # 13 admin pages
│   ├── employee/       # 21 employee pages
│   ├── employer/       # 15 employer pages
│   └── vendor/         # 10 vendor pages
└── main.tsx            # App entry point
```

---

## 3. Complete Database Schema

### 3.1 Core Tables (37 Total)

#### `profiles`
User profile data linked to auth.users
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
grade TEXT                             -- E.g., 'G1', 'G2', 'M1'
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

#### `organizations`
Multi-tenant organization configuration
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

#### `user_roles`
Role assignments (separate from profiles for security)
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL UNIQUE
role user_role NOT NULL DEFAULT 'employee'
created_at TIMESTAMPTZ

-- Enum: user_role = 'employee' | 'employer' | 'admin' | 'vendor'
```

#### `benefits`
Benefit definitions catalog
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

-- Enum: benefit_type = 'cash_allowances' | 'health_protection' | 'time_off_flex' | 'growth_career' | 'wealth_ownership' | 'wellbeing'
-- Enum: life_area = 'home_living' | 'family_parenting' | 'health' | 'money' | 'career' | 'lifestyle' | 'mobility'
```

#### `benefit_entitlements`
User-specific benefit allocations
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
benefit_id UUID REFERENCES benefits(id)
organization_id UUID REFERENCES organizations(id)
annual_allowance NUMERIC NOT NULL
utilized_amount NUMERIC DEFAULT 0
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

#### `benefit_grade_eligibility`
Grade-based benefit rules
```sql
id UUID PRIMARY KEY
benefit_id UUID REFERENCES benefits(id)
grade TEXT NOT NULL                    -- E.g., 'G1', 'G2', 'M1'
is_eligible BOOLEAN DEFAULT true
annual_allowance NUMERIC
coverage_percent NUMERIC
max_claim_per_transaction NUMERIC
max_dependents INTEGER
dependent_coverage TEXT
waiting_period_days INTEGER DEFAULT 0
requires_documentation BOOLEAN DEFAULT true
notes TEXT
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

#### `requests`
Claims, requests, and questions
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
organization_id UUID REFERENCES organizations(id)
request_type request_type NOT NULL     -- Enum
subject TEXT NOT NULL
category TEXT NOT NULL
description TEXT
amount NUMERIC
status request_status DEFAULT 'pending' -- Enum
priority TEXT DEFAULT 'medium'
assigned_to UUID
sla_due_at TIMESTAMPTZ
reviewed_by UUID
reviewed_at TIMESTAMPTZ
reviewer_notes TEXT
last_status_change_at TIMESTAMPTZ
created_at TIMESTAMPTZ

-- Enum: request_type = 'claim' | 'request' | 'question'
-- Enum: request_status = 'pending' | 'approved' | 'rejected' | 'draft' | 'submitted' | 'in_review' | 'paid' | 'closed'
```

#### `request_events`
Status change history for requests
```sql
id UUID PRIMARY KEY
request_id UUID REFERENCES requests(id)
actor_user_id UUID NOT NULL
from_status TEXT
to_status TEXT NOT NULL
notes_internal TEXT                    -- Employer-only notes
notes_employee_visible TEXT            -- Shared with employee
created_at TIMESTAMPTZ
```

### 3.2 Supporting Tables

#### Leave Management
```sql
TABLE leave_balances:
  id, user_id, organization_id
  leave_type TEXT                      -- 'annual', 'sick', 'maternity', etc.
  total_days INTEGER, used_days INTEGER DEFAULT 0
  year INTEGER, created_at
```

#### Family & Dependents
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
  created_at

TABLE housing_listings:
  id, title TEXT, area TEXT
  bedrooms INTEGER, bathrooms INTEGER
  annual_rent NUMERIC
  amenities TEXT[]
  image_url, rating NUMERIC
  property_finder_url, bayut_url, dubizzle_url TEXT
  created_at
```

#### Education
```sql
TABLE schools:
  id, name TEXT
  curriculum TEXT                      -- 'British', 'American', 'IB', etc.
  location TEXT, grade_range TEXT
  annual_fee NUMERIC
  facilities TEXT[], rating NUMERIC
  website_url TEXT, created_at
```

#### Healthcare
```sql
TABLE health_providers:
  id, name TEXT
  provider_type TEXT                   -- 'hospital', 'clinic', 'pharmacy'
  specialty TEXT, area TEXT
  address TEXT, phone TEXT
  in_network BOOLEAN DEFAULT true
  rating NUMERIC, created_at
```

### 3.3 Per Diem / Travel Tables

```sql
TABLE per_diem_rates:
  id, grade TEXT
  destination_type TEXT                -- 'domestic', 'gcc', 'international'
  region TEXT, country TEXT, city TEXT
  daily_accommodation, daily_meals, daily_transport, daily_incidentals NUMERIC
  daily_total NUMERIC
  currency TEXT DEFAULT 'AED'
  effective_from DATE, effective_until DATE
  is_active BOOLEAN DEFAULT true
  notes TEXT, created_at, updated_at

TABLE per_diem_claims:
  id, user_id, organization_id, rate_id
  trip_purpose TEXT, trip_reference TEXT
  destination_country TEXT, destination_city TEXT
  destination_type TEXT
  departure_date DATE, return_date DATE
  number_of_days INTEGER
  accommodation_amount, meals_amount, transport_amount, incidentals_amount, total_amount NUMERIC
  currency TEXT DEFAULT 'AED'
  status TEXT DEFAULT 'pending'
  receipts_attached BOOLEAN DEFAULT false
  reviewed_by UUID, reviewed_at, reviewer_notes TEXT
  paid_at, submitted_at, created_at, updated_at
```

### 3.4 Employer Tables

```sql
TABLE employer_actions:
  id, organization_id UUID NOT NULL
  title TEXT NOT NULL, description TEXT
  status TEXT DEFAULT 'planned'        -- 'planned', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium'       -- 'low', 'medium', 'high', 'critical'
  due_date DATE, owner_user_id UUID
  source_insight TEXT                  -- AI-generated insight reference
  metric_keys TEXT[] DEFAULT '{}'
  expected_impact JSONB DEFAULT '{}'
  completed_at, created_at, updated_at

TABLE org_budgets:
  id, organization_id UUID NOT NULL
  fiscal_year INTEGER NOT NULL
  annual_budget NUMERIC DEFAULT 0
  budget_allocated JSONB DEFAULT '{}'  -- Per-category breakdown
  created_at, updated_at

TABLE employee_satisfaction_ratings:
  id, user_id UUID NOT NULL
  category TEXT DEFAULT 'overall'      -- 'overall', 'benefits', 'culture', etc.
  rating INTEGER NOT NULL              -- 1-5 scale
  feedback TEXT
  period_month INTEGER, period_year INTEGER
  created_at
```

### 3.5 Marketplace & Vendor Tables

```sql
TABLE marketplace_offers:
  id, vendor_id UUID
  title TEXT, merchant TEXT, category TEXT
  description TEXT, discount_percent INTEGER
  image_url TEXT, terms TEXT
  tags TEXT[], rating NUMERIC
  is_active BOOLEAN DEFAULT true
  created_at

TABLE perk_activations:
  id, user_id UUID, offer_id UUID, organization_id UUID
  activated_at TIMESTAMPTZ

TABLE vendors:
  id, user_id UUID NOT NULL UNIQUE
  company_name TEXT NOT NULL
  description TEXT, logo_url TEXT
  website_url TEXT, contact_email TEXT, contact_phone TEXT
  commission_rate NUMERIC
  total_transactions INTEGER DEFAULT 0
  total_revenue NUMERIC DEFAULT 0
  is_active BOOLEAN DEFAULT true
  created_at, updated_at

TABLE vendor_transactions:
  id, vendor_id UUID, user_id UUID, organization_id UUID, offer_id UUID
  transaction_type TEXT DEFAULT 'redemption'
  original_amount NUMERIC, discount_amount NUMERIC
  commission_amount NUMERIC NOT NULL
  code_used TEXT
  status TEXT DEFAULT 'pending'        -- 'pending', 'confirmed', 'settled'
  redeemed_at, settled_at, created_at
```

### 3.6 Platform & Analytics Tables

```sql
TABLE platform_analytics:
  id, metric_name TEXT, metric_type TEXT
  metric_value NUMERIC
  period_start DATE, period_end DATE
  industry TEXT, region TEXT, company_size TEXT
  metadata JSONB, created_at

TABLE metric_definitions:
  key TEXT PRIMARY KEY
  name_en TEXT, name_ar TEXT
  definition_en TEXT, definition_ar TEXT
  formula_en TEXT, formula_ar TEXT
  source TEXT
  owner_role TEXT DEFAULT 'employer'
  min_sample_size INTEGER DEFAULT 1
  confidence_rules JSONB DEFAULT '{}'
  created_at, updated_at
```

### 3.7 Security Tables

```sql
TABLE audit_logs:
  id, user_id UUID NOT NULL
  action TEXT                          -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  resource_type TEXT, resource_id TEXT
  details JSONB
  ip_address TEXT, user_agent TEXT
  created_at

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
  session_token_hash TEXT NOT NULL
  device_info JSONB
  ip_address TEXT, user_agent TEXT
  is_active BOOLEAN DEFAULT true
  last_activity, expires_at, created_at

TABLE mfa_settings:
  id, user_id UUID NOT NULL UNIQUE
  mfa_enabled BOOLEAN DEFAULT false
  enrolled_at, updated_at

TABLE sensitive_employee_data:
  id, user_id UUID NOT NULL UNIQUE
  emirates_id_encrypted TEXT
  passport_number_encrypted TEXT
  monthly_salary_encrypted TEXT
  blood_type TEXT
  emergency_contact_name TEXT, emergency_contact_phone TEXT
  created_at, updated_at
```

### 3.8 Notifications & UI Configuration

```sql
TABLE notifications:
  id, user_id UUID NOT NULL
  title TEXT, message TEXT
  type TEXT DEFAULT 'info'             -- 'info', 'success', 'warning', 'error'
  category TEXT, action_url TEXT
  is_read BOOLEAN DEFAULT false
  expires_at, created_at

TABLE ui_visibility_settings:
  id, organization_id UUID
  role TEXT, page_key TEXT, element_key TEXT
  is_visible BOOLEAN DEFAULT true
  updated_by UUID, updated_at

TABLE admin_saved_reports:
  id, admin_user_id UUID
  report_name TEXT, report_type TEXT
  filters JSONB, data_snapshot JSONB
  created_at, updated_at

TABLE data_access_requests:
  id, user_id UUID
  request_type TEXT                    -- 'export', 'delete', 'access'
  status TEXT DEFAULT 'pending'
  notes TEXT
  processed_by UUID, processed_at
  created_at
```

---

## 4. Security & RLS Policies

### 4.1 Core Security Functions

```sql
-- Check if user has a specific role
CREATE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get user's organization ID
CREATE FUNCTION get_user_organization_id(_user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM profiles 
  WHERE user_id = _user_id LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if users are in same organization
CREATE FUNCTION is_same_organization(_target_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p1.organization_id = p2.organization_id
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = _target_user_id
    AND p1.organization_id IS NOT NULL
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 4.2 RLS Policy Patterns (103 Total)

#### Pattern 1: Self-Access
```sql
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = user_id);
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

#### Pattern 4: Restrictive Policies
```sql
CREATE POLICY "Service role only" ON account_lockouts
FOR ALL USING (false);
```

### 4.3 Complete RLS Policy Summary

| Table | Policies | Key Rules |
|-------|----------|-----------|
| profiles | 4 | Self-access + Employer org view |
| organizations | 3 | Self-org view + Admin manage |
| user_roles | 1 | Self-view only |
| benefits | 1 | Public read |
| benefit_entitlements | 2 | Self + Employer org |
| benefit_grade_eligibility | 2 | Auth view + Employer/Admin manage |
| requests | 4 | Self + Employer org |
| request_events | 4 | Self + Employer org + Admin |
| leave_balances | 2 | Self + Employer org |
| children | 1 | Self-manage |
| marketplace_offers | 5 | Public + Vendor manage |
| perk_activations | 2 | Self + Employer org |
| vendors | 2 | Self-manage |
| vendor_transactions | 2 | Vendor view + Admin manage |
| employer_actions | 4 | Org + Role based |
| org_budgets | 2 | Employer view + Admin manage |
| employee_satisfaction_ratings | 5 | Self + Employer + Admin |
| audit_logs | 2 | System insert + Admin view |
| notifications | 4 | Self-manage |
| mfa_settings | 3 | Self-manage |
| sensitive_employee_data | 4 | Self + Admin |
| metric_definitions | 2 | Auth view + Admin manage |
| ui_visibility_settings | 2 | Org view + Admin manage |
| per_diem_rates | 2 | Auth view + Employer manage |
| per_diem_claims | 5 | Self + Employer org |
| account_lockouts | 1 | Service role only |
| login_attempts | 1 | Service role only |

---

## 5. User Portals & Pages

### 5.1 Employee Portal (21 Pages)

| Section | Page | Route | Features |
|---------|------|-------|----------|
| Home | Dashboard | `/employee` | Benefits Maximizer, Deadlines, Package Snapshot |
| My Money | Compensation | `/employee/financial` | Salary breakdown, tax info |
| My Money | Benefits Analysis | `/employee/benefits-analysis` | Utilization charts |
| My Money | Bonus | `/employee/bonus` | Performance bonus tracking |
| My Money | Equity | `/employee/equity` | Stock options, vesting |
| My Money | Gratuity | `/employee/gratuity` | End of service calculation |
| Benefits | Housing | `/employee/housing` | Allowance, area explorer |
| Benefits | Schooling | `/employee/schooling` | Education allowance |
| Benefits | Health | `/employee/health` | Insurance, providers |
| Benefits | Transport | `/employee/transport` | Car allowance |
| Benefits | Wellbeing | `/employee/wellbeing` | Wellness perks |
| Benefits | Learning | `/employee/learning` | Training budget |
| Actions | Leave | `/employee/leave` | Balance, request |
| Actions | Documents | `/employee/documents` | Certificates, letters |
| Actions | Benefits | `/employee/benefits` | Claims & requests |
| Services | Marketplace | `/employee/marketplace` | Vendor offers |
| Services | Gov Connect | `/employee/gov-connect` | UAE gov links |
| Services | Knowledge Hub | `/employee/knowledge-hub` | FAQs, guides |
| Settings | Profile | `/employee/profile` | Personal info |
| Settings | Security | `/employee/security-settings` | Password, MFA |
| Onboarding | Onboarding | `/employee/onboarding` | New joiner wizard |

### 5.2 Employer Portal (15 Pages)

| Section | Page | Route | Features |
|---------|------|-------|----------|
| Home | Command Center | `/employer` | KPIs, Data Quality, Period Selector |
| Actions | Claims | `/employer/claims` | Bulk approve/reject, SLA |
| Actions | Recommendations | `/employer/recommendations` | AI insights |
| Actions | Action Plan | `/employer/action-plan` | Strategic initiatives |
| Financial | Spend | `/employer/spend` | Budget tracking |
| Financial | Forecasting | `/employer/forecasting` | Year-end projections |
| Financial | Waste Recovery | `/employer/waste-recovery` | Unrealized Benefits |
| People | Segments | `/employer/segments` | Employee groups |
| People | Satisfaction | `/employer/satisfaction` | Survey results |
| People | Marketplace Analytics | `/employer/marketplace-analytics` | Perk usage |
| Governance | Policy Hub | `/employer/policy-hub` | Policy versions |
| Governance | Compliance | `/employer/compliance` | Audit trail |
| Governance | Metrics Dictionary | `/employer/metrics-dictionary` | KPI definitions |
| Config | Integrations | `/employer/integrations` | HRIS connections |
| Config | Knowledge Center | `/employer/knowledge-center` | Documentation |

### 5.3 Admin Portal (13 Pages)

| Section | Page | Route |
|---------|------|-------|
| Home | Dashboard | `/admin` |
| Data Integrity | Data Quality | `/admin/data-quality` |
| Data Integrity | Benchmark Methodology | `/admin/benchmark-methodology` |
| Benchmarking | Benchmarks | `/admin/benchmarks` |
| Benchmarking | Spending Patterns | `/admin/spending-patterns` |
| Benchmarking | Market Intelligence | `/admin/market-intelligence` |
| Platform Mgmt | Organizations | `/admin/organizations` |
| Platform Mgmt | Saved Reports | `/admin/saved-reports` |
| Configuration | UI Configuration | `/admin/ui-configuration` |
| Configuration | Data Migration | `/admin/data-migration` |
| Configuration | Org Settings | `/admin/organization-settings` |
| Configuration | Tenant Test | `/admin/tenant-test` |
| Configuration | Settings | `/admin/settings` |

### 5.4 Vendor Portal (10 Pages)

| Section | Page | Route |
|---------|------|-------|
| Home | Dashboard | `/vendor` |
| Offers | My Offers | `/vendor/offers` |
| Offers | Create Offer | `/vendor/create-offer` |
| Offers | Offer Quality | `/vendor/offer-quality` |
| Performance | Analytics | `/vendor/analytics` |
| Performance | Transactions | `/vendor/transactions` |
| Finance | Earnings | `/vendor/earnings` |
| Finance | Payouts | `/vendor/payouts` |
| Account | Profile | `/vendor/profile` |
| Account | Settings | `/vendor/settings` |

---

## 6. Navigation Architecture

### 6.1 Employee Sidebar (Task-Based)
```
├── 🏠 Home
├── 💰 My Money ▼
│   ├── Compensation
│   ├── Benefits
│   ├── Bonus
│   ├── Equity
│   └── Gratuity
├── ✅ Do Stuff ▼
│   ├── Leave
│   ├── Documents
│   └── Claims & Requests
├── 🛒 Marketplace
├── 🔧 Services ▼
│   ├── Gov Connect
│   └── Knowledge Hub
└── ⚙️ Settings ▼
    ├── Profile
    └── Security
```

### 6.2 Employer Sidebar (Dual-Mode)
```
[Toggle: Strategic | Operational]

├── 📊 Command Center
├── 📋 Action Queue ▼
│   ├── Claims (with count)
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

### 6.3 Admin Sidebar
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

### 6.4 Vendor Sidebar
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

## 7. Key Components

### 7.1 Shared Components

#### BenefitPageLayout
4-tab structure for benefit detail pages:
- **Tab 1: Overview** - Allowance summary, policy bullets
- **Tab 2: Use It** - Action buttons, providers, calculators
- **Tab 3: Insights** - Utilization charts, recommendations
- **Tab 4: History** - Past claims, timeline

#### ConfidenceGate
Wraps metrics with confidence indicators:
- `high`: Shows content directly
- `medium`: Shows content with "Estimated" badge
- `low`: Shows "Insufficient data" message
- `not_integrated`: Shows "Connect data source" prompt

#### DataQualityPanel
Displays for employers:
- Profile completeness percentage
- Missing critical fields
- Data freshness indicators
- Action items to improve quality

#### MetricTooltip
Hover tooltip fetching from `metric_definitions`:
- Name (localized), Definition, Formula, Source, Last updated

### 7.2 Chart Components

| Component | Purpose |
|-----------|---------|
| AnimatedLineChart | Time series data |
| AnimatedBarChart | Category comparisons |
| AnimatedDonutChart | Proportions with center label |
| AnimatedRadarChart | Multi-dimensional metrics |
| StackedAreaChart | Cumulative trends |
| ProgressBarList | Progress indicators |

### 7.3 Employer Components

| Component | Purpose |
|-----------|---------|
| ExecutivePulseCards | 4 KPIs: Score, Budget, Utilization, Pending |
| MoneyFlowVisualization | Sankey-style budget flow |
| YearEndProjection | Spend forecasting |
| ViewToggle | Strategic/Operational switch |
| QuickActionsBar | Bulk approve/reject claims |
| SLADashboard | On-track/at-risk/breached tracking |
| PeriodSelector | MTD/QTD/YTD/Custom date picker |

---

## 8. Design System

### 8.1 Color Palette (HSL)
```css
--primary: 222 47% 11%           /* Navy blue */
--accent: 174 60% 45%            /* Teal */
--success: 160 84% 39%           /* Green */
--warning: 38 92% 50%            /* Amber */
--destructive: 0 84% 60%         /* Red */
--info: 199 89% 48%              /* Blue */
```

### 8.2 Benefit Type Tags
```css
.tag-cash      /* Emerald - Cash & Financial */
.tag-health    /* Rose - Health & Protection */
.tag-time      /* Blue - Time Off & Flexibility */
.tag-growth    /* Purple - Growth & Career */
.tag-wealth    /* Amber - Wealth & Ownership */
.tag-wellbeing /* Cyan - Wellbeing */
```

### 8.3 Typography
- **Display:** DM Sans (headings)
- **Body:** Inter (text)
- **Arabic:** Noto Sans Arabic

### 8.4 RTL Support
- Full Arabic language support
- Automatic layout mirroring via `flex-row-reverse`
- Sidebar positioning via `lg:pr-64` / `lg:pl-64`

---

## 9. Data Hooks & State Management

### 9.1 Context Providers

| Context | Purpose |
|---------|---------|
| AuthContext | User, session, role, signIn/Out |
| LanguageContext | Language (en/ar), direction (ltr/rtl) |
| ProfileContext | Profile data, children, pets, interests |
| PeriodContext | Date range (MTD/QTD/YTD/Custom) |
| UIVisibilityContext | Element visibility per role |
| PrivacyContext | Salary visibility toggle |

### 9.2 React Query Hooks

#### Employee Hooks
- `useProfile()`, `useChildren()`, `useLeaveBalances()`
- `useBenefits()`, `useBenefitEntitlements()`
- `useRequests()`, `useRequestEvents(requestId)`
- `useMarketplaceOffers()`, `usePerkActivations()`

#### Employer Hooks
- `useEmployerDashboardMetrics(orgId)`
- `useBenefitUtilizationStats(orgId)`
- `useOrgRequests()`, `useUpdateRequest()`
- `useEmployerActions()`, `useCreateAction()`, `useActionStats()`

#### Shared Hooks
- `useMetricDefinitions()`, `useMetricDefinition(key)`
- `useAuditLog()` - logEvent, logLogin, logLogout
- `useSessionSecurity()` - Activity tracking, timeout
- `usePagination(data, pageSize)`

---

## 10. Authentication & Demo Accounts

### 10.1 Auth Flow
1. Email/password via Supabase Auth
2. Role fetched from `user_roles` table
3. Organization from `profiles` table
4. Session managed by Supabase

### 10.2 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | `demo.employee@bnft.ae` | `demo123456` |
| Employer | `demo.employer@bnft.ae` | `demo123456` |
| Admin | `demo.admin@bnft.ae` | `demo123456` |
| Vendor | `demo.vendor@bnft.ae` | `demo123456` |

---

## 11. Feature Workflows

### 11.1 Employee Claims Workflow
```
Draft → Submitted → In Review → Approved/Rejected → Paid
```
- `request_events` logs all status changes
- SLA timer starts on submission
- Employer bulk actions available

### 11.2 Employer Data Quality
- `DataQualityPanel` shows completeness metrics
- `ConfidenceGate` wraps metrics with confidence levels
- Benchmarks compare against industry averages

### 11.3 Vendor Payout Workflow
1. View earnings from commissions
2. Request payout (minimum threshold)
3. Admin processes payout
4. Settlement status tracking

---

## 12. Responsive Design

### 12.1 Breakpoints
```
sm: 640px   (Mobile landscape)
md: 768px   (Tablet portrait)
lg: 1024px  (Tablet landscape / Small desktop)
xl: 1280px  (Desktop)
2xl: 1400px (Large desktop)
```

### 12.2 Mobile Patterns
- Collapsible sidebar with hamburger menu
- Stacked cards on mobile
- Touch-friendly 44px minimum targets
- Sheet components for mobile modals

---

## Appendix: Database Functions

```sql
-- Get employer dashboard metrics
get_employer_dashboard_metrics(p_org_id, p_period_start, p_period_end) → JSONB

-- Get benefit utilization stats  
get_benefit_utilization_stats(p_org_id, p_period_start, p_period_end) → JSONB

-- Log audit event
log_audit_event(p_user_id, p_action, p_resource_type, ...) → UUID

-- Ensure demo user role
ensure_demo_user_role(p_email, p_role, p_org_id) → JSONB

-- Get org stats
get_org_benefit_stats(org_id) → TABLE
get_org_leave_stats(org_id) → TABLE
get_org_satisfaction_stats(org_id) → TABLE
get_org_employee_directory(org_id) → TABLE
```

---

*Document generated for AI assistant consumption. Last updated: January 2026*
