from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

# from app.db.base import Base
# from app.db.session import engine
# from app.models import User

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Base.metadata.create_all(bind=engine)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} is running",
        "environment": settings.APP_ENV,
    }
