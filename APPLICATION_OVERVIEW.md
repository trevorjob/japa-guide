# 🌍 Japaguide - Complete Application Overview

**Last Updated**: June 2025  
**Project Status**: Active Development (MVP Phase)  
**Tech Stack**: Django + Next.js + D3.js + OpenAI

---

## 📋 Table of Contents

1. [What is Japaguide?](#what-is-japaguide)
2. [Core Concept](#core-concept)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Backend Django Apps](#backend-django-apps)
6. [Frontend Pages & Components](#frontend-pages--components)
7. [Key Features](#key-features)
8. [Data Models](#data-models)
9. [API Endpoints](#api-endpoints)
10. [AI Integration](#ai-integration)
11. [Current Data Status](#current-data-status)
12. [Roadmap & Future Plans](#roadmap--future-plans)

---

## 🎯 What is Japaguide?

**Japaguide** is a migration companion web application designed to help people explore, plan, and execute their journey of moving to a new country. The name "Japa" comes from Nigerian slang meaning "to run/escape/emigrate" - capturing the spirit of seeking better opportunities abroad.

### Target Users
- **Primary**: Nigerians and other Africans exploring migration options
- **Secondary**: Anyone worldwide planning international relocation
- **Use Cases**: Study abroad, work visas, skilled migration, family reunification

### Core Value Proposition
1. **Explore**: Interactive world map to discover migration destinations
2. **Plan**: Generate personalized migration roadmaps
3. **Calculate**: Estimate total costs with hidden expense awareness
4. **Connect**: AI assistant (Japabot) with personality modes
5. **Learn**: Community stories from successful migrants

---

## 💡 Core Concept

### Anonymous-First Design
Unlike most apps, Japaguide is **fully functional without registration**. Users can:
- Explore all countries and visa information
- Generate migration roadmaps
- Use the cost calculator
- Chat with Japabot AI
- Save progress to browser session

Registration is **optional** - only needed when users want to:
- Permanently save their roadmaps
- Track progress across devices
- Share their migration story
- Claim premium features (future)

### The "Session → User" Pattern
```
Anonymous User → Redis Session → Generate Roadmap
                     ↓
              User Signs Up
                     ↓
              Claim Session Data → All roadmaps linked to account
```

---

## 🛠 Tech Stack

### Backend
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Django 4.2+ | Core backend logic |
| **API** | Django REST Framework | RESTful endpoints |
| **Database** | PostgreSQL (SQLite for dev) | Primary data storage |
| **Cache/Sessions** | Redis | Session storage, API caching |
| **Background Jobs** | Celery | AI enrichment, data sync |
| **AI Provider** | DeepSeek (OpenAI-compatible) | Chat, comparisons, enrichment |
| **Image Hosting** | Cloudinary | Flags, avatars, story covers |

### Frontend
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 14 (App Router) | React with SSR |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Maps** | D3.js + TopoJSON | Interactive world map |
| **Animations** | Framer Motion | Smooth UI transitions |
| **State** | Zustand | Auth state management |
| **HTTP Client** | Axios | API communication |

### Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Containerization** | Docker + docker-compose | Development & deployment |
| **Deployment** | Railway/Render/Fly.io | Cloud hosting |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Next.js 14                            │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐        │  │
│  │  │ Explore │ │ Roadmap  │ │ Calc   │ │ Stories │        │  │
│  │  │  (Map)  │ │ Builder  │ │        │ │         │        │  │
│  │  └────┬────┘ └────┬─────┘ └───┬────┘ └────┬────┘        │  │
│  │       │           │           │           │              │  │
│  │       └───────────┴───────────┴───────────┘              │  │
│  │                       │                                   │  │
│  │              ┌────────▼────────┐                         │  │
│  │              │   API Service   │  (Axios)                │  │
│  │              └────────┬────────┘                         │  │
│  └───────────────────────┼──────────────────────────────────┘  │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Django + DRF                             │  │
│  │                                                           │  │
│  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │  │
│  │  │ users  │ │ countries│ │  visas   │ │   roadmaps    │ │  │
│  │  └────────┘ └──────────┘ └──────────┘ └───────────────┘ │  │
│  │                                                           │  │
│  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │  │
│  │  │   ai   │ │   docs   │ │   maps   │ │    stories    │ │  │
│  │  └────────┘ └──────────┘ └──────────┘ └───────────────┘ │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│              │              │                 │                  │
│              ▼              ▼                 ▼                  │
│  ┌──────────────┐   ┌─────────────┐   ┌──────────────┐         │
│  │  PostgreSQL  │   │    Redis    │   │   DeepSeek   │         │
│  │  (Database)  │   │ (Cache+Jobs)│   │    (AI)      │         │
│  └──────────────┘   └─────────────┘   └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Celery                               │  │
│  │              (Background AI Enrichment)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Backend Django Apps

### 1. `core` - Common Utilities
- Base settings and configuration
- Utility functions
- Common mixins and base classes

### 2. `users` - Authentication & Profiles
**Models:**
- `User` - Extended Django user with:
  - `country_of_origin`, `current_country`
  - `plan_type` (free/pro/enterprise)
  - `ai_credits_remaining`
- `UserProfile` - Detailed profile for personalization:
  - Education level, field of study
  - Years of experience, current job
  - Budget, savings, target move date
  - Skills, languages, dependents

**Key Features:**
- JWT authentication (SimpleJWT)
- Session claiming for anonymous users
- Profile-based roadmap personalization

### 3. `countries` - Country Data
**Models:**
- `Country` - Comprehensive country data:
  - Basic: code, name, region, currency, population
  - Cost: cost_of_living_index, avg_rent, avg_meal_cost
  - Migration: refugees_in, refugees_out, net_migration
  - Economic: gdp_per_capita, unemployment_rate (mostly empty)
  - Quality: data_quality_score, needs_review flags

**Data Sources:**
- REST Countries API (basic info)
- UNHCR Refugee API (migration data)
- Manual seed data (33 countries with summaries)

### 4. `visas` - Visa Information
**Models:**
- `VisaType` - Visa programs per country:
  - Name, description, category
  - Processing time (min/max weeks)
  - Cost estimates (min/max)
  - Requirements, benefits, restrictions (JSON)
  - Success rate, renewable flag
- `VisaStep` - Application steps:
  - Order, title, description
  - Estimated time and cost
  - Tips and common pitfalls

### 5. `roadmaps` - Migration Planning
**Models:**
- `Roadmap` - Generated migration plan:
  - Can be linked to user OR session_id
  - Country, visa_type, goal
  - Profile snapshot at generation time
  - AI tone selection
- `RoadmapStep` - Individual steps:
  - Title, description, order
  - Time and cost estimates
  - AI enhancement text
- `RoadmapStepStatus` - Progress tracking:
  - Completed flag, completion date
  - Blocked flag with reason
  - User notes

### 6. `ai` - AI Integration
**Models:**
- `PromptTemplate` - Reusable AI prompts:
  - Name, template text (Jinja2)
  - Temperature, max_tokens
  - Tone (helpful, uncle_japa, bestie, etc.)
- `AIRequest` - Logging and analytics:
  - Prompt, response, tokens used
  - Cost tracking

**Service Features:**
- Personality system with 6 tones
- Response caching (1 hour)
- Cost tracking (DeepSeek pricing)

### 7. `docs` - Document Generation (Phase 2)
**Models:**
- `DocumentTemplate` - CV, cover letter templates
- `GeneratedDocument` - User-created documents
  - Supports both users and anonymous sessions

### 8. `maps` - Geographic Points (Phase 2)
**Models:**
- `GeoPoint` - Points of interest:
  - Embassies, universities, hospitals
  - Lat/lng coordinates
  - Contact info, metadata

### 9. `stories` - Japa Journal (Phase 2)
**Models:**
- `Story` - User migration stories:
  - Author, title, content
  - Country relation
  - Tags (student, work, family)
  - Moderation (approved, featured)
  - Engagement (views, likes)

### 10. `admin_tools` - Data Management
- CSV importers
- Manual data update utilities
- Admin customizations

---

## 🖥 Frontend Pages & Components

### Pages (`/client/app/`)

#### 1. **Home** (`/`)
- Landing page with animated hero
- Rotating country names
- Feature highlights
- Call-to-action sections

#### 2. **Explore** (`/explore`)
- **Interactive D3.js World Map**
  - Color-coded by difficulty score
  - Hover highlighting with animations
  - Click to select country
- **Map Filters**
  - Region filter
  - Difficulty range slider
  - Search by country name
- **Country Drawer**
  - Sliding panel with country details
  - Tabs: Overview, Visas, Stats
  - Quick actions: Generate roadmap, Calculate costs

#### 3. **Roadmap** (`/roadmap`)
- Roadmap generation form
- Step-by-step display
- Progress tracking
- Export options

#### 4. **Calculator** (`/calculator`)
- Cost estimation form
- Breakdown visualization
- Savings plan generator
- Hidden costs awareness

#### 5. **Stories** (`/stories`)
- Story listing with filters
- Individual story pages
- Submission form

#### 6. **Auth** (`/login`, `/register`)
- JWT-based authentication
- Optional registration
- Session claiming

### Key Components (`/client/components/features/`)

```
features/
├── calculator/
│   └── CostCalculator.tsx      # Full cost estimation UI
├── chat/
│   └── ChatPanel.tsx           # Japabot chat interface
├── country/
│   └── CountryDrawer.tsx       # Slide-out country details
├── map/
│   ├── MapCanvas.tsx           # D3.js map rendering (827 lines)
│   └── MapFilters.tsx          # Filter controls
├── roadmap/
│   └── [components]            # Roadmap UI components
└── visa/
    └── [components]            # Visa display components
```

---

## ✨ Key Features

### 1. 🗺 Interactive World Map
**Tech**: D3.js + TopoJSON + Framer Motion

- Pan and zoom navigation
- Color-coded difficulty scores
- Smooth hover animations
- Country selection with drawer
- Region filtering

**Recent Optimizations** (see MAP_ANIMATION_FIXES.md):
- Separated selectedCountry handling
- Render key tracking to prevent re-renders
- All-countries cache for color reset

### 2. 📋 Roadmap Generator
**Flow**:
```
User selects country → Chooses goal (study/work/etc) → 
Provides profile info → Selects AI tone →
System generates deterministic steps from visa data →
Celery queues AI enrichment → Steps get personalized tips
```

**Personality Modes**:
| Tone | Style |
|------|-------|
| `helpful` | Professional, warm |
| `uncle_japa` | Nigerian pidgin, real talk |
| `bestie` | Gen-Z slang, supportive |
| `strict_officer` | Formal, bureaucratic |
| `hype_man` | ALL CAPS ENTHUSIASM! 🔥 |
| `therapist` | Gentle, validating |

### 3. 💰 Cost Calculator
**Inputs**:
- Country & city
- Visa type & duration
- Number of dependents
- Custom costs (flights, tuition, etc.)

**Outputs**:
- Total estimated cost
- Detailed breakdown by category
- Hidden costs warnings
- Monthly breakdown
- Savings plan (aggressive/relaxed)
- Comparison with typical range

### 4. 🤖 Japabot AI Assistant
**Capabilities**:
- Answer migration questions
- Country comparisons
- Personalized advice
- Roadmap enrichment
- Document writing assistance

**Technical**:
- DeepSeek API (OpenAI-compatible)
- Prompt templates with Jinja2
- Response caching
- Cost tracking

### 5. 📚 Migration Stories (Phase 2)
- User-submitted success stories
- Country-tagged
- Moderation system
- Featured/trending stories

---

## 📊 Data Models

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │  Country    │       │  VisaType   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │◄──────┤ country_id  │
│ username    │       │ code        │       │ name        │
│ email       │       │ name        │       │ description │
│ full_name   │       │ region      │       │ requirements│
│ plan_type   │       │ summary     │       │ cost_min    │
│ ai_credits  │       │ difficulty  │       │ cost_max    │
└──────┬──────┘       │ cost_index  │       └──────┬──────┘
       │              └──────┬──────┘              │
       │                     │                     │
       ▼                     │                     ▼
┌─────────────┐              │              ┌─────────────┐
│ UserProfile │              │              │  VisaStep   │
├─────────────┤              │              ├─────────────┤
│ user_id     │              │              │ visa_type_id│
│ education   │              │              │ order       │
│ budget      │              │              │ title       │
│ skills      │              │              │ description │
│ languages   │              ▼              │ tips        │
└─────────────┘       ┌─────────────┐       └─────────────┘
                      │  Roadmap    │
       ┌──────────────┤             │◄─────────────┐
       │              ├─────────────┤              │
       │              │ user_id     │              │
       ▼              │ session_id  │              │
┌─────────────┐       │ country_id  │       ┌─────────────┐
│   Story     │       │ visa_type_id│       │RoadmapStep  │
├─────────────┤       │ goal        │       ├─────────────┤
│ author_id   │       │ ai_tone     │       │ roadmap_id  │
│ country_id  │       └─────────────┘       │ order       │
│ title       │                             │ title       │
│ content     │                             │ ai_enhanced │
│ approved    │                             └──────┬──────┘
└─────────────┘                                    │
                                                   ▼
                                            ┌──────────────┐
                                            │StepStatus    │
                                            ├──────────────┤
                                            │ step_id      │
                                            │ completed    │
                                            │ blocked      │
                                            │ notes        │
                                            └──────────────┘
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Create account |
| POST | `/api/v1/auth/login/` | Get JWT tokens |
| POST | `/api/v1/auth/refresh/` | Refresh token |
| GET | `/api/v1/auth/me/` | Current user |
| POST | `/api/v1/auth/claim-session/` | Claim anonymous data |

### Countries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/countries/` | List all (with filters) |
| GET | `/api/v1/countries/{code}/` | Country detail |
| POST | `/api/v1/countries/{code}/calculate-cost/` | Cost calculation |

### Visas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/visas/` | List visas (filter by country) |
| GET | `/api/v1/visas/{id}/` | Visa detail with steps |

### Roadmaps
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/roadmaps/generate/` | Generate new roadmap |
| GET | `/api/v1/roadmaps/` | List user's roadmaps |
| GET | `/api/v1/roadmaps/{id}/` | Roadmap detail |
| POST | `/api/v1/roadmaps/{id}/steps/{step_id}/complete/` | Mark step done |
| POST | `/api/v1/roadmaps/{id}/steps/{step_id}/block/` | Mark step blocked |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/chat/` | Chat with Japabot |
| POST | `/api/v1/ai/compare/` | Compare countries |

### Phase 2
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/docs/` | Document templates |
| GET/POST | `/api/v1/maps/` | Geographic points |
| GET/POST | `/api/v1/stories/` | Migration stories |

---

## 🤖 AI Integration

### Provider: DeepSeek
- OpenAI-compatible API
- Much cheaper than GPT-4 (~$0.21/1M tokens)
- Used for: chat, comparisons, roadmap enrichment

### Personality System
```python
PERSONALITY_INTROS = {
    'helpful': "Hi! I'm Japabot, your friendly migration guide.",
    'uncle_japa': "Ah ah! Uncle Japa here o! My guy/my sister, how far?",
    'bestie': "Heyyyy bestie! 💅 Your japa bestie is here!",
    'strict_officer': "Good day. Immigration Officer speaking.",
    'hype_man': "YOOOOO! LET'S GOOOO! 🔥🔥🔥",
    'therapist': "Hello, I'm here to support you through this journey."
}
```

### Caching Strategy
- Response cache: 1 hour (Redis)
- Cache key: MD5 hash of prompt
- Reduces costs for common questions

---

## 📈 Current Data Status

### Summary (from COUNTRY_DATA_AUDIT.md)

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Countries | 196 | 100% |
| With Summary | 33 | 17% |
| With GDP Data | 0 | 0% |
| With Visa Types | ~3 | 2% |
| Total Visa Types | 6 | - |

### Data Quality Issues
1. **Manually seeded data** (33 countries) has **invented numbers**
2. **difficulty_score** calculated from flawed heuristics
3. **No economic data** (GDP, unemployment, etc.)
4. **Minimal visa information** (only Canada, USA, Germany)
5. **UNHCR data** only covers refugees, not general migration

### Priority for RAG Implementation
Before implementing RAG (Retrieval-Augmented Generation), data quality must improve:
- Country summaries for all 196 countries
- Accurate visa information for top 50 destinations
- Real economic data from World Bank API
- Quality scores and source tracking

See: [COUNTRY_DATA_AUDIT.md](./COUNTRY_DATA_AUDIT.md)

---

## 🚀 Roadmap & Future Plans

### Phase 1 (Current - MVP)
- [x] Interactive world map
- [x] Basic country data display
- [x] Roadmap generation
- [x] Cost calculator
- [x] AI chat integration
- [x] Anonymous user support
- [ ] **Data quality improvement** ← Current Focus
- [ ] RAG implementation

### Phase 2 (Coming Soon)
- [ ] Document builder (CV, cover letters)
- [ ] Geographic points of interest
- [ ] Migration stories/journal
- [ ] Community features

### Phase 3 (Future)
- [ ] Premium tier with advanced features
- [ ] Mobile app
- [ ] Embassy appointment tracking
- [ ] Visa application status integration
- [ ] Community networking

### Monetization Plans
- **Free tier**: 10 AI credits, basic features
- **Pro tier**: Unlimited AI, advanced roadmaps
- **Enterprise**: API access, bulk tools

---

## 🔗 Related Documentation

- [COUNTRY_DATA_AUDIT.md](./COUNTRY_DATA_AUDIT.md) - Detailed data quality analysis
- [MAP_ANIMATION_FIXES.md](./MAP_ANIMATION_FIXES.md) - Frontend optimization history
- [plan.md](./plan.md) - Original technical specification
- [server/README.md](./server/README.md) - Backend setup guide
- [client/README.md](./client/README.md) - Frontend setup guide

---

*Document created: June 2025*  
*Project: Japaguide - Your Migration Companion*
