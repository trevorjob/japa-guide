# Country Data Population Prompts for RAG

This document contains the structured prompts to generate high-quality, factual immigration data for each Tier-1 country. These prompts are designed to be executed sequentially for each country.

## Prerequisites

Before running these prompts, ensure:
- [ ] `CountryDocument` model exists and migrated
- [ ] `Source` model exists with reliability tracking
- [ ] Country records exist in database
- [ ] Official immigration websites have been identified

## Prompt Sequence Per Country

Execute these prompts in order for each country in the Tier-1 list.

---

## Prompt 1: Identify Official Source

```
For the country: <COUNTRY_NAME>

Identify the official government immigration website(s).
Return:
- Official site URL
- Owning government agency
- Reliability level

Prepare a Source object entry (do not save yet).
```

**Expected Output:**
```python
{
    "name": "UK Home Office - Visas and Immigration",
    "url": "https://www.gov.uk/browse/visas-immigration",
    "country": "<country_id>",
    "source_type": "official",
    "reliability_level": "high",
    "description": "Official UK government immigration portal"
}
```

---

## Prompt 2: Generate Country Overview Document

```
Using ONLY the official immigration website for <COUNTRY_NAME>,
generate a factual immigration overview document.

Rules:
- No invented numbers
- No success rates
- Mention uncertainty explicitly
- Neutral tone

Structure:
- Overview
- Main visa pathways
- Who this country is suitable for
- Known challenges

Output formatted text ready for insertion into CountryDocument.
```

**Target Fields:**
- `doc_type`: `overview`
- `data_confidence`: Based on source reliability
- `needs_review`: `True` (until manually verified)

---

## Prompt 3: Work Visa Pathways Document

```
For <COUNTRY_NAME>, summarize the primary work visa pathways using official sources.

Include:
- Common visa types
- High-level requirements
- Notes on processing variability
- Explicit "what affects approval" section

Avoid timelines or guarantees.
```

**Target Fields:**
- `doc_type`: `work`

---

## Prompt 4: Study Visa Overview Document

```
For <COUNTRY_NAME>, generate a study visa overview suitable for RAG.

Include:
- Student visa existence
- Typical eligibility
- Relationship to post-study work (if applicable)
- Risks or common misconceptions

Cite official sources.
```

**Target Fields:**
- `doc_type`: `study`

---

## Prompt 5: Visa Application Steps

```
For the major visa types in <COUNTRY_NAME>,
design a high-level application step sequence.

Constraints:
- 6–10 steps maximum
- No timelines
- No success rates
- Steps must be reusable across applicants

Output as structured data ready for VisaStep insertion.
```

**Target Model:** `VisaStep`
**Expected Output:**
```python
[
    {"order": 1, "title": "Gather required documents", "description": "..."},
    {"order": 2, "title": "Complete online application", "description": "..."},
    # ...
]
```

---

## Tier-1 Countries Checklist

### Phase 1: Core English-Speaking (10 countries)

| Country | Source | Overview | Work | Study | Steps |
|---------|--------|----------|------|-------|-------|
| Canada | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| United States | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| United Kingdom | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Australia | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Ireland | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| New Zealand | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Germany | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Netherlands | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| France | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Portugal | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

### Phase 2: Gulf & Middle East (5 countries)

| Country | Source | Overview | Work | Study | Steps |
|---------|--------|----------|------|-------|-------|
| United Arab Emirates | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Qatar | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Saudi Arabia | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Kuwait | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bahrain | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

### Phase 3: EU Expansion (5 countries)

| Country | Source | Overview | Work | Study | Steps |
|---------|--------|----------|------|-------|-------|
| Spain | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Italy | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Belgium | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Sweden | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Poland | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

### Phase 4: African Destinations (5 countries)

| Country | Source | Overview | Work | Study | Steps |
|---------|--------|----------|------|-------|-------|
| South Africa | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Ghana | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Rwanda | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Kenya | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Mauritius | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

### Phase 5: Other High-Value (5 countries)

| Country | Source | Overview | Work | Study | Steps |
|---------|--------|----------|------|-------|-------|
| Singapore | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Japan | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Malta | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Cyprus | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Switzerland | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Data Quality Rules

### DO Include:
- Official source citations
- Explicit uncertainty markers ("requirements may vary", "subject to change")
- General eligibility categories
- Known document requirements
- High-level pathway descriptions

### DO NOT Include:
- Invented success rates
- Specific processing times (use ranges with disclaimers)
- Guarantees of approval
- Outdated fee amounts (use "check official source")
- Personal opinions

---

## Document Content Guidelines

### Overview Document Structure
```markdown
# Immigration to [Country]

## Overview
[2-3 paragraphs about the country as an immigration destination]

## Main Immigration Pathways
- **Work visas**: [Brief description]
- **Study visas**: [Brief description]
- **Family reunification**: [Brief description]
- **Investor/Entrepreneur**: [If applicable]

## Who This Country Is Suitable For
- [Profile 1]
- [Profile 2]
- [Profile 3]

## Known Challenges
- [Challenge 1]
- [Challenge 2]

## Official Resources
- [Link to official immigration portal]

*Last verified: [Date]*
*Source reliability: [High/Medium/Low]*
```

### Work Visa Document Structure
```markdown
# Work Visa Options in [Country]

## Primary Work Visa Categories

### [Visa Type 1]
- **Purpose**: [Description]
- **Typical Requirements**: [List]
- **Key Considerations**: [Notes]

### [Visa Type 2]
...

## What Affects Approval
- [Factor 1]
- [Factor 2]

## Important Notes
- Processing times vary significantly
- Requirements may change - verify with official sources
- Employer sponsorship requirements differ by visa type

*Source: [Official immigration website]*
```

---

## Database Insertion Template

After generating content, use this pattern:

```python
from countries.models import Country, Source, CountryDocument
from django.utils import timezone

# 1. Get or create the source
country = Country.objects.get(code='CAN')
source, created = Source.objects.get_or_create(
    name="Immigration, Refugees and Citizenship Canada (IRCC)",
    defaults={
        "url": "https://www.canada.ca/en/immigration-refugees-citizenship.html",
        "country": country,
        "source_type": "official",
        "reliability_level": "high",
        "description": "Official Canadian immigration portal",
        "last_checked": timezone.now(),
    }
)

# 2. Create the document
doc = CountryDocument.objects.create(
    country=country,
    title="Immigration Overview: Canada",
    content="""...""",  # Generated content
    doc_type="overview",
    source=source,
    data_confidence="high" if source.reliability_level == "high" else "medium",
    needs_review=True,  # Always start as needing review
)
```

---

## Known Official Immigration Portals

Reference list for quick access:

| Country | Portal | Agency |
|---------|--------|--------|
| Canada | canada.ca/immigration | IRCC |
| USA | uscis.gov | USCIS |
| UK | gov.uk/visas-immigration | Home Office |
| Australia | immi.homeaffairs.gov.au | Home Affairs |
| Germany | make-it-in-germany.com | BAMF |
| Ireland | irishimmigration.ie | ISD |
| Netherlands | ind.nl | IND |
| France | france-visas.gouv.fr | Ministry of Interior |
| UAE | icp.gov.ae | ICP |
| Saudi Arabia | visa.mofa.gov.sa | MOFA |

---

## Execution Notes

1. **Run prompts in batches** - Do 5-10 countries at a time
2. **Verify sources first** - Ensure URLs are active before generating content
3. **Mark all as needs_review=True** - Manual verification required
4. **Update last_verified** - When content is manually checked
5. **Track in checklist** - Check off completed items above

---

*Document created: December 2025*
*Purpose: RAG data population guide for Japa Guide*
