from fastapi import FastAPI
from backend.database import init_db
from backend.routes import certificate_routes
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(certificate_routes.router)


