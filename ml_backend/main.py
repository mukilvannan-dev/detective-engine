"""
CaseMind AI - FastAPI Application Entry Point
Aliases app from app.py for standard uvicorn main:app convention.
"""

from app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
