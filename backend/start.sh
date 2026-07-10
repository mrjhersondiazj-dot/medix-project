#!/bin/sh
set -e

python -m app.scripts.requisito_no_funcional_inicializacion_datos_demo_despliegue
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
