from tkinter.font import families

from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.user_preferences import router as user_preferences_router
from app.api.routes.users import router as users_router
from app.api.routes.meal_plans import router as meal_plans_router
from app.api.routes.recipe_ratings import router as recipe_ratings_router
from app.api.routes.families import router as families_router


api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(users_router, tags=["users"])
api_router.include_router(recipe_ratings_router, tags=["recipe ratings"])
api_router.include_router(user_preferences_router, tags=["user preferences"])
api_router.include_router(meal_plans_router, tags=["meal plans"])
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(families_router, tags=["families"])
