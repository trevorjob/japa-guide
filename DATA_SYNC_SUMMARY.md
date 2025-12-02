# Country Data Sync Implementation Summary

## ✅ Successfully Implemented

### 1. Database Schema Enhancement
**Migration:** `countries.0002_country_area_sq_km_country_asylum_seekers_and_more.py`

**New Fields Added (37 operations):**
- **Basic Info:** `code_alpha2`, `subregion`, `area_sq_km`, `flag_svg_url`, `flag_png_url`
- **Migration Metrics:** `refugees_in`, `refugees_out`, `asylum_seekers`, `net_migration`, `idp_count`
- **Economic Indicators:** `gdp_per_capita_usd`, `unemployment_rate`, `life_expectancy`, `literacy_rate`
- **Cost Data:** `cpi_annual_change`, `ppp_conversion_factor`
- **Visa Data:** `visa_summary`, `visa_types_count`, `visa_last_reviewed`
- **Data Tracking:** `basic_data_last_synced`, `migration_data_last_synced`, `economic_data_last_synced`
- **Quality Metrics:** `data_quality_score` (0-100), `needs_review`, `is_featured`
- **Metadata:** JSON field for languages, timezones, borders, capital, etc.

**Indexes Created:**
- `countries_c_code_79f189_idx` (country code)
- `countries_c_region_927116_idx` (region)
- `countries_c_difficu_dceb0c_idx` (difficulty_score)

### 2. REST Countries API Sync (✅ Working)
**Command:** `python manage.py sync_countries`

**API Endpoint:** `https://restcountries.com/v3.1/independent?status=true`
- **Why this endpoint?** The `/all` endpoint requires fields parameter, `/independent` works without it
- **Coverage:** 195 independent countries

**Data Synced:**
- ISO codes (alpha-2, alpha-3)
- Basic info (name, region, subregion)
- Population & area
- Currency
- Flags (SVG & PNG URLs)
- Metadata (languages, timezones, borders, capital, coordinates, etc.)

**Usage Examples:**
```bash
# Sync all countries
python manage.py sync_countries

# Test with 5 countries
python manage.py sync_countries --limit=5

# Sync specific countries
python manage.py sync_countries --countries=CAN,USA,GBR

# Force update (ignore last sync time)
python manage.py sync_countries --force
```

**Results (Initial Sync):**
```
Total countries: 196
Created: 160
Updated: 35
```

### 3. UNHCR Migration Data Sync (✅ Working)
**Command:** `python manage.py sync_migration`

**API Endpoint:** `https://api.unhcr.org/population/v1/population/`
- **Data Year:** 2023 (configurable)
- **Metrics:** Refugees, Asylum Seekers, IDPs

**Data Synced:**
- **Refugees IN:** People seeking asylum in this country (`coa` - country of asylum)
- **Refugees OUT:** People fleeing from this country (`coo` - country of origin)
- **Asylum Seekers:** People awaiting refugee status determination
- **IDPs:** Internally Displaced Persons
- **Net Migration:** Calculated as `refugees_in - refugees_out`

**Usage Examples:**
```bash
# Sync all countries (will take time, 195+ API calls)
python manage.py sync_migration

# Sync specific countries
python manage.py sync_migration --countries=DEU,USA,CAN,TUR

# Use different year
python manage.py sync_migration --year=2022
```

**Sample Results:**
| Country | Refugees IN | Refugees OUT | Asylum Seekers | Net Migration |
|---------|-------------|--------------|----------------|---------------|
| USA | 409,202 | 1,229 | 2,601,467 | 407,973 |
| Turkey | 3,251,127 | 127,738 | 222,069 | 3,123,389 |
| Canada | 169,448 | 223 | 197,961 | 169,225 |
| Uganda | 1,577,498 | 8,376 | 37,657 | 1,569,122 |

### 4. Data Quality System
**Auto-calculated Score (0-100):**
```python
def calculate_data_quality_score(self):
    score = 0
    # Basic data (30 points)
    if self.name: score += 10
    if self.population: score += 10
    if self.basic_data_last_synced: score += 10
    
    # Migration data (30 points)
    if self.refugees_in is not None: score += 10
    if self.asylum_seekers is not None: score += 10
    if self.migration_data_last_synced: score += 10
    
    # Economic data (20 points)
    if self.gdp_per_capita_usd: score += 10
    if self.economic_data_last_synced: score += 10
    
    # Completeness (20 points)
    if self.flag_svg_url: score += 5
    if self.summary: score += 5
    if self.visa_summary: score += 10
    
    return score
```

## 📊 Current Database Status

**Total Countries:** 196
- **With Basic Data:** 195 (REST Countries synced)
- **With Migration Data:** 5 (UNHCR synced for testing)
- **With Economic Data:** 0 (World Bank integration pending)

**Sample Country (Germany):**
```json
{
  "code": "DEU",
  "code_alpha2": "DE",
  "name": "Germany",
  "region": "Europe",
  "subregion": "Western Europe",
  "population": 83491249,
  "area_sq_km": 357114,
  "currency": "EUR",
  "flag_svg_url": "https://flagcdn.com/de.svg",
  "metadata": {
    "languages": ["German"],
    "timezones": ["UTC+01:00"],
    "borders": ["AUT", "BEL", "CZE", "DNK", "FRA", "LUX", "NLD", "POL", "CHE"],
    "capital": ["Berlin"],
    "latlng": [51.0, 9.0],
    "independent": true,
    "un_member": true,
    "fifa": "GER",
    "continents": ["Europe"]
  },
  "basic_data_source": "rest_countries",
  "basic_data_last_synced": "2025-12-02T22:42:15.123Z"
}
```

## 🔄 Next Steps

### Immediate (High Priority)
1. ✅ ~~REST Countries API sync~~ - DONE
2. ✅ ~~UNHCR migration data sync~~ - DONE
3. ⏳ **Run full migration sync:** `python manage.py sync_migration` (will take ~10-15 minutes)
4. ⏳ **World Bank economic data sync** - Create `sync_economic.py` command
   - GDP per capita
   - Unemployment rate
   - CPI annual change
   - PPP conversion factor

### Medium Priority
5. **OECD price level data** - For cost of living estimates
6. **Update API endpoints** - Add filters for synced data:
   - `/api/countries/?has_migration_data=true`
   - `/api/countries/?data_quality__gte=70`
   - `/api/countries/?needs_review=true`
7. **Admin dashboard improvements** - Show sync status, data quality

### Low Priority
8. **Scheduled syncing** - Celery tasks for automatic updates
9. **Data validation** - Flag outliers, missing data
10. **Export functionality** - Download country data as CSV/JSON

## 🛠️ Dependencies Added

```
requests==2.31.0
```

## 📝 Management Commands Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `sync_countries` | Sync basic country data from REST Countries | `python manage.py sync_countries --limit=10` |
| `sync_migration` | Sync UNHCR migration metrics | `python manage.py sync_migration --year=2023` |
| `sync_economic` | Sync World Bank economic data | *(Coming soon)* |

## 🔍 Troubleshooting

### REST Countries API Issues
**Problem:** 400 Bad Request on `/all` endpoint  
**Solution:** Use `/independent?status=true` instead (no fields parameter required)

**Problem:** Need more countries (including dependencies)  
**Solution:** Add command for `/all?fields=cca2,cca3,name,...` with specific fields

### UNHCR API Issues
**Problem:** Getting 0 values  
**Solution:** Changed from `/populations/` to `/population/` and aggregate multiple items

**Problem:** Slow syncing (195+ countries)  
**Solution:** Use `--countries=` flag to sync in batches

### Data Quality
**Problem:** Some countries missing migration data  
**Solution:** UNHCR only has data for countries with refugee populations - this is expected

## 📈 Performance Metrics

**REST Countries Sync:**
- Time: ~5 seconds for 195 countries
- Requests: 1 API call (bulk endpoint)
- Success Rate: 100% (195/195)

**UNHCR Migration Sync:**
- Time: ~3 seconds per country (2 API calls each)
- Estimated full sync: ~10-15 minutes for 195 countries
- Success Rate: 100% for tested countries (5/5)

## 💡 API Rate Limits & Costs

| API | Rate Limit | Cost | Status |
|-----|------------|------|--------|
| REST Countries | None (public) | FREE ✅ | No API key needed |
| UNHCR | Unknown | FREE ✅ | No API key needed |
| World Bank | Unknown | FREE ✅ | No API key needed |
| OECD | Unknown | FREE ✅ | May need registration |

---

**Last Updated:** December 2, 2025  
**Status:** ✅ Phase 1 Complete (Basic + Migration Data)  
**Next Phase:** Economic data integration + Full migration sync
