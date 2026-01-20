# Total Rewards Platform - Comprehensive Technical Documentation

## Table of Contents
1. [Platform Overview](#1-platform-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Design System](#4-design-system)
5. [Portal Details](#5-portal-details)
6. [Database Schema](#6-database-schema)
7. [Authentication & Security](#7-authentication--security)
8. [Component Library](#8-component-library)
9. [State Management](#9-state-management)
10. [Internationalization](#10-internationalization)
11. [Feature Modules](#11-feature-modules)

---

## 1. Platform Overview

### 1.1 Purpose
The **bnft. Total Rewards Platform** is a comprehensive employee benefits and total compensation management system designed for organizations in the GCC region (UAE, Saudi Arabia, Qatar, Kuwait). It provides a unified platform for employees to understand, track, and maximize their benefits while giving employers actionable insights into benefits utilization and ROI.

### 1.2 User Portals
The platform consists of **four distinct portals**, each tailored to specific user roles:

| Portal | Target Users | Primary Purpose |
|--------|-------------|-----------------|
| **Employee Portal** | Individual employees | View benefits, submit claims, access perks marketplace |
| **Employer Portal** | HR teams, C-suite executives | Analytics, claims processing, policy management |
| **Admin Portal** | Platform administrators | Multi-tenant management, benchmarking, market intelligence |
| **Vendor Portal** | Marketplace vendors/partners | Offer management, earnings tracking, performance analytics |

### 1.3 Key Platform Features
- **Multi-language Support**: English (LTR) and Arabic (RTL) with automatic direction switching
- **Dark/Light Theme**: Full theme support with semantic color tokens
- **Role-based Access Control**: Strict permission enforcement via RLS policies
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Data**: Live updates via Supabase subscriptions
- **Privacy Controls**: Salary hiding, data privacy settings

---

## 2. Technology Stack

### 2.1 Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | Latest | Type safety |
| Vite | Latest | Build tool & dev server |
| Tailwind CSS | Latest | Utility-first styling |
| shadcn/ui | Latest | Component library base |
| Framer Motion | 12.25.0 | Animations |
| Recharts | 2.15.4 | Chart visualizations |
| TanStack Query | 5.83.0 | Server state management |
| React Router | 6.30.3 | Client-side routing |

### 2.2 Backend Technologies (Lovable Cloud / Supabase)
| Service | Purpose |
|---------|---------|
| PostgreSQL | Primary database |
| Supabase Auth | Authentication (email, social) |
| Row Level Security | Data access control |
| Edge Functions | Serverless backend logic |
| Supabase Storage | File uploads & documents |

### 2.3 Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.90.1",
  "@tanstack/react-query": "^5.83.0",
  "framer-motion": "^12.25.0",
  "recharts": "^2.15.4",
  "react-hook-form": "^7.61.1",
  "zod": "^3.25.76",
  "date-fns": "^3.6.0",
  "xlsx": "^0.18.5",
  "lucide-react": "^0.462.0"
}
```

---

## 3. Architecture

### 3.1 File Structure
```
src/
├── components/
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Authentication components (MFA, password)
│   ├── charts/             # Animated chart components
│   ├── dashboard/          # Dashboard widgets & insights
│   ├── employee/           # Employee portal components
│   ├── employer/           # Employer portal components
│   ├── layout/             # Layout & sidebar components
│   ├── notifications/      # Notification center
│   ├── security/           # Security providers & settings
│   ├── shared/             # Cross-portal shared components
│   ├── ui/                 # Base UI components (shadcn)
│   └── vendor/             # Vendor portal components
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   ├── LanguageContext.tsx # i18n & RTL
│   ├── ProfileContext.tsx  # User profile state
│   ├── UIVisibilityContext.tsx # Feature toggles
│   └── EmployerViewModeContext.tsx # Executive/Ops toggle
├── hooks/
│   ├── useEmployeeDashboard.ts  # Employee data fetching
│   ├── useEmployerDashboard.ts  # Employer data fetching
│   ├── useSupabaseData.ts       # Generic Supabase hooks
│   └── useSessionSecurity.ts    # Session management
├── pages/
│   ├── employee/           # 22 employee pages
│   ├── employer/           # 10 employer pages
│   ├── admin/              # 10 admin pages
│   └── vendor/             # 8 vendor pages
├── lib/
│   ├── utils.ts            # Utility functions
│   ├── constants.ts        # App constants
│   ├── chartColors.ts      # Chart color palette
│   └── colorSystem.ts      # Design system colors
└── integrations/
    └── supabase/           # Supabase client & types
```

### 3.2 Context Provider Hierarchy
```tsx
<QueryClientProvider>
  <BrowserRouter>
    <LanguageProvider>          {/* i18n & RTL */}
      <AuthProvider>            {/* Authentication */}
        <ProfileProvider>       {/* User profile */}
          <PrivacyProvider>     {/* Privacy toggles */}
            <UIVisibilityProvider>  {/* Feature flags */}
              <SecurityProvider>    {/* Session security */}
                <AppRoutes />
              </SecurityProvider>
            </UIVisibilityProvider>
          </PrivacyProvider>
        </ProfileProvider>
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
</QueryClientProvider>
```

### 3.3 Routing Structure

#### Public Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Index | Landing page |
| `/auth` | Auth | Login/signup |

#### Employee Routes (`/employee/*`)
| Route | Component | Description |
|-------|-----------|-------------|
| `/employee` | Dashboard | Main dashboard with compensation overview |
| `/employee/benefits` | Benefits | All benefits grid view |
| `/employee/benefits-analysis` | BenefitsAnalysis | Utilization analytics |
| `/employee/housing` | Housing | Housing allowance details |
| `/employee/schooling` | Schooling | Education benefits |
| `/employee/health` | Health | Health insurance |
| `/employee/transport` | Transport | Transport & mobility |
| `/employee/long-term-financials` | LongTermFinancials | Gratuity, ESOP, bonuses |
| `/employee/wellbeing` | Wellbeing | Wellness programs |
| `/employee/learning` | Learning | L&D benefits |
| `/employee/leave` | Leave | Leave management |
| `/employee/marketplace` | Marketplace | Perks & partners |
| `/employee/documents` | Documents | HR document requests |
| `/employee/requests` | Requests | Claims & requests |
| `/employee/gov-connect` | GovConnect | UAE government links |
| `/employee/profile` | Profile | Smart profile (4 tabs) |
| `/employee/onboarding` | Onboarding | New hire journey |
| `/employee/knowledge` | KnowledgeHub | Help & FAQs |

#### Employer Routes (`/employer/*`)
| Route | Component | Description |
|-------|-----------|-------------|
| `/employer` | Dashboard | Dual-mode (Executive/HR Ops) |
| `/employer/spend` | Spend | Spend & utilization analytics |
| `/employer/zombie` | ZombieSpend | Unused benefits detection |
| `/employer/segments` | Segments | Employee segmentation |
| `/employer/claims` | Claims | Claims processing queue |
| `/employer/marketplace` | MarketplaceAnalytics | Vendor performance |
| `/employer/policies` | Policies | Policy management |
| `/employer/integrations` | Integrations | HRIS connections |
| `/employer/knowledge` | KnowledgeCenter | Resources & guides |
| `/employer/recommendations` | Recommendations | AI-powered suggestions |

#### Admin Routes (`/admin/*`)
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | Dashboard | Platform command center |
| `/admin/benchmarks` | Benchmarks | Regional benchmarking |
| `/admin/market` | MarketIntelligence | User intent analysis |
| `/admin/spending` | SpendingPatterns | Cross-org patterns |
| `/admin/reports` | SavedReports | Report management |
| `/admin/organizations` | Organizations | Org management |
| `/admin/organizations/:orgId/settings` | OrgSettings | Per-org config |
| `/admin/settings` | Settings | Platform settings |
| `/admin/ui-config` | UIConfiguration | UI feature toggles |
| `/admin/data-migration` | DataMigration | Data import tools |

#### Vendor Routes (`/vendor/*`)
| Route | Component | Description |
|-------|-----------|-------------|
| `/vendor` | Dashboard | Vendor analytics home |
| `/vendor/offers` | Offers | Offer management |
| `/vendor/offers/new` | CreateOffer | New offer wizard |
| `/vendor/analytics` | Analytics | Performance metrics |
| `/vendor/transactions` | Transactions | Transaction history |
| `/vendor/earnings` | Earnings | Earnings & payouts |
| `/vendor/profile` | Profile | Company profile |
| `/vendor/settings` | Settings | Vendor settings |

---

## 4. Design System

### 4.1 Color Tokens (HSL Format)
The design uses semantic CSS variables defined in `index.css`:

#### Light Mode
```css
:root {
  /* Primary Navy */
  --background: 220 20% 98%;
  --foreground: 222 47% 11%;
  --primary: 222 47% 11%;
  --primary-foreground: 210 40% 98%;
  
  /* Teal Accent */
  --accent: 174 55% 42%;
  --accent-foreground: 0 0% 100%;
  
  /* Secondary */
  --secondary: 220 14% 96%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 50%;
  
  /* Semantic Colors */
  --destructive: 0 72% 55%;
  --success: 160 70% 40%;
  --warning: 38 85% 52%;
  --info: 199 80% 50%;
  
  /* Chart Palette */
  --chart-1: 174 55% 42%;  /* Teal */
  --chart-2: 199 80% 50%;  /* Blue */
  --chart-3: 262 48% 52%;  /* Purple */
  --chart-4: 38 85% 52%;   /* Amber */
  --chart-5: 340 60% 52%;  /* Rose */
  --chart-6: 160 70% 40%;  /* Green */
  --chart-7: 24 70% 52%;   /* Orange */
  --chart-8: 280 50% 52%;  /* Violet */
  
  /* Sidebar (Dark) */
  --sidebar-background: 222 47% 8%;
  --sidebar-foreground: 220 14% 96%;
  --sidebar-primary: 174 55% 42%;
}
```

#### Dark Mode
```css
.dark {
  --background: 222 47% 6%;
  --foreground: 220 14% 96%;
  --primary: 174 60% 45%;
  --accent: 174 60% 45%;
  --card: 222 47% 10%;
  --border: 222 47% 18%;
}
```

### 4.2 Typography
```css
/* Body Text */
font-family: 'Inter', system-ui, sans-serif;

/* Headings */
font-family: 'DM Sans', system-ui, sans-serif;

/* Arabic (RTL) */
font-family: 'Noto Sans Arabic', 'Inter', system-ui, sans-serif;
```

### 4.3 Component Classes
```css
/* Card Variants */
.glass-card      /* Frosted glass effect */
.metric-card     /* Metric display cards */
.benefit-card    /* Benefit item cards */
.executive-card  /* Premium gradient cards */

/* Navigation */
.nav-item        /* Sidebar navigation items */
.nav-item-active /* Active state */

/* Tags & Badges */
.tag-primary     /* Accent-colored tags */
.tag-cash        /* Green (cash benefits) */
.tag-health      /* Rose (health benefits) */
.tag-time        /* Blue (time/leave) */
.tag-growth      /* Purple (career) */
.tag-wealth      /* Amber (financial) */
.tag-wellbeing   /* Teal (wellness) */

/* Status Indicators */
.within-allowance  /* Green - under budget */
.topup-needed      /* Amber - needs top-up */

/* Insight Badges */
.insight-badge-success
.insight-badge-warning
.insight-badge-info
```

### 4.4 Gradients
```css
--gradient-primary: linear-gradient(135deg, navy 0%, navy-light 100%);
--gradient-accent: linear-gradient(135deg, teal 0%, teal-light 100%);
--gradient-hero: linear-gradient(135deg, navy-dark 0%, navy 50%, teal-dark 100%);
```

### 4.5 Shadows
```css
--shadow-xs: 0 1px 2px rgb(0 0 0 / 0.03);
--shadow-sm: 0 1px 3px rgb(0 0 0 / 0.04);
--shadow-md: 0 4px 6px rgb(0 0 0 / 0.05);
--shadow-lg: 0 10px 15px rgb(0 0 0 / 0.06);
--shadow-glow: 0 0 24px hsl(accent / 0.2);
```

### 4.6 Spacing & Layout Standards
- **Page padding**: `p-6` (1.5rem)
- **Card padding**: `p-6` (1.5rem)
- **Grid gaps**: `gap-4` to `gap-6`
- **Progress bars**: `h-1.5` (6px)
- **Small text**: `text-[13px]`
- **Border opacity**: `border-border/40`

---

## 5. Portal Details

### 5.1 Employee Portal

#### Dashboard Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ProfileCompleteness                                         │
│ "Good morning, {firstName}!" + completion progress          │
├─────────────────────────────────────────────────────────────┤
│ QuickActionsStrip                                           │
│ [Submit Claim] [Request Leave] [Next Payroll: X days]       │
├─────────────────────────────────────────────────────────────┤
│ Compensation Summary                                        │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Monthly  │ Annual   │ Guaranteed│ Benefits │              │
│ │ Salary   │ Salary   │ Benefits  │ % of Pkg │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│ Total Guaranteed Compensation: AED XXX,XXX                  │
├─────────────────────────────────────────────────────────────┤
│ Your Benefits (2x3 Grid)                                    │
│ ┌──────────┬──────────┬──────────┐                         │
│ │ Housing  │ Schooling│ Health   │                         │
│ │ 100%     │ 70%      │ 28%      │                         │
│ ├──────────┼──────────┼──────────┤                         │
│ │ Transport│ Wellbeing│ Learning │                         │
│ │ 85%      │ 53%      │ 38%      │                         │
│ └──────────┴──────────┴──────────┘                         │
├─────────────────────────────────────────────────────────────┤
│ SmartInsights (AI-powered recommendations)                  │
└─────────────────────────────────────────────────────────────┘
```

#### Sidebar Navigation
```
DASHBOARD
├── Overview

MY BENEFITS
├── All Benefits
└── Benefits Analysis

BENEFIT DETAILS
├── Housing
├── Schooling
├── Health Insurance
├── Transport & Mobility
├── Long-Term Financials
├── Wellbeing Program
└── Learning & Development

LEAVE MANAGEMENT
└── Leave Management

HR & SERVICES
├── Claims, Requests & Travel
├── HR Documents
├── Knowledge Hub
├── Gov Connect
└── Onboarding

[Perks & Partners] ← Gradient button
[Smart Profile]    ← Gradient button
```

#### Marketplace (Perks & Partners) Structure
```
Tabs: [Personalized For You] [Bank Card Benefits]

PERSONALIZED FOR YOU TAB:
┌─────────────────────────────────────────────────────────────┐
│ Stats Strip: X Offers | Avg X% Discount | X Cards | X Cat   │
├─────────────────────────────────────────────────────────────┤
│ TOP PICKS FOR YOU                                           │
│ [CuratedPerks carousel - 3 personalized offers]             │
├─────────────────────────────────────────────────────────────┤
│ BROWSE BY CATEGORY                                          │
│ [Food] [Travel] [Health] [Family] [Learning] [Home] ...    │
├─────────────────────────────────────────────────────────────┤
│ ALL PERKS (Filterable grid)                                 │
│ Search: [...] Sort: [Discount ▼] View: [Grid/List]         │
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ Offer 1 │ Offer 2 │ Offer 3 │ Offer 4 │                  │
│ └─────────┴─────────┴─────────┴─────────┘                  │
└─────────────────────────────────────────────────────────────┘

BANK CARD BENEFITS TAB:
┌─────────────────────────────────────────────────────────────┐
│ Your linked cards: Emirates NBD Skywards, FAB Cashback     │
│ Benefits from your cards aggregated here                    │
└─────────────────────────────────────────────────────────────┘
```

#### Smart Profile (4 Tabs)
```
Tabs: [Personal] [Employment] [Preferences] [Security]

PERSONAL TAB:
- Basic Info (name, DOB, nationality)
- Contact Details
- Emergency Contact
- Family Information (spouse, children)
- Pets
- Bank Cards Section ← NEW

EMPLOYMENT TAB:
- Job Details
- Manager Info
- Compensation Details

PREFERENCES TAB:
- Interests & Hobbies
- Notification Preferences
- Display Settings

SECURITY TAB:
- Change Password
- MFA Settings
- Active Sessions
- Data Privacy Settings
```

### 5.2 Employer Portal

#### Dual-Mode Dashboard
The Employer portal features a mode toggle between:

**1. HR Operations Mode (Default)**
```
┌─────────────────────────────────────────────────────────────┐
│ HR Operations Hub                     [Date] [SLA: 94%]     │
├─────────────────────────────────────────────────────────────┤
│ ACTION ITEMS                                                │
│ ┌───────────┬───────────┬───────────┬───────────┐          │
│ │ Claims    │ Document  │ Policy    │ Leave     │          │
│ │ Pending:12│ Requests:5│ Reviews:3 │ Pending:8 │          │
│ └───────────┴───────────┴───────────┴───────────┘          │
├─────────────────────────────────────────────────────────────┤
│ PERFORMANCE METRICS                                         │
│ Avg Processing: 2.3 days | Claims This Month: 156          │
│ Approval Rate: 94% | Policy Updates Due: 3                  │
├─────────────────────────────────────────────────────────────┤
│ CLAIMS BY CATEGORY          │ RECENT ACTIVITY              │
│ [ProgressBarList chart]     │ [Activity feed]              │
├─────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                               │
│ [Process Claims] [Review Policies] [Generate Report]        │
└─────────────────────────────────────────────────────────────┘
```

**2. Executive Mode**
```
┌─────────────────────────────────────────────────────────────┐
│ Executive Dashboard                    [Period Selector]    │
├─────────────────────────────────────────────────────────────┤
│ KEY METRICS                                                 │
│ ┌───────────┬───────────┬───────────┬───────────┐          │
│ │ Total     │ Utiliz-   │ Employee  │ Cost per  │          │
│ │ Investment│ ation     │ Satis-    │ Employee  │          │
│ │ AED 24.5M │ 72%       │ faction   │ AED 185K  │          │
│ └───────────┴───────────┴───────────┴───────────┘          │
├─────────────────────────────────────────────────────────────┤
│ STRATEGIC INSIGHTS                                          │
│ [AI-generated C-suite insights with ROI impact]             │
├─────────────────────────────────────────────────────────────┤
│ UTILIZATION TRENDS        │ BENEFITS BY TYPE               │
│ [AnimatedLineChart]       │ [AnimatedDonutChart]           │
└─────────────────────────────────────────────────────────────┘
```

#### Sidebar Navigation
```
OVERVIEW
├── Dashboard

OPERATIONS
├── Claims & Approvals
└── Employee Segments

FINANCIALS
├── Spend & Utilization
└── Zombie Spend

ANALYTICS
├── Marketplace Analytics
├── Policy Insights
└── Recommendations

SETTINGS
├── Integrations
└── Knowledge Center
```

### 5.3 Admin Portal

#### Dashboard Tabs
```
Tabs: [Overview] [Benchmarks] [Market Intelligence] 
      [Vendor Performance] [Data Quality] [Action Center]

OVERVIEW TAB:
┌─────────────────────────────────────────────────────────────┐
│ PLATFORM METRICS                                            │
│ Organizations: 47 | Employees: 12,847 | GMV: AED 24.5M     │
├─────────────────────────────────────────────────────────────┤
│ PLATFORM GROWTH              │ INDUSTRY DISTRIBUTION        │
│ [AnimatedLineChart]          │ [AnimatedDonutChart]         │
├─────────────────────────────────────────────────────────────┤
│ TOP PERFORMING BENEFITS (Platform-wide)                     │
│ Housing: 94% | Education: 87% | Health: 82%                │
└─────────────────────────────────────────────────────────────┘

BENCHMARKS TAB:
- Regional comparison table (UAE, Saudi, Qatar, Kuwait)
- Utilization by region chart
- Average spend by region chart

MARKET INTELLIGENCE TAB:
- High-intent user segments
- Opportunity identification

VENDOR PERFORMANCE TAB:
- Vendor leaderboard
- Compliance scores
- Redemption analytics

DATA QUALITY TAB:
- Orphaned records
- Missing budgets
- Stale syncs
- Integration health

ACTION CENTER TAB:
- Platform-level tasks
- Priority actions
- Escalated issues
```

#### Sidebar Navigation
```
PLATFORM OVERVIEW
├── Dashboard

BENCHMARKING
├── Regional & Industry

MARKET INTELLIGENCE
├── User Intent & Segments
└── Spending Patterns

PLATFORM MANAGEMENT
├── Organizations
└── Saved Reports

CONFIGURATION
├── UI Configuration
└── Data Migration

SETTINGS
└── Platform Settings
```

### 5.4 Vendor Portal

#### Dashboard Tabs
```
Tabs: [My Offers] [Analytics] [Insights] [Transactions] 
      [Earnings] [Payouts]

MY OFFERS TAB:
┌─────────────────────────────────────────────────────────────┐
│ OFFER CARDS (2-column grid)                                 │
│ ┌───────────────────────────┬───────────────────────────┐  │
│ │ 20% Off Premium Gym       │ Free Trial - Wellness App │  │
│ │ Views: 1,250 | Red: 245   │ Views: 890 | Red: 167     │  │
│ │ Earnings: AED 8,500       │ Earnings: AED 4,200       │  │
│ └───────────────────────────┴───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

INSIGHTS TAB:
- PerformanceInsights component
- AI-powered optimization tips
- Weekly trend chart

PAYOUTS TAB:
- PayoutThresholds component
- Commission tier progress (Bronze → Silver → Gold)
- Payout summary
- Request payout functionality
```

#### Sidebar Navigation
```
OVERVIEW
├── Dashboard

OFFERS MANAGEMENT
├── My Offers
└── Create Offer

PERFORMANCE
├── Analytics
├── Transactions
└── Earnings

ACCOUNT
├── Company Profile
└── Settings
```

---

## 6. Database Schema

### 6.1 Core Tables

#### Users & Authentication
```sql
-- User roles (employee, employer, admin, vendor)
user_roles (id, user_id, role, created_at)

-- User profiles
profiles (
  id, user_id, organization_id,
  first_name, last_name, email, phone,
  department, position, grade,
  monthly_salary, employment_date,
  home_location, work_location,
  nationality, date_of_birth,
  marital_status, spouse_name, spouse_employer,
  emirates_id, passport_number, blood_type,
  emergency_contact_name, emergency_contact_phone,
  interests[], cars[], pets[],
  preferred_language, avatar_url,
  manager_name, created_at, updated_at
)

-- Children (for education benefits)
children (id, user_id, name, date_of_birth, grade, school_name, organization_id)
```

#### Organizations
```sql
organizations (
  id, name, domain, logo_url,
  primary_color, secondary_color, accent_color,
  welcome_message, footer_text,
  survey_start_month, survey_end_month,
  settings, created_at, updated_at
)

org_policy_settings (
  id, organization_id,
  fiscal_year_start_month, payroll_cycle, currency, timezone,
  leave_accrual_rules, gratuity_calculation_rules
)

org_budgets (
  id, organization_id, fiscal_year, annual_budget, budget_allocated
)
```

#### Benefits
```sql
benefits (
  id, name, description, benefit_type, life_area,
  annual_value, icon, policy_bullets[], is_active
)

benefit_entitlements (
  id, user_id, benefit_id, organization_id,
  annual_allowance, utilized_amount
)

benefit_grade_eligibility (
  id, benefit_id, grade, is_eligible,
  annual_allowance, coverage_percent,
  max_dependents, dependent_coverage,
  waiting_period_days, requires_documentation,
  max_claim_per_transaction, notes
)

benefit_policy_versions (
  id, benefit_id, organization_id, version,
  policy_text, attachment_url,
  effective_from, effective_until,
  created_by
)

benefit_required_documents (
  id, benefit_id, document_name, document_type,
  description, is_required, required_for, conditions
)
```

#### Requests & Claims
```sql
requests (
  id, user_id, organization_id,
  request_type, category, subject, description,
  amount, status, priority,
  assigned_to, sla_due_at,
  reviewed_by, reviewed_at, reviewer_notes,
  last_status_change_at
)

request_attachments (
  id, request_id, file_name, file_url, file_type, file_size,
  document_type, is_required, uploaded_by, uploaded_at
)

request_events (
  id, request_id, from_status, to_status,
  actor_user_id, notes_internal, notes_employee_visible
)
```

#### Leave Management
```sql
leave_balances (
  id, user_id, organization_id, year,
  leave_type, total_days, used_days
)
```

#### Marketplace
```sql
marketplace_offers (
  id, vendor_id, title, description, merchant, category,
  discount_percent, terms, tags[], rating,
  image_url, is_active
)

perk_activations (
  id, user_id, offer_id, organization_id, activated_at
)

vendors (
  id, name, description, category, logo_url,
  contact_email, contact_phone, website,
  commission_rate, is_active
)

vendor_transactions (
  id, vendor_id, offer_id, user_id, organization_id,
  transaction_type, original_amount, discount_amount,
  commission_amount, code_used, status,
  redeemed_at, settled_at
)
```

#### Per Diem
```sql
per_diem_rates (
  id, region, country, city, destination_type, grade,
  daily_meals, daily_accommodation, daily_transport,
  daily_incidentals, daily_total, currency,
  effective_from, effective_until, is_active
)

per_diem_claims (
  id, user_id, organization_id, rate_id,
  destination_country, destination_city, destination_type,
  departure_date, return_date, number_of_days,
  trip_purpose, trip_reference,
  meals_amount, accommodation_amount,
  transport_amount, incidentals_amount, total_amount,
  currency, status, receipts_attached,
  submitted_at, reviewed_by, reviewed_at, reviewer_notes, paid_at
)
```

#### Analytics & Tracking
```sql
utilization_events (
  id, user_id, benefit_id, organization_id,
  event_type, amount, description, created_at
)

platform_analytics (
  id, metric_name, metric_type, metric_value,
  period_start, period_end, region, industry, company_size
)

metric_definitions (
  key, name_en, name_ar, definition_en, definition_ar,
  formula_en, formula_ar, source, owner_role,
  min_sample_size, confidence_rules
)
```

#### Security
```sql
user_sessions (
  id, user_id, session_token_hash,
  ip_address, user_agent, device_info,
  created_at, last_activity, expires_at, is_active
)

login_attempts (
  id, email, ip_address, success, attempt_time
)

account_lockouts (
  id, email, failed_attempts, locked_at, locked_until, notification_sent
)

mfa_settings (
  id, user_id, mfa_enabled, enrolled_at, updated_at
)

audit_logs (
  id, user_id, action, resource_type, resource_id,
  details, ip_address, user_agent, created_at
)

data_access_requests (
  id, user_id, request_type, status,
  notes, processed_by, processed_at
)
```

#### UI Configuration
```sql
ui_visibility_settings (
  id, organization_id, role, page_key, element_key,
  is_visible, updated_by, updated_at
)
```

### 6.2 Enums
```sql
-- User Roles
CREATE TYPE user_role AS ENUM ('employee', 'employer', 'admin', 'vendor');

-- Request Types
CREATE TYPE request_type AS ENUM (
  'claim', 'document', 'leave', 'travel', 
  'expense', 'policy', 'general'
);

-- Request Status
CREATE TYPE request_status AS ENUM (
  'draft', 'pending', 'in_review', 'approved', 
  'rejected', 'processing', 'completed', 'cancelled'
);

-- Benefit Types
CREATE TYPE benefit_type AS ENUM (
  'cash_allowances', 'health_protection', 'time_off_flex',
  'growth_career', 'wealth_ownership', 'wellbeing'
);

-- Life Areas
CREATE TYPE life_area AS ENUM (
  'home_living', 'family_parenting', 'health',
  'money', 'career', 'lifestyle', 'mobility'
);
```

---

## 7. Authentication & Security

### 7.1 Authentication Flow
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<{ error: Error | null }>;
}
```

### 7.2 Security Features
| Feature | Implementation |
|---------|---------------|
| Session Management | 30-minute timeout, activity tracking |
| MFA | TOTP-based enrollment & challenge |
| Account Lockout | 5 failed attempts → 15-min lock |
| Rate Limiting | Edge function protection |
| Audit Logging | All sensitive actions logged |
| Row Level Security | Per-table RLS policies |
| Password Policy | Strength indicator, min requirements |

### 7.3 Protected Routes
```tsx
<ProtectedRoute allowedRoles={['employee']}>
  <EmployeeLayout />
</ProtectedRoute>
```

### 7.4 RLS Policy Pattern
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Organization-scoped access
CREATE POLICY "Org members can view org benefits" ON benefit_entitlements
  FOR SELECT USING (
    organization_id = get_user_organization_id()
  );
```

---

## 8. Component Library

### 8.1 Base UI Components (shadcn/ui)
- Accordion, Alert, AlertDialog, AspectRatio, Avatar
- Badge, Breadcrumb, Button, Calendar, Card, Carousel
- Checkbox, Collapsible, Command, ContextMenu
- Dialog, Drawer, DropdownMenu, Form
- HoverCard, Input, InputOTP, Label, Menubar
- NavigationMenu, Pagination, Popover, Progress
- RadioGroup, ResizablePanels, ScrollArea, Select
- Separator, Sheet, Sidebar, Skeleton, Slider
- Sonner (toast), Switch, Table, Tabs
- Textarea, Toast, Toggle, ToggleGroup, Tooltip

### 8.2 Custom Chart Components
```typescript
// Animated charts with Framer Motion
AnimatedBarChart     // Horizontal/vertical bars
AnimatedLineChart    // Time series with gradients
AnimatedDonutChart   // Pie charts with animation
AnimatedRadarChart   // Multi-dimensional data
StackedAreaChart     // Cumulative trends
ProgressBarList      // Labeled progress bars
ChartContainer       // Responsive wrapper
```

### 8.3 Dashboard Components
```typescript
SmartInsights           // AI-powered recommendations
BenchmarkComparison     // Industry comparisons
PersonalizedRecommendations // User-specific tips
CuratedPerks            // Featured marketplace offers
TrendIndicator          // Up/down arrows with %
DateRangeFilter         // Period selection
DrillDownModal          // Detailed data views
BenefitsDrillDownSheet  // Benefits detail sheet
```

### 8.4 Employee Components
```typescript
BenefitCard             // Benefit display card
BenefitActionButtons    // Claim/view actions
ProfileCompleteness     // Profile progress
QuickActionsStrip       // Dashboard shortcuts
CompensationBreakdownModal // Salary details
LeavePayrollWidget      // Leave summary
PerDiemWidget           // Travel allowances
PolicyHighlightsCard    // Policy bullets
RequestClaimWidget      // Submit claims
SatisfactionSurvey      // Feedback form
ClaimsDirectory         // Claims list
BankCardBenefits        // Bank card perks
```

### 8.5 Employer Components
```typescript
ExecutiveDashboard      // C-suite view
HROpsDashboard          // Operations view
DataQualityBadge        // Data confidence
PeriodSelector          // Date range picker
TrendComparison         // Period comparison
```

### 8.6 Vendor Components
```typescript
OfferQualityScore       // Compliance checklist
PerformanceInsights     // AI optimization tips
PayoutThresholds        // Commission tiers
```

### 8.7 Shared Components
```typescript
PageHeader              // Consistent page titles
FilterBar               // Search & filters
BankCardsSection        // Bank card management
ConfidenceGate          // Data quality wrapper
EmptyState              // No data display
```

---

## 9. State Management

### 9.1 React Context
| Context | Purpose |
|---------|---------|
| `AuthContext` | User, session, role, auth methods |
| `LanguageContext` | Current language, direction, translations |
| `ProfileContext` | User profile, family, bank cards |
| `UIVisibilityContext` | Feature visibility toggles |
| `PrivacyContext` | Salary hiding preferences |
| `EmployerViewModeContext` | Executive/Ops mode toggle |

### 9.2 Data Fetching Hooks
```typescript
// Employee hooks
useEmployeeDashboard()    // Dashboard data
useProfile()              // Current user profile
useBenefits()             // Available benefits
useBenefitEntitlements()  // User's entitlements
useLeaveBalances()        // Leave data
useRequests()             // User's requests
useUtilizationHistory()   // Usage trends

// Employer hooks
useEmployerDashboard()    // Employer analytics
useAllProfiles()          // All employees
useAllBenefitEntitlements()  // Org entitlements
useAllUtilizationEvents() // Org utilization

// Shared hooks
useMarketplaceOffers()    // Active offers
useHousingListings()      // Housing data
useSchools()              // Education data
useHealthProviders()      // Healthcare data
```

---

## 10. Internationalization

### 10.1 Supported Languages
| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| Arabic | `ar` | RTL |

### 10.2 Translation Usage
```typescript
const { t, language, direction } = useLanguage();

// In component
<h1>{t('dashboard.title')}</h1>

// Or inline translation
const t = (en: string, ar: string) => language === 'ar' ? ar : en;
<p>{t('Hello', 'مرحبا')}</p>
```

### 10.3 RTL Support
```css
/* Automatic direction */
html.rtl {
  direction: rtl;
  font-family: 'Noto Sans Arabic', system-ui, sans-serif;
}

/* Flex reversal */
html.rtl .nav-item {
  flex-direction: row-reverse;
}

/* Margin/padding swap */
html.rtl .ms-auto {
  margin-right: auto;
  margin-left: 0;
}
```

---

## 11. Feature Modules

### 11.1 Employee Dashboard
- **ProfileCompleteness**: Personalized greeting with profile progress
- **QuickActionsStrip**: Submit Claim, Request Leave, Next Payroll countdown
- **CompensationGrid**: 4 key metrics + total compensation card
- **Benefits Grid**: 2×3 grid of benefit cards with utilization
- **SmartInsights**: AI-powered recommendations

### 11.2 Benefits System
- **6 Core Benefits**: Housing, Schooling, Health, Transport, Wellbeing, Learning
- **Long-Term Financials**: Gratuity, ESOP, Bonus (consolidated page)
- **Policy Highlights**: Bullet points + View Full Policy
- **Grade Eligibility**: Different allowances by employee grade
- **Required Documents**: Dynamic document requirements

### 11.3 Marketplace
- **Personalized For You**: AI-curated offers tab
- **Bank Card Benefits**: Aggregated bank card perks
- **Category Browsing**: 9 categories with icons
- **Offer Cards**: Discount badges, ratings, merchant info
- **Offer Quality Score**: Vendor compliance checklist

### 11.4 Leave Management
- **Leave Types**: Annual, Sick, Personal, Maternity, Paternity, Compassionate
- **Balance Display**: Used vs. remaining days
- **Request Flow**: Submit → Approve → Track

### 11.5 Claims & Requests
- **Request Types**: Claim, Document, Leave, Travel, Expense, Policy, General
- **Status Tracking**: Draft → Pending → In Review → Approved/Rejected
- **SLA Management**: Due dates and processing times
- **Attachment Support**: Document uploads

### 11.6 Employer Analytics
- **Dual-Mode View**: Executive (strategic) vs. HR Ops (tactical)
- **Spend Analysis**: Budget vs. actual, by category
- **Zombie Spend**: Unused benefit detection
- **Segmentation**: Employee groups and patterns
- **Benchmark Comparison**: Industry/regional comparisons

### 11.7 Admin Platform
- **Multi-Tenant Management**: Organization CRUD
- **Benchmarking**: Regional and industry comparisons
- **Market Intelligence**: User intent analysis
- **Data Quality**: Integration health monitoring
- **UI Configuration**: Feature visibility toggles
- **Data Migration**: Excel import wizard

### 11.8 Vendor Portal
- **Offer Management**: Create, edit, pause offers
- **Performance Analytics**: Views, redemptions, conversion
- **Earnings Tracking**: Commission calculation
- **Payout System**: Tiered commission rates (Bronze/Silver/Gold)
- **AI Insights**: Optimization recommendations

---

## Appendix A: Constants

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

---

## Appendix B: Key Metrics by Portal

### Employee Metrics
- Monthly Salary
- Annual Salary
- Guaranteed Benefits Value
- Benefits % of Package
- Total Guaranteed Compensation
- Benefits Utilization %
- Leave Balance (days remaining)

### Employer Metrics
- Total Benefits Investment
- Utilization Rate
- Employee Satisfaction Score
- Cost per Employee
- Claims Processing Time
- SLA Compliance %
- Zombie Spend Amount

### Admin Metrics
- Total Organizations
- Active Employees (platform)
- Platform GMV
- Active Vendors
- Average Utilization (by region)
- Industry Distribution

### Vendor Metrics
- Active Offers
- Total Views
- Redemptions
- Total Earnings
- Conversion Rate
- Commission Earned
- Pending Payout

---

## Appendix C: Edge Functions

### Available Functions
| Function | Purpose |
|----------|---------|
| `rate-limit-auth` | Login attempt rate limiting |
| `account-lockout` | Failed login lockout management |

### Edge Function Structure
```typescript
// supabase/functions/[function-name]/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Function logic
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```

---

*Last Updated: January 2026*
*Platform Version: 2.0*
*Documentation Version: 1.0*
