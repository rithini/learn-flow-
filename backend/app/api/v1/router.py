from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.students import router as students_router
from app.api.v1.trainers import router as trainers_router
from app.api.v1.courses import router as courses_router
from app.api.v1.materials import router as materials_router
from app.api.v1.capsules import router as capsules_router
from app.api.v1.quizzes import router as quizzes_router
from app.api.v1.admins import router as admins_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.notifications import router as notifications_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(students_router)
api_v1_router.include_router(trainers_router)
api_v1_router.include_router(courses_router)
api_v1_router.include_router(materials_router)
api_v1_router.include_router(capsules_router)
api_v1_router.include_router(quizzes_router)
api_v1_router.include_router(admins_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(notifications_router)
