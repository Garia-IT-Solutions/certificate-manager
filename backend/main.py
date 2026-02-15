from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import (
    auth_routes,
    certificate_routes,
    dashboard_routes,
    document_routes,
    profile_routes,
    seatimelog_routes
)
from backend.database import init_db
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    init_db()
    yield

app = FastAPI(title="MarineTracker Pro API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, tags=["Authentication"])
app.include_router(certificate_routes.router, tags=["Certificates"])
app.include_router(dashboard_routes.router, tags=["Dashboard"])
app.include_router(document_routes.router, tags=["Documents"])
app.include_router(profile_routes.router, tags=["Profile"])
app.include_router(seatimelog_routes.router, tags=["Sea Time Logs"])

@app.get("/")
def read_root():
    return {"message": "MarineTracker Pro API is running"}
