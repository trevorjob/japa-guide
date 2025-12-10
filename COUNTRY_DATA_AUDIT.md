# Country Data Audit & Current State

## Executive Summary

The current country data system has **significant quality issues**. Data comes from multiple sources with different reliability levels, calculations are based on rough heuristics rather than real data, and 83% of countries lack meaningful content.

---

## Current Data Sources

### 1. REST Countries API (`sync_countries.py`)
**What it provides:**
- Basic info: name, region, subregion, population, area, currency
- Flags (SVG/PNG URLs)
- Metadata: languages, timezones, borders, capital, coordinates, UN membership

**Quality:** ✅ Good - Official ISO data, regularly updated

**Limitations:**
- No economic data (GDP, unemployment, etc.)
- No migration/visa information
- No cost of living data

---

### 2. UNHCR Refugee Statistics API (`sync_migration.py`)
**What it provides:**
- `refugees_in` - Refugees hosted by country
- `refugees_out` - Refugees originating from country
- `asylum_seekers` - Pending asylum applications
- `idp_count` - Internally displaced persons

**Quality:** ⚠️ Partial - Only captures refugee/asylum flows, not general migration

**Limitations:**
- Doesn't capture skilled worker migration
- Doesn't capture student migration
- Doesn't capture family reunification
- `net_migration` calculated as `refugees_in - refugees_out` is **misleading** (ignores all other migration types)

---

### 3. Manual Seed Data (`seed_data.py`)
**What it provides for 33 countries:**
- `summary` - Hand-written migration overview
- `cost_of_living_index` - Manually assigned numbers
- `difficulty_score` - Manually assigned (1-10)
- `avg_rent_monthly_usd` - Estimated values
- `avg_meal_cost_usd` - Estimated values
- `healthcare_monthly_usd` - Estimated values

**Quality:** ❌ Poor
- Numbers appear **invented** (no cited sources)
- `cost_of_living_index` values don't match any known index (Numbeo, etc.)
- Inconsistent methodology between countries
- Only covers 33/196 countries (17%)

---

## The `difficulty_score` Problem

### Current Calculation (`sync_countries.py`)
The difficulty score is calculated using a **heuristic algorithm**:

```python
score = 5  # Base score

# Factor 1: Region (+5 to +7 based on region)
region_scores = {
    'Europe': 7,
    'Americas': 6,
    'Asia': 5,
    'Africa': 3,
    'Oceania': 7,
}

# Factor 2: Population size
if population > 100,000,000: score += 2
elif population > 50,000,000: score += 1
elif population < 1,000,000: score -= 1

# Factor 3: English-speaking
if 'english' in languages: score += 2

# Factor 4: Hard-coded "high demand" countries
if name in ['USA', 'CANADA', 'UK', ...]: score += 2

# Factor 5: Island nations
if no_borders and desirable_region: score += 1

# Factor 6: UN membership
if un_member: score += 0.5

# Factor 7: Dependencies
if not independent: score += 1
```

### Problems with this approach:

| Issue | Example |
|-------|---------|
| **No actual visa data** | Doesn't consider visa processing times, rejection rates, requirements |
| **Population ≠ difficulty** | India (1.4B) gets +2 but has relatively accessible work visas |
| **English bonus is backwards** | Being English-speaking doesn't make immigration harder |
| **Hard-coded list is arbitrary** | Why is Singapore in Asia scored 5 base, then +2 for high demand? |
| **No economic factors** | Ignores GDP, unemployment, labor shortages |
| **No policy factors** | Ignores points systems, quotas, skills shortages lists |

### Conflicting Values
- **USA via sync_countries.py**: Calculated as 10 (maxed out)
- **USA via seed_data.py**: Manually set to 8
- Result: Depends on which script ran last

---

## Data Completeness Matrix

| Field | Source | Filled | Missing | Quality |
|-------|--------|--------|---------|---------|
| `name` | REST Countries | 196 | 0 | ✅ Good |
| `region` | REST Countries | 196 | 0 | ✅ Good |
| `population` | REST Countries | 196 | 0 | ✅ Good |
| `currency` | REST Countries | 196 | 0 | ✅ Good |
| `flag_svg_url` | REST Countries | 196 | 0 | ✅ Good |
| `metadata` | REST Countries | 196 | 0 | ✅ Good |
| `difficulty_score` | Heuristic | 196 | 0 | ❌ Unreliable |
| `summary` | Manual | 33 | 163 | ⚠️ Inconsistent |
| `cost_of_living_index` | Manual | 33 | 163 | ❌ Invented |
| `avg_rent_monthly_usd` | Manual | 33 | 163 | ❌ Invented |
| `avg_meal_cost_usd` | Manual | 33 | 163 | ❌ Invented |
| `healthcare_monthly_usd` | Manual | 33 | 163 | ❌ Invented |
| `gdp_per_capita_usd` | None | 0 | 196 | ❌ Missing |
| `unemployment_rate` | None | 0 | 196 | ❌ Missing |
| `life_expectancy` | None | 0 | 196 | ❌ Missing |
| `visa_summary` | None | 0 | 196 | ❌ Missing |
| `refugees_in` | UNHCR | ~180 | ~16 | ⚠️ Partial |
| `refugees_out` | UNHCR | ~180 | ~16 | ⚠️ Partial |

---

## Visa Data Status

### Current State
- **Total visa types**: 6
- **Countries with visa data**: ~3 (Canada, USA, partial)
- **Coverage**: <2%

### Visa Data Source
All visa data is **manually written** in `seed_visa_data.py`:

```python
# Example - completely hand-written
{
    'name': 'Express Entry (Federal Skilled Worker)',
    'processing_time_min_weeks': 24,
    'processing_time_max_weeks': 32,
    'cost_estimate_min': 1500,
    'cost_estimate_max': 2500,
    'success_rate': 65,  # Where did this number come from?
    'requirements': ['Bachelor\'s degree', 'IELTS 6.5+', ...],
}
```

**Problems:**
- Processing times change frequently
- Costs are outdated
- Success rates are not publicly available for most visas
- Requirements change with policy updates
- No automated updates

---

## What's Actually Needed for RAG

For a quality RAG system, we need **factual, verifiable, up-to-date** data:

### Tier 1: Essential (Must Have)
| Data | Purpose | Possible Sources |
|------|---------|------------------|
| Country overview | Context | Wikipedia API, CIA World Factbook |
| Visa types per country | Core feature | Government websites, VisaGuide.World |
| Visa requirements | Core feature | Government websites, Timatic |
| Processing times | User planning | Government websites |
| Cost estimates | User planning | Government websites, forums |

### Tier 2: Important (Should Have)
| Data | Purpose | Possible Sources |
|------|---------|------------------|
| GDP per capita | Economic context | World Bank API (free) |
| Cost of living | Planning | Numbeo API (paid) or estimates from GDP |
| Safety index | Decision making | GPI, Numbeo |
| Healthcare quality | Decision making | WHO, Numbeo |
| English proficiency | Accessibility | EF EPI Index |

### Tier 3: Nice to Have
| Data | Purpose | Possible Sources |
|------|---------|------------------|
| Expat community size | Social | InterNations surveys |
| Job market data | Planning | LinkedIn, Indeed APIs |
| Immigration success stories | Inspiration | Manual curation |
| Embassy locations | Practical | Government data |

---

## Key Questions for Strategy

1. **What is the primary use case?**
   - Browsing/exploring countries?
   - Getting specific visa information?
   - Comparing destinations?
   - Step-by-step immigration guidance?

2. **What accuracy level is acceptable?**
   - "Rough guide" (current state)
   - "Generally accurate" (LLM-generated with review)
   - "Authoritative" (official sources only)

3. **How often does data need updating?**
   - Static (set and forget)
   - Periodic (monthly/quarterly refresh)
   - Real-time (API integrations)

4. **What's the budget for data?**
   - Free APIs only
   - Paid APIs (Numbeo: ~$100/mo, Timatic: expensive)
   - Manual curation (time cost)

5. **Who is the target user?**
   - From which countries? (affects which destinations matter)
   - Skill level? (student, skilled worker, investor)
   - Budget level? (affects which countries to prioritize)

---

## Recommendations

### Immediate Actions
1. **Stop using heuristic difficulty scores** - They're misleading
2. **Add World Bank data** - Free API, reliable economic indicators
3. **Flag all manual data as "unverified"** - User transparency
4. **Focus on top 20 destination countries first** - 80/20 rule

### Short-term (Before RAG)
1. **Define a proper difficulty score methodology** based on:
   - Visa rejection rates (if available)
   - Processing times
   - Requirements complexity
   - Quotas/caps

2. **Get real cost of living data**:
   - Option A: Numbeo API (paid but comprehensive)
   - Option B: Estimate from GDP/PPP using World Bank data

3. **Generate quality summaries**:
   - Use LLM to create consistent, factual country overviews
   - Include sources/citations
   - Human review for top 50 countries

### Long-term
1. **Build a visa requirements database** - This is the core value
2. **Create update mechanisms** - Visa policies change frequently
3. **Add user-generated content** - Success stories, tips, reviews

---

## Files Involved

| File | Purpose | Status |
|------|---------|--------|
| `countries/models.py` | Data schema | Has fields for everything, mostly empty |
| `countries/management/commands/sync_countries.py` | REST Countries sync | Works but calculates bad difficulty scores |
| `countries/management/commands/sync_migration.py` | UNHCR sync | Works but limited utility |
| `seed_data.py` | Manual country data | 33 countries with invented numbers |
| `seed_visa_data.py` | Manual visa data | 6 visas, outdated |
| `visas/models.py` | Visa schema | Good structure, no data |

---

## Next Steps: Your Decision

After reviewing this audit, consider:

1. **What data quality bar do you want to set?**
2. **Which countries are highest priority?**
3. **What's the timeline for RAG implementation?**
4. **Are you willing to use paid data sources?**

Once you decide on these, we can create a concrete data pipeline.
