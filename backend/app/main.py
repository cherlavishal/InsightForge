from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager
from app.config import settings
from app.database import engine, Base, check_database_connection
from app.api.routes import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting InsightForge backend...")
    
    # Check database connection
    if not check_database_connection():
        logger.error("Database connection failed!")
    else:
        logger.info("Database connected successfully")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down InsightForge backend...")

# Create FastAPI app
app = FastAPI(
    title="InsightForge API",
    description="Cloud-Native AI System for Intelligent Data-Driven Decision Support",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Parse CORS origins from settings
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [origin.strip() for origin in origins.split(',')]

# Configure CORS - MUST be first middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "insightforge-backend"}
# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to InsightForge API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }

# Global exception handler - ensures CORS headers even on errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    
    # Determine status code
    status_code = 500
    if hasattr(exc, 'status_code'):
        status_code = exc.status_code
    
    return JSONResponse(
        status_code=status_code,
        content={
            "detail": "An internal server error occurred",
            "error": str(exc)
        },
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )