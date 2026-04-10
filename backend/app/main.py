from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
# from app.db.base import Base
# from app.db.session import engine
# from app.models import User

app = FastAPI(title=settings.APP_NAME)

# Base.metadata.create_all(bind=engine)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} is running",
        "environment": settings.APP_ENV,
    }
