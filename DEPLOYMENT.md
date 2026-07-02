# MEDIX deployment

## Local

```powershell
docker compose up -d --build
docker compose exec backend python -m app.scripts.init_db
```

Open `http://127.0.0.1:5173`.

## Production checklist

Use these environment variables in your hosting provider:

```text
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DATABASE
REDIS_URL=redis://HOST:PORT/0
SECRET_KEY=use-a-long-random-secret
CORS_ORIGINS=https://your-medix-frontend-domain.com
VITE_API_URL=https://your-medix-backend-domain.com/api/v1
ENVIRONMENT=production
```

Recommended deployment:

1. Backend web service: Dockerfile `backend/Dockerfile.prod`, context `backend`.
2. Frontend web service: Dockerfile `frontend/Dockerfile.prod`, context `frontend`.
3. PostgreSQL database.
4. Redis instance.
5. Set `CORS_ORIGINS` to the final frontend URL.
6. Set `VITE_API_URL` to the final backend URL plus `/api/v1`.

The production backend container runs `python -m app.scripts.init_db` before starting, so demo roles are created automatically.
