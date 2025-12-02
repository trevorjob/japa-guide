# 🔥 LEAN PROMPT — Django Backend for **Japaguide** (Side Project Edition)

You are an expert **backend architect & Django engineer**. Design and produce a complete backend implementation plan (and example code snippets) for **Japaguide** — a playful, feature-rich migration companion. This backend powers the following features:
**Country Playbooks, AI Recommendations, Document Builder, Country Comparison Tool, Japa Cost Calculator, Migration Timeline Planner, Interactive Maps data.**

Focus on: **quick iteration, developer velocity, and getting to MVP fast**. This is a side project, so keep it lean but functional. Provide everything an engineer needs to implement this with Django + Django REST Framework (DRF). Use PostgreSQL as the primary DB. Use Celery + Redis for background jobs. Use Docker. Integrate OpenAI for AI-powered features. Use Cloudinary for all image hosting (flags, country images, user avatars).

**CRITICAL: The app must be fully functional for anonymous users. Registration/login is OPTIONAL and only needed when users want to save their data permanently. All features (roadmap generation, cost calc, AI chat, etc.) work without auth.**

---

# 1) High-level architecture & services

* Django monolith with clear modular apps:
  * `core` (settings, utils, common models)
  * `countries` (country profiles, stats, playbooks)
  * `visas` (visa types, steps, docs, timelines)
  * `roadmaps` (generated roadmaps, user progress)
  * `users` (profiles, auth, passport stamps)
  * `ai` (AI prompts, caches, templates)
  * `docs` (generated documents / templates - Phase 2)
  * `maps` (geo data, points of interest - Phase 2)
  * `stories` (japa journal entries - Phase 2)
  * `admin_tools` (CSV importers, manual data updates)
  
* External services:
  * PostgreSQL (primary database)
  * Redis (Celery broker + light caching + session storage for anonymous users)
  * Celery workers (background tasks)
  * OpenAI (LLM for AI features)
  * Cloudinary (all image hosting)
  
* Deploy: Docker + docker-compose for dev and prod (Railway, Render, or Fly.io)

---

# 2) Database schema (models overview)

Provide Django model definitions with key fields & relationships.

## Core Models (Phase 1)

### `countries.models.Country`
* `code: CharField(max_length=8, unique=True)`
* `name: CharField`
* `region: CharField`
* `currency: CharField`
* `population: IntegerField (nullable)`
* `flag_image: CloudinaryField('flags')`
* `hero_image: CloudinaryField('country_heroes', blank=True)`
* `summary: TextField`
* `cost_of_living_index: FloatField (nullable)`
* `difficulty_score: IntegerField (1-10, nullable)`
* `avg_rent_monthly_usd: DecimalField (nullable)` — average rent in major cities
* `avg_meal_cost_usd: DecimalField (nullable)` — average meal cost
* `healthcare_monthly_usd: DecimalField (nullable)` — average healthcare/insurance
* `metadata: JSONField (default=dict)` (flexible for future data)
* `created_at`, `updated_at`

### `visas.models.VisaType`
* `country = ForeignKey(Country, related_name='visa_types')`
* `name: CharField`
* `slug: SlugField`
* `description: TextField`
* `processing_time_min_weeks: IntegerField (nullable)`
* `processing_time_max_weeks: IntegerField (nullable)`
* `cost_estimate_min: DecimalField (nullable)`
* `cost_estimate_max: DecimalField (nullable)`
* `requirements: JSONField (default=list)`
* `is_active: BooleanField (default=True)`
* `created_at`, `updated_at`

### `visas.models.VisaStep`
* `visa_type = ForeignKey(VisaType, related_name='steps')`
* `order: IntegerField`
* `title: CharField`
* `description: TextField`
* `estimated_time_days: IntegerField (nullable)`
* `estimated_cost_usd: DecimalField (nullable)` — cost for this specific step
* `tips: JSONField (default=list)`
* `common_pitfalls: JSONField (default=list)`

### `users.models.User` (extend AbstractUser)
* Core auth fields (email, password - all optional for anonymous usage)
* `full_name: CharField (blank=True)`
* `bio: TextField (blank=True)`
* `country_of_origin: CharField (blank=True)`
* `current_country: CharField (blank=True)`
* `avatar: CloudinaryField('avatars', blank=True)`
* `is_anonymous_converted: BooleanField (default=False)` — track if they started anonymous
* `created_at`, `updated_at`

### `users.models.UserProfile` (structured profile data)
* `user = OneToOneField(User, on_delete=CASCADE)`
* `education_level: CharField(choices=EDUCATION_CHOICES, blank=True)`
* `field_of_study: CharField (blank=True)`
* `years_experience: IntegerField (default=0)`
* `current_job_title: CharField (blank=True)`
* `budget_usd: DecimalField (nullable)`
* `monthly_savings_usd: DecimalField (nullable)`
* `target_move_date: DateField (nullable)`
* `skills: JSONField (default=list)` — array of skill strings
* `languages: JSONField (default=list)` — array of language strings
* `has_dependents: BooleanField (default=False)`
* `num_dependents: IntegerField (default=0)`
* `preferred_climate: CharField (blank=True)`
* `created_at`, `updated_at`

### `roadmaps.models.Roadmap`
* `session_id: CharField (max_length=255, blank=True)` — for anonymous users (Redis session key)
* `user = ForeignKey(User, null=True, blank=True)` — null for anonymous
* `title: CharField`
* `country = FK(Country)`
* `visa_type = FK(VisaType, null=True, blank=True)`
* `goal: CharField` (study, work, business, family)
* `profile_snapshot: JSONField` (snapshot of profile at generation time)
* `ai_tone: CharField (default='helpful')` — which AI personality was used
* `status: CharField (default='draft')` (draft, active, completed, archived)
* `is_anonymous: BooleanField (default=False)` — track if created without login
* `created_at`, `updated_at`

### `roadmaps.models.RoadmapStep` (normalized, not JSON)
* `roadmap = FK(Roadmap, related_name='steps')`
* `order: IntegerField`
* `title: CharField`
* `description: TextField`
* `estimated_time_days: IntegerField (nullable)`
* `estimated_cost_usd: DecimalField (nullable)`
* `tips: JSONField (default=list)`
* `pitfalls: JSONField (default=list)`
* `ai_enhanced: BooleanField (default=False)` — was this enhanced by AI?
* `ai_enhancement: TextField (blank=True)` — additional AI advice

### `roadmaps.models.RoadmapStepStatus`
* `step = FK(RoadmapStep, related_name='status')`
* `completed: BooleanField (default=False)`
* `completed_at: DateTimeField (null=True)`
* `notes: TextField (blank=True)`
* `blocked: BooleanField (default=False)`
* `blocker_reason: TextField (blank=True)`

### `ai.models.PromptTemplate`
* `name: CharField (unique=True)`
* `description: TextField`
* `prompt_text: TextField` (Jinja2 template with {{variables}})
* `temperature: FloatField (default=0.7)`
* `max_tokens: IntegerField (default=1000)`
* `mode: CharField` (roadmap_enrich, doc_builder, compare, interview_prep, general)
* `tone: CharField` (helpful, uncle_japa, bestie, strict_officer, hype_man, therapist)
* `is_active: BooleanField (default=True)`
* `created_at`, `updated_at`

### `ai.models.AIRequest` (logging only)
* `session_id: CharField (max_length=255, blank=True)` — track anonymous usage
* `user = FK(User, null=True, blank=True)`
* `prompt_template = FK(PromptTemplate, null=True)`
* `prompt_text: TextField`
* `response_text: TextField`
* `model_used: CharField (default='gpt-4o-mini')`
* `tokens_used: IntegerField (nullable)`
* `cost_usd: DecimalField (nullable)`
* `duration_seconds: FloatField (nullable)`
* `metadata: JSONField`
* `created_at: DateTimeField`

## Phase 2 Models (add later)

### `docs.models.DocumentTemplate`
* `name`, `template_type`, `description`, `content_template`, `example_fields`, `is_active`

### `docs.models.GeneratedDocument`
* `session_id: CharField` — for anonymous users
* `user`, `template`, `title`, `content`, `format`, `cloudinary_url`, `metadata`, `created_at`

### `maps.models.GeoPoint`
* `country`, `city_name`, `lat`, `lng`, `point_type`, `name`, `description`, `metadata`

### `stories.models.Story`
* `title`, `slug`, `author_name`, `author`, `content`, `country`, `tags`, `cover_image`, `approved`, `featured`

---

# 3) Anonymous User Strategy

## Session-Based Data Storage
* Use Django sessions backed by Redis
* Generate unique `session_id` for anonymous users
* Store temporary roadmaps, calculations, AI chats in session
* When user signs up: migrate session data to their account

## Implementation Pattern
```python
# Every endpoint should work like this:
def create_roadmap(request):
    user = request.user if request.user.is_authenticated else None
    session_id = request.session.session_key if not user else None
    
    roadmap = Roadmap.objects.create(
        user=user,
        session_id=session_id,
        is_anonymous=(user is None),
        ...
    )
```

## Data Migration on Signup
* When anonymous user registers: find all records with their `session_id`
* Update `user` field, clear `session_id`, set `is_anonymous=False`
* Preserve all their roadmaps, calculations, chat history

## Session Management
* Sessions expire after 30 days
* Prompt anonymous users to save their progress before expiry
* Allow "claim this roadmap" functionality via email link

---

# 4) API design (DRF endpoints)

Use JWT auth (SimpleJWT) but make ALL endpoints work without auth. Structure: `/api/v1/...`

## Phase 1 Endpoints (MVP)

### Auth (All Optional)
* `POST /api/v1/auth/register/` — optional registration
* `POST /api/v1/auth/login/` — returns JWT tokens
* `POST /api/v1/auth/refresh/` — refresh access token
* `GET /api/v1/auth/me/` — get current user (requires auth)
* `PATCH /api/v1/auth/me/` — update profile (requires auth)
* `POST /api/v1/auth/claim-session/` — migrate anonymous data to account

### Countries & Visas (No auth required)
* `GET /api/v1/countries/` — list countries (filters: region, difficulty, search)
* `GET /api/v1/countries/{code}/` — country detail + visa summary + cost data
* `GET /api/v1/countries/{code}/visa-types/` — visa types for country
* `GET /api/v1/visas/{id}/` — visa detail with steps and costs

### Roadmap Generation (CORE FEATURE - No auth required)
* `POST /api/v1/roadmaps/generate/`
  - Body: `{country, goal, visa_type_id?, profile{education, budget, etc}, ai_tone}`
  - Works for anonymous: uses session_id
  - Works for authenticated: uses user_id
  - Returns: roadmap with deterministic steps + queues AI enrichment
  - Response: `{roadmap_id, title, status, steps[], ai_enrichment_status, is_anonymous}`

* `GET /api/v1/roadmaps/` — list roadmaps (session-based or user-based)
* `GET /api/v1/roadmaps/{id}/` — get roadmap detail
* `PATCH /api/v1/roadmaps/{id}/` — update roadmap (title, status)
* `POST /api/v1/roadmaps/{id}/steps/{step_id}/complete/` — mark step complete
* `POST /api/v1/roadmaps/{id}/steps/{step_id}/block/` — mark step blocked with reason

### Cost Calculator (Enhanced - No auth required)
* `POST /api/v1/calc/estimate/`
  - Body: 
    ```json
    {
      "country": "CAN",
      "city": "Toronto",
      "visa_type": "student",
      "duration_months": 24,
      "num_dependents": 0,
      "inputs": {
        "flights": 1200,
        "visa_fees": 150,
        "insurance_yearly": 600,
        "tuition_yearly": 15000,
        "rent_monthly": null,  // use country average if null
        "living_monthly": null,  // use country average if null
        "buffer_percentage": 20
      }
    }
    ```
  - Returns: 
    ```json
    {
      "total_estimated": 52000,
      "breakdown": {
        "visa_application": 150,
        "flights": 1200,
        "insurance": 1200,
        "tuition": 30000,
        "accommodation": 28800,
        "living_expenses": 19200,
        "healthcare": 1200,
        "phone_internet": 960,
        "transportation": 2400,
        "buffer": 10400
      },
      "hidden_costs": [
        {"item": "Initial apartment deposit", "estimated": 2400},
        {"item": "Furniture & setup", "estimated": 1500},
        {"item": "Winter clothing", "estimated": 500}
      ],
      "monthly_breakdown": {
        "essential": 2100,
        "optional": 400,
        "total": 2500
      },
      "savings_plan": {
        "months_to_save": 12,
        "monthly_target": 4333,
        "aggressive_plan": {"months": 8, "monthly": 6500},
        "relaxed_plan": {"months": 18, "monthly": 2889}
      },
      "cost_comparison": {
        "your_estimate": 52000,
        "typical_range": "45000-60000",
        "percentile": "60th"
      },
      "currency": "USD"
    }
    ```

### AI Assistant (Japabot - No auth required)
* `POST /api/v1/ai/chat/`
  - Body:
    ```json
    {
      "message": "What's the fastest way to get a work visa for Germany as a software engineer?",
      "tone": "uncle_japa",
      "context": {
        "roadmap_id": "...",
        "country_code": "DEU",
        "user_profile": {...}
      }
    }
    ```
  - Returns:
    ```json
    {
      "answer": "My guy, listen...",
      "personality_intro": "Uncle Japa here!",
      "sources": [
        {"type": "visa", "id": 5, "name": "EU Blue Card"},
        {"type": "country", "code": "DEU"}
      ],
      "follow_up_questions": [
        "Do you have a university degree?",
        "What's your current salary range?"
      ],
      "tokens_used": 450,
      "cached": false
    }
    ```
  
* `POST /api/v1/ai/compare/`
  - Body: `{left: "CAN", right: "DEU", metrics: ["cost", "pr_time", "job_market", "quality_of_life"], user_profile: {...}}`
  - Returns: Structured comparison tailored to user's profile

### Timeline Planner (No auth required)
* `POST /api/v1/timeline/create/`
  - Body: `{roadmap_id, start_date, target_date}`
  - Returns: Timeline with milestones and deadlines
  
* `GET /api/v1/timeline/{roadmap_id}/`
  - Returns calendar-friendly timeline

### Session Management (For anonymous users)
* `POST /api/v1/session/save/` — explicitly save session data (extends expiry)
* `GET /api/v1/session/status/` — check session status and expiry
* `POST /api/v1/session/email/` — email session link to user for later access

### Admin Tools (protected)
* `POST /api/v1/admin/import/countries/` — upload CSV/JSON
* `POST /api/v1/admin/import/visa-types/` — import visa data
* `GET /api/v1/admin/ai/prompts/` — manage prompt templates
* `GET /api/v1/admin/analytics/` — usage stats (anonymous vs registered, popular countries, etc.)

## Phase 2 Endpoints (add later)

### Document Builder
* `GET /api/v1/docs/templates/`
* `POST /api/v1/docs/generate/` — works for anonymous too
* `GET /api/v1/docs/{id}/`

### Maps
* `GET /api/v1/maps/points/?country=X&type=Y`

### Stories
* `GET /api/v1/stories/`
* `POST /api/v1/stories/` (user submissions)

---

# 5) Roadmap generation logic

## Step 1: Deterministic Generation (instant)
* Query `VisaType` → `VisaSteps` from database
* Create `RoadmapStep` objects (many-to-one relationship)
* If no visa selected, use generic steps based on goal
* Add cost estimates using country's cost data and visa step costs
* Return immediately to user

## Step 2: AI Enrichment (async via Celery)
* Queue background task to enhance roadmap
* Use `PromptTemplate` with mode='roadmap_enrich'
* Build context: user profile + country + visa steps + tone
* Call OpenAI API (gpt-4o-mini for cost)
* Parse response, update `RoadmapStep.ai_enhanced` and `ai_enhancement` fields
* Log request in `AIRequest` for debugging

## Step 3: Fallback Strategy
* If AI fails: keep deterministic steps
* Mark roadmap with `ai_metadata.fallback_used = True`
* Never block user on AI - always have working roadmap

## Implementation Notes
* Use Jinja2 for prompt templating
* Cache AI responses in Redis (1 hour TTL)
* Rate limit AI endpoints (20 requests/hour per session)
* For anonymous users: track by session_id
* Provide feedback in UI: "✨ AI personalization in progress..."

---

# 6) AI Integration (OpenAI)

## Service Architecture
* Create `ai/services.py` with `AIService` class
* Methods: `complete(template, context, use_cache=True, session_id=None)`
* Always use `gpt-4o-mini` (cheaper, fast enough for side project)
* Cache responses using hash of rendered prompt
* Log all requests to `AIRequest` model (track both user_id and session_id)

## Enhanced AI Tone System (Make it MEMORABLE)

### Personality Definitions
* **`helpful`** (Default) - "Hi! I'm Japabot, your friendly migration guide."
  - Tone: Professional but warm, clear explanations, encouraging
  
* **`uncle_japa`** - "Ah ah, my guy/my sister! Uncle Japa here o!"
  - Tone: Nigerian uncle who's been abroad, uses pidgin/slang, tells it straight, shares war stories
  - Example: "My brother, this Canada thing no be beans o. But I go show you how to do am proper."
  
* **`bestie`** - "Heyyyy bestie! 💅 Your japa bestie is hereee"
  - Tone: Gen-Z friend, uses slang and emojis, hypes you up, keeps it real
  - Example: "Bestie, Germany's visa process is actually kinda iconic ngl. Let me break it down for you..."
  
* **`strict_officer`** - "Good day. Immigration Officer speaking."
  - Tone: Formal, bureaucratic, no-nonsense, detailed procedures
  - Example: "You are required to submit the following documents in the exact order specified..."
  
* **`hype_man`** - "YOOOOO LET'S GOOOOO! 🔥🔥🔥"
  - Tone: ALL CAPS ENERGY, celebrates every win, motivational speaker vibes
  - Example: "THIS IS YOUR MOMENT! YOU'RE ABOUT TO CHANGE YOUR LIFE! HERE'S THE ROADMAP TO GREATNESS!"
  
* **`therapist`** - "I hear you, and your feelings are completely valid."
  - Tone: Validates emotions, addresses anxiety, gentle and supportive, acknowledges difficulty
  - Example: "Moving abroad can feel overwhelming. Let's break this down into manageable steps. How are you feeling about this?"

## Prompt Templates (seed these in DB)

### Roadmap Enrichment
```
You are {{personality_intro}}.

USER PROFILE:
- Education: {{profile.education_level}}
- Field: {{profile.field_of_study}}
- Experience: {{profile.years_experience}} years
- Budget: ${{profile.budget_usd}} USD
- Target date: {{profile.target_move_date}}
- Skills: {{profile.skills|join(', ')}}

TARGET: {{country}} for {{goal}}

CURRENT ROADMAP STEPS:
{{steps|tojson}}

YOUR TASK (use {{tone}} personality):
Enhance these roadmap steps with:
1. Personalized advice based on user's background
2. Specific timelines with deadlines
3. 2-3 practical tips per major phase
4. 2-3 common pitfalls to avoid (be specific)
5. Recommended tools/resources

{{tone_instructions}}

Keep response under 700 words. Be authentic to your personality. Return as JSON with key "enriched_steps".
```

### Cost Calculator Enhancement
```
You are {{personality_intro}}.

User is planning to move to {{country}} ({{city}}) for {{duration_months}} months.
Their budget is ${{budget}} USD.

COST BREAKDOWN:
{{cost_breakdown|tojson}}

YOUR TASK (use {{tone}} personality):
1. Identify "hidden costs" they might be missing (3-5 items)
2. Give realistic monthly budget advice
3. Suggest savings strategies for their timeline
4. Rate their budget: realistic/tight/comfortable/generous
5. Share one insider tip about managing money in {{country}}

Be authentic to your personality. Keep under 400 words.
```

### Country Comparison
```
You are {{personality_intro}}.

Compare {{left_country}} vs {{right_country}} for:
{{metrics|join(', ')}}

USER CONTEXT:
{{user_profile|tojson}}

YOUR TASK (use {{tone}} personality):
1. Side-by-side comparison on requested metrics
2. Which country fits their profile better?
3. Pros/cons for each
4. Deal-breakers to consider
5. Final recommendation with reasoning

Be authentic to your personality. Keep under 600 words. Use bullet points where helpful.
```

## Cost Control
* Use gpt-4o-mini (not gpt-4)
* Set max_tokens=1000 default
* Cache aggressively
* Rate limit: 20 AI calls/hour per session/user
* Log all costs in `AIRequest.cost_usd`
* Monitor monthly spend via admin dashboard

---

# 7) Background Jobs (Celery)

## Setup
* Celery with Redis broker
* `celery -A japaguide worker -l info`
* `celery -A japaguide beat -l info` (for scheduled tasks)

## Core Tasks

```python
@shared_task
def enrich_roadmap_with_ai(roadmap_id):
    """Enrich roadmap with AI personalization"""
    # Get roadmap with steps
    # Get appropriate prompt template
    # Build context from profile + country + steps + tone
    # Call AIService.complete()
    # Update RoadmapStep objects with ai_enhancement
    # Log to AIRequest (with session_id if anonymous)
    # Handle errors gracefully - never delete deterministic steps
    pass

@shared_task
def cleanup_expired_sessions():
    """Delete roadmaps from expired anonymous sessions (run daily)"""
    # Find sessions older than 30 days
    # Delete associated roadmaps where is_anonymous=True
    pass

@shared_task
def generate_roadmap_pdf(roadmap_id):  # Phase 2
    """Generate PDF export and upload to Cloudinary"""
    pass

@shared_task
def generate_document(document_id):  # Phase 2
    """Generate document with AI"""
    pass
```

---

# 8) Caching Strategy

Keep it simple:
* Redis for Celery + basic caching + session storage
* Cache TTLs:
  - Country lists: 1 hour
  - Visa types: 1 hour
  - AI responses: 1 hour
  - User/session roadmaps: DO NOT CACHE

Cache keys format:
* `ai:completion:{template_id}:{prompt_hash}`
* `countries:list:{filters_hash}`
* `visas:country:{country_code}`
* `session:{session_id}:data`

Don't over-cache. Only cache read-heavy, rarely-changing data.

---

# 9) Admin & Data Management

## Django Admin
* Use built-in Django Admin with light customizations
* Inline VisaSteps in VisaType admin
* Bulk actions for managing countries
* View-only access to AIRequest logs
* Dashboard showing: anonymous vs registered usage, popular countries, AI costs

## Management Commands

```bash
# Import data
python manage.py import_countries seed_data/countries.json
python manage.py import_visa_types seed_data/visa_germany.json --country=DEU

# Seed prompt templates
python manage.py seed_prompts

# Cleanup
python manage.py cleanup_expired_sessions
```

## Seed Data Format

JSON files in `seed_data/`:
* `countries.json` — array of country objects with enhanced cost data
* `visa_types_{country}.json` — visa types + steps for country
* `prompt_templates.json` — AI prompt templates with personality definitions

Example country (enhanced):
```json
{
  "code": "CAN",
  "name": "Canada",
  "region": "North America",
  "currency": "CAD",
  "population": 38000000,
  "summary": "Canada offers multiple immigration pathways...",
  "cost_of_living_index": 72.5,
  "difficulty_score": 6,
  "avg_rent_monthly_usd": 1200,
  "avg_meal_cost_usd": 12,
  "healthcare_monthly_usd": 100,
  "metadata": {
    "official_languages": ["English", "French"],
    "pr_timeline_months": "6-12",
    "popular_cities": ["Toronto", "Vancouver", "Montreal"],
    "job_market_score": 8,
    "hidden_costs": [
      "Winter clothing ($300-500 initial)",
      "Apartment deposit (first + last month)",
      "Phone plan ($40-60/month)"
    ]
  }
}
```

---

# 10) Security & Best Practices

## Environment Variables (.env)
```bash
DEBUG=False
SECRET_KEY=change-in-production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://japaguide.com
SESSION_COOKIE_AGE=2592000  # 30 days
```

## Security Settings
* JWT authentication (SimpleJWT) - OPTIONAL
* CORS configured for frontend only
* Rate limiting on AI endpoints (by session OR user)
* Input validation on all user inputs
* Session security: httponly cookies, secure in production
* Anonymous data cleanup after 30 days

## Rate Limiting (Session-Aware)
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # Applied to session_id if not authenticated
        'user': '1000/hour',
        'ai': '20/hour',  # Applied to session_id OR user_id
    }
}

# Custom throttle that works with sessions:
class SessionOrUserRateThrottle(UserRateThrottle):
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = request.session.session_key or self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
```

---

# 11) Cloudinary Integration

## Setup
```python
# settings.py
import cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)
```

## Model Fields
```python
from cloudinary.models import CloudinaryField

class Country(models.Model):
    flag_image = CloudinaryField('flags')
    hero_image = CloudinaryField('country_heroes', blank=True)
```

## Uploading Images
* Use CloudinaryField in models
* Auto-transforms: resize, optimize, auto-format
* Folders: `flags/`, `avatars/`, `country_heroes/`, `story_covers/`, `roadmap_pdfs/`

---

# 12) Docker Setup

## Dockerfile
```dockerfile
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "japaguide.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: japaguide
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis

  celery:
    build: .
    command: celery -A japaguide worker -l info
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - redis
      - db

  celery-beat:
    build: .
    command: celery -A japaguide beat -l info
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - redis

volumes:
  postgres_data:
```

## requirements.txt
```txt
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
django-redis==5.4.0
django-celery-results==2.5.1
psycopg2-binary==2.9.9
celery==5.3.4
redis==5.0.1
openai==1.3.5
cloudinary==1.36.0
python-dotenv==1.0.0
gunicorn==21.2.0
dj-database-url==2.1.0
Pillow==10.1.0
Jinja2==3.1.2
```

---

# 13) Quickstart (README)

```bash
# Clone and setup
git clone <repo>
cd japaguide-backend
cp .env.example .env
# Edit .env with your keys (OpenAI, Cloudinary)

# Start with Docker
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Import seed data
docker-compose exec web python manage.py import_countries seed_data/countries.json
docker-compose exec web python manage.py seed_prompts

# Access
# API: http://localhost:8000/api/v1/
# Admin: http://localhost:8000/admin/

# Test anonymous usage
curl -X POST http://localhost:8000/api/v1/roadmaps/generate/ \
  -H "Content-Type: application/json" \
  -d '{"country": "CAN", "goal": "work", "profile": {"education_level": "bachelor"}, "ai_tone": "uncle_japa"}'
```

---

# 14) Deliverables

Provide the following:

1. **Django project structure** — folder layout, app organization

2. **Complete models.py** for all Phase 1 apps:
   - Enhanced Country model with cost fields
   - Structured UserProfile model (not JSON blob)
   - Normalized RoadmapStep model (not JSON array)
   - Session-aware models (session_id fields where needed)

3. **DRF serializers & views** for core endpoints:
   - Auth (optional, with session claiming)
   - Countries with enhanced cost data
   - Roadmaps (anonymous-friendly)
   - Enhanced cost calculator with hidden costs
   - AI chat with personality system
   - Session management endpoints

4. **Anonymous user handling**:
   - Session-based data storage
   - Session to user migration logic
   - Session cleanup task

5. **Celery tasks**:
   - Roadmap AI enrichment
   - Session cleanup
   - Future: PDF generation

6. **AI service module** with:
   - AIService class with caching, prompt rendering, OpenAI integration
   - Enhanced personality system (6 distinct tones)
   - Session-aware request logging

7. **Admin configuration**:
   - Country admin with inline cost fields
   - VisaType admin with inline steps
   - Analytics dashboard for anonymous vs registered usage
   - AIRequest logs viewer

8. **Management commands**:
   - import_countries (with enhanced cost fields)
   - import_visa_types
   - seed_prompts (with all 6 personalities)
   - cleanup_expired_sessions

9. **Seed data examples**:
   - countries.json with cost data and hidden costs
   - visa_types_*.json with cost estimates per step
   - prompt_templates.json with personality definitions

10. **Docker files**:
    - Dockerfile
    - docker-compose.yml (db, redis, web, celery, celery-beat)
    - requirements.txt

11. **Enhanced prompt templates**:
    - Roadmap enrichment (with personality switching)
    - Cost calculator advice (with hidden costs)
    - Country comparison (personalized)
    - All 6 personality definitions

12. **URL routing** — complete urls.py for API endpoints including session management

13. **Settings configuration**:
    - Database, Redis, Celery
    - Cloudinary
    - DRF with session-aware throttling
    - JWT (optional auth)
    - Session configuration (30-day expiry)

14. **Permissions & Middleware**:
    - Custom permission classes that allow anonymous OR authenticated
    - Session creation middleware for anonymous users
    - Rate limiting that works with sessions

---

# 15) Key Implementation Notes

## Anonymous User Flow
```python
# Example view pattern for anonymous support:
class RoadmapGenerateView(APIView):
    permission_classes = [AllowAny]  # Works for everyone
    throttle_classes = [SessionOrUserRateThrottle]
    
    def post(self, request):
        # Ensure session exists
        if not request.session.session_key:
            request.session.create()
        
        # Get user or session
        user = request.user if request.user.is_authenticated else None
        session_id = None if user else request.session.session_key
        is_anonymous = user is None
        
        # Create roadmap (works for both)
        roadmap = Roadmap.objects.create(
            user=user,
            session_id=session_id,
            is_anonymous=is_anonymous,
            ...
        )
        
        return Response({
            'roadmap_id': roadmap.id,
            'is_anonymous': is_anonymous,
            'session_expires_in_days': 30 if is_anonymous else None,
            ...
        })
```

## Session Migration on Signup
```python
# When user registers, migrate their session data:
def claim_session_data(user, session_key):
    # Find all session-based records
    roadmaps = Roadmap.objects.filter(session_id=session_key, user__isnull=True)
    ai_requests = AIRequest.objects.filter(session_id=session_key, user__isnull=True)
    # ... other models
    
    # Migrate to user account
    roadmaps.update(user=user, session_id=None, is_anonymous=False)
    ai_requests.update(user=user, session_id=None)
    
    return {
        'migrated_roadmaps': roadmaps.count(),
        'migrated_ai_requests': ai_requests.count(),
    }
```

## Enhanced Cost Calculator Logic
```python
def calculate_migration_costs(country, city, visa_type, duration_months, inputs, num_dependents=0):
    """
    Enhanced cost calculation with country defaults and hidden costs
    """
    # Use country defaults if not provided
    monthly_rent = inputs.get('rent_monthly') or country.avg_rent_monthly_usd
    monthly_living = inputs.get('living_monthly') or (country.avg_meal_cost_usd * 60)  # ~2 meals/day
    monthly_healthcare = country.healthcare_monthly_usd or 100
    
    # Calculate base costs
    breakdown = {
        'visa_application': inputs.get('visa_fees', 150),
        'flights': inputs.get('flights', 1200) * (1 + num_dependents),
        'insurance': inputs.get('insurance_yearly', 600) * (duration_months / 12),
        'tuition': inputs.get('tuition_yearly', 0) * (duration_months / 12),
        'accommodation': monthly_rent * duration_months * (1 + num_dependents * 0.5),
        'living_expenses': monthly_living * duration_months * (1 + num_dependents * 0.7),
        'healthcare': monthly_healthcare * duration_months * (1 + num_dependents),
        'phone_internet': 60 * duration_months,
        'transportation': 100 * duration_months * (1 + num_dependents * 0.3),
    }
    
    # Add hidden costs from country metadata
    hidden_costs = []
    if country.metadata.get('hidden_costs'):
        for cost_item in country.metadata['hidden_costs']:
            # Parse cost from string like "Winter clothing ($300-500 initial)"
            # Add to hidden_costs list
            pass
    
    # Add standard hidden costs
    hidden_costs.extend([
        {'item': 'Initial apartment deposit', 'estimated': monthly_rent * 2},
        {'item': 'Furniture & setup', 'estimated': 1500},
        {'item': 'Documents translation/notarization', 'estimated': 300},
    ])
    
    # Calculate buffer
    subtotal = sum(breakdown.values())
    buffer_pct = inputs.get('buffer_percentage', 20) / 100
    breakdown['buffer'] = subtotal * buffer_pct
    
    total = subtotal + breakdown['buffer']
    
    # Savings plans
    budget = inputs.get('budget', total)
    months_to_save = inputs.get('months_to_save', 12)
    
    savings_plan = {
        'months_to_save': months_to_save,
        'monthly_target': total / months_to_save,
        'aggressive_plan': {
            'months': max(6, months_to_save * 0.66),
            'monthly': total / max(6, months_to_save * 0.66)
        },
        'relaxed_plan': {
            'months': months_to_save * 1.5,
            'monthly': total / (months_to_save * 1.5)
        }
    }
    
    return {
        'total_estimated': total,
        'breakdown': breakdown,
        'hidden_costs': hidden_costs,
        'monthly_breakdown': {
            'essential': monthly_rent + monthly_living + monthly_healthcare,
            'optional': 100,  # entertainment, etc
            'total': monthly_rent + monthly_living + monthly_healthcare + 100
        },
        'savings_plan': savings_plan,
        'cost_comparison': {
            'your_estimate': total,
            'typical_range': f"{total * 0.85:.0f}-{total * 1.15:.0f}",
            'percentile': '60th'  # Could calculate based on averages
        },
        'currency': 'USD'
    }
```

## AI Personality System Implementation
```python
# In AIService:
PERSONALITY_INTROS = {
    'helpful': "Hi! I'm Japabot, your friendly migration guide.",
    'uncle_japa': "Ah ah! Uncle Japa here o! My guy/my sister, how far?",
    'bestie': "Heyyyy bestie! 💅 Your japa bestie is here to spill all the tea!",
    'strict_officer': "Good day. Immigration Officer speaking. Please pay attention.",
    'hype_man': "YOOOOO! LET'S GOOOO! 🔥🔥🔥 YOUR HYPE MAN IS HERE!",
    'therapist': "Hello, I'm here to support you through this journey. How are you feeling?"
}

TONE_INSTRUCTIONS = {
    'uncle_japa': "Use Nigerian pidgin phrases naturally. Be like an uncle who's been abroad and knows the struggles. Call them 'my guy' or 'my sister'. Use phrases like 'no be beans', 'e no easy', 'I go show you'. Be real and encouraging.",
    'bestie': "Use Gen-Z slang naturally: 'bestie', 'ngl', 'lowkey', 'iconic', 'slay'. Use emojis occasionally. Be excited and supportive. Keep it real but fun.",
    'hype_man': "USE CAPS FOR EMPHASIS! BE EXTREMELY ENTHUSIASTIC! HYPE THEM UP! USE FIRE EMOJIS! CELEBRATE EVERY STEP! MOTIVATION OVERLOAD!",
    'therapist': "Acknowledge their emotions. Use phrases like 'I hear you', 'It's normal to feel...', 'Let's take this one step at a time'. Be gentle and validating.",
}

def complete(self, template, context, use_cache=True, session_id=None):
    # Add personality context
    tone = context.get('tone', 'helpful')
    context['personality_intro'] = PERSONALITY_INTROS.get(tone, PERSONALITY_INTROS['helpful'])
    context['tone_instructions'] = TONE_INSTRUCTIONS.get(tone, '')
    
    # Rest of completion logic...
```

---

# 16) Future-Proofing (Monetization Hooks - Infrastructure Only)

While monetization is not the focus now, structure the code to support it later:

## Add to User Model
```python
class User(AbstractUser):
    # ... existing fields
    plan_type = CharField(choices=['free', 'pro', 'enterprise'], default='free')
    plan_expiry = DateField(null=True, blank=True)
    ai_credits_remaining = IntegerField(default=10)  # Free tier gets 10 AI generations
    created_at = DateTimeField(auto_now_add=True)
```

## Add to Roadmap Model
```python
class Roadmap(models.Model):
    # ... existing fields
    is_premium = BooleanField(default=False)  # For future premium features
    export_count = IntegerField(default=0)  # Track PDF exports
```

## Add Middleware for Usage Tracking
```python
class UsageTrackingMiddleware:
    """Track API usage for future billing"""
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Track endpoint usage
        # Log for analytics
        # Check plan limits (when implemented)
        response = self.get_response(request)
        return response
```

## Add Admin Analytics
* Track anonymous vs registered conversion rate
* Most popular countries
* AI usage patterns
* Cost per user (OpenAI costs)
* Session retention rate

---

# 17) Style & Code Quality Guidelines

**Keep it clean and maintainable:**
* Use Django best practices (fat models, thin views, service layer for complex logic)
* Comprehensive docstrings for all service methods
* Type hints where helpful
* Comments explaining "why" not "what"
* Consistent naming: `snake_case` for Python, `camelCase` for JSON responses
* Use Django's built-in features (don't reinvent the wheel)
* DRY principle: extract common patterns into utils
* Test locally with Docker before deploying

**Code Style:**
```python
# Good: Clear, self-documenting
def calculate_visa_timeline(visa_type, user_profile):
    """
    Calculate realistic timeline for visa process.
    
    Args:
        visa_type: VisaType instance
        user_profile: Dict containing user's education, experience, etc.
    
    Returns:
        Dict with timeline_weeks, confidence_score, factors
    """
    base_weeks = visa_type.processing_time_min_weeks
    # ... logic
    return {'timeline_weeks': total_weeks, 'confidence': 0.8}

# Bad: Unclear, magic numbers
def calc(vt, up):
    w = vt.ptmin
    if up['e'] > 5:
        w = w * 0.9
    return w
```