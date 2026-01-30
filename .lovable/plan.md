
# GLOBAL REFACTOR — bnft SSOT + Zero-Waste + Consistency

## Overview

This refactor enforces platform-wide consistency for employee benefit pages, terminology, and visual standards. The changes will ensure data reconciliation integrity and remove duplicate CTAs and purposeless buttons.

---

## 1. Entitlement Strip Label Standardization

### Current State
- `BenefitDetailTemplate.tsx` uses inconsistent labels:
  - First card: `label="Annual"` or `label="Monthly"` (frequency-dependent)
  - Second card: `label="Used"` (incorrect term)
  - Third card: `label="Remaining"` (correct)
- `UniversalBenefitTemplate.tsx` uses different labels:
  - `label="Annual Value"`, `label="Utilized"`, `label="Remaining"`, plus a 4th card

### Required Changes

**File: `src/components/templates/BenefitDetailTemplate.tsx`**
- Line 187: Change `label={frequency === 'annual' ? 'Annual' : 'Monthly'}` to `label="Annual entitlement"`
- Line 195: Change `label="Used"` to `label="Paid YTD"`
- Line 196: Change formula from `Claims YTD` to `Paid claims only`
- Ensure all value outputs use `tabular-nums` class

**File: `src/components/templates/UniversalBenefitTemplate.tsx`**
- Line 170: Change `label="Annual Value"` to `label="Annual entitlement"`
- Line 178: Change `label="Utilized"` to `label="Paid YTD"`
- Remove the 4th card (Utilization percentage) to match 3-card pattern

**File: `src/components/employee/wizard/WizardStepEstimate.tsx`**
- Line 78: Change `"Used So Far"` to `"Paid YTD"`

---

## 2. "Paid YTD" Calculation Fix (Paid-Only Status)

### Current State
- `useBenefitPolicy.ts` line 216 includes both `'approved'` and `'paid'` in the utilized calculation:
  ```typescript
  .in('status', ['approved', 'paid'])
  ```

### Required Changes

**File: `src/hooks/useBenefitPolicy.ts`**
- Line 216: Change `.in('status', ['approved', 'paid'])` to `.in('status', ['paid'])`
- This ensures "Paid YTD" reflects only actually disbursed amounts
- "Remaining" will correctly calculate as `Annual entitlement - Paid YTD`

---

## 3. Remove Duplicate Primary CTAs

### Current State
- `BenefitDetailTemplate.tsx` has TWO CTA buttons:
  1. Header action button (line 175-179) in `PageHeader`
  2. In-page CTA card (lines 329-347) with duplicate button

### Required Changes

**File: `src/components/templates/BenefitDetailTemplate.tsx`**
- Remove Section F (lines 329-347): The in-page CTA card that duplicates the header action
- Keep only the single primary CTA in `PageHeader.actions`
- The section comment `{/* F) Start claim/request CTA */}` and card will be deleted

---

## 4. Terminology Enforcement

### 4.1 "Used" to "Paid YTD" Mapping
All employee benefit pages must use "Paid YTD" instead of "Used":

**Files to update:**
- `src/components/templates/BenefitDetailTemplate.tsx` (line 195)
- `src/components/templates/UniversalBenefitTemplate.tsx` (line 178)
- `src/components/employee/wizard/WizardStepEstimate.tsx` (line 78)
- `src/components/employee/benefits/NextActionPanel.tsx` (references to "utilized")

### 4.2 "Savings" to "Recovery" for recovery_potential metric
Search and replace UI labels where "Savings" appears in context of recovery_potential:

**Files to audit:**
- `src/components/dashboard/EmployerBenefitRecommendations.tsx` - function `calculateSavings` and `totalPotentialSavings` (internal variable names OK, but UI labels should say "Recovery")
- Any UI text showing "Potential Savings" should become "Recovery Potential"

### 4.3 "Zombie Spend" to "Budget Leakage" (Already Mostly Done)
The codebase already uses "Budget Leakage" in UI. Remaining cleanup:

**Files with lingering references:**
- `src/hooks/useEmployerActions.ts` - `sourceType: 'zombie_spend'` (keep as data key, but ensure UI shows "Budget Leakage")
- `src/contexts/UIVisibilityContext.tsx` - key `'zombie_spend'` (keep as key, UI label is correct)
- Variable names like `zombieSpend` can remain as internal identifiers

---

## 5. Button Purpose Audit

### Buttons to Validate

| Component | Button | Action | Status |
|-----------|--------|--------|--------|
| BenefitDetailTemplate | "View all claims" (line 386) | Routes to `/employee/requests` | Valid |
| PageHeader | Partner Offers button | Routes to `/employee/marketplace?category=...` | Valid |
| Dashboard | "See All" | Routes to `/employee/benefits` | Valid |

### No purposeless buttons identified that need removal

---

## 6. Ensure `tabular-nums` and `formatCurrencyAED()` Consistency

### Current State
The `SummaryStatsCard` component already applies proper formatting internally.

### Required Changes
None - the component handles formatting correctly. Currency values passed through `formatCurrencyAED()` are already Western-digit compliant.

---

## 7. Section Order Enforcement

### Standard Section Order for All Benefit Pages
1. **Header** (PageHeader with title, description, icon, policy ref badge, primary CTA)
2. **Entitlement Strip** (3 cards: Annual entitlement | Paid YTD | Remaining)
3. **How it works** (collapsible, max 4 bullets)
4. **What you can claim/request** (rules, caps, eligible items)
5. **Required documents** (checklist)
6. ~~Start claim/request CTA~~ (REMOVED - duplicate)
7. **Recent activity** (last 3 claims with "View all claims" link)
8. **Category-specific content** (children)

All 7 benefit pages in `src/pages/employee/benefits/` already use `BenefitDetailTemplate`, so fixing the template fixes all pages.

---

## Technical Implementation Summary

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/templates/BenefitDetailTemplate.tsx` | 1. Update labels to "Annual entitlement", "Paid YTD", "Remaining"<br>2. Remove duplicate CTA card (Section F)<br>3. Update formula text |
| `src/components/templates/UniversalBenefitTemplate.tsx` | 1. Update labels<br>2. Remove 4th utilization card |
| `src/hooks/useBenefitPolicy.ts` | Change status filter from `['approved', 'paid']` to `['paid']` |
| `src/components/employee/wizard/WizardStepEstimate.tsx` | Change "Used So Far" to "Paid YTD" |

### No New Files Required

### No Route Changes Required

---

## Acceptance Criteria Verification

| Criterion | Implementation |
|-----------|----------------|
| Employee benefit pages show identical section order | Fixed in `BenefitDetailTemplate` - all 7 pages inherit |
| Entitlement labels are exactly "Annual entitlement", "Paid YTD", "Remaining" | Updated in template |
| Paid YTD equals paid-only totals | Changed query filter to `['paid']` only |
| Paid YTD reconciles with employer paid totals | Status alignment ensures reconciliation |
| No duplicate primary CTAs | Removed in-page CTA card |
| formatCurrencyAED() + tabular-nums everywhere | Already enforced in SummaryStatsCard |
| Empty values show "—" | Already enforced in formatNullable() |

---

## Risk Assessment

**Low Risk**: All changes are isolated to specific templates and one hook. The 7 benefit pages consume the template without modification.

**Data Reconciliation Impact**: Changing from `['approved', 'paid']` to `['paid']` will show lower "Paid YTD" values (approved claims won't count until actually paid). This is the CORRECT behavior per requirements.

**Testing Focus**: Verify all benefit pages render correctly and that the entitlement strip values reconcile with the employer's settlement view.
