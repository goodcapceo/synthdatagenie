"""
Synthetic Data Genie API

FastAPI application for generating synthetic financial transaction data.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

# Create FastAPI app
app = FastAPI(
    title="Synthetic Data Genie API",
    description="""
    Generate realistic synthetic financial transaction data for ML training,
    fraud detection testing, and fintech demos.

    ## Features
    - **Realistic Distributions**: Lognormal amounts, temporal patterns, geographic coherence
    - **6 Anomaly Types**: Geographic, velocity, amount, category, temporal, merchant risk
    - **Quality Metrics**: Statistical validation of generated data
    - **Fast Generation**: 50,000 records in under 10 seconds

    ## Use Cases
    - Training fraud detection models
    - Building fintech application demos
    - Testing data pipelines
    - Research and education
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS origins - include production frontend URL if set
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add production frontend URL from environment
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    cors_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api", tags=["Generation"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "message": "Synthetic Data Genie API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
