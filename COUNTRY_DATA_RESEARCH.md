# Country Data Sources Research (FREE API-Only Version)

This is an updated version of your original file, **restricted to completely free APIs** and **no scraping**, while keeping the visa system as a manual process for now.

---

# ✅ Overview

You want:

* Free
* API-only
* No scraping
* No paid services
* Country data
* Migration data
* Economic indicators
* Cost/difficulty indicators
* Visa info (manual for now)

Below is the **final research-backed version**, using only sources that satisfy these constraints.

---

# 🟦 1. Basic Country Data (Free APIs)

## **1. REST Countries API — Primary Source (FREE)**

**API:** [https://restcountries.com/](https://restcountries.com/)
**Cost:** Free, no API key

### Provides:

* Country names
* ISO codes (cca2, cca3)
* Region / Subregion
* Population
* Currencies
* Languages
* Flag images (PNG, SVG)
* Timezones
* Borders

### Example Request:

```
GET https://restcountries.com/v3.1/all
```

### Usage in DB:

Use this as your base country model:

* name
* code
* population
* region
* currency
* flag

---

## **2. GeoNames API (FREE with signup)**

**API:** [https://www.geonames.org/export/web-services.html](https://www.geonames.org/export/web-services.html)

### Provides:

* City-level population
* Elevation
* Coordinates
* Country subdivisions
* Time zones

**Use Case:**
Enrich location metadata if needed.

---

# 🟧 2. Migration & Refugee Data (Free Official APIs)

This solves your request for **migration status**.

## ⭐ **1. UNHCR Refugee Statistics API (FREE)**

**API:** [https://api.unhcr.org/docs/refugee-statistics.html](https://api.unhcr.org/docs/refugee-statistics.html)

This is the best real migration dataset on earth.

### Provides:

* Refugee populations (inbound & outbound)
* Asylum seekers (pending)
* Decisions (accepted/rejected)
* Stateless persons
* Internally displaced persons (IDPs)

### Example Endpoints:

**Countries list:**

```
GET https://api.unhcr.org/population/v1/countries
```

**Refugees FROM Argentina (ARG):**

```
GET https://api.unhcr.org/population/v1/populations?coo=ARG
```

**Refugees IN France (FRA):**

```
GET https://api.unhcr.org/population/v1/populations?coa=FRA
```

### Usage:

Store migration metrics in metadata fields or a table like:

```
refugees_out
refugees_in
asylum_seekers
stateless_count
idp_count
```

---

## ⭐ **2. World Bank Migration Indicators API (FREE)**

**API:** [https://api.worldbank.org/v2/country/](https://api.worldbank.org/v2/country/)

### Useful Indicators:

* Net migration (`SM.POP.NETM`)
* Migrant stock (`SM.POP.TOTL`)
* Remittance flows
* Expat/immigrant ratios

### Example Request:

```
GET https://api.worldbank.org/v2/country/FRA/indicator/SM.POP.NETM?format=json
```

### Use Case:

Build your own "migration difficulty" or "immigration friendliness" scores.

---

## ⭐ **3. UN DESA Migration Data API (FREE)**

**API:** [https://population.un.org/wpp/](https://population.un.org/wpp/)

### Provides:

* Migrant stock by origin/destination
* Migration by age & sex
* Long-term migration patterns

This supplements UNHCR + World Bank.

---

# 🟩 3. Cost of Living Data (Free API Approximations)

No fully free cost-of-living API exists.
But **these APIs offer cost/price indexes legally and for free**.

## ⭐ **1. OECD Price Level & CPI API (FREE)**

**API:** [https://stats.oecd.org/sdmx-json/](https://stats.oecd.org/sdmx-json/)

### Provides:

* Consumer Price Index (CPI)
* Price level index
* Food, housing, energy indexes
* Purchasing power parity (PPP)

### Example:

```
https://stats.oecd.org/SDMX-JSON/data/DP_LIVE/ARG.CPI.A/all?
```

### Use Case:

Estimate a **cost_of_living_index** with:

* CPI change
* PPP comparison
* OECD price levels

---

## ⭐ **2. World Bank Price Level APIs**

Indicators:

* `FP.CPI.TOTL.ZG` (CPI annual %)
* `PA.NUS.PPPC.RF` (PPP conversion factor)

### Example:

```
GET https://api.worldbank.org/v2/country/ARG/indicator/FP.CPI.TOTL.ZG?format=json
```

---

# 🟫 4. Economic & Social Indicators (for Difficulty Score)

## ⭐ **World Bank API (FREE)**

Provides key indicators you can use to generate your **difficulty score**.

### Examples:

* GDP per capita (`NY.GDP.PCAP.CD`)
* Unemployment (`SL.UEM.TOTL.ZS`)
* Life expectancy (`SP.DYN.LE00.IN`)
* Literacy rate (`SE.ADT.LITR.ZS`)
* Poverty rate

### Usage:

Create a computed score:

```
difficulty_score = weighted(hdi, cost_of_living, unemployment, english_level, migration_acceptance)
```

---

# 🟥 5. English Proficiency (Free Data File)

## ⭐ EF English Proficiency Index (Free Data Download)

[https://www.ef.com/epi/](https://www.ef.com/epi/)

Not an API, but they provide CSV/JSON data downloadable for free.

Include a field:

```
english_proficiency_score
```

Used in difficulty scoring.

---

# 🟪 6. Visa Data (NO FREE API EXISTS) — Manual for Now

Since you want:

* free-only
* api-only
* no scraping

Then visa data must be **manual**.

### Your options:

#### ⭐ Option 1 — Store a `visa_summary` field

You write short summaries manually over time.

#### ⭐ Option 2 — Store visa types as manual entries

Example:

```
visa_types_count
visa_summary
difficulty_score
last_reviewed
```

#### ⭐ Option 3 — Add them gradually as you research each country.

This is realistic because all companies (NomadList, MoveHub, Sherpa before raising funds) did this at first.

---

# 🟦 7. Recommended DB Additions (Free API-Friendly)

```
class Country(models.Model):
    code = models.CharField(max_length=3)
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    currency = models.CharField(max_length=10)
    population = models.IntegerField()
    flag_image = models.URLField(blank=True)

    # API metadata
    basic_data_source = models.CharField(default="rest_countries")
    high_level_migration_source = models.CharField(default="unhcr")
    economic_data_source = models.CharField(default="world_bank")

    # COST OF LIVING (From WB/OECD approximations)
    cost_of_living_index = models.FloatField(null=True)

    # Migration Metrics
    refugees_in = models.IntegerField(null=True)
    refugees_out = models.IntegerField(null=True)
    asylum_seekers = models.IntegerField(null=True)
    net_migration = models.IntegerField(null=True)

    # Visa (Manual)
    visa_summary = models.TextField(blank=True)
    visa_types_count = models.IntegerField(default=0)
    visa_last_reviewed = models.DateField(null=True)

    metadata = models.JSONField(default=dict)
```

---

# 🟧 8. Management Commands to Build

### **Sync Basic Country Data (REST Countries)**

```
python manage.py sync_countries
```

### **Sync Migration Data (UNHCR + World Bank)**

```
python manage.py sync_migration
```

### **Sync Economic Data (World Bank)**

```
python manage.py sync_economics
```

### **Visa manual update**

```
python manage.py update_visa --country=FRA
```

---

# 🟩 9. Conclusion

With only free APIs, you can cover:

| Feature             | Free API Exists | Source         |
| ------------------- | --------------- | -------------- |
| Country info        | ✅               | REST Countries |
| Migration flows     | ✅               | UNHCR          |
| Net migration       | ✅               | World Bank     |
| Refugee data        | ✅               | UNHCR          |
| Economic indicators | ✅               | World Bank     |
| Cost of living      | ⚠️ Approx only  | OECD/WB        |
| Visa policies       | ❌ Manual only   | —              |

Visa data will require your own research, but **everything else is fully automatable with free APIs**.

If you want, I can now:

* Add example sync scripts
* Add endpoint mapping tables
* Add a scoring formula
* Build a full data architecture document
