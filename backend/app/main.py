from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Import routers
from app.routers import disasters, chat, crawler
from app.database.connection import db_manager
from app.services.chatbot import initialize_chatbot

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    logger.info("Starting Sentinel Globe API")
    
    # Initialize database
    try:
        await db_manager.connect()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
    
    # Initialize chatbot
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        try:
            initialize_chatbot(gemini_api_key)
            logger.info("Chatbot initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize chatbot: {e}")
    else:
        logger.warning("GEMINI_API_KEY not found, chatbot will not be available")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Sentinel Globe API")
    try:
        await db_manager.disconnect()
        logger.info("Database disconnected successfully")
    except Exception as e:
        logger.error(f"Error disconnecting database: {e}")

# Create FastAPI app
app = FastAPI(
    title="Sentinel Globe API",
    description="Real-time disaster monitoring and emergency information API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(disasters.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(crawler.router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Sentinel Globe API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "disasters": "/api/disasters",
            "chat": "/api/chat",
            "crawler": "/api/crawler",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db_status = "connected" if db_manager.db else "disconnected"
        
        # Check chatbot status
        from app.services.chatbot import chatbot
        chatbot_status = "available" if chatbot else "unavailable"
        
        return {
            "status": "healthy",
            "database": db_status,
            "chatbot": chatbot_status,
            "timestamp": "2024-01-01T00:00:00Z"  # You might want to use actual timestamp
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }
