from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.services.crawler import crawler

router = APIRouter(prefix="/crawler", tags=["crawler"])

@router.post("/crawl")
async def run_crawl(background_tasks: BackgroundTasks):
    """Trigger a disaster data crawling session"""
    try:
        background_tasks.add_task(crawler.run_full_crawl)
        return {"message": "Crawling started in background"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting crawl: {str(e)}")

@router.post("/crawl/earthquakes")
async def crawl_earthquakes(background_tasks: BackgroundTasks):
    """Crawl only earthquake data"""
    async def crawl_and_store_earthquakes():
        try:
            earthquakes = await crawler.crawl_usgs_earthquakes()
            await crawler.store_disasters(earthquakes)
        except Exception as e:
            print(f"Error crawling earthquakes: {e}")
    
    background_tasks.add_task(crawl_and_store_earthquakes)
    return {"message": "Earthquake crawling started in background"}

@router.post("/crawl/weather")
async def crawl_weather(background_tasks: BackgroundTasks):
    """Crawl only weather alert data"""
    async def crawl_and_store_weather():
        try:
            alerts = await crawler.crawl_noaa_weather_alerts()
            await crawler.store_weather_alerts(alerts)
        except Exception as e:
            print(f"Error crawling weather alerts: {e}")
    
    background_tasks.add_task(crawl_and_store_weather)
    return {"message": "Weather alert crawling started in background"}

@router.post("/crawl/fires")
async def crawl_fires(background_tasks: BackgroundTasks):
    """Crawl only fire data"""
    async def crawl_and_store_fires():
        try:
            fires = await crawler.crawl_fire_data()
            await crawler.store_disasters(fires)
        except Exception as e:
            print(f"Error crawling fire data: {e}")
    
    background_tasks.add_task(crawl_and_store_fires)
    return {"message": "Fire data crawling started in background"}
