#!/usr/bin/env python3

import asyncio
import uvicorn
import os
import sys
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.database.connection import get_database
from app.services.crawler import crawler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def initialize_with_sample_data():
    """Initialize database with some sample disaster data"""
    try:
        db = await get_database()
        
        # Check if we already have data
        existing_disasters = await db.disaster.count()
        if existing_disasters > 0:
            logger.info(f"Database already has {existing_disasters} disasters. Skipping sample data.")
            return
        
        logger.info("Initializing database with sample disaster data...")
        
        # Sample disaster data
        sample_disasters = [
            {
                "type": "earthquake",
                "title": "M 6.2 Earthquake - Northern California",
                "description": "Moderate earthquake detected in Northern California region",
                "severity": "medium",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "magnitude": 6.2,
                "source": "USGS",
                "occurred_at": "2024-01-01T12:00:00Z",
                "status": "active"
            },
            {
                "type": "wildfire",
                "title": "Forest Fire - Los Angeles County",
                "description": "Active wildfire spreading in Los Angeles County",
                "severity": "high",
                "latitude": 34.0522,
                "longitude": -118.2437,
                "affected_area": 150.5,
                "source": "NASA FIRMS",
                "occurred_at": "2024-01-02T08:30:00Z",
                "status": "active"
            },
            {
                "type": "flood",
                "title": "Flash Flood Warning - Houston Area",
                "description": "Heavy rainfall causing flash flooding in Houston metropolitan area",
                "severity": "high",
                "latitude": 29.7604,
                "longitude": -95.3698,
                "casualties": 2,
                "source": "NWS",
                "occurred_at": "2024-01-03T15:45:00Z",
                "status": "monitoring"
            }
        ]
        
        for disaster_data in sample_disasters:
            await db.disaster.create(data=disaster_data)
        
        logger.info(f"Created {len(sample_disasters)} sample disasters")
        
    except Exception as e:
        logger.error(f"Error initializing sample data: {e}")

async def run_initial_crawl():
    """Run a quick crawl to get some real data"""
    try:
        logger.info("Running initial data crawl...")
        
        # Just crawl earthquakes for now - keep it simple
        earthquakes = await crawler.crawl_usgs_earthquakes()
        await crawler.store_disasters(earthquakes)
        
        logger.info(f"Crawled {len(earthquakes)} earthquakes")
        
    except Exception as e:
        logger.error(f"Error in initial crawl: {e}")

async def main():
    """Main initialization function"""
    logger.info("Starting SENTINEL Backend Server...")
    
    # Initialize database with sample data
    await initialize_with_sample_data()
    
    # Run initial crawl
    await run_initial_crawl()
    
    # Start the FastAPI server
    config = uvicorn.Config(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
        log_level="info"
    )
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
