import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import agencies, anomalies, investigate, dataset

app = FastAPI(
    title="FundWatch Intelligence API",
    description="Explainable MPLADS Spending-Anomaly Detection & Grounded Intelligence Service",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with /api prefix and root aliases
app.include_router(anomalies.router)
app.include_router(agencies.router)
app.include_router(investigate.router)
app.include_router(dataset.router)

@app.get("/")
def root():
    return {
        "service": "FundWatch Intelligence Engine",
        "status": "operational",
        "version": "2.0.0",
        "problem_statement": "MoSPI Problem Statement 10",
        "features": [
            "4-Dimension Mathematical Risk Scoring (S1, S2, S3, S4)",
            "Dynamic User Dataset Auto-Labelling & Ingestion",
            "Top 5 Investigator Visualizations",
            "Grounded Investigation Copilot"
        ],
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
