# Total Rewards Platform - Technical Documentation v4.0
## Comprehensive Platform Architecture & Implementation Guide

---

# TABLE OF CONTENTS

1. [Platform Overview](#1-platform-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Routing & Navigation](#4-routing--navigation)
5. [Database Schema](#5-database-schema)
6. [Authentication & Security](#6-authentication--security)
7. [Design System](#7-design-system)
8. [Component Library](#8-component-library)
9. [State Management](#9-state-management)
10. [Feature Modules](#10-feature-modules)
11. [Internationalization](#11-internationalization)
12. [Charts & Visualizations](#12-charts--visualizations)
13. [API Integration](#13-api-integration)
14. [Edge Functions](#14-edge-functions)
15. [Performance & Optimization](#15-performance--optimization)

---

# 1. PLATFORM OVERVIEW

## 1.1 Purpose
A comprehensive Total Rewards Management Platform for UAE-based organizations to manage employee benefits, compensation, marketplace perks, and HR analytics.

## 1.2 User Portals (4 Distinct Interfaces)

### Employee Portal (`/employee/*`)
- Personal dashboard with compensation summary
- Benefits utilization tracking
- Marketplace access and perk redemption
- Document generation (salary certificates, NOC letters)
- Leave management
- Government service links (UAE-specific)

### Employer Portal (`/employer/*`)
- Executive analytics dashboard
- Budget management and spend tracking
- Zombie spend identification
- Employee segment analysis
- Claims processing
- Policy management
- Integration management

### Admin Portal (`/admin/*`)
- Platform-wide analytics (multi-tenant)
- Regional benchmarks (GCC)
- Organization management
- Market intelligence
- UI configuration per organization
- Data migration tools

### Vendor Portal (`/vendor/*`)
- Offer management
- Transaction tracking
- Earnings analytics
- Performance metrics

## 1.3 Key Features
- Multi-language support (English/Arabic with RTL)
- Dark/Light theme
- Role-based access control
- Real-time data sync
- Privacy controls (salary masking)
- Responsive design (mobile-first)
- Animated charts and visualizations

---

# 2. TECHNOLOGY STACK

## 2.1 Frontend
```
Framework:        React 18.3.1
Build Tool:       Vite
Language:         TypeScript
Styling:          Tailwind CSS + CSS Variables
UI Components:    shadcn/ui (Radix UI primitives)
State:            React Context + TanStack Query
Routing:          React Router DOM 6.30.3
Animations:       Framer Motion 12.25.0
Charts:           Recharts 2.15.4
Forms:            React Hook Form + Zod
Icons:            Lucide React
```

## 2.2 Backend (Lovable Cloud / Supabase)
```
Database:         PostgreSQL 14
Auth:             Supabase Auth (email, MFA)
Storage:          Supabase Storage
Edge Functions:   Deno-based serverless functions
Real-time:        Supabase Realtime subscriptions
```

## 2.3 Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.90.1",
  "@tanstack/react-query": "^5.83.0",
  "framer-motion": "^12.25.0",
  "recharts": "^2.15.4",
  "react-hook-form": "^7.61.1",
  "zod": "^3.25.76",
  "date-fns": "^3.6.0",
  "xlsx": "^0.18.5"
}
```

---

# 3. APPLICATION ARCHITECTURE

## 3.1 File Structure
```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
├── index.css                  # Global styles + design tokens
│
├── components/
│   ├── ui/                    # shadcn/ui components (50+ components)
│   ├── charts/                # Custom animated chart components
│   ├── dashboard/             # Dashboard-specific components
│   ├── employee/              # Employee portal components
│   ├── layout/                # Layout components (sidebars, layouts)
│   ├── security/              # Security-related components
│   ├── auth/                  # Authentication components
│   ├── admin/                 # Admin portal components
│   └── notifications/         # Notification components
│
├── pages/
│   ├── employee/              # 18 employee pages
│   ├── employer/              # 10 employer pages
│   ├── admin/                 # 10 admin pages
│   ├── vendor/                # 8 vendor pages
│   ├── Auth.tsx               # Authentication page
│   ├── Index.tsx              # Landing/redirect page
│   └── NotFound.tsx           # 404 page
│
├── contexts/
│   ├── AuthContext.tsx        # Authentication state
│   ├── LanguageContext.tsx    # i18n + translations
│   ├── ProfileContext.tsx     # User profile data
│   └── UIVisibilityContext.tsx # UI element visibility control
│
├── hooks/
│   ├── useSupabaseData.ts     # Data fetching hooks
│   ├── useAuditLog.ts         # Audit logging
│   ├── useSessionSecurity.ts  # Session management
│   └── use-mobile.tsx         # Mobile detection
│
├── lib/
│   ├── utils.ts               # Utility functions (cn, etc.)
│   ├── constants.ts           # Application constants
│   ├── benefitCategories.ts   # Benefit type definitions
│   ├── chartColors.ts         # Chart color palette
│   └── colorSystem.ts         # Color utilities
│
└── integrations/
    └── supabase/
        ├── client.ts          # Supabase client instance
        └── types.ts           # Auto-generated DB types
```

## 3.2 Context Providers Hierarchy
```tsx
<QueryClientProvider>
  <BrowserRouter>
    <LanguageProvider>           // i18n + RTL
      <AuthProvider>             // Authentication
        <ProfileProvider>        // User profile
          <PrivacyProvider>      // Salary masking
            <UIVisibilityProvider>  // Element visibility
              <SecurityProvider>    // Session security
                <TooltipProvider>
                  <AppRoutes />
                </TooltipProvider>
              </SecurityProvider>
            </UIVisibilityProvider>
          </PrivacyProvider>
        </ProfileProvider>
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
</QueryClientProvider>
```

---

# 4. ROUTING & NAVIGATION

## 4.1 Route Structure

### Public Routes
```
/           → Landing page / Role-based redirect
/auth       → Login / Register / Password reset
```

### Employee Routes (Protected, role: 'employee')
```
/employee                    → Dashboard (compensation summary)
/employee/benefits           → All benefits overview
/employee/benefits-analysis  → Benefits utilization analysis
/employee/housing            → Housing allowance details
/employee/schooling          → Education benefits
/employee/health             → Health insurance
/employee/transport          → Transport allowance
/employee/wellbeing          → Wellness programs
/employee/financial          → Financial planning
/employee/bonus              → Annual bonus
/employee/equity             → Stock/equity benefits
/employee/learning           → Learning & development
/employee/leave              → Leave management
/employee/marketplace        → Perks marketplace
/employee/documents          → Document generation
/employee/gov-connect        → UAE government portals
/employee/profile            → Profile management
/employee/onboarding         → Onboarding guide
/employee/knowledge          → Knowledge hub
```

### Employer Routes (Protected, role: 'employer')
```
/employer                    → Executive dashboard
/employer/spend              → Spend analytics
/employer/zombie             → Zombie spend analysis
/employer/segments           → Employee segments
/employer/claims             → Claims management
/employer/marketplace        → Marketplace analytics
/employer/policies           → Policy management
/employer/integrations       → Integration management
/employer/knowledge          → Knowledge center
/employer/recommendations    → AI recommendations
```

### Admin Routes (Protected, role: 'admin')
```
/admin                       → Platform command center
/admin/benchmarks            → Regional benchmarks
/admin/market                → Market intelligence
/admin/spending              → Spending patterns
/admin/reports               → Saved reports
/admin/organizations         → Organization management
/admin/organizations/:id/settings → Org-specific settings
/admin/settings              → Platform settings
/admin/ui-config             → UI visibility config
/admin/data-migration        → Data migration tools
```

### Vendor Routes (Protected, role: 'vendor')
```
/vendor                      → Vendor dashboard
/vendor/offers               → Offer management
/vendor/offers/new           → Create new offer
/vendor/analytics            → Performance analytics
/vendor/transactions         → Transaction history
/vendor/earnings             → Earnings & payouts
/vendor/profile              → Vendor profile
/vendor/settings             → Vendor settings
```

## 4.2 Protected Route Implementation
```tsx
function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleRedirects[role]} />;
  }
  
  return children;
}
```

---

# 5. DATABASE SCHEMA

## 5.1 Core Tables

### User & Organization
```sql
-- Organizations (multi-tenant)
organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  welcome_message TEXT,
  footer_text TEXT,
  settings JSONB,
  survey_start_month INTEGER,
  survey_end_month INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- User Profiles (linked to auth.users)
profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  organization_id UUID REFERENCES organizations,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  grade TEXT,
  monthly_salary NUMERIC,
  employment_date DATE,
  date_of_birth DATE,
  nationality TEXT,
  marital_status TEXT,
  home_location TEXT,
  work_location TEXT,
  emirates_id TEXT,
  passport_number TEXT,
  blood_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  spouse_name TEXT,
  spouse_employer TEXT,
  manager_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT,
  interests TEXT[],
  cars TEXT[],
  pets TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- User Roles
user_roles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ
)
-- ENUM: user_role = 'admin' | 'vendor' | 'employer' | 'employee'
```

### Benefits System
```sql
-- Benefit Definitions
benefits (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  benefit_type benefit_type NOT NULL,
  life_area life_area NOT NULL,
  annual_value NUMERIC,
  icon TEXT,
  policy_bullets TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)
-- ENUM: benefit_type = 'cash_allowances' | 'health_protection' | 
--       'time_off_flex' | 'growth_career' | 'wealth_ownership' | 'wellbeing'
-- ENUM: life_area = 'home_living' | 'family_parenting' | 'health' | 
--       'money' | 'career' | 'lifestyle' | 'mobility'

-- Employee Benefit Entitlements
benefit_entitlements (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  benefit_id UUID REFERENCES benefits,
  organization_id UUID REFERENCES organizations,
  annual_allowance NUMERIC NOT NULL,
  utilized_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Grade-based Eligibility
benefit_grade_eligibility (
  id UUID PRIMARY KEY,
  benefit_id UUID REFERENCES benefits,
  grade TEXT NOT NULL,
  is_eligible BOOLEAN DEFAULT true,
  annual_allowance NUMERIC,
  coverage_percent NUMERIC,
  max_dependents INTEGER,
  dependent_coverage TEXT,
  max_claim_per_transaction NUMERIC,
  waiting_period_days INTEGER,
  requires_documentation BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Benefit Required Documents
benefit_required_documents (
  id UUID PRIMARY KEY,
  benefit_id UUID REFERENCES benefits,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  is_required BOOLEAN DEFAULT true,
  required_for TEXT,
  conditions JSONB,
  created_at TIMESTAMPTZ
)

-- Benefit Policy Versions
benefit_policy_versions (
  id UUID PRIMARY KEY,
  benefit_id UUID REFERENCES benefits,
  organization_id UUID REFERENCES organizations,
  version INTEGER DEFAULT 1,
  policy_text TEXT,
  attachment_url TEXT,
  effective_from DATE NOT NULL,
  effective_until DATE,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Requests & Claims
```sql
-- Request System
requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations,
  request_type request_type NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  status request_status DEFAULT 'pending',
  priority TEXT,
  assigned_to UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  sla_due_at TIMESTAMPTZ,
  last_status_change_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
-- ENUM: request_type = 'claim' | 'inquiry' | 'feedback' | 'document_request'
-- ENUM: request_status = 'pending' | 'approved' | 'rejected' | 'in_review'

-- Request Attachments
request_attachments (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  document_type TEXT,
  is_required BOOLEAN,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ
)

-- Request Event Log (status changes)
request_events (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests,
  actor_user_id UUID NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  notes_internal TEXT,
  notes_employee_visible TEXT,
  created_at TIMESTAMPTZ
)
```

### Leave Management
```sql
-- Leave Balances
leave_balances (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations,
  leave_type TEXT NOT NULL,
  year INTEGER,
  total_days NUMERIC NOT NULL,
  used_days NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ
)
```

### Dependents & Family
```sql
-- Children
children (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  school_name TEXT,
  grade TEXT,
  created_at TIMESTAMPTZ
)
```

### Marketplace
```sql
-- Marketplace Offers
marketplace_offers (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  merchant TEXT NOT NULL,
  discount_percent NUMERIC,
  terms TEXT,
  image_url TEXT,
  tags TEXT[],
  rating NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)

-- Perk Activations (redemptions)
perk_activations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_id UUID REFERENCES marketplace_offers,
  organization_id UUID REFERENCES organizations,
  activated_at TIMESTAMPTZ
)

-- Vendors
vendors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)
```

### Housing & Education
```sql
-- Housing Areas (Dubai/UAE)
housing_areas (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  avg_rent_studio NUMERIC,
  avg_rent_1br NUMERIC,
  avg_rent_2br NUMERIC,
  avg_rent_3br NUMERIC,
  commute_to_difc_mins INTEGER,
  created_at TIMESTAMPTZ
)

-- Housing Listings
housing_listings (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  annual_rent NUMERIC NOT NULL,
  amenities TEXT[],
  image_url TEXT,
  rating NUMERIC,
  bayut_url TEXT,
  dubizzle_url TEXT,
  property_finder_url TEXT,
  created_at TIMESTAMPTZ
)

-- Schools
schools (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  curriculum TEXT NOT NULL,
  location TEXT NOT NULL,
  grade_range TEXT NOT NULL,
  annual_fee NUMERIC NOT NULL,
  rating NUMERIC,
  facilities TEXT[],
  website_url TEXT,
  created_at TIMESTAMPTZ
)
```

### Healthcare
```sql
-- Health Providers
health_providers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  specialty TEXT,
  area TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  rating NUMERIC,
  in_network BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)
```

### Per Diem System
```sql
-- Per Diem Rates
per_diem_rates (
  id UUID PRIMARY KEY,
  grade TEXT NOT NULL,
  region TEXT NOT NULL,
  destination_type TEXT NOT NULL,
  country TEXT,
  city TEXT,
  currency TEXT DEFAULT 'AED',
  daily_meals NUMERIC DEFAULT 0,
  daily_accommodation NUMERIC DEFAULT 0,
  daily_transport NUMERIC DEFAULT 0,
  daily_incidentals NUMERIC DEFAULT 0,
  daily_total NUMERIC GENERATED,
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Per Diem Claims
per_diem_claims (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations,
  rate_id UUID REFERENCES per_diem_rates,
  trip_purpose TEXT NOT NULL,
  trip_reference TEXT,
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  destination_type TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  number_of_days INTEGER GENERATED,
  currency TEXT DEFAULT 'AED',
  meals_amount NUMERIC DEFAULT 0,
  accommodation_amount NUMERIC DEFAULT 0,
  transport_amount NUMERIC DEFAULT 0,
  incidentals_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC GENERATED,
  receipts_attached BOOLEAN,
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Analytics & Events
```sql
-- Utilization Events
utilization_events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations,
  benefit_id UUID REFERENCES benefits,
  event_type TEXT NOT NULL,
  amount NUMERIC,
  description TEXT,
  created_at TIMESTAMPTZ
)

-- Platform Analytics (aggregate)
platform_analytics (
  id UUID PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  region TEXT,
  industry TEXT,
  company_size TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)

-- Employee Satisfaction Ratings
employee_satisfaction_ratings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT DEFAULT 'overall',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  period_year INTEGER,
  period_month INTEGER,
  created_at TIMESTAMPTZ
)
```

### Security & Audit
```sql
-- Audit Logs
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ
)

-- User Sessions
user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token_hash TEXT NOT NULL,
  device_info JSONB,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ
)

-- MFA Settings
mfa_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  mfa_enabled BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Account Lockouts
account_lockouts (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ NOT NULL,
  notification_sent BOOLEAN DEFAULT false
)

-- Login Attempts
login_attempts (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT false,
  attempt_time TIMESTAMPTZ
)

-- Data Access Requests (GDPR)
data_access_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL, -- 'export' | 'delete' | 'access_log'
  status TEXT DEFAULT 'pending',
  notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

### Admin & Configuration
```sql
-- Admin Saved Reports
admin_saved_reports (
  id UUID PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  filters JSONB,
  data_snapshot JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- UI Visibility Settings
ui_visibility_settings (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations,
  role TEXT NOT NULL,
  page_key TEXT NOT NULL,
  element_key TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  updated_by UUID,
  updated_at TIMESTAMPTZ
)

-- Metric Definitions
metric_definitions (
  key TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  definition_en TEXT NOT NULL,
  definition_ar TEXT,
  formula_en TEXT NOT NULL,
  formula_ar TEXT,
  source TEXT NOT NULL,
  owner_role TEXT DEFAULT 'employer',
  min_sample_size INTEGER DEFAULT 10,
  confidence_rules JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Employer Actions (to-do items)
employer_actions (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations,
  title TEXT NOT NULL,
  description TEXT,
  source_insight TEXT,
  metric_keys TEXT[],
  expected_impact JSONB,
  priority TEXT,
  status TEXT DEFAULT 'open',
  owner_user_id UUID,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Integration Runs
integration_runs (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations,
  connector_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  records_synced INTEGER,
  records_failed INTEGER,
  coverage_percent NUMERIC,
  error_summary TEXT,
  metadata JSONB,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Organization Budgets
org_budgets (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations,
  fiscal_year INTEGER NOT NULL,
  annual_budget NUMERIC DEFAULT 0,
  budget_allocated JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Organization Policy Settings
org_policy_settings (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations UNIQUE,
  payroll_cycle TEXT,
  currency TEXT,
  timezone TEXT,
  fiscal_year_start_month INTEGER,
  leave_accrual_rules JSONB,
  gratuity_calculation_rules JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

# 6. AUTHENTICATION & SECURITY

## 6.1 Auth Flow
```typescript
// AuthContext provides:
interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;  // 'employee' | 'employer' | 'admin' | 'vendor'
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<{ error: Error | null }>;
}
```

## 6.2 Security Features
- **Session Management**: Automatic timeout with activity tracking
- **MFA**: TOTP-based two-factor authentication
- **Audit Logging**: All sensitive actions logged
- **Account Lockout**: After failed login attempts
- **Rate Limiting**: Via edge functions
- **HTTPS Enforcement**: Warning for non-HTTPS connections
- **Password Strength**: Client-side validation

## 6.3 RLS Policies
All tables have Row Level Security enabled with policies based on:
- `auth.uid()` for user-specific data
- Organization membership for org-scoped data
- Role-based access for admin/employer functions

---

# 7. DESIGN SYSTEM

## 7.1 Color Tokens (CSS Variables)

### Light Mode
```css
:root {
  /* Core */
  --background: 220 20% 97%;      /* Light gray */
  --foreground: 222 47% 11%;       /* Navy */
  --card: 0 0% 100%;               /* White */
  
  /* Primary - Navy */
  --primary: 222 47% 11%;
  --primary-foreground: 210 40% 98%;
  
  /* Accent - Teal */
  --accent: 174 60% 45%;
  --accent-foreground: 0 0% 100%;
  
  /* Semantic */
  --success: 160 84% 39%;          /* Green */
  --warning: 38 92% 50%;           /* Amber */
  --destructive: 0 84% 60%;        /* Red */
  --info: 199 89% 48%;             /* Blue */
  
  /* Muted */
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  
  /* Charts (8 colors) */
  --chart-1: 174 60% 45%;          /* Teal */
  --chart-2: 199 89% 48%;          /* Blue */
  --chart-3: 262 52% 55%;          /* Purple */
  --chart-4: 38 92% 50%;           /* Amber */
  --chart-5: 340 65% 55%;          /* Pink */
  --chart-6: 160 84% 39%;          /* Green */
  --chart-7: 24 75% 55%;           /* Orange */
  --chart-8: 280 55% 55%;          /* Violet */
  
  /* Sidebar */
  --sidebar-background: 222 47% 8%;
  --sidebar-foreground: 220 14% 96%;
  --sidebar-primary: 174 60% 45%;
  --sidebar-accent: 222 47% 14%;
}
```

### Dark Mode
```css
.dark {
  --background: 222 47% 6%;
  --foreground: 220 14% 96%;
  --card: 222 47% 10%;
  --primary: 174 60% 45%;
  --accent: 174 60% 45%;
  /* ... adjusted values for dark mode */
}
```

## 7.2 Typography
```css
/* Body text */
font-family: 'Inter', system-ui, sans-serif;

/* Headings */
font-family: 'DM Sans', system-ui, sans-serif;

/* Arabic RTL */
font-family: 'Noto Sans Arabic', 'Inter', system-ui, sans-serif;
```

## 7.3 Component Classes
```css
/* Cards */
.metric-card    /* Stats display card */
.benefit-card   /* Benefit card with hover state */
.executive-card /* Premium gradient card */
.glass-card     /* Glassmorphism effect */

/* Badges */
.tag-primary    /* Accent color badge */
.tag-cash       /* Green - cash benefits */
.tag-health     /* Rose - health benefits */
.tag-time       /* Blue - time off */
.tag-growth     /* Purple - career growth */
.tag-wealth     /* Amber - wealth/equity */
.tag-wellbeing  /* Cyan - wellness */

/* Status indicators */
.within-allowance  /* Green text for budget OK */
.topup-needed      /* Amber text for over budget */

/* Insights */
.insight-badge-success
.insight-badge-warning
.insight-badge-info
```

## 7.4 Gradients
```css
--gradient-primary: linear-gradient(135deg, navy 0%, navy-light 100%);
--gradient-accent: linear-gradient(135deg, teal 0%, teal-light 100%);
--gradient-hero: linear-gradient(135deg, navy-dark 0%, navy 50%, teal-dark 100%);
```

---

# 8. COMPONENT LIBRARY

## 8.1 UI Components (shadcn/ui based)
```
Accordion, AlertDialog, Alert, AspectRatio, Avatar,
Badge, Breadcrumb, Button, Calendar, Card, Carousel,
Chart, Checkbox, Collapsible, Command, ContextMenu,
Dialog, Drawer, DropdownMenu, Form, HoverCard, Input,
InputOTP, Label, Menubar, NavigationMenu, Pagination,
Popover, Progress, RadioGroup, ResizablePanels, ScrollArea,
Select, Separator, Sheet, Sidebar, Skeleton, Slider,
Sonner (toasts), Switch, Table, Tabs, Textarea, Toast,
Toggle, ToggleGroup, Tooltip
```

## 8.2 Custom Components

### Charts (`src/components/charts/`)
```typescript
// Animated charts with Framer Motion
AnimatedBarChart      // Vertical/horizontal bar charts
AnimatedLineChart     // Line charts with dual axes
AnimatedDonutChart    // Donut/pie charts
AnimatedRadarChart    // Spider/radar charts
StackedAreaChart      // Area charts with stacking
ProgressBarList       // List of progress indicators
ChartContainer        // Wrapper with loading states
```

### Dashboard Components (`src/components/dashboard/`)
```typescript
BenchmarkComparison        // Industry comparison
BenefitsDrillDownSheet     // Detailed benefit breakdown
CuratedPerks               // Featured perks display
DateRangeFilter            // Date range picker
DrillDownModal             // Data drill-down modal
EmployerBenefitRecommendations  // AI recommendations
PersonalizedRecommendations     // User-specific tips
SmartInsights              // AI-generated insights
TrendIndicator             // Up/down trend badges
```

### Employee Components (`src/components/employee/`)
```typescript
BenefitActionButtons       // Claim/view/bookmark actions
ClaimsDirectory            // Claims list with filters
CompensationBreakdownModal // Detailed comp breakdown
PerDiemWidget              // Travel per diem calculator
RequestClaimWidget         // Claim submission form
SatisfactionSurvey         // Rating widget
SubmitClaimButton          // Quick claim button
```

### Layout Components (`src/components/layout/`)
```typescript
AdminLayout     // Admin portal wrapper
AdminSidebar    // Admin navigation
EmployeeLayout  // Employee portal wrapper
EmployeeSidebar // Employee navigation
EmployerLayout  // Employer portal wrapper
EmployerSidebar // Employer navigation
VendorLayout    // Vendor portal wrapper
VendorSidebar   // Vendor navigation
```

### Security Components (`src/components/security/`)
```typescript
SecurityProvider       // Security context wrapper
SessionManager         // Active sessions management
DataPrivacySettings    // GDPR/privacy controls
```

### Auth Components (`src/components/auth/`)
```typescript
MFAChallenge               // TOTP verification
MFAEnrollment              // MFA setup flow
PasswordStrengthIndicator  // Password validation
```

---

# 9. STATE MANAGEMENT

## 9.1 React Context Usage

### AuthContext
- User authentication state
- Session management
- Role-based access

### LanguageContext
```typescript
interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  direction: 'ltr' | 'rtl';
  t: (key: string) => string;  // Translation function
}
```

### ProfileContext
- User profile data (local state)
- Family/dependent information
- User preferences

### UIVisibilityContext
```typescript
// Control which UI elements are visible per role/page
interface UIVisibilityContextType {
  isElementVisible: (role: string, page: string, element: string) => boolean;
  setElementVisibility: (role: string, page: string, element: string, visible: boolean) => void;
  getVisibilitySettings: () => VisibilitySettings;
  loading: boolean;
}
```

### PrivacyContext
- Salary/sensitive data masking
- Privacy toggle state

## 9.2 TanStack Query (React Query)

### Data Fetching Hooks (`src/hooks/useSupabaseData.ts`)
```typescript
// User-specific data
useProfile()              // User profile
useBenefits()             // Available benefits
useBenefitEntitlements()  // User's entitlements
useHousingAreas()         // Housing data
useHousingListings()      // Property listings
useSchools()              // School data
useHealthProviders()      // Medical providers
useMarketplaceOffers()    // Perks/offers
useLeaveBalances()        // Leave data
useRequests()             // Claims/requests
useChildren()             // Dependents
useUtilizationEvents()    // Usage events
usePerkActivations()      // Redeemed perks

// Employer-specific data
useAllProfiles()          // All employees
useAllBenefitEntitlements()
useAllUtilizationEvents()
useAllPerkActivations()
```

---

# 10. FEATURE MODULES

## 10.1 Employee Dashboard
- **Compensation Summary**: Monthly/annual salary, guaranteed benefits, total package
- **Benefits Grid**: 8 benefit cards with utilization tracking
- **Privacy Toggle**: Hide/show salary figures
- **Quick Actions**: View all benefits, submit claims

## 10.2 Benefits System
- **Benefit Categories**: Cash, Health, Time Off, Growth, Wealth, Wellbeing
- **Life Areas**: Home, Family, Health, Money, Career, Lifestyle, Mobility
- **Utilization Tracking**: Used vs. allowance amounts
- **Status Indicators**: Fully utilized, in progress, opportunity

## 10.3 Marketplace
- **Categories**: 9 categories (Food, Fitness, Learning, etc.)
- **Offer Types**: Discounts, BOGO, free trials
- **Activation Flow**: One-click redemption
- **Vendor Commission**: 10% platform fee

## 10.4 Document Generation
- **Document Types**: 10 types (salary certificates, NOC, etc.)
- **Variants**: Bank, embassy, landlord versions
- **Audit Trail**: Generation logged in document_audit table

## 10.5 Leave Management
- **Leave Types**: Annual, sick, personal, maternity, paternity, compassionate
- **Balances**: Total vs. used days
- **Request Flow**: Submit → Review → Approve/Reject

## 10.6 Per Diem System
- **Rate Tables**: By grade, region, destination type
- **Components**: Meals, accommodation, transport, incidentals
- **Claim Workflow**: Draft → Submitted → Reviewed → Paid

## 10.7 Employer Analytics
- **KPIs**: Employees, budget, utilization, zombie spend
- **Charts**: Trend lines, spend breakdown, segment radar
- **Insights**: AI-generated recommendations
- **Benchmarks**: Industry and regional comparisons

## 10.8 Admin Platform
- **Multi-tenant**: Organization management
- **Regional Data**: GCC benchmarks (UAE, Saudi, Qatar, Kuwait)
- **Market Intelligence**: High-intent user segments
- **Vendor Performance**: Transaction metrics

---

# 11. INTERNATIONALIZATION

## 11.1 Supported Languages
- **English (en)**: LTR, default
- **Arabic (ar)**: RTL, full translation

## 11.2 Translation Structure
```typescript
// LanguageContext translations object
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.benefits': 'Benefits',
    // ... 200+ keys
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.benefits': 'المزايا',
    // ... Arabic translations
  }
};
```

## 11.3 RTL Support
```css
/* Automatic RTL adaptations */
html.rtl {
  direction: rtl;
  font-family: 'Noto Sans Arabic', system-ui;
}

html.rtl .nav-item { flex-direction: row-reverse; }
html.rtl .chevron-end { transform: scaleX(-1); }
html.rtl .progress-bar { direction: rtl; }
```

---

# 12. CHARTS & VISUALIZATIONS

## 12.1 Chart Components

### AnimatedBarChart
```typescript
<AnimatedBarChart
  data={[{ name: 'Q1', value: 100 }, ...]}
  height={300}
  showSecondary={false}
  formatValue={(v) => `${v}%`}
/>
```

### AnimatedLineChart
```typescript
<AnimatedLineChart
  data={[{ name: 'Jan', value: 100, secondaryValue: 50 }, ...]}
  showSecondary={true}
  primaryLabel="Revenue"
  secondaryLabel="Costs"
  height={300}
/>
```

### AnimatedDonutChart
```typescript
<AnimatedDonutChart
  data={[{ name: 'Health', value: 35, color: 'hsl(...)' }, ...]}
  innerRadius={50}
  outerRadius={80}
  height={200}
/>
```

### AnimatedRadarChart
```typescript
<AnimatedRadarChart
  data={[{ subject: 'Housing', value: 92, fullMark: 100 }, ...]}
  height={300}
/>
```

### StackedAreaChart
```typescript
<StackedAreaChart
  data={monthlyData}
  stacks={[
    { key: 'cash', label: 'Cash', color: 'hsl(...)' },
    { key: 'health', label: 'Health', color: 'hsl(...)' }
  ]}
  height={300}
/>
```

## 12.2 Chart Color Palette
```typescript
const CHART_COLORS = [
  'hsl(174 60% 45%)',  // Teal
  'hsl(199 89% 48%)',  // Blue
  'hsl(262 52% 55%)',  // Purple
  'hsl(38 92% 50%)',   // Amber
  'hsl(340 65% 55%)',  // Pink
  'hsl(160 84% 39%)',  // Green
  'hsl(24 75% 55%)',   // Orange
  'hsl(280 55% 55%)',  // Violet
];
```

---

# 13. API INTEGRATION

## 13.1 Supabase Client
```typescript
import { supabase } from '@/integrations/supabase/client';

// Query example
const { data, error } = await supabase
  .from('benefits')
  .select('*')
  .eq('is_active', true);

// Insert example
const { error } = await supabase
  .from('requests')
  .insert({ user_id, category, subject });

// Real-time subscription
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => handleNotification(payload)
  )
  .subscribe();
```

## 13.2 React Query Integration
```typescript
export function useBenefits() {
  return useQuery({
    queryKey: ['benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });
}
```

---

# 14. EDGE FUNCTIONS

## 14.1 Available Functions

### rate-limit-auth
- Rate limits authentication attempts
- Prevents brute force attacks
- Tracks IP addresses

### account-lockout
- Locks accounts after failed attempts
- Configurable lockout duration
- Sends notification emails

## 14.2 Edge Function Structure
```typescript
// supabase/functions/function-name/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Function logic here
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

# 15. PERFORMANCE & OPTIMIZATION

## 15.1 Code Splitting
- Route-based lazy loading with React.lazy()
- Dynamic imports for heavy components

## 15.2 Caching Strategy
- TanStack Query with stale-while-revalidate
- Configurable cache times per query

## 15.3 Image Optimization
- Lazy loading for images
- Responsive image sizing

## 15.4 Bundle Optimization
- Tree shaking enabled
- Vite's automatic code splitting
- Minimal external dependencies

---

# APPENDIX A: CONSTANTS & ENUMS

## Benefit Types
```typescript
type BenefitType = 
  | 'cash_allowances'
  | 'health_protection'
  | 'time_off_flex'
  | 'growth_career'
  | 'wealth_ownership'
  | 'wellbeing';
```

## Life Areas
```typescript
type LifeArea = 
  | 'home_living'
  | 'family_parenting'
  | 'health'
  | 'money'
  | 'career'
  | 'lifestyle'
  | 'mobility';
```

## User Roles
```typescript
type UserRole = 'admin' | 'vendor' | 'employer' | 'employee';
```

## Request Types
```typescript
type RequestType = 'claim' | 'inquiry' | 'feedback' | 'document_request';
```

## Request Status
```typescript
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_review';
```

## Marketplace Categories
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
  'Travel & Experiences'
];
```

## Document Types
```typescript
const DOCUMENT_TYPES = [
  'salary_certificate_bank',
  'salary_certificate_embassy',
  'salary_certificate_landlord',
  'employment_letter',
  'noc_letter',
  'leave_balance',
  'insurance_confirmation',
  'dependent_letter',
  'experience_letter',
  'service_letter'
];
```

## Leave Types
```typescript
const LEAVE_TYPES = [
  { id: 'annual', name: 'Annual Leave' },
  { id: 'sick', name: 'Sick Leave' },
  { id: 'personal', name: 'Personal Leave' },
  { id: 'maternity', name: 'Maternity Leave' },
  { id: 'paternity', name: 'Paternity Leave' },
  { id: 'compassionate', name: 'Compassionate Leave' }
];
```

## Government Services (UAE)
```typescript
const GOV_CONNECT_CATEGORIES = [
  { id: 'identity', name: 'Identity & Immigration', links: ['UAE Pass', 'ICP Portal'] },
  { id: 'employment', name: 'Employment & HR', links: ['MOHRE', 'FAHR'] },
  { id: 'local', name: 'Local Services', links: ['TAMM', 'Dubai Police', 'DEWA'] },
  { id: 'health', name: 'Health Authorities', links: ['DHA', 'DOH'] },
  { id: 'telecom', name: 'Telecom Services', links: ['Etisalat', 'du'] }
];
```

---

# APPENDIX B: KEY METRICS

## Employee Dashboard Metrics
- Monthly Salary
- Annual Salary
- Guaranteed Benefits Value
- Benefits % of Total Package
- Total Compensation
- Leave Balance

## Employer Dashboard Metrics
- Total Employees
- Annual Budget
- Budget Utilization %
- Utilization Rate
- Zombie Spend
- Employee Satisfaction Score
- Retention Rate
- Pending Claims
- Average Processing Days
- ROI Indicator

## Admin Dashboard Metrics
- Total Organizations
- Active Employees (platform-wide)
- Platform GMV
- Active Vendors
- Regional Benchmarks
- Industry Distribution

## Vendor Dashboard Metrics
- Active Offers
- Total Views
- Redemptions
- Total Earnings
- Conversion Rate
- Pending Payout

---

# APPENDIX C: UI VISIBILITY CONFIGURATION

## Configurable Elements by Portal

### Employee Dashboard
- `compensation_summary`
- `your_benefits`
- `satisfaction_survey`

### Employer Dashboard
- `kpi_cards`
- `secondary_kpi`
- `executive_insights`
- `utilization_trend`
- `spend_by_type`
- `segment_comparison`
- `cumulative_spend`
- `top_benefits`
- `zombie_spend`
- `recommendations`

### Vendor Dashboard
- `metrics_cards`
- `offers_tab`
- `analytics_tab`
- `transactions_tab`
- `earnings_tab`

---

*Documentation Version: 4.0*
*Last Updated: January 2026*
*Platform: Total Rewards Management System*
