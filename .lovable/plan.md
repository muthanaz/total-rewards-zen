

# CEO-Grade Dashboard Enhancement Plan

## Objective
Transform the Executive Dashboard from an analytics display into a decision-support tool that a CEO can scan in 30 seconds and immediately know what requires attention.

---

## Phase 1: Header Simplification

### 1.1 Page Title & Subtitle
**File:** `src/components/employer/ExecutiveDashboard.tsx`

**Current:**
```
"Total Rewards Overview"
"Strategic total rewards performance — FY 2024"
```

**Change to:**
```
"Benefits Investment Summary"
"FY 2024 · 312 employees · AED 78.8K per head"
```

### 1.2 Remove Duplicate Status Badge
- Remove the "On Track / Needs Attention" badge from header (lines 298-313)
- Keep only the one in ExecSummaryStrip

### 1.3 Simplify Toggle Labels
**File:** `src/components/employer/ExecModeToggle.tsx`

**Current:** "Board-ready" / "CFO Detail"
**Change to:** "Summary" / "Detailed"

### 1.4 Simplify Export Button
**File:** `src/components/employer/BoardPackExportButton.tsx`

**Current:** "Board Pack"
**Change to:** "Export"

---

## Phase 2: Executive Summary Strip Refinement

**File:** `src/components/employer/ExecSummaryStrip.tsx`

### 2.1 Terminology Updates
| Current | Change to |
|---------|-----------|
| "Invested" | "Total Spend" |
| "Utilized" | "Usage Rate" |
| "Recoverable" | "Unused Value" |
| "Unrealized value" (sublabel) | "opportunity to recapture" |

### 2.2 Remove Duplicate Badge
- Remove the "On Track / Action Needed" badge from this strip since header already has one (or vice versa - keep only ONE location)

---

## Phase 3: Confidence Strip Transformation

**File:** `src/components/employer/ExecHighlightsStrip.tsx`

### 3.1 Option A: Simplify Dramatically
Change entire strip to single line:
```
"✓ Data verified from HR, Finance, Benefits · Updated 2h ago"
```

Only show warning state if data is stale:
```
"⚠ Data is 3 days old · Some figures may be outdated"
```

### 3.2 Option B: Move to Footer
Remove from main content area entirely. Add as subtle footer note below all cards.

### 3.3 Terminology
| Current | Change to |
|---------|-----------|
| "High Confidence" | "Verified" |
| "Medium Confidence" | "Partial" |
| "Low Confidence" | "Limited" |
| "Sources: 3" | "HR, Finance, Benefits" (name them) |

---

## Phase 4: KPI Cards Enhancement

**File:** `src/components/employer/ExecKPICards.tsx`

### 4.1 Currency Abbreviation
Always use abbreviated format:
- `AED 24,600,000` → `AED 24.6M`
- `AED 6,888,000` → `AED 6.9M`

### 4.2 Surface "Why It Moved"
Move the hidden tooltip content to a visible subtitle under each KPI value:
```
AED 24.6M
Total Investment
↑ 8% · headcount growth + L&D expansion
```

### 4.3 Simplify Sub-metrics
| Current | Change to |
|---------|-----------|
| "+AED 1.2M (5.3%)" | "5% over budget" |
| "Target: 75%" | "Target 75%" (no colon) |
| "Benchmark: 80%" | "Benchmark 80%" (no colon) |

### 4.4 Unrealized Value Breakdown
Either:
- Enlarge the mini-breakdown bar to be readable
- OR replace with single "Top driver: Awareness Gap (35%)"

---

## Phase 5: Decisions & Actions Upgrade

**File:** `src/components/employer/DecisionsActionsCard.tsx`

### 5.1 Move Section Up
In `ExecutiveDashboard.tsx`, move `<DecisionsActionsCard>` BEFORE the Investment Allocation section (above line 347).

This prioritizes "what do I need to do" over "where does money go".

### 5.2 Title Simplification
| Current | Change to |
|---------|-----------|
| "Decisions & Actions" | "Action Required" |

### 5.3 Status Label Updates
| Current | Change to |
|---------|-----------|
| "Backlog" | "Pending" |
| "In Progress" | "Active" |
| "Blocked" | "Blocked" (keep) |
| "Completed" | "Done" |

### 5.4 Impact Clarity
Change "AED 50,000 impact" to "Saves AED 50K" or "Recovers AED 50K"

### 5.5 Empty State
| Current | Change to |
|---------|-----------|
| "No actions scheduled for next 30 days" | "All caught up — no decisions needed" |

---

## Phase 6: Investment Allocation Polish

### 6.1 Chart Title
**File:** `src/components/employer/ExecutiveDashboard.tsx` (ChartWrapper props)

| Current | Change to |
|---------|-----------|
| "Investment Allocation" | "Where Money Goes" |

### 6.2 Remove Subtitle
Delete: "Budget distribution by benefit category"

### 6.3 Add Center Total
Add total value in donut hole: "AED 24.6M"

---

## Phase 7: At-Risk Segments Polish

**File:** `src/components/employer/AtRiskSegmentsCard.tsx`

### 7.1 Consistent Casing
Change "unrealized" → "Unrealized"

### 7.2 Simplified Segment Names
Remove internal codes like "Grade A (Executives)" → just "Executives"

---

## Phase 8: Global Consistency Fixes

### 8.1 Create Formatting Constants
**File:** `src/lib/utils.ts`

Add helper for consistent abbreviation:
```typescript
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) return `AED ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `AED ${(amount / 1_000).toFixed(0)}K`;
  return `AED ${amount}`;
}
```

### 8.2 Enforce Conventions
| Element | Standard |
|---------|----------|
| Currency > 10K | Always abbreviated (24.6M, 890K) |
| Percentages | No space before % (72%, not 72 %) |
| Labels | Title Case (Unrealized, not unrealized) |
| "vs" | Always lowercase, no period (vs, not vs.) |

---

## Implementation Order

| Priority | Task | Effort |
|----------|------|--------|
| 1 | Remove duplicate status badge from header | 5 min |
| 2 | Update terminology in ExecSummaryStrip | 10 min |
| 3 | Move Decisions & Actions section up | 5 min |
| 4 | Abbreviate all currency values | 15 min |
| 5 | Simplify ExecModeToggle labels | 5 min |
| 6 | Surface "Why it moved" as visible subtitle | 20 min |
| 7 | Simplify/remove Confidence Strip | 15 min |
| 8 | Update status labels in DecisionsActionsCard | 10 min |
| 9 | Global consistency fixes | 15 min |

**Total estimated effort:** ~1.5 hours

---

## Expected Outcome

**Before:** Dashboard requires 2+ minutes to parse, with technical jargon and hidden context.

**After:** CEO can scan in 30 seconds and immediately understand:
1. How much we're spending (and if it's on budget)
2. How much employees are using (and if it meets target)
3. How much value is being left unused
4. What decisions need to be made NOW

