# 🗺️ Frontend Integration Roadmap

> **Goal**: Connect the map-first frontend to the Django backend, ensuring each feature works seamlessly from UI → API → Database.

## 📊 Current Status

### ✅ What Works
- **Frontend**: All UI components built with Headless UI + Framer Motion
- **Backend**: Phase 1 & 2 complete - 30+ Django REST endpoints
- **Design System**: Tailwind CSS v4 with glassmorphism and custom tokens
- **Architecture**: Single-canvas map-first experience ready

### 🔄 What Needs Work
- **No API integration** - Frontend has mock data only
- **Map not loading real data** - Need to connect to `/api/v1/countries/`
- **Features incomplete** - Calculator, roadmap, chat UI exists but not wired up
- **Session management** - Anonymous-first flow not implemented on frontend

---

## 🎯 Phase-by-Phase Roadmap

### **PHASE 1: Map Foundation** (Priority: CRITICAL)
*Goal: Get the interactive map working with real country data*

#### 1.1 - Connect MapCanvas to Countries API
- **File**: `client/components/features/map/MapCanvas.tsx`
- **Backend Endpoint**: `GET /api/v1/countries/`
- **Tasks**:
  - [ ] Fetch all countries with `difficulty_score`, `code`, `name`
  - [ ] Map `difficulty_score` (1-10) to color scale (blue gradient)
  - [ ] Implement country click handler → update URL with `?country={code}`
  - [ ] Add loading spinner while fetching
  - [ ] Handle errors gracefully
- **Data Structure**:
  ```typescript
  interface CountryMapData {
    code: string;           // ISO code (e.g., "CAN")
    name: string;           // "Canada"
    difficulty_score: number; // 1-10
    region: string;         // "North America"
  }
  ```
- **API Call**:
  ```typescript
  import { getCountries } from '@/lib/services';
  const countries = await getCountries({ fields: 'code,name,difficulty_score,region' });
  ```

#### 1.2 - Implement Map Filters Panel
- **File**: `client/components/features/map/MapFilters.tsx` (NEW)
- **Backend Endpoint**: `GET /api/v1/countries/?region={region}&difficulty_min={min}&difficulty_max={max}`
- **Tasks**:
  - [ ] Create floating panel (bottom-left of map)
  - [ ] Add region filter (Select component: All, Europe, Asia, Americas, Africa, Oceania)
  - [ ] Add difficulty slider (RadioGroup: Easy 1-3, Medium 4-6, Hard 7-10, All)
  - [ ] Add cost range filter (Toggle: Affordable <$20k, Moderate $20k-50k, High >$50k)
  - [ ] Update map when filters change
- **UI Components**: `Select`, `RadioGroup`, `Toggle` from `@/components/ui`

#### 1.3 - Add Map Tooltips on Hover
- **File**: `client/components/features/map/MapCanvas.tsx`
- **Tasks**:
  - [ ] Show country name on hover
  - [ ] Show difficulty badge (Easy/Medium/Hard)
  - [ ] Position tooltip near cursor
  - [ ] Add fade-in animation
- **Design**: Glassmorphism card with `class="glass text-sm"`

---

### **PHASE 2: Country Details Drawer** (Priority: HIGH)
*Goal: Display rich country information when user clicks a country*

#### 2.1 - Wire Up CountryDrawer
- **File**: `client/components/features/country/CountryDrawer.tsx`
- **Backend Endpoint**: `GET /api/v1/countries/{code}/`
- **Tasks**:
  - [ ] Fetch full country details when URL has `?country={code}`
  - [ ] Display hero image, flag, summary
  - [ ] Show quick stats cards (difficulty, avg cost, processing time)
  - [ ] List popular visa routes from `/api/v1/visas/?country={code}`
  - [ ] Add close button → remove `?country` from URL
- **Data Structure**:
  ```typescript
  interface CountryDetail {
    code: string;
    name: string;
    region: string;
    currency: string;
    summary: string;
    flag_image: string;
    hero_image: string;
    difficulty_score: number;
    avg_rent_monthly_usd: string;
    avg_meal_cost_usd: string;
    healthcare_monthly_usd: string;
    cost_of_living_index: number;
  }
  ```

#### 2.2 - Display Visa Routes
- **File**: `client/components/features/country/VisaRoutes.tsx` (NEW)
- **Backend Endpoint**: `GET /api/v1/visas/?country={code}`
- **Tasks**:
  - [ ] Fetch visa types for selected country
  - [ ] Display as cards with icon (work/study/family), name, processing time
  - [ ] Click visa → open modal with detailed steps
  - [ ] Show difficulty indicator (Easy/Medium/Hard)
- **Data Structure**:
  ```typescript
  interface VisaType {
    id: number;
    name: string;
    category: 'work' | 'study' | 'family' | 'other';
    processing_time_days: number;
    base_cost_usd: string;
    requirements: string;
  }
  ```

#### 2.3 - Action Buttons Integration
- **File**: `client/components/features/country/CountryDrawer.tsx`
- **Tasks**:
  - [ ] "Calculate Full Costs" → Add `?action=calculate` to URL
  - [ ] "Generate Roadmap" → Add `?action=roadmap` to URL
  - [ ] "Ask AI" → Add `?chat=true` to URL
  - [ ] All actions keep `?country={code}` in URL

---

### **PHASE 3: Cost Calculator** (Priority: HIGH)
*Goal: Real-time cost estimation with backend calculations*

#### 3.1 - Connect Calculator to Backend
- **File**: `client/components/features/calculator/CostCalculator.tsx`
- **Backend Endpoint**: `POST /api/v1/roadmaps/calc/estimate/`
- **Tasks**:
  - [ ] Collect inputs: country, visa_type, purpose, budget, dependents
  - [ ] Send POST request on "Calculate" button
  - [ ] Display results in right column (visa fees, living costs, hidden costs, savings plan)
  - [ ] Add loading state during calculation
  - [ ] Handle errors (e.g., invalid inputs)
- **Request Body**:
  ```typescript
  interface CostEstimateRequest {
    country: string;          // "CAN"
    visa_type_id: number;     // 1
    purpose: string;          // "work"
    budget?: number;          // 25000
    dependents?: number;      // 0
  }
  ```
- **Response**:
  ```typescript
  interface CostEstimate {
    total_cost_usd: string;
    breakdown: {
      visa_fees: string;
      living_costs: string;
      hidden_costs: string;
      emergency_fund: string;
    };
    savings_plan: {
      monthly_target: string;
      months_needed: number;
    };
  }
  ```

#### 3.2 - Add Visa Type Selection
- **File**: `client/components/features/calculator/CostCalculator.tsx`
- **Tasks**:
  - [ ] Fetch visa types for selected country
  - [ ] Use `Select` component for visa type picker
  - [ ] Show base cost preview when visa type selected
  - [ ] Pre-select first visa type if only one available

---

### **PHASE 4: Roadmap Generation** (Priority: HIGH)
*Goal: AI-powered migration roadmap wizard*

#### 4.1 - Build Roadmap Wizard Flow
- **File**: `client/components/features/roadmap/RoadmapWizard.tsx`
- **Backend Endpoint**: `POST /api/v1/roadmaps/generate/`
- **Tasks**:
  - [ ] Step 1: Select country (if not already in URL)
  - [ ] Step 2: Select visa type
  - [ ] Step 3: Choose AI personality (uncle_japa, helpful, bestie, brutally_honest, meme_lord, motivational)
  - [ ] Step 4: Add context (current situation, timeline, budget)
  - [ ] Step 5: Generate roadmap (show loading with personality-based messages)
  - [ ] Step 6: Display roadmap with steps, timelines, costs
- **Request Body**:
  ```typescript
  interface RoadmapGenerateRequest {
    country: string;          // "CAN"
    goal: string;             // "work"
    ai_tone?: string;         // "uncle_japa"
    context?: string;         // "I'm a software developer..."
    session_id?: string;      // For anonymous users
  }
  ```
- **Response**:
  ```typescript
  interface Roadmap {
    id: number;
    country: string;
    goal: string;
    status: 'active' | 'completed' | 'abandoned';
    steps: RoadmapStep[];
    total_cost_estimate_usd: string;
    timeline_months: number;
  }
  
  interface RoadmapStep {
    id: number;
    title: string;
    description: string;
    order: number;
    timeline_estimate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  }
  ```

#### 4.2 - Display Generated Roadmap
- **File**: `client/components/features/roadmap/RoadmapView.tsx` (NEW)
- **Tasks**:
  - [ ] Show roadmap as vertical timeline
  - [ ] Each step is a card with title, description, timeline, cost
  - [ ] Add checkboxes to mark steps complete → `PATCH /api/v1/roadmaps/{id}/steps/{step_id}/`
  - [ ] Show overall progress bar
  - [ ] Add "Save Roadmap" button (creates account if anonymous)

#### 4.3 - Personality Selection UI
- **File**: `client/components/features/roadmap/PersonalityPicker.tsx` (NEW)
- **Tasks**:
  - [ ] Create `RadioGroup` with 6 personality options
  - [ ] Each option has icon, name, description, sample quote
  - [ ] Personalities:
    - **helpful**: Professional, detailed guidance
    - **uncle_japa**: Nigerian humor, cultural context
    - **bestie**: Casual, supportive friend
    - **brutally_honest**: Direct, no-nonsense advice
    - **meme_lord**: Internet humor, relatable
    - **motivational**: Inspirational, encouraging

---

### **PHASE 5: AI Chat Panel** (Priority: MEDIUM)
*Goal: Conversational AI assistant for migration questions*

#### 5.1 - Implement Chat UI
- **File**: `client/components/features/chat/ChatPanel.tsx`
- **Backend Endpoint**: `POST /api/v1/ai/chat/`
- **Tasks**:
  - [ ] Floating panel (bottom-right, draggable)
  - [ ] Message history (user messages vs AI responses)
  - [ ] Input field with "Ask Uncle Japa" placeholder
  - [ ] Send button (disabled while loading)
  - [ ] Auto-scroll to latest message
  - [ ] Personality selector at top
- **Request Body**:
  ```typescript
  interface ChatRequest {
    message: string;
    country?: string;         // Context from URL
    conversation_id?: number; // For follow-up messages
    tone?: string;            // "uncle_japa"
    session_id?: string;      // Anonymous tracking
  }
  ```
- **Response**:
  ```typescript
  interface ChatResponse {
    response: string;
    conversation_id: number;
    tokens_used: number;
  }
  ```

#### 5.2 - Add Chat Context Awareness
- **File**: `client/components/features/chat/ChatPanel.tsx`
- **Tasks**:
  - [ ] Auto-inject country from URL (`?country=CAN`) into chat context
  - [ ] Show "Currently discussing: Canada" badge
  - [ ] Clear chat when country changes
  - [ ] Persist chat history in localStorage (session-based)

#### 5.3 - Compare Countries Feature
- **File**: `client/components/features/chat/CountryComparison.tsx` (NEW)
- **Backend Endpoint**: `POST /api/v1/ai/compare/`
- **Tasks**:
  - [ ] Add "Compare Countries" button in chat
  - [ ] Select 2-3 countries to compare
  - [ ] Send request with country codes
  - [ ] Display side-by-side comparison table
  - [ ] Include difficulty, cost, visa options, pros/cons
- **Request Body**:
  ```typescript
  interface CompareRequest {
    country_codes: string[];  // ["CAN", "AUS", "UK"]
    tone?: string;
  }
  ```

---

### **PHASE 6: Session & Auth Management** (Priority: MEDIUM)
*Goal: Anonymous-first flow with seamless account creation*

#### 6.1 - Implement Session ID Tracking
- **File**: `client/lib/session.ts` (NEW)
- **Tasks**:
  - [ ] Generate UUID for new visitors (store in localStorage)
  - [ ] Send `session_id` with all roadmap/chat requests
  - [ ] Check session status: `GET /api/v1/auth/session/status/`
  - [ ] Show banner: "You're browsing anonymously. Create account to save progress."

#### 6.2 - Session Claim Flow
- **File**: `client/components/auth/SessionClaimBanner.tsx` (NEW)
- **Backend Endpoint**: `POST /api/v1/auth/claim-session/`
- **Tasks**:
  - [ ] Show banner after user generates roadmap or chats
  - [ ] "Save Your Progress" button → open registration modal
  - [ ] After registration, claim session with `session_id`
  - [ ] Migrate all roadmaps, chats to user account
  - [ ] Hide banner after successful claim

#### 6.3 - Login/Register UI
- **Files**: `client/app/login/page.tsx`, `client/app/register/page.tsx` (Already exist)
- **Backend Endpoints**: 
  - `POST /api/v1/auth/register/`
  - `POST /api/v1/auth/login/`
- **Tasks**:
  - [ ] Wire up registration form (email, password, confirm password)
  - [ ] Wire up login form (email, password)
  - [ ] Store JWT tokens in `authStore` (Zustand)
  - [ ] Redirect to `/explore` after login
  - [ ] Show error messages (e.g., "Email already exists")

---

### **PHASE 7: User Dashboard** (Priority: LOW)
*Goal: Manage saved roadmaps, chat history, profile*

#### 7.1 - My Roadmaps Page
- **File**: `client/app/dashboard/roadmaps/page.tsx` (NEW)
- **Backend Endpoint**: `GET /api/v1/roadmaps/`
- **Tasks**:
  - [ ] List all user's roadmaps (active, completed, abandoned)
  - [ ] Each roadmap card shows country, goal, progress %
  - [ ] Click roadmap → open full view with steps
  - [ ] Add "Continue Roadmap" button → `/explore?roadmap={id}`
  - [ ] Add "Archive" and "Delete" actions

#### 7.2 - Chat History
- **File**: `client/app/dashboard/chats/page.tsx` (NEW)
- **Backend Endpoint**: `GET /api/v1/ai/conversations/` (Need to create endpoint)
- **Tasks**:
  - [ ] List all chat conversations
  - [ ] Show preview of last message
  - [ ] Click conversation → open in chat panel
  - [ ] Add search/filter by country

#### 7.3 - Profile Settings
- **File**: `client/app/dashboard/profile/page.tsx` (NEW)
- **Backend Endpoint**: `GET /api/v1/auth/me/`, `PATCH /api/v1/users/profile/`
- **Tasks**:
  - [ ] Display user info (email, name, joined date)
  - [ ] Edit profile (name, bio, avatar)
  - [ ] Change password
  - [ ] Delete account

---

### **PHASE 8: Stories & Community** (Priority: LOW)
*Goal: User-generated migration stories*

#### 8.1 - Stories Feed
- **File**: `client/app/stories/page.tsx` (Already exists, needs wiring)
- **Backend Endpoint**: `GET /api/v1/stories/`
- **Tasks**:
  - [ ] Fetch approved stories
  - [ ] Display as cards (title, excerpt, country, author)
  - [ ] Filter by country, visa type, status (planning, in_progress, completed)
  - [ ] Click story → open full view

#### 8.2 - Create Story
- **File**: `client/app/stories/new/page.tsx` (NEW)
- **Backend Endpoint**: `POST /api/v1/stories/`
- **Tasks**:
  - [ ] Form: country, visa type, status, title, content (rich text)
  - [ ] Add images (Cloudinary upload)
  - [ ] Submit for moderation
  - [ ] Show "Pending approval" message

---

### **PHASE 9: Document Generation** (Priority: LOW)
*Goal: AI-generated documents (CV, cover letter, SOP)*

#### 9.1 - Document Templates
- **File**: `client/app/documents/page.tsx` (NEW)
- **Backend Endpoint**: `GET /api/v1/docs/templates/`
- **Tasks**:
  - [ ] List available templates (CV, Cover Letter, SOP)
  - [ ] Show preview of template
  - [ ] Click template → open document builder

#### 9.2 - Document Builder
- **File**: `client/app/documents/create/page.tsx` (NEW)
- **Backend Endpoint**: `POST /api/v1/docs/generate/`
- **Tasks**:
  - [ ] Multi-step form for document inputs
  - [ ] Preview document live
  - [ ] Generate PDF/DOCX
  - [ ] Download or save to account

---

### **PHASE 10: Maps & POI** (Priority: LOW)
*Goal: Show embassies, universities, etc. on map*

#### 10.1 - POI Layer on Map
- **File**: `client/components/features/map/MapCanvas.tsx`
- **Backend Endpoint**: `GET /api/v1/maps/?country={code}`
- **Tasks**:
  - [ ] Fetch POIs for selected country
  - [ ] Add markers to D3 map (embassy icons, university icons)
  - [ ] Click marker → show POI details tooltip
  - [ ] Filter POIs by type (embassy, university, hospital)

---

## 🛠️ Development Workflow

### Step-by-Step Process for Each Feature:

1. **Read Backend Docs**
   - Check `server/README.md` for endpoint details
   - Review `server/{app}/models.py` for data structure
   - Test endpoint with curl/Postman

2. **Update `lib/services.ts`**
   - Add service function for new endpoint
   - Handle request/response types
   - Add error handling

3. **Update Component**
   - Import service function
   - Add `useEffect` or `onClick` handler
   - Manage loading/error states
   - Update UI with real data

4. **Test Integration**
   - Start Django backend: `cd server && docker-compose up`
   - Start Next.js frontend: `cd client && npm run dev`
   - Test feature in browser
   - Check console for errors

5. **Update Documentation**
   - Mark task as complete in roadmap
   - Update `SETUP_COMPLETE.md` if needed
   - Add notes about any quirks

---

## 📋 Quick Reference

### Backend Base URL
```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

### Key Endpoints Summary

| Feature | Method | Endpoint | Auth Required |
|---------|--------|----------|---------------|
| Countries List | GET | `/countries/` | ❌ |
| Country Detail | GET | `/countries/{code}/` | ❌ |
| Visa Types | GET | `/visas/?country={code}` | ❌ |
| Generate Roadmap | POST | `/roadmaps/generate/` | ❌ (session) |
| Cost Estimate | POST | `/roadmaps/calc/estimate/` | ❌ |
| AI Chat | POST | `/ai/chat/` | ❌ (session) |
| Compare Countries | POST | `/ai/compare/` | ❌ |
| Register | POST | `/auth/register/` | ❌ |
| Login | POST | `/auth/login/` | ❌ |
| Claim Session | POST | `/auth/claim-session/` | ✅ |
| Stories List | GET | `/stories/` | ❌ |
| Create Story | POST | `/stories/` | ✅ |
| Generate Doc | POST | `/docs/generate/` | ❌ (session) |
| POI List | GET | `/maps/?country={code}` | ❌ |

### File Structure Reference

```
Priority Order:
1. MapCanvas.tsx           → Phase 1
2. CountryDrawer.tsx       → Phase 2
3. CostCalculator.tsx      → Phase 3
4. RoadmapWizard.tsx       → Phase 4
5. ChatPanel.tsx           → Phase 5
6. Session management      → Phase 6
7. Dashboard pages         → Phase 7
8. Stories                 → Phase 8
9. Documents               → Phase 9
10. Maps/POI              → Phase 10
```

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ Map loads with real country data
- ✅ Countries colored by difficulty
- ✅ Click country → URL updates → drawer opens
- ✅ Filters work (region, difficulty, cost)

### Phase 2 Complete When:
- ✅ Country drawer shows real data
- ✅ Visa routes displayed
- ✅ Action buttons update URL correctly

### Phase 3 Complete When:
- ✅ Cost calculator returns real estimates
- ✅ Results display correctly
- ✅ Loading/error states work

### Phase 4 Complete When:
- ✅ Roadmap wizard generates AI roadmap
- ✅ Steps display in timeline
- ✅ User can mark steps complete

### Phase 5 Complete When:
- ✅ Chat sends messages to backend
- ✅ AI responds with selected personality
- ✅ Context awareness works

### Phase 6 Complete When:
- ✅ Anonymous users get session ID
- ✅ Registration claims session data
- ✅ Login/logout flow works

---

## 📝 Notes

- **Start with Phase 1** - The map is the foundation
- **Test incrementally** - Don't build 3 features before testing
- **Use existing components** - All UI primitives already built
- **Follow URL-first pattern** - Keep state in URL for shareability
- **Anonymous-first** - Don't force login until user wants to save

---

## 🚀 Getting Started

```powershell
# Terminal 1: Start Django backend
cd c:\Users\HP\Videos\programming\japa-guide\server
docker-compose up

# Terminal 2: Start Next.js frontend
cd c:\Users\HP\Videos\programming\japa-guide\client
npm run dev

# Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/v1/
# Django Admin: http://localhost:8000/admin/
```

**Ready to start? Begin with Phase 1.1 - Connect MapCanvas to Countries API** 🎨
