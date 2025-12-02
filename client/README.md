# Japaguide Frontend

> A map-first, single-canvas migration guidance platform built with Next.js 14, D3.js, and Headless UI

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit:
- **Landing Page**: http://localhost:3000
- **Interactive Map**: http://localhost:3000/explore
- **Components Demo**: http://localhost:3000/components-demo

## 🎯 What's This?

Japaguide is a modern migration guidance platform with a unique **map-first UX**. Instead of traditional multi-page navigation, everything happens on a continuous canvas centered around an interactive world map.

### Key Features

✨ **Interactive D3.js World Map**
- Click countries to explore migration options
- Color-coded difficulty visualization
- Filter by region, cost, processing time

🗂️ **Progressive Disclosure**
- Layer 0: Map (always visible)
- Layer 1: Country drawer (slides from right)
- Layer 2: Feature overlays (calculator, roadmap, chat)

🎨 **Headless UI Components**
- Fully accessible (keyboard nav, screen readers)
- Custom-styled with your design system
- Smooth Framer Motion animations

🔗 **URL-Driven State**
- Every state is shareable via URL
- `/explore?country=canada&action=calculator`

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | Headless UI + Framer Motion |
| Map | D3.js + D3-Geo + TopoJSON |
| State | Zustand |
| API | Axios (Django REST backend) |

## 📂 Project Structure

```
client/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Design system
│   ├── explore/page.tsx        # Map experience ⭐
│   └── components-demo/page.tsx # UI showcase
│
├── components/
│   ├── ui/                     # Headless UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Toggle.tsx
│   │   ├── Select.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── Dialog.tsx
│   │   ├── Tabs.tsx
│   │   └── Loading.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx          # Top navigation
│   │   └── SearchOverlay.tsx   # Country search
│   │
│   └── features/
│       ├── map/MapCanvas.tsx          # D3.js map
│       ├── country/CountryDrawer.tsx  # Country details
│       ├── calculator/CostCalculator.tsx
│       ├── roadmap/RoadmapWizard.tsx
│       └── chat/ChatPanel.tsx
│
├── lib/
│   ├── api.ts                  # API client
│   ├── services.ts             # Data services
│   └── utils.ts                # Utilities
│
└── stores/
    └── authStore.ts            # Auth state
```

## 🎨 Components

### Headless UI Components

All components are built with `@headlessui/react` for accessibility:

```tsx
import { Button, Input, Toggle, Select, RadioGroup, Dialog } from '@/components/ui';

// Button with variants
<Button variant="primary" magnetic>Click Me</Button>

// Toggle Switch
<Toggle 
  enabled={state} 
  onChange={setState}
  label="Notifications"
  description="Receive updates"
/>

// Select Dropdown
<Select
  value={country}
  onChange={setCountry}
  options={[
    { value: 'jp', label: '🇯🇵 Japan', icon: '🗾' }
  ]}
/>

// Radio Group
<RadioGroup
  value={purpose}
  onChange={setPurpose}
  options={[
    { value: 'work', label: 'Work', icon: '💼' }
  ]}
/>

// Modal Dialog
<Dialog isOpen={open} onClose={close} title="Hello">
  Content here
</Dialog>
```

Visit `/components-demo` to see all components in action.

## 🗺️ The Map Experience

### URL Patterns

```
/explore                              # Default map
/explore?country=canada               # + Country drawer
/explore?country=canada&action=calculator # + Cost calculator
/explore?country=canada&action=roadmap    # + Roadmap wizard
/explore?country=canada&chat=true         # + Chat panel
```

### Layer System

**Layer 0: Map Canvas**
- Always visible, full screen
- D3.js choropleth map
- Click country → opens drawer

**Layer 1: Country Drawer**
- Slides from right (420px desktop)
- Stats, visa routes, action buttons
- Framer Motion animations

**Layer 2: Overlays**
- Cost Calculator (modal)
- Roadmap Wizard (full screen)
- Chat Panel (draggable)

## 🔌 Backend Integration

Backend: Django REST API at `http://127.0.0.1:8000/api/`

### API Endpoints

```typescript
// Countries
GET /api/countries/
GET /api/countries/:id/
GET /api/visa-types/

// Calculations
POST /api/cost-estimates/
POST /api/roadmaps/

// AI Chat
POST /api/chat-conversations/
POST /api/chat-messages/

// Auth
POST /api/auth/login/
POST /api/auth/register/
```

See `lib/api.ts` for client implementation.

## 🎨 Design System

### Colors

- **Accents**: Orange (`#FF6B35`, `#F7931E`)
- **Data Viz**: Blue scale (5 shades for difficulty)
- **Neutrals**: Gray scale for backgrounds

### Effects

- **Glassmorphism**: `.glass` and `.glass-heavy`
- **Shadows**: `shadow-glow-primary`, `shadow-float`
- **Animations**: Fade, slide, scale keyframes

### Typography

- Font: Inter (sans-serif)
- Scale: 9 sizes from `xs` (12px) to `5xl` (48px)
- Weights: 400, 600, 700, 800

## 📱 Responsive Design

- **Desktop**: Full map experience with side drawer
- **Tablet**: Adapted layouts, touch-optimized
- **Mobile**: Full-width drawers, stacked overlays

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_MAP_DATA_URL=https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
```

## 📚 Documentation

- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Detailed architecture docs
- [frontend_plan.md](../frontend_plan.md) - Original design spec

## 🐛 Troubleshooting

**Dev server won't start?**
```bash
# Kill existing processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
npm run dev
```

**TypeScript errors?**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Map not loading?**
- Check internet connection (map loads from CDN)
- Open browser console for errors

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

MIT

---

**Last Updated**: December 1, 2025
**Status**: ✅ Core structure complete with Headless UI
