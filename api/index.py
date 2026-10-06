"""Vercel serverless entrypoint: serves the FastAPI backend under /api.

vercel.json rewrites every /api/* request here and bundles backend/ with this function,
so the routes in backend/server.py run unchanged.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from server import app  # noqa: E402,F401
