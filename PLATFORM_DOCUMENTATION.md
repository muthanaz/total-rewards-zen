# bnft. Platform - Complete Technical Documentation

> **Total Rewards & Benefits Management Platform**
> A comprehensive multi-tenant SaaS platform for employee benefits management, employer analytics, vendor marketplace, and platform administration.

---

## 🏗️ Platform Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack React Query + React Context
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

### Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui base components (50+ components)
│   ├── charts/          # Custom chart components
│   ├── dashboard/       # Shared dashboard widgets
│   ├── employee/        # Employee-specific components
│   ├── employer/        # Employer-specific components
│   ├── admin/           # Admin-specific components
│   ├── layout/          # Layout components (sidebars, layouts)
│   ├── auth/            # Authentication components
│   ├── security/        # Security components
│   └── notifications/   # Notification system
├── pages/
│   ├── employee/        # 21 employee pages
│   ├── employer/        # 15 employer pages
│   ├── admin/           # 13 admin pages
│   └── vendor/          # 10 vendor pages
├── contexts/            # React contexts (Auth, Language, Profile, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and constants
└── integrations/        # Supabase client and types
```

---

## 👥 User Roles & Portals

### 1. Employee Portal (`/employee`)
Personal benefits management and utilization tracking.

**Pages:**
| Route | Description |
|-------|-------------|
| `/employee` | Dashboard with Benefits Maximizer, Deadlines, Package Snapshot |
| `/employee/benefits-analysis` | Detailed compensation breakdown |
| `/employee/benefits` | All benefits overview |
| `/employee/housing` | Housing allowance with rental listings |
| `/employee/schooling` | Education benefits with school directory |
| `/employee/health` | Health insurance with provider directory |
| `/employee/transport` | Transport allowances (fuel, car, flights) |
| `/employee/wellbeing` | Wellbeing programs and gym memberships |
| `/employee/financial` | Savings plan calculator |
| `/employee/gratuity` | End-of-service gratuity calculator |
| `/employee/bonus` | Annual bonus tracking |
| `/employee/equity` | Stock options and equity |
| `/employee/learning` | Learning & development budget |
| `/employee/leave` | Leave management and requests |
| `/employee/marketplace` | Employee perks and discounts |
| `/employee/documents` | Document requests (salary certificates, etc.) |
| `/employee/gov-connect` | UAE government portal links |
| `/employee/profile` | Personal profile management |
| `/employee/onboarding` | New employee onboarding |
| `/employee/knowledge` | Help center and FAQs |

**Key Features:**
- Benefits Maximizer with prioritized actions
- Unused value tracking with deadlines
- 4-tab benefit pages (Overview, Use It, Insights, History)
- Satisfaction surveys
- Arabic/English with full RTL support

### 2. Employer Portal (`/employer`)
HR/Benefits administration and analytics.

**Pages:**
| Route | Description |
|-------|-------------|
| `/employer` | Executive dashboard with KPIs and data quality |
| `/employer/spend` | Benefits spend analysis |
| `/employer/zombie` | Unrealized Benefits Value (recoverable vs structural) |
| `/employer/segments` | Employee segmentation |
| `/employer/claims` | Claims queue with bulk actions |
| `/employer/marketplace` | Marketplace analytics |
| `/employer/policies` | Policy Hub with versioning and acknowledgements |
| `/employer/integrations` | Third-party integrations |
| `/employer/recommendations` | AI-powered recommendations |
| `/employer/forecasting` | Budget forecasting |
| `/employer/satisfaction` | Employee satisfaction pulse |
| `/employer/compliance` | Compliance audit |
| `/employer/knowledge` | Knowledge center |
| `/employer/metrics` | Metrics dictionary |
| `/employer/actions` | Action plan management |

**Key Features:**
- Strategic vs Operational view modes
- Data quality indicators with confidence levels
- Executive pulse cards (Effective Spend, Budget, Waste, Satisfaction)
- Benchmark comparisons
- Year-end projections
- Money flow visualization

### 3. Admin Portal (`/admin`)
Platform-wide administration.

**Pages:**
| Route | Description |
|-------|-------------|
| `/admin` | Platform dashboard |
| `/admin/benchmarks` | Industry benchmarks |
| `/admin/market` | Market intelligence |
| `/admin/spending` | Cross-org spending patterns |
| `/admin/reports` | Saved reports |
| `/admin/organizations` | Organization management |
| `/admin/organizations/:id/settings` | Org-specific settings |
| `/admin/settings` | Platform settings |
| `/admin/ui-config` | UI visibility configuration |
| `/admin/data-migration` | Excel data import |
| `/admin/tenant-test` | Tenant isolation testing |
| `/admin/data-quality` | Data quality checks |
| `/admin/benchmark-methodology` | Benchmark methodology docs |

### 4. Vendor Portal (`/vendor`)
Marketplace vendor management.

**Pages:**
| Route | Description |
|-------|-------------|
| `/vendor` | Vendor dashboard |
| `/vendor/offers` | Offer management |
| `/vendor/offers/new` | Create new offer |
| `/vendor/offer-quality` | Offer quality scores |
| `/vendor/analytics` | Performance analytics |
| `/vendor/transactions` | Transaction history |
| `/vendor/earnings` | Earnings overview |
| `/vendor/payouts` | Payout requests |
| `/vendor/profile` | Vendor profile |
| `/vendor/settings` | Vendor settings |

---

## 🎨 Design System

### Color Palette
```css
/* Primary - Navy Blue */
--primary: 222 47% 11%;

/* Accent - Teal */
--accent: 174 60% 45%;

/* Semantic Colors */
--success: 160 84% 39%;     /* Green */
--warning: 38 92% 50%;      /* Amber */
--destructive: 0 84% 60%;   /* Red */
--info: 199 89% 48%;        /* Blue */
```

### Typography
- **Display Font**: DM Sans (headings)
- **Body Font**: Inter (text)
- **Arabic Font**: Noto Sans Arabic (RTL support)

### Component Classes
```css
.glass-card       /* Frosted glass effect */
.metric-card      /* Stat cards with hover effects */
.benefit-card     /* Benefit cards with accent hover */
.nav-item         /* Sidebar navigation items */
.executive-card   /* Premium gradient cards */
.insight-badge    /* Status badges (success/warning/info) */
```

### Benefit Type Tags
```css
.tag-cash         /* Green - Cash allowances */
.tag-health       /* Rose - Health benefits */
.tag-time         /* Blue - Time off */
.tag-growth       /* Purple - Career growth */
.tag-wealth       /* Amber - Wealth/equity */
.tag-wellbeing    /* Cyan - Wellbeing */
```

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profile data linked to auth.users
```sql
- id, user_id, first_name, last_name, email
- organization_id, department, position, grade
- date_of_birth, nationality, marital_status
- monthly_salary, employment_date
- emergency_contact_name, emergency_contact_phone
- preferred_language (en/ar)
```

#### `organizations`
Multi-tenant organization data
```sql
- id, name, domain
- primary_color, secondary_color, accent_color
- logo_url, welcome_message, footer_text
- survey_start_month, survey_end_month
- settings (JSON)
```

#### `benefits`
Benefit definitions
```sql
- id, name, description, icon
- benefit_type (enum: cash_allowances, health_protection, time_off_flex, growth_career, wealth_ownership, wellbeing)
- life_area (enum: home_living, family_parenting, health, money, career, lifestyle, mobility)
- annual_value, is_active, policy_bullets
```

#### `benefit_entitlements`
User-specific benefit allocations
```sql
- id, user_id, benefit_id, organization_id
- annual_allowance, utilized_amount
```

#### `requests`
Claims and requests from employees
```sql
- id, user_id, organization_id
- request_type (enum: claim, request, question)
- status (enum: pending, approved, rejected, draft, submitted, in_review, paid, closed)
- category, subject, description, amount
- sla_due_at, assigned_to, priority
```

#### `marketplace_offers`
Vendor offers/perks
```sql
- id, vendor_id, title, description
- category, merchant, discount_percent
- rating, tags, terms, image_url, is_active
```

### Supporting Tables
- `user_roles` - Role assignments (employee, employer, admin, vendor)
- `leave_balances` - Leave entitlements per user
- `housing_areas` / `housing_listings` - Housing data
- `schools` - School directory
- `health_providers` - Healthcare provider directory
- `per_diem_rates` / `per_diem_claims` - Travel per diem
- `vendor_transactions` - Marketplace transactions
- `notifications` - User notifications
- `audit_logs` - Action audit trail
- `ui_visibility_settings` - Configurable UI elements
- `metric_definitions` - Metric dictionary

---

## 🔐 Authentication & Security

### Authentication Flow
1. Email/password login via Supabase Auth
2. Demo login with pre-seeded accounts
3. Role fetched from `user_roles` table
4. Organization fetched from `profiles` table
5. Session managed with Supabase session

### Demo Accounts
```
employee: demo.employee@bnft.ae / demo123456
employer: demo.employer@bnft.ae / demo123456
admin: demo.admin@bnft.ae / demo123456
vendor: demo.vendor@bnft.ae / demo123456
```

### Row Level Security (RLS)
- Users can only access their own data
- Employers can access organization data
- Admins have broader platform access

### Security Features
- Session timeout with auto-logout
- MFA enrollment support
- Password strength indicators
- Audit logging for sensitive actions
- Data privacy settings
- Account lockout protection

---

## 🌍 Internationalization (i18n)

### Supported Languages
- English (en) - LTR
- Arabic (ar) - RTL

### Implementation
```tsx
const { language, direction } = useLanguage();
const isRTL = direction === 'rtl';
const isArabic = language === 'ar';

// Conditional text
{isArabic ? 'مرحباً' : 'Welcome'}

// RTL-aware styling
<div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
```

### RTL Support
- Automatic layout mirroring
- RTL-specific CSS classes
- Arabic typography with Noto Sans Arabic
- Progress bars reverse direction

---

## 📊 Data Hooks

### Employee Hooks (`useSupabaseData.ts`)
```tsx
useProfile()           // Current user profile
useBenefits()          // All active benefits
useBenefitEntitlements() // User's benefit allocations
useHousingAreas()      // Housing area data
useHousingListings()   // Rental listings
useSchools()           // School directory
useHealthProviders()   // Healthcare providers
useMarketplaceOffers() // Available perks
useLeaveBalances()     // Leave entitlements
useRequests()          // User's claims/requests
useChildren()          // User's children data
useUtilizationEvents() // Benefit usage history
usePerkActivations()   // Activated perks
```

### Employer Hooks
```tsx
useEmployerDashboardMetrics() // Dashboard KPIs
useBenefitUtilizationStats()  // Utilization by benefit
useAllProfiles()              // All organization profiles
useAllRequests()              // All claims for review
useEmployerActions()          // Action plan items
```

---

## 🧩 Key Components

### Shared UI Components
```tsx
<PageHeader />          // Page title with icon and actions
<SummaryStatsCard />    // Metric display cards
<BenefitGuide />        // How-to-use guide panels
<BenefitPageLayout />   // 4-tab layout for benefit pages
<ConfidenceGate />      // Data confidence indicators
<DataQualityPanel />    // Data quality warnings
<ContextPanel />        // Side panel for details
```

### Chart Components
```tsx
<AnimatedLineChart />   // Time series with animations
<AnimatedBarChart />    // Bar chart with animations
<AnimatedDonutChart />  // Donut/pie with animations
<AnimatedRadarChart />  // Radar comparison charts
<ProgressBarList />     // Ranked progress bars
<StackedAreaChart />    // Stacked area charts
```

### Employee Components
```tsx
<CompensationBreakdownModal />  // Salary breakdown modal
<SatisfactionSurvey />          // Rating survey widget
<NextActionsPanel />            // Prioritized actions
<BenefitActionButtons />        // Claim/activate buttons
<PerDiemWidget />               // Travel per diem calculator
```

### Employer Components
```tsx
<ExecutivePulseCards />     // KPI cards with trends
<MoneyFlowVisualization />  // Budget flow diagram
<YearEndProjection />       // Spend forecasting
<AIInsightsPanel />         // AI recommendations
<ViewToggle />              // Strategic/Operational switch
```

---

## 🔄 State Management

### Contexts
```tsx
<AuthProvider>          // User, session, role, signIn/Out
<LanguageProvider>      // Language, direction, toggle
<ProfileProvider>       // User profile data
<PeriodProvider>        // Date range selection
<UIVisibilityProvider>  // Configurable UI elements
<PrivacyProvider>       // Salary visibility toggle
<SecurityProvider>      // Session security
```

### React Query
- 5-minute stale time
- Single retry on failure
- No refetch on window focus
- Query keys by entity and user

---

## 📱 Responsive Design

### Breakpoints
```
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1400px // Wide screens
```

### Mobile Patterns
- Collapsible sidebar with hamburger menu
- Stacked cards on mobile
- Touch-friendly button sizes
- Simplified navigation

---

## 🎯 Key Features Summary

### Employee
- ✅ Total compensation visibility
- ✅ Benefits utilization tracking
- ✅ Claim submission workflow
- ✅ Leave management
- ✅ Marketplace perks
- ✅ Document requests
- ✅ Government services quick links
- ✅ Satisfaction surveys
- ✅ Personalized recommendations

### Employer
- ✅ Executive dashboard with KPIs
- ✅ Data quality monitoring
- ✅ Utilization analytics
- ✅ Waste/unrealized value tracking
- ✅ Claims queue management
- ✅ Policy hub with versioning
- ✅ Employee segmentation
- ✅ Budget forecasting
- ✅ Benchmark comparisons

### Admin
- ✅ Multi-org management
- ✅ Platform benchmarks
- ✅ Data migration tools
- ✅ UI configuration
- ✅ Tenant isolation

### Vendor
- ✅ Offer management
- ✅ Performance analytics
- ✅ Transaction tracking
- ✅ Payout requests

---

## 🚀 URLs

- **Preview**: https://id-preview--1b3e81ee-6249-4528-9b3d-dd306a1bae24.lovable.app
- **Published**: https://total-rewards-zen.lovable.app

---

## 📦 Dependencies

### Core
- react, react-dom, react-router-dom
- @tanstack/react-query
- @supabase/supabase-js

### UI
- tailwindcss, tailwindcss-animate
- framer-motion
- lucide-react (icons)
- recharts (charts)
- shadcn/ui components (50+)

### Forms & Validation
- react-hook-form
- @hookform/resolvers
- zod

### Utilities
- date-fns
- class-variance-authority
- clsx, tailwind-merge

---

*This documentation provides ChatGPT with complete context about the bnft. platform architecture, features, design system, and implementation details.*
