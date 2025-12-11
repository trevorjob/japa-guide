# Launch Readiness & Feature Deferral Analysis

## Core User Journey: Explore → Decide → Plan → Execute

This analysis identifies which features are required for the MVP user journey and which can be deferred post-launch.

---

## Feature Inventory

### ✅ REQUIRED FOR LAUNCH (Core Journey)

| Feature | App | Status | Notes |
|---------|-----|--------|-------|
| **Interactive Map** | `client/explore` | ✅ Complete | D3-based world map with country selection |
| **Country Data Display** | `countries` | ✅ Complete | CountryDrawer with basic info |
| **Visa Routes** | `visas` | ⚠️ Partial | 6 visa types seeded, needs expansion |
| **Cost Calculator** | `client/calculator` | ✅ Complete | Frontend calculation working |
| **Roadmap Generation** | `roadmaps` | ✅ Complete | Basic wizard and step display |
| **Roadmap View** | `client/roadmap/[id]` | ✅ Complete | View saved roadmaps |
| **Region Filtering** | `client/explore` | ✅ Complete | Filter by continent |
| **Country Search** | `client/explore` | ✅ Complete | Search by name |

### ⚠️ PARTIALLY IMPLEMENTED (Needs Completion Before Launch)

| Feature | App | Status | Blocker | Priority |
|---------|-----|--------|---------|----------|
| **AI Chat** | `ai` | ⚠️ Backend only | No frontend chat UI | HIGH |
| **Data Transparency** | `countries` | ⚠️ Model ready | Badge not integrated | MEDIUM |
| **Tier-1 Country Data** | `countries` | ⚠️ 30 countries identified | Documents not populated | HIGH |
| **Visa Step Details** | `visas` | ⚠️ Model exists | Most visas have no steps | MEDIUM |

### 🔴 NOT REQUIRED FOR LAUNCH (Defer Post-Launch)

| Feature | App | Reason to Defer | Deferral Risk |
|---------|-----|-----------------|---------------|
| **User Authentication** | `users` | Anonymous-first works for MVP | Low - sessions work |
| **User Registration** | `client/login`, `register` | Folders empty, backend ready | Low |
| **Story Sharing** | `stories` | Community feature, not core journey | Low |
| **Document Generation** | `docs` | PDF/DOCX not implemented, nice-to-have | Low |
| **GeoPoints/Maps** | `maps` | Embassy locations etc., enrichment only | Low |
| **Premium Features** | `roadmaps.is_premium` | Monetization is phase 2 | None |
| **Export to PDF** | `docs.tasks` | TODO placeholder | Low |
| **Interview Prep Mode** | `ai` | Specialized AI mode | Low |
| **Country Comparison** | `ai` | Side-by-side comparison view | Medium |
| **Difficulty Filtering** | `client/explore` | Based on unreliable data | None |

---

## Open TODOs in Codebase

| File | Line | TODO | Priority | Action |
|------|------|------|----------|--------|
| `server/docs/tasks.py` | 19 | Implement PDF generation | DEFER | Post-launch |
| `server/docs/tasks.py` | 48 | Implement DOCX generation | DEFER | Post-launch |
| `server/docs/views.py` | 66 | Queue Celery task for doc generation | DEFER | Post-launch |

---

## Recommended Launch Scope

### Phase 1: MVP Launch Checklist

**Must Have (Week 1-2):**
- [ ] Remove difficulty_score from map coloring
- [ ] Add Data Transparency Badge to CountryDrawer
- [ ] Populate Tier-1 country visa data (top 10 countries)
- [ ] Basic AI chat UI (even simple input → response)
- [ ] Cost calculator text updates (uncertainty language)
- [ ] Fix any remaining bugs in core flow

**Should Have (Week 2-3):**
- [ ] Expand to 20 Tier-1 countries
- [ ] Add visa steps for popular visa types
- [ ] Improve AI prompts with safety rules
- [ ] Mobile responsiveness polish

**Nice to Have (Post-Launch):**
- [ ] User authentication
- [ ] Story sharing
- [ ] Document generation
- [ ] Premium features

---

## Features to REMOVE Before Launch

| Feature | Location | Reason | Action |
|---------|----------|--------|--------|
| Difficulty Score Display | `CountryDrawer.tsx` | Unreliable data | Replace with data confidence |
| Difficulty Filtering | `MapFilters.tsx` | Based on invented scores | Remove filter UI |
| Success Rate Display | `VisaRouteModal.tsx` | No real data | Hide or add disclaimer |
| Success Rate in API | `visas/serializers.py` | Fabricated | Exclude from response |

---

## Backend Apps Analysis

| App | Core Journey | Launch Status | Defer? |
|-----|--------------|---------------|--------|
| `countries` | ✅ Explore | Ready | No |
| `visas` | ✅ Decide | Needs data | No |
| `roadmaps` | ✅ Plan | Ready | No |
| `ai` | ✅ Execute (guidance) | Needs UI | No |
| `users` | ❌ Optional | Ready but unused | Yes |
| `stories` | ❌ Community | Models only | Yes |
| `docs` | ❌ Export | Placeholder | Yes |
| `maps` | ❌ Enrichment | Models only | Yes |
| `admin_tools` | ❌ Internal | Ready | N/A |
| `core` | ✅ Shared | Ready | No |

---

## Frontend Routes Analysis

| Route | Core Journey | Status | Action |
|-------|--------------|--------|--------|
| `/` | Landing | ✅ Complete | None |
| `/explore` | Explore/Decide | ✅ Complete | Polish |
| `/calculator` | Plan | ✅ Complete | Text updates |
| `/roadmap/[id]` | Plan/Execute | ✅ Complete | None |
| `/login` | ❌ Optional | Empty folder | Defer |
| `/register` | ❌ Optional | Empty folder | Defer |
| `/stories` | ❌ Community | Empty folder | Defer |
| `/components-demo` | ❌ Dev only | ✅ Complete | Remove before launch |

---

## Risk Assessment

### High Risk Items (Fix Before Launch)

1. **AI Fabrication Risk**
   - Current prompts don't prevent fabrication
   - Could give users false information
   - **Action:** Update prompts with safety rules

2. **Unreliable Data Display**
   - Difficulty scores are invented
   - Success rates are fabricated
   - **Action:** Remove or add strong disclaimers

3. **No Data Transparency**
   - Users can't tell what's verified vs estimated
   - **Action:** Integrate DataTransparencyBadge

### Medium Risk Items

1. **Limited Visa Data**
   - Only 6 visa types in database
   - Popular countries may have incomplete options
   - **Action:** Prioritize Tier-1 country visa expansion

2. **Cost Estimates May Mislead**
   - Calculator uses rough multipliers
   - **Action:** Add uncertainty language

### Low Risk Items (Acceptable for Launch)

1. No user accounts (sessions work fine)
2. No story sharing (community feature)
3. No document export (convenience feature)
4. Limited non-Tier-1 data (progressive enhancement)

---

## Recommended Deferral Plan

### Defer to Phase 2 (1-2 months post-launch)
- User authentication & registration
- Story sharing platform
- Document generation (PDF/DOCX)
- Premium features & monetization
- GeoPoints/Embassy locations
- Interview prep AI mode

### Defer to Phase 3 (3-6 months post-launch)
- Country comparison tool
- Community features (upvotes, comments)
- Mobile app (if web proves traction)
- Advanced analytics
- Partner integrations

### Never Build (Out of Scope)
- Visa application submission (legal liability)
- Payment processing for visa fees
- Immigration lawyer matching (liability)
- Guaranteed outcome predictions

---

## Summary

**For MVP Launch, focus on:**
1. Core journey works: Explore → Decide → Plan → Execute
2. Data integrity: Remove/disclaim unreliable metrics
3. Transparency: Show users what's verified vs estimated
4. Tier-1 countries: Quality over quantity

**Safe to defer:**
- User accounts (anonymous sessions work)
- Community features (stories, sharing)
- Document export (PDF/DOCX)
- Premium monetization
- Non-core AI modes

---

*Analysis generated: December 2025*
*Purpose: Launch readiness assessment for Japa Guide*
