# Japaguide Frontend - Map-First Architecture

## 🎨 Overview

This is a Next.js 14 application built with a **single-canvas, map-first architecture**. The entire UI is centered around an interactive world map using D3.js, with progressive disclosure through layered overlays.

## ✅ Setup Complete

### Installed Dependencies
- ✅ Next.js 14 (App Router)
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS v4
- ✅ Headless UI (accessible components)
- ✅ Framer Motion (animations)
- ✅ D3.js + D3-Geo + TopoJSON (interactive map)
- ✅ Axios (API calls)
- ✅ Zustand (state management)

### Design System Configured
- ✅ Custom color palette (orange accents, blue data viz)
- ✅ Typography scale (Inter font, 9 sizes)
- ✅ Glassmorphism utilities
- ✅ Animation keyframes (fade, slide, scale)
- ✅ Dark mode support
- ✅ Custom scrollbar and focus styles

## 📂 Project Structure

```
client/
├── app/
│   ├── layout.tsx          # Root layout with Navbar
│   ├── page.tsx            # Home/landing page  
│   ├── globals.css         # Design tokens & utilities
│   └── explore/
│       └── page.tsx        # ⭐ Map-first experience
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Fixed top nav with search
│   │   └── SearchOverlay.tsx  # Full-screen country search
│   ├── features/
│   │   ├── map/
│   │   │   └── MapCanvas.tsx      # Layer 0: D3.js map
│   │   ├── country/
│   │   │   └── CountryDrawer.tsx  # Layer 1: Country details
│   │   ├── calculator/
│   │   │   └── CostCalculator.tsx # Layer 2: Cost overlay
│   │   ├── roadmap/
│   │   │   └── RoadmapWizard.tsx  # Layer 2: Roadmap wizard
│   │   └── chat/
│   │       └── ChatPanel.tsx      # Floating AI chat
│   └── ui/                # Headless UI components
│       ├── Button.tsx         # Accessible button
│       ├── Input.tsx          # Field with floating label
│       ├── Toggle.tsx         # Switch component
│       ├── Select.tsx         # Listbox dropdown
│       ├── RadioGroup.tsx     # Radio cards
│       ├── Dialog.tsx         # Modal/overlay
│       ├── Tabs.tsx           # Tab navigation
│       ├── Card.tsx           # Layout card
│       ├── Loading.tsx        # Spinners
│       └── index.ts           # Exports
├── lib/
│   ├── api.ts             # API client for Django backend
│   ├── services.ts        # Data fetching services
│   └── utils.ts           # Utility functions
└── stores/
    └── authStore.ts       # Zustand auth state
```

## 🗺️ The Map Experience (`/explore`)

### Layer System

**Layer 0 - Map Canvas** (Always visible)
- Interactive D3.js world map
- Countries colored by difficulty (blue scale)
- Hover: tooltips with country name
- Click: opens Country Drawer
- Filters panel (bottom-left): region, difficulty, cost

**Layer 1 - Country Drawer** (Slides from right)
- 420px width on desktop, full width on mobile
- Quick stats cards (difficulty, cost, time)
- Popular visa routes
- Action buttons:
  - Calculate Full Costs → Opens Cost Calculator
  - Generate Roadmap → Opens Roadmap Wizard  
  - Ask AI → Opens Chat Panel

**Layer 2 - Feature Overlays** (Modals/Full-screen)
- **Cost Calculator**: 2-column modal (inputs vs live results)
- **Roadmap Wizard**: Full-screen multi-step wizard
- **Chat Panel**: Draggable bottom panel (Uncle Japa AI)

### URL State Management

Every UI state is reflected in the URL for shareability:

```
/explore                          # Default map view
/explore?country=canada           # Map + Canada drawer
/explore?country=canada&action=calculate  # + Cost calculator
/explore?country=canada&action=roadmap    # + Roadmap wizard
/explore?country=canada&chat=true         # + Chat panel
```

## 🎨 Design System

### Colors

```css
/* Accents */
--accent-primary: #FF6B35;   /* Orange CTA */
--accent-secondary: #F7931E; /* Orange secondary */

/* Data Visualization (Map) */
--data-lowest: #E8F4F8;      /* Easiest countries */
--data-low: #B8D4E8;
--data-medium: #7BA7CC;
--data-high: #4A7BA7;
--data-highest: #2C4A6B;     /* Hardest countries */

/* Neutrals */
--bg-primary: #FAFAFA;       /* Main background */
--bg-secondary: #F5F5F5;     /* Cards */
--bg-tertiary: #EBEBEB;      /* Borders */
--text-primary: #1A1A1A;     /* Main text */
--text-secondary: #666666;   /* Secondary text */
--text-tertiary: #999999;    /* Disabled */
```

### Typography

- Font: **Inter** (sans-serif) for everything
- Sizes: `xs` (12px) → `5xl` (48px)
- Weights: 400 (body), 600 (headings), 700-800 (display)

### Animations

```css
.animate-fade-in      /* 0.3s fade */
.animate-slide-up     /* 0.4s slide from bottom */
.animate-slide-right  /* 0.35s slide from right */
.animate-scale-in     /* 0.2s scale + fade */
```

### Glassmorphism

```css
.glass              /* 8px blur, 85% white bg */
.glass-heavy        /* 12px blur (for modals) */
```

## 🎯 Headless UI Components

All UI components are built with `@headlessui/react` for full accessibility:

### Available Components

**Button** - Magnetic effect, 4 variants (primary, secondary, ghost, accent)
```tsx
<Button variant="primary" magnetic>Click Me</Button>
```

**Input** - Floating label, error states, descriptions
```tsx
<Input label="Email" type="email" error="Invalid" />
```

**Toggle** - Switch component with label and description
```tsx
<Toggle enabled={state} onChange={setState} label="Notifications" />
```

**Select** - Accessible dropdown with icons and search
```tsx
<Select value={val} onChange={set} options={[...]} />
```

**RadioGroup** - Beautiful radio cards with icons and descriptions
```tsx
<RadioGroup value={val} onChange={set} options={[...]} />
```

**Dialog** - Modal/overlay with sizes (sm, md, lg, xl, full)
```tsx
<Dialog isOpen={open} onClose={close} title="Hello">
  Content
</Dialog>
```

**Tabs** - Pills and underline variants
```tsx
<Tabs variant="pills" tabs={[{ label: 'Tab', content: <div /> }]} />
```

### Features
- ✅ Full keyboard navigation (Tab, Arrow keys, Enter, Escape)
- ✅ Screen reader support (ARIA labels)
- ✅ Focus management (visible focus rings)
- ✅ Framer Motion animations
- ✅ Custom design system styling
- ✅ TypeScript typed

### Demo
Visit `/components-demo` to see all components in action!

## 🔌 Backend Integration

The Django REST API is running at `http://127.0.0.1:8000/api/`

### API Endpoints Used

```typescript
// Countries
GET /api/countries/           # List all countries
GET /api/countries/:id/       # Country details
GET /api/visa-types/          # Visa types for country

// Cost Calculator
POST /api/cost-estimates/     # Calculate costs

// Roadmaps
POST /api/roadmaps/           # Generate roadmap
GET /api/roadmaps/:id/        # Get roadmap details

// AI Chat
POST /api/chat-conversations/ # Create conversation
POST /api/chat-messages/      # Send message

// Auth (optional)
POST /api/auth/register/      # Register user
POST /api/auth/login/         # JWT login
POST /api/auth/refresh/       # Refresh token
```

## 🚀 Running the Project

### Development

```bash
cd client
npm install
npm run dev
```

Visit:
- **Landing**: http://localhost:3000
- **Map Experience**: http://localhost:3000/explore

### Build for Production

```bash
npm run build
npm start
```

## 📱 Mobile Responsive

- Navbar: Collapsible on mobile
- Map: Touch-optimized (pinch zoom, drag)
- Country Drawer: Full-width on mobile
- Overlays: Stack vertically on small screens
- Chat Panel: Full height on mobile

## 🎯 Next Steps

### Phase 1: Core Functionality ✅
- [x] Design system setup
- [x] Headless UI components (Button, Input, Toggle, Select, RadioGroup, Dialog, Tabs)
- [x] Map canvas with D3.js
- [x] Country drawer
- [x] Cost calculator (updated with RadioGroup)
- [x] Roadmap wizard
- [x] Chat panel
- [x] Search overlay
- [x] Components showcase page

### Phase 2: API Integration (Next)
- [ ] Connect to Django backend
- [ ] Load real country data
- [ ] Implement cost calculations
- [ ] Generate roadmaps with AI
- [ ] Chat with DeepSeek AI
- [ ] User authentication (optional)

### Phase 3: Polish
- [ ] Add micro-interactions
- [ ] Loading states
- [ ] Error handling
- [ ] Animations refinement
- [ ] Performance optimization
- [ ] Accessibility (WCAG AA)

### Phase 4: Advanced Features
- [ ] Save roadmaps
- [ ] Progress tracking
- [ ] Document generation
- [ ] Success stories
- [ ] Community features

## 🎨 Design Philosophy

1. **Map is Home** - Everything starts from the map
2. **Progressive Disclosure** - Features reveal contextually
3. **Spatial Continuity** - Always know where you are
4. **Smooth Transitions** - Every state change is animated
5. **URL-Driven** - All states are shareable links

## 📚 Key Libraries

- **Headless UI**: Accessible, unstyled UI components
- **D3.js**: Map rendering, data visualization
- **Framer Motion**: Smooth animations
- **TopoJSON**: Simplified world topology
- **Zustand**: Lightweight state management
- **Axios**: HTTP client for API calls

## 🐛 Known Issues

- Map data loads from CDN (requires internet)
- Dark mode toggle doesn't persist (needs localStorage)
- Mobile gestures need refinement
- Some components are placeholders (will connect to API)

## 📝 Notes

- All components use `'use client'` for interactivity
- Map is lazy-loaded with `next/dynamic` for performance
- Suspense boundaries wrap async components
- TypeScript strict mode enabled
- Tailwind v4 uses `@theme inline` for custom tokens

---

**Last Updated**: December 1, 2025
**Status**: Core structure complete, ready for API integration
