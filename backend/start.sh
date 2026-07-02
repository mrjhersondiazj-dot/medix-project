#!/bin/sh
set -e

python -m app.scripts.init_db
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
