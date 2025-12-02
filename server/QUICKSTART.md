# 🚀 Japaguide Backend - Quick Start

## Fastest Way to Run

```powershell
cd C:\Users\HP\Videos\programming\japa-guide\server

# Option 1: Docker (Easiest)
docker-compose up -d
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser

# Option 2: Local
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Test It's Working

```powershell
# Health check
curl http://localhost:8000/api/v1/countries/

# Test anonymous roadmap generation
curl -X POST http://localhost:8000/api/v1/roadmaps/generate/ -H "Content-Type: application/json" -d "{\"country\":\"CAN\",\"goal\":\"work\"}"
```

## Add Sample Data

1. Go to http://localhost:8000/admin/
2. Login with superuser
3. Add a Country (e.g., Canada, code: CAN)
4. Add a VisaType for that country
5. Add VisaSteps for that visa type

## API Endpoints

- Countries: `/api/v1/countries/`
- Visas: `/api/v1/visas/`
- Roadmaps: `/api/v1/roadmaps/generate/`
- Cost Calc: `/api/v1/roadmaps/calc/estimate/`
- AI Chat: `/api/v1/ai/chat/`

## Key Files

- `IMPLEMENTATION_COMPLETE.md` - Full feature list
- `PROJECT_STATUS.md` - Technical details
- `.env` - Configuration (update API keys)

## Phase 1 = 100% Complete ✅

All core features working. Phase 2 (docs, maps, stories) is future work.
