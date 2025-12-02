# 🎨 JAPAGUIDE - Revised Frontend Architecture Prompt

You are an expert **frontend architect & creative developer**. Design and build a **visually stunning, interaction-rich, and emotionally engaging** frontend for **Japaguide** — a migration companion app that needs to feel like a premium consumer product with a **single, fluid interface centered around an interactive map**.

This is NOT your typical CRUD app or multi-page SaaS tool. Think: **Fiserv's clean data visualization** meets **Apple Maps' fluidity** meets **Linear's spatial UI**. Every interaction should feel **smooth, intentional, and spatially aware**. The design should make users feel like they're exploring a living world, not clicking through boring forms.

**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion for animations, D3.js/TopoJSON for maps. NO Shadcn/UI, NO Chakra UI, NO generic component libraries. We're building custom everything.

**Backend:** Fully built Django REST API. All endpoints work for anonymous users. JWT auth is optional.

---

## 🎯 Core Design Philosophy: Single-Canvas, Progressive Disclosure

### The Central Principle
**Everything happens on ONE continuous canvas with the interactive map at the center.** 

No traditional multi-page navigation. No jarring transitions. No feeling of "leaving" the main space.

### Core Interaction Model

```
THE MAP (Layer 0 - Always Present)
    ↓ click country
COUNTRY DRAWER (Layer 1 - Slides from right)
    ↓ click action
FEATURE OVERLAY (Layer 2 - Modal/Panel appears)
    ↓ complete/close
← Back to previous layer
```

### Key Principles

1. **The Map is Home** - Everything radiates from the interactive world map
2. **Progressive Disclosure** - Features reveal themselves contextually as you interact
3. **Spatial Continuity** - You always know where you are in the interface
4. **Layered Depth** - UI layers stack on top of each other with blur/dim effects
5. **Smooth Transitions** - Every state change is animated and reversible
6. **Context Preservation** - Background layers remain visible (dimmed) to maintain orientation

---

## 🎨 Visual Design System

### Color Palette (Warm, Data-Focused)

**Primary Palette:**
```css
/* Primary Accent (Orange/Coral - for CTAs and highlights) */
--accent-primary: #FF6B35;
--accent-secondary: #F7931E;

/* Data Visualization Blues (Map colors) */
--data-lowest: #E8F4F8;      /* Lightest blue (easiest countries) */
--data-low: #B8D4E8;          /* Light blue */
--data-medium: #7BA7CC;       /* Medium blue */
--data-high: #4A7BA7;         /* Dark blue */
--data-highest: #2C4A6B;      /* Darkest blue (hardest countries) */

/* Neutral Grays (Clean, minimal) */
--bg-primary: #FAFAFA;        /* Main background */
--bg-secondary: #F5F5F5;      /* Card backgrounds */
--bg-tertiary: #EBEBEB;       /* Borders, dividers */
--text-primary: #1A1A1A;      /* Main text */
--text-secondary: #666666;    /* Secondary text */
--text-tertiary: #999999;     /* Disabled text */

/* Glassmorphism */
--glass-light: rgba(255, 255, 255, 0.85);
--glass-border: rgba(255, 255, 255, 0.2);
--overlay-dim: rgba(0, 0, 0, 0.4);
```

**Dark Mode Palette:**
```css
--bg-primary-dark: #0F0F0F;
--bg-secondary-dark: #1A1A1A;
--bg-tertiary-dark: #252525;
--text-primary-dark: #FAFAFA;
--text-secondary-dark: #A0A0A0;
--glass-dark: rgba(20, 20, 20, 0.85);
--overlay-dim-dark: rgba(0, 0, 0, 0.6);
```

### Typography

```css
/* Clean, data-focused fonts */
--font-display: 'Inter', system-ui, sans-serif;  /* 600-800 weight */
--font-body: 'Inter', system-ui, sans-serif;     /* 400-500 weight */
--font-mono: 'JetBrains Mono', monospace;        /* For data/stats */

/* Type Scale */
--text-xs: 0.75rem;      /* 12px - captions */
--text-sm: 0.875rem;     /* 14px - secondary */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.125rem;     /* 18px - emphasis */
--text-xl: 1.25rem;      /* 20px - card titles */
--text-2xl: 1.5rem;      /* 24px - section headers */
--text-3xl: 1.875rem;    /* 30px - page titles */
--text-4xl: 2.25rem;     /* 36px - hero numbers */
--text-5xl: 3rem;        /* 48px - large stats */
```

---

## 🗺️ The Map Canvas (Layer 0)

### Map Design Specifications

**Visual Style:**
- **Minimal detail** - Only country/state borders, no cities, roads, or terrain
- **Clean choropleth** - Countries colored by difficulty/cost/popularity
- **Subtle textures** - Slight noise/grain texture on countries for depth
- **White/very light borders** - Clean separation between countries
- **Soft shadows** - Countries slightly elevated with subtle shadows

**Reference:** Like Fiserv images - clean, data-focused, not overly detailed

### Map States & Interactions

```typescript
// Default State
- Countries colored by difficulty (light blue → dark blue)
- Smooth zoom/pan enabled
- Hover shows tooltip with country name + quick stat
- No clutter, very clean

// Hover State
- Hovered country brightens slightly
- Tooltip appears (floating card with flag, name, one stat)
- Cursor becomes pointer

// Selected State
- Selected country gets subtle glow/outline
- Map smoothly zooms to focus on country (not too much, keep context)
- Other countries dim slightly (reduce opacity by 20%)
- Country drawer slides in from right

// Filter Active State
- Non-matching countries become fully transparent or very light gray
- Matching countries stay colored
- Smooth fade transition (300ms)
```

### Map Controls (Floating, Minimal)

**Bottom Left Floating Panel (Glass morphism):**
```
┌─────────────────────┐
│  Filters            │
│  ─────────────      │
│  Region: [All ▼]    │
│  Difficulty: ═●═    │
│  Cost Range: ─●──   │
│  [Reset]            │
└─────────────────────┘
```

**Top Right Corner:**
```
[🗺️ Map] [📊 Chart] ← View toggle
```

### Map Library Implementation

**Use D3.js + TopoJSON for maximum control:**

```typescript
// Simplified approach
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

// Load world topology (simplified, no excessive detail)
const worldData = await d3.json('/data/world-110m.json');
const countries = topojson.feature(worldData, worldData.objects.countries);

// Color scale based on difficulty
const colorScale = d3.scaleSequential()
  .domain([1, 10])
  .interpolator(d3.interpolateBlues);

// Render with smooth transitions
svg.selectAll('path')
  .data(countries.features)
  .join('path')
  .attr('d', geoPath)
  .attr('fill', d => colorScale(d.properties.difficulty))
  .attr('stroke', '#ffffff')
  .attr('stroke-width', 0.5)
  .on('mouseover', handleHover)
  .on('click', handleSelect)
  .transition()
  .duration(300)
  .attr('opacity', d => isFiltered(d) ? 1 : 0.2);
```

---

## 📱 UI Layer System

### Layer 0: The Map (Always Visible)
- Full screen, always rendered
- Dims/blurs when upper layers are active
- Maintains zoom/pan state across interactions

### Layer 1: Country Drawer (Slides from Right)

**Trigger:** Click country on map

**Design:**
```
┌─────────────────────────────────┐
│  [←]  🇨🇦 CANADA           [×]  │
├─────────────────────────────────┤
│                                 │
│  Quick Stats (Cards)            │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │Diff. │ │Cost  │ │PR    │   │
│  │ 6/10 │ │$$$$  │ │6-12mo│   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  Popular Visa Routes            │
│  ○ Express Entry                │
│  ○ Provincial Nominee           │
│  ○ Study Permit                 │
│                                 │
│  Actions                        │
│  [Calculate Full Costs]         │
│  [Generate Roadmap]             │
│  [View Success Stories]         │
│  [Ask AI About Canada]          │
│                                 │
│  ↓ Scroll for more details      │
└─────────────────────────────────┘
```

**Specs:**
- Width: 420px (desktop), 100% (mobile)
- Slides in from right (350ms ease-out)
- Backdrop: Map dims to 0.6 opacity + blur(8px)
- Scrollable content inside
- Close: Click X, click backdrop, or press Escape
- Arrow back: Returns to country list/search

### Layer 2: Feature Overlays

#### 2a. Cost Calculator Overlay

**Trigger:** Click "Calculate Full Costs" in drawer

**Design:**
```
┌─────────────────────────────────────────────────┐
│  [←] Cost Calculator: Canada             [×]    │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  Inputs          │  Live Breakdown              │
│                  │                              │
│  Destination     │  Total: $52,340             │
│  🇨🇦 Canada       │  ═══════════════════         │
│                  │                              │
│  Duration        │  Visa & Flights: $1,350     │
│  ─────●──── 24mo │  Tuition: $30,000           │
│                  │  Housing: $28,800           │
│  Purpose         │  Living: $19,200            │
│  ○ Work          │  Buffer: $10,400            │
│  ● Study         │                              │
│  ○ Family        │  💡 Hidden Costs:            │
│                  │  • Deposit: $2,400           │
│  Budget          │  • Furniture: $1,500         │
│  $ 15,000        │  • Winter gear: $500         │
│                  │                              │
│  [Calculate]     │  Your Savings Plan:          │
│                  │  $4,333/month for 12 months  │
└──────────────────┴──────────────────────────────┘
```

**Specs:**
- Modal: 900px width, 600px height, centered
- Backdrop: Map + drawer both dim to 0.3 opacity + blur(12px)
- Two-column layout (sticky sidebar on left)
- Real-time calculations as user types
- Smooth number count-up animations

#### 2b. Roadmap Generator (Full Screen Wizard)

**Trigger:** Click "Generate Roadmap" in drawer

**Design:** Multi-step wizard but contained in one overlay

**Step 1: Confirm Destination**
```
┌─────────────────────────────────────────────────┐
│  [×] Close                    Step 1 of 5      │
│  ═══════════════════╸                          │
├─────────────────────────────────────────────────┤
│                                                 │
│     You selected 🇨🇦 Canada                     │
│                                                 │
│     What's your goal?                           │
│                                                 │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│     │   💼     │  │   🎓     │  │   👨‍👩‍👧    │ │
│     │  Work    │  │  Study   │  │  Family  │ │
│     └──────────┘  └──────────┘  └──────────┘ │
│                                                 │
│                    [Continue →]                 │
└─────────────────────────────────────────────────┘
```

**Step 2-4:** Similar full-screen cards with progress bar at top

**Step 5: Choose Your AI Guide**
```
┌─────────────────────────────────────────────────┐
│  [×] Close                    Step 5 of 5      │
│  ══════════════════════════════╸               │
├─────────────────────────────────────────────────┤
│                                                 │
│     Who should guide your journey?              │
│                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │    👨🏾‍💼    │  │    💅🏽     │  │    🔥      │ │
│  │           │  │           │  │           │ │
│  │  Uncle    │  │   Your    │  │   Hype    │ │
│  │  Japa     │  │  Bestie   │  │   Man     │ │
│  │           │  │           │  │           │ │
│  │ "My guy,  │  │ "Bestie,  │  │ "LET'S    │ │
│  │ I got you"│  │ spilling  │  │ GOOOO!"   │ │
│  └───────────┘  └───────────┘  └───────────┘ │
│                                                 │
│              [Generate My Roadmap]              │
└─────────────────────────────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│           ✨ Crafting your roadmap...           │
│                                                 │
│     ████████████████░░░░░░░░░  75%            │
│                                                 │
│     ✓ Analyzing visa requirements               │
│     ✓ Calculating costs                         │
│     ✓ Mapping timeline                          │
│     ⏳ Consulting Uncle Japa...                  │
│                                                 │
│     [Animated illustration: documents flying,   │
│      passport stamping, plane icon]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Specs:**
- Full screen overlay (with subtle background pattern)
- Map completely hidden (blur heavy or fade out)
- Can go back to previous steps
- ESC or X returns to drawer
- Smooth card transitions between steps

#### 2c. AI Chat Panel (Slides from Bottom)

**Trigger:** Click "Ask AI" anywhere or floating chat button

**Design:**
```
┌─────────────────────────────────────────────────┐
│  👨🏾‍💼 Uncle Japa              [_] [□] [×]        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Uncle Japa: Ah ah! My guy, wetin you          │
│  need help with? I dey here for you o!         │
│                                                 │
│                              You: What's the   │
│                              fastest way to    │
│                              move to Canada?   │
│                                                 │
│  Uncle Japa: My brother, Canada no be beans    │
│  o, but I go show you sharp sharp. If you     │
│  get tech skills, Express Entry na your       │
│  guy...                                        │
│                                                 │
│  [Suggested: How much should I save?]          │
│  [What documents do I need?]                   │
│                                                 │
├─────────────────────────────────────────────────┤
│  Type message... [😊] [📎]           [Send]    │
└─────────────────────────────────────────────────┘
```

**States:**
- **Minimized:** Small floating bubble (bottom right)
- **Default:** Takes 50% of screen height, slides up
- **Expanded:** Full screen (drag handle to expand)
- **Backdrop:** Map + drawer visible but dimmed

**Specs:**
- Draggable top handle to resize
- Smooth slide animation (400ms)
- Messages type out character by character
- Can minimize to floating bubble
- Persists across navigation (stays open if not explicitly closed)

---

## 🔄 URL State Management

**Everything is URL-driven for shareability:**

```
/ 
→ Default map view

/?country=canada
→ Map with Canada drawer open

/?country=canada&action=calculate
→ Map + Drawer + Calculator overlay

/?country=canada&action=roadmap
→ Map + Drawer + Roadmap wizard

/?country=canada&roadmap=abc123
→ Map + Drawer with specific roadmap loaded

/?chat=true&guide=uncle-japa&country=canada
→ Map + Drawer + Chat panel (with context)
```

**Benefits:**
- ✅ Browser back/forward works naturally
- ✅ Users can bookmark specific states
- ✅ Shareable links with exact UI state
- ✅ Deep linking from external sources

---

## 🎯 Navigation & Global UI

### Top Navigation Bar (Minimal, Always Visible)

```
┌─────────────────────────────────────────────────┐
│  [Logo/Home]        [Search...]      [🌓] [👤]  │
└─────────────────────────────────────────────────┘
```

**Specs:**
- Fixed top, backdrop blur glass effect
- Height: 64px
- Search expands to full width overlay on click
- Theme toggle and profile are icon-only
- NO traditional nav links (Home, About, etc.)

### Search Overlay

**Trigger:** Click search in nav

**Design:**
```
┌─────────────────────────────────────────────────┐
│  [←]  Search countries...                  [×] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Recent                                         │
│  • 🇨🇦 Canada                                    │
│  • 🇩🇪 Germany                                   │
│                                                 │
│  Popular                                        │
│  • 🇬🇧 United Kingdom                            │
│  • 🇦🇺 Australia                                 │
│  • 🇨🇦 Canada                                    │
│                                                 │
│  All Countries (by region)                      │
│  Europe • North America • Asia • Africa         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Specs:**
- Full screen overlay with blur backdrop
- Instant search as you type
- Results grouped by region
- Click country → closes search + opens country drawer
- ESC to close

### Floating Action Elements

**Bottom Right: Quick Action Bubble**
```
[💬] ← Chat bubble (always visible)
[↑] ← Back to top (appears on scroll)
```

**Bottom Center: Progress Indicator** (when roadmap active)
```
┌────────────────────────┐
│ Your Progress: 6/10 ✓  │
│ ████████████░░░░  60%  │
└────────────────────────┘
```

---

## 📊 Roadmap Display Page

**URL:** `/?country=canada&roadmap=abc123` or dedicated `/roadmap/abc123`

**Layout:** Timeline view (default)

```
┌─────────────────────────────────────────────────┐
│  [←] Your Canada Roadmap          [⋮] Options   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Progress Overview (Left Sidebar)               │
│  ┌─────────────────┐                           │
│  │  Timeline       │      ●─────●─────●─────●  │
│  │  6 months       │     Step1  Step2  Step3   │
│  │                 │     (✓)    (⏳)   (🔒)    │
│  │  Budget         │                           │
│  │  $3,200/$10,000 │                           │
│  │  ██████░░░░     │                           │
│  │                 │                           │
│  │  [Export PDF]   │                           │
│  └─────────────────┘                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Step Cards (Expandable):**

Click step → Card expands with details:
```
┌─────────────────────────────────────────────────┐
│  ✓ Step 1: Research Universities                │
│     Estimated: 30 days | Cost: $0               │
├─────────────────────────────────────────────────┤
│  What to do:                                    │
│  • Research accredited universities             │
│  • Check admission requirements                 │
│  • Prepare target list                          │
│                                                 │
│  💡 Tips from Uncle Japa:                       │
│  "My guy, make sure the school dey accredited!  │
│  No carry your money go useless place..."       │
│                                                 │
│  [✓ Mark Complete] [✏️ Add Notes]               │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Component Design Patterns

### Cards (Multiple Variants)

**Glass Card:**
```typescript
<div className="backdrop-blur-xl bg-white/85 dark:bg-black/60 rounded-2xl p-6 border border-white/20 shadow-lg">
  {children}
</div>
```

**Data Card (For Stats):**
```typescript
<div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
  <div className="text-sm text-gray-500">Difficulty</div>
  <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
    6/10
  </div>
</div>
```

**Interactive Card (Hover Lift):**
```typescript
<motion.div
  className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer"
  whileHover={{ 
    y: -4, 
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)" 
  }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  {children}
</motion.div>
```

### Buttons

**Primary CTA:**
```typescript
<motion.button
  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Start Roadmap
</motion.button>
```

**Secondary:**
```typescript
<button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:border-gray-400 transition">
  Learn More
</button>
```

**Ghost:**
```typescript
<button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
  Cancel
</button>
```

### Inputs

**Search Input:**
```typescript
<div className="relative">
  <input
    type="text"
    placeholder="Search countries..."
    className="w-full pl-12 pr-4 py-3 rounded-full bg-white border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition"
  />
  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
</div>
```

**Slider (Custom):**
```typescript
<div className="relative w-full h-2 bg-gray-200 rounded-full">
  <motion.div
    className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
    style={{ width: `${(value / max) * 100}%` }}
  />
  <motion.div
    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-orange-500 rounded-full shadow-lg cursor-pointer"
    style={{ left: `${(value / max) * 100}%` }}
    drag="x"
    dragConstraints={containerRef}
    dragElastic={0}
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
  />
</div>
```

### Loading States

**Skeleton Loader:**
```typescript
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

**Spinner (Custom):**
```typescript
<motion.div
  className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full"
  animate={{ rotate: 360 }}
  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
/>
```

---

## 📱 Mobile Adaptations

### Mobile Navigation
- **Bottom tab bar** (not hamburger menu)
- **5 tabs:** Map, Search, Roadmap, Chat, Profile
- **Active indicator:** Colored icon + label
- **Smooth transitions** between tabs

### Mobile Map
- **Touch optimized:** Pinch to zoom, drag to pan
- **Larger touch targets** for countries
- **Simplified tooltips** (less info)

### Mobile Drawer
- **Full screen** on mobile (not side drawer)
- **Swipe down to close**
- **Bottom sheet style** for calculator/overlays

### Mobile Roadmap
- **Swipeable cards** (Tinder-style)
- **Swipe right:** Mark complete
- **Swipe left:** Skip
- **Long press:** View details

---

## ⚡ Performance Requirements

### Map Performance
- Lazy load country details
- Use simplified topology (110m, not 50m)
- Debounce zoom/pan events
- Virtual scrolling for country lists

### Animation Performance
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Reduce motion for users with `prefers-reduced-motion`

### Bundle Size
- Code split routes
- Lazy load heavy components (chat, calculator)
- Optimize images (WebP, lazy loading)
- Tree-shake unused libraries

---

## 🎭 Personality & Voice

### UI Copy Style
- **Friendly, not corporate:** "Let's find your perfect country" not "Select destination"
- **Encouraging:** "You're crushing it! 6 steps done" not "6/10 complete"
- **Context-aware:** "Moving to Canada? Here's what you need" not "Country details"

### Empty States
- **Helpful, not blank:** Show suggestions, not "No data"
- **Action-oriented:** Include a CTA to fix the empty state

### Error States
- **Human, not technical:** "Oops, couldn't load that" not "Error 404"
- **Provide next steps:** Always include a way forward

---

## 🚀 Implementation Priority

### Phase 1: Core Canvas (Week 1-2)
1. ✅ Map with D3 + country selection
2. ✅ Country drawer with basic info
3. ✅ URL state management
4. ✅ Mobile responsive layout

### Phase 2: Key Features (Week 3-4)
5. ✅ Cost calculator overlay
6. ✅ Roadmap generator wizard
7. ✅ Basic AI chat panel
8. ✅ Search overlay

### Phase 3: Polish (Week 5-6)
9. ✅ Animations & transitions
10. ✅ Dark mode
11. ✅ Loading states
12. ✅ Error handling

### Phase 4: Delight (Week 7-8)
13. ✅ Micro-interactions
14. ✅ Easter eggs
15. ✅ Onboarding tour
16. ✅ Celebration moments

---

## 🎯 Success Metrics

### User Experience
- **Time to first interaction:** < 2 seconds
- **Perceived performance:** Instant feedback on all actions
- **Mobile usability:** 100% touch-optimized

### Technical
- **Lighthouse score:** 95+ on all metrics
- **Bundle size:** < 300KB initial load
- **Animation FPS:** 60fps constant

### Design
- **Visual hierarchy:** Clear at all zoom levels
- **Accessibility:** WCAG AA compliant
- **Cross-browser:** Works on all modern browsers

---

## 🔥 Key Differentiators

What makes this different from other migration apps:

1. **Single canvas UX** - No page reloads, everything flows
2. **Map-first approach** - Visual exploration, not forms
3. **Contextual AI** - Help appears when you need it
4. **Data visualization** - Clean, Fiserv-style charts
5. **Progressive disclosure** - Never overwhelming
6. **Personality-driven** - AI guides with character
7. **Mobile-first** - Touch-optimized from the start

---

## 📝 Notes for Implementation

- Use Next.js 14 App Router (not Pages Router)
- Implement with TypeScript (strict mode)
- Use Tailwind CSS (no custom CSS files if possible)
- Framer Motion for all animations
- D3.js for map (not a heavy mapping library)
- NO localStorage (use URL state or server state)
- Optimistic UI updates everywhere
- Handle offline gracefully

---

**Remember:** This is a **single, continuous experience** centered around an interactive map. Every feature should feel like a natural extension of exploring the map, not a separate page or tool. The map is always home.