from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import get_db_connection, init_db
from backend.routes import certificate_routes, profile_routes, seatimelog_routes, document_routes, auth_routes, dashboard_routes, category_routes, resume_routes
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(certificate_routes.router)
app.include_router(profile_routes.router)
app.include_router(seatimelog_routes.router)
app.include_router(document_routes.router)
app.include_router(auth_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(category_routes.router)
app.include_router(resume_routes.router)

if __name__ == "__main__":
    try:
        import uvicorn
        uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    except ModuleNotFoundError:
        raise SystemExit("Install uvicorn: pip install uvicorn")
