# bnft. Design System v3.0

> Internal style guide for maintaining premium, consistent UI across all portals.

---

## 1. Design Principles

1. **Premium by Default** - Every element should feel polished and intentional
2. **Consistent Everywhere** - Same patterns across Employee/Employer/Admin/Vendor
3. **Accessible First** - WCAG 2.2 AA minimum, 44px touch targets on mobile
4. **RTL-Ready** - Arabic support with Western digits (0-9) always
5. **Mobile-First** - Responsive breakpoints: sm(640) → md(768) → lg(1024) → xl(1280)

---

## 2. Typography Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `display-xl` | 36/48px | Bold | Hero sections |
| `display-lg` | 30/36px | Bold | Page titles |
| `heading-h1` | 24/30px | Bold | Section headers |
| `heading-h2` | 20/24px | Semibold | Card titles |
| `heading-h3` | 18px | Semibold | Subsection headers |
| `heading-h4` | 16px | Semibold | Group labels |
| `body-lg` | 16px | Regular | Primary content |
| `body-md` | 14px | Regular | Default body text |
| `body-sm` | 12px | Regular | Supporting text |
| `caption-md` | 14px | Regular + muted | Metadata labels |
| `caption-sm` | 12px | Regular + muted | Secondary labels |
| `caption-xs` | 10px | Regular + muted | Tiny annotations |
| `stat-hero` | 36/48px | Bold | Hero metrics |
| `stat-lg` | 30px | Bold | Primary stats |
| `stat-md` | 24px | Bold | Card stats |
| `stat-sm` | 20px | Bold | Compact stats |

### Font Families
- **Body**: Inter (400-700)
- **Display**: DM Sans (500-700)
- **Arabic**: Noto Sans Arabic (400-700)

### Usage in Code
```tsx
import { typography } from '@/lib/designSystem';

// Apply via className
<h1 className={typography.heading.h1}>Page Title</h1>
<p className={typography.body.md}>Body text</p>
<span className={typography.stat.lg}>45,230</span>
```

---

## 3. Color System

### Semantic Tokens (use these, NOT hex values)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | 220 20% 98% | 222 47% 6% | Page background |
| `--foreground` | 222 47% 11% | 220 14% 96% | Primary text |
| `--card` | 0 0% 100% | 222 47% 10% | Card backgrounds |
| `--primary` | 222 47% 11% | 174 60% 45% | Primary actions |
| `--accent` | 174 55% 42% | 174 60% 45% | Teal accent |
| `--secondary` | 220 14% 96% | 222 47% 14% | Secondary surfaces |
| `--muted` | 220 14% 96% | 222 47% 14% | Muted backgrounds |
| `--muted-foreground` | 220 9% 50% | 220 9% 60% | Secondary text |
| `--destructive` | 0 72% 55% | 0 62% 50% | Errors, deletions |
| `--success` | 160 70% 40% | 160 84% 45% | Success states |
| `--warning` | 38 85% 52% | 38 95% 55% | Warnings |
| `--info` | 199 80% 50% | 199 89% 55% | Informational |
| `--border` | 220 13% 90% | 222 47% 18% | Borders |

### Chart Palette
```
chart-1: Teal (accent)
chart-2: Blue (info)
chart-3: Purple
chart-4: Amber (warning)
chart-5: Pink
chart-6: Green (success)
chart-7: Orange
chart-8: Violet
```

### Usage Rules
```tsx
// ✅ CORRECT - Use semantic tokens
className="bg-card text-foreground border-border"
className="text-success bg-success/10"
className="text-muted-foreground"

// ❌ WRONG - Never use raw colors
className="bg-white text-gray-900"
className="text-green-500 bg-green-50"
```

---

## 4. Spacing Scale (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight inline elements |
| `gap-2` | 8px | Icon spacing |
| `gap-3` | 12px | Compact grouping |
| `gap-4` | 16px | Standard gap |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Large sections |
| `p-4` | 16px | Compact card padding |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Spacious card padding |

### Page Layout
```tsx
// Standard page structure
<div className="space-y-6">           {/* 24px between sections */}
  <PageHeader />
  <FilterBar />
  <Card className="p-6">              {/* 24px internal padding */}
    <div className="space-y-4">       {/* 16px between elements */}
      ...
    </div>
  </Card>
</div>
```

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Badges, chips |
| `rounded-md` | 6px | Buttons, inputs |
| `rounded-lg` | 10px | Cards, dialogs |
| `rounded-xl` | 12px | Large cards |
| `rounded-2xl` | 16px | Hero cards |
| `rounded-full` | 50% | Avatars, pills |

---

## 6. Shadows

| Token | Usage |
|-------|-------|
| `shadow-xs` | Subtle lift (inputs) |
| `shadow-sm` | Cards at rest |
| `shadow-md` | Cards on hover |
| `shadow-lg` | Dialogs, drawers |
| `shadow-xl` | Modals, hero cards |
| `shadow-glow` | Accent highlight |

---

## 7. Button System

### Variants
| Variant | Usage |
|---------|-------|
| `default` (primary) | Primary CTAs - Submit, Save, Create |
| `secondary` | Secondary actions - Cancel, Back |
| `outline` | Tertiary actions - Filter toggles |
| `destructive` | Danger actions - Delete, Remove |
| `ghost` | Inline actions - Edit, View details |
| `link` | Text links within content |

### Sizes
| Size | Height | Usage |
|------|--------|-------|
| `xs` | 24px | Compact inline actions |
| `sm` | 36px | Secondary buttons |
| `default` | 40-44px | Standard buttons |
| `lg` | 44px | Hero CTAs |
| `icon` | 40-44px | Icon-only buttons |

### Best Practices
```tsx
// Primary action (one per section)
<Button>Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive with confirmation
<Button variant="destructive">Delete</Button>

// Ghost for inline actions
<Button variant="ghost" size="sm">
  <Edit className="w-4 h-4 me-2" />
  Edit
</Button>

// Icon only with tooltip
<Button variant="ghost" size="icon" aria-label="Settings">
  <Settings className="w-4 h-4" />
</Button>
```

---

## 8. Card Patterns

### Variants
```tsx
// Base card
<Card className="p-6">Content</Card>

// Interactive card (hover effects)
<Card className="p-6 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer">

// Metric card
<Card className="p-5 hover:shadow-md transition-shadow">
  <MetricContent />
</Card>

// Section card with header
<SectionCard title="Title" description="Desc" action={<Button />}>
  Content
</SectionCard>
```

### Card Content Structure
```
┌─────────────────────────────────────┐
│ Header (title + actions)            │
├─────────────────────────────────────┤
│ Content area                        │
│ - p-6 padding                       │
│ - space-y-4 internal spacing        │
├─────────────────────────────────────┤
│ Footer (optional)                   │
└─────────────────────────────────────┘
```

---

## 9. Form Patterns

### Input Styling
```tsx
<Label htmlFor="email">Email</Label>
<Input 
  id="email"
  placeholder="you@example.com" 
  className="h-10"
/>
```

### Form Layout
```tsx
// Vertical (default)
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Field</Label>
    <Input />
  </div>
</div>

// Horizontal (wide forms)
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>First Name</Label>
    <Input />
  </div>
  <div className="space-y-2">
    <Label>Last Name</Label>
    <Input />
  </div>
</div>
```

---

## 10. Table Patterns

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead className="text-end">Amount</TableHead> {/* Right-align numbers */}
      <TableHead>Status</TableHead>
      <TableHead className="w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">Item</TableCell>
      <TableCell className="text-end tabular-nums">1,234</TableCell>
      <TableCell><Badge>Active</Badge></TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">View</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Rules
- Right-align numeric columns with `text-end tabular-nums`
- Use `—` (em-dash) for empty values
- Action buttons in last column
- Responsive: use `ResponsiveTable` for mobile card view

---

## 11. Badge System

### Status Badges
```tsx
<Badge variant="outline" className="bg-success/10 text-success border-success/30">
  Active
</Badge>

<Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
  Pending
</Badge>

<Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
  Rejected
</Badge>
```

### Use EnumChip for Consistent Styling
```tsx
import { EnumChip } from '@/components/shared/EnumChip';

<EnumChip value="approved" type="status" />
<EnumChip value="high" type="priority" />
```

---

## 12. Empty States (Zero States)

Every major page needs a meaningful empty state with:
1. **Icon** - Relevant to the content type
2. **Title** - What this section is for
3. **Description** - Why it's empty
4. **Action** - Next best step

```tsx
import { ZeroState } from '@/components/shared/ZeroState';

<ZeroState
  portal="employee"
  page="claims"
  onAction={() => navigate('/employee/benefits')}
/>
```

### Portal-Specific Empty States
| Portal | Page | Message | Action |
|--------|------|---------|--------|
| Employee | Claims | No claims submitted yet | Browse Benefits |
| Employee | Marketplace | No offers available | Request an Offer |
| Employer | Claims Queue | All caught up! | View Analytics |
| Employer | Policies | No policies created | Create First Policy |
| Admin | Organizations | No organizations | Add Organization |
| Vendor | Offers | No active offers | Create Offer |

---

## 13. Loading States

```tsx
// Page loading
<DashboardSkeleton />

// Section loading
<SummaryCardsSkeleton count={4} />
<TableSkeleton rows={5} columns={4} />
<ChartSkeleton />
<ListItemSkeleton count={3} />
```

---

## 14. Toast Patterns

```tsx
import { toast } from '@/hooks/use-toast';

// Success
toast({
  title: "Changes saved",
  description: "Your policy has been updated.",
});

// Error
toast({
  variant: "destructive",
  title: "Failed to save",
  description: "Please try again.",
});

// With action
toast({
  title: "Claim submitted",
  description: "You'll be notified when reviewed.",
  action: <ToastAction altText="View">View</ToastAction>,
});
```

---

## 15. RTL Support

### Automatic Handling
- Direction: `dir="rtl"` on html element
- Font: Noto Sans Arabic auto-applied
- Flex: Use `flex-row-rtl` for auto-reversal
- Spacing: Use logical properties (`ms-2`, `me-2`, `ps-4`, `pe-4`)

### Keep LTR
- Numbers: Always Western digits (0-9)
- Charts: Left-to-right axis
- Code: Left-aligned

### Implementation
```tsx
// Use logical spacing
<div className="flex items-center gap-2">
  <Icon className="me-2" /> {/* margin-end */}
  <span>{label}</span>
</div>

// Format numbers with Western digits
import { formatCurrencyAED, formatInteger } from '@/lib/utils';
<span>{formatInteger(1234)}</span> // Always "1,234"
```

---

## 16. Icon System

### Library: Lucide React
- Size: 16px (w-4 h-4) default, 20px (w-5 h-5) large
- Stroke: 2px (default)
- Color: Inherit from parent (`currentColor`)

### Usage
```tsx
import { Settings, ChevronRight, AlertCircle } from 'lucide-react';

// Inline with text
<span className="flex items-center gap-2">
  <AlertCircle className="w-4 h-4 text-warning" />
  Warning message
</span>

// In buttons
<Button>
  <Plus className="w-4 h-4" />
  Add Item
</Button>

// Icon containers
<div className="p-2 rounded-xl bg-accent text-accent-foreground">
  <Briefcase className="w-5 h-5" />
</div>
```

---

## 17. Responsive Breakpoints

```
Mobile:  < 640px  (default styles)
Tablet:  640-1023px (sm:)
Desktop: 1024-1279px (lg:)
Wide:    ≥ 1280px (xl:)
```

### Common Patterns
```tsx
// Grid columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Hide/show
<div className="hidden lg:block">Desktop only</div>
<div className="lg:hidden">Mobile/tablet only</div>

// Responsive text
<h1 className="text-2xl lg:text-3xl">Responsive Heading</h1>
```

---

## 18. Animation Guidelines

### Entry Animations
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Micro-interactions
- Buttons: `transition-colors duration-150`
- Cards: `transition-all duration-200`
- Dialogs: `transition-all duration-300`

### Respect User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Quick Reference

### Do's ✅
- Use semantic color tokens
- 8px spacing grid
- One primary button per section
- Empty states with actions
- Loading skeletons
- RTL logical properties
- Western digits (0-9) everywhere

### Don'ts ❌
- Hardcoded hex colors
- Arbitrary spacing values
- Multiple primary buttons
- Generic "No data" messages
- Spinner-only loading
- Fixed margin-left/right for RTL
- Arabic numerals in UI

---

*Last updated: January 2026*
