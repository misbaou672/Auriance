#!/usr/bin/env python
"""Simple server runner for AURIANCE"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import uvicorn
    from app.main_auriance import app

    port = int(os.environ.get("BACKEND_PORT", 8000))
    # NOTE: Avoid emojis here because Windows console/codepage can raise UnicodeEncodeError.
    print(f"Starting AURIANCE server on port {port}...")
    print(f"URL: http://localhost:{port}")
    print(f"Docs: http://localhost:{port}/docs")

    uvicorn.run(app, host="0.0.0.0", port=port)
except Exception as e:
    print(f"Startup error: {e}")
    import traceback
    traceback.print_exc()
