# Immigration Data Pipeline

This directory contains the web scraping and AI document generation pipeline for populating country immigration data.

## Overview

The pipeline works in 3 stages:

1. **Scrape** - Fetch official immigration website content
2. **Generate** - Use DeepSeek AI to create structured documents
3. **Load** - Import reviewed documents into the database

## Files

```
data_sources/
├── country_sources.json      # Source URLs for each country
├── scrape_immigration_data.py  # Scraping + AI generation script
├── load_documents_to_db.py   # Database import script
├── cache/                    # Cached web pages (auto-generated)
└── generated/                # Generated JSON documents (auto-generated)
```

## Setup

1. Install dependencies:
```bash
pip install beautifulsoup4 lxml
```

2. Ensure DeepSeek API is configured in `.env`:
```
DEEPSEEK_API_KEY=your-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

## Usage

### Step 1: Add Country Sources

Edit `country_sources.json` to add or update source URLs for countries:

```json
{
  "countries": {
    "CAN": {
      "name": "Canada",
      "agency": "Immigration, Refugees and Citizenship Canada (IRCC)",
      "portal_url": "https://www.canada.ca/en/immigration-refugees-citizenship.html",
      "sources": {
        "overview": ["https://..."],
        "work": ["https://...", "https://..."],
        "study": ["https://..."]
      }
    }
  }
}
```

### Step 2: Scrape and Generate Documents

```bash
# Process a single country
python data_sources/scrape_immigration_data.py --country CAN

# Process specific doc type only
python data_sources/scrape_immigration_data.py --country CAN --doc-type work

# Process all countries
python data_sources/scrape_immigration_data.py --all

# List available countries
python data_sources/scrape_immigration_data.py --list
```

**Output:** JSON files in `data_sources/generated/` directory.

### Step 3: Review Generated Documents

Before loading to database, review the generated JSON files:

1. Open `data_sources/generated/CAN.json`
2. Check each document's content for accuracy
3. Remove or flag any problematic content
4. Verify source URLs are correct

### Step 4: Load to Database

```bash
# Dry run first (no changes saved)
python data_sources/load_documents_to_db.py --country CAN --dry-run

# Actually load a country
python data_sources/load_documents_to_db.py --country CAN

# Load all countries
python data_sources/load_documents_to_db.py --all

# Check status
python data_sources/load_documents_to_db.py --status
```

## Document Types

| Type | Description |
|------|-------------|
| `overview` | General immigration overview |
| `work` | Work visa information |
| `study` | Student visa information |
| `family` | Family immigration/sponsorship |
| `citizenship` | Naturalization pathways |
| `asylum` | Asylum/refugee info (if applicable) |

## Data Quality

All generated documents are marked with:
- `data_confidence = 'high'` (from official sources)
- `needs_review = True` (requires human verification)

After manual review, update via Django admin:
- Set `needs_review = False` when verified
- Adjust `data_confidence` if needed

## Caching

Web pages are cached for 24 hours in `data_sources/cache/`.

To force refresh:
```bash
# Delete cache directory
rm -rf data_sources/cache/

# Or modify the scraper's cache settings
```

## Rate Limiting

The scraper includes:
- 2 second delay between requests
- Automatic retry with exponential backoff
- Proper User-Agent headers

**Be respectful of government websites!**

## Troubleshooting

### "No content could be scraped"
- Check if the URL is accessible
- Some sites may block automated access
- Try adding the site to cache manually

### "API error generating document"
- Check DeepSeek API key
- Verify API quota
- Check logs/scraper.log for details

### "Country not found in database"
- Run seed_data.py first to populate countries
- Verify country code matches database

## Tier-1 Countries

Priority countries for data population:

**Phase 1 - Core English-Speaking:**
CAN, USA, GBR, AUS, IRL, NZL, DEU, NLD, FRA, PRT

**Phase 2 - Gulf & Middle East:**
ARE, QAT, SAU, KWT, BHR

**Phase 3 - EU Expansion:**
ESP, ITA, BEL, SWE, POL

**Phase 4 - African Destinations:**
ZAF, GHA, RWA, KEN, MUS

**Phase 5 - Other High-Value:**
SGP, JPN, MLT, CYP, CHE

## Best Practices

1. **Process in batches** - Don't run all countries at once
2. **Review before loading** - Always check generated content
3. **Monitor API usage** - DeepSeek charges per token
4. **Keep sources updated** - Government websites change
5. **Back up generated files** - Before database load
