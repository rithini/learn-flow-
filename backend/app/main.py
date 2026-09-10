import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.exceptions import LearnFlowException
from app.core.logging import logger
from app.db.base import Base
from app.db.session import engine
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing LearnFlow database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("LearnFlow API server startup completed.")
    yield
    logger.info("LearnFlow API server shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Role-based AI-assisted adaptive micro-learning portal for institutes.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Standardized Error Handling ---

@app.exception_handler(LearnFlowException)
async def learnflow_exception_handler(request: Request, exc: LearnFlowException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "requestId": exc.request_id,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join([str(l) for l in err.get("loc", [])])
        errors.append({"field": loc, "message": err.get("msg", "Validation error")})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "The submitted payload failed schema validation.",
                "details": errors,
                "requestId": str(uuid.uuid4()),
            }
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    req_id = str(uuid.uuid4())
    logger.error(f"Unhandled server error [Req ID: {req_id}]: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please try again later.",
                "details": [],
                "requestId": req_id,
            }
        },
    )


# --- System & Health Endpoints ---

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "learnflow-backend", "version": "1.0.0"}


@app.get("/ready", tags=["System"])
def readiness_check():
    return {"status": "ready", "database": "connected"}


# --- API v1 Routing ---
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
