from fastapi import APIRouter
from app.api import auth
from app.api import data
from app.api import analytics
from app.api import insights
from app.api import actions
import logging

logger = logging.getLogger(__name__)

api_router = APIRouter()

# Log all included routers
logger.info("Registering API routes...")

# Include all API routers
api_router.include_router(auth.router)
logger.info("✓ Auth router registered")

api_router.include_router(data.router)
logger.info("✓ Data router registered")

api_router.include_router(analytics.router)
logger.info("✓ Analytics router registered")

api_router.include_router(insights.router)
logger.info("✓ Insights router registered")

api_router.include_router(actions.router)
logger.info("✓ Actions router registered")

# Health check endpoint
@api_router.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "insightforge-api",
        "version": "1.0.0"
    }