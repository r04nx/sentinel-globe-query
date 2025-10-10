import httpx
import feedparser
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
import logging
from app.database.connection import get_database
from app.models.schemas import DisasterCreate, WeatherAlertCreate, NewsArticleCreate

logger = logging.getLogger(__name__)

class DisasterCrawler:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def close(self):
        await self.client.aclose()

    async def crawl_usgs_earthquakes(self) -> List[DisasterCreate]:
        """Crawl USGS earthquake data"""
        disasters = []
        try:
            # USGS GeoJSON feed for significant earthquakes in the last 30 days
            url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
            response = await self.client.get(url)
            response.raise_for_status()
            
            data = response.json()
            
            for feature in data.get("features", []):
                properties = feature.get("properties", {})
                geometry = feature.get("geometry", {})
                coordinates = geometry.get("coordinates", [])
                
                if len(coordinates) >= 2:
                    longitude, latitude = coordinates[0], coordinates[1]
                    magnitude = properties.get("mag")
                    
                    # Determine severity based on magnitude
                    if magnitude >= 7.0:
                        severity = "critical"
                    elif magnitude >= 6.0:
                        severity = "high"
                    elif magnitude >= 5.0:
                        severity = "medium"
                    else:
                        severity = "low"
                    
                    disaster = DisasterCreate(
                        type="earthquake",
                        title=properties.get("title", f"M {magnitude} Earthquake"),
                        description=properties.get("detail"),
                        severity=severity,
                        latitude=latitude,
                        longitude=longitude,
                        magnitude=magnitude,
                        source="USGS",
                        source_url=properties.get("url"),
                        external_id=feature.get("id"),
                        occurred_at=datetime.fromtimestamp(properties.get("time", 0) / 1000)
                    )
                    disasters.append(disaster)
                    
        except Exception as e:
            logger.error(f"Error crawling USGS earthquakes: {e}")
            
        return disasters

    async def crawl_noaa_weather_alerts(self) -> List[WeatherAlertCreate]:
        """Crawl NOAA weather alerts"""
        alerts = []
        try:
            # NOAA API for current weather alerts
            url = "https://api.weather.gov/alerts/active"
            headers = {
                "User-Agent": "SentinelGlobe/1.0 (disaster-monitoring)"
            }
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            for feature in data.get("features", []):
                properties = feature.get("properties", {})
                geometry = feature.get("geometry", {})
                
                # Get coordinates (use first coordinate if polygon)
                coordinates = geometry.get("coordinates", [[[[0, 0]]]])
                if coordinates and len(coordinates) > 0:
                    try:
                        if geometry.get("type") == "Polygon":
                            # For polygons, use the first coordinate of the first ring
                            coords = coordinates[0][0]
                            longitude, latitude = coords[0], coords[1]
                        else:
                            longitude, latitude = coordinates[0], coordinates[1]
                    except (IndexError, TypeError):
                        longitude, latitude = 0, 0
                
                # Map severity
                severity_map = {
                    "Extreme": "critical",
                    "Severe": "high",
                    "Moderate": "medium",
                    "Minor": "low"
                }
                severity = severity_map.get(properties.get("severity", "Minor"), "low")
                
                alert = WeatherAlertCreate(
                    alert_type=properties.get("event", "Weather Alert").lower(),
                    title=properties.get("headline", properties.get("event", "Weather Alert")),
                    description=properties.get("description"),
                    severity=severity,
                    latitude=latitude,
                    longitude=longitude,
                    area_desc=properties.get("areaDesc"),
                    urgency=properties.get("urgency", "Unknown").lower(),
                    certainty=properties.get("certainty", "Unknown").lower(),
                    expires_at=datetime.fromisoformat(properties.get("expires").replace("Z", "+00:00")) if properties.get("expires") else None,
                    issued_at=datetime.fromisoformat(properties.get("sent").replace("Z", "+00:00")) if properties.get("sent") else datetime.now(),
                    source="NOAA/NWS",
                    source_id=properties.get("id")
                )
                alerts.append(alert)
                
        except Exception as e:
            logger.error(f"Error crawling NOAA weather alerts: {e}")
            
        return alerts

    async def crawl_disaster_news(self) -> List[NewsArticleCreate]:
        """Crawl disaster-related news from RSS feeds"""
        articles = []
        
        # RSS feeds to monitor
        feeds = [
            "https://feeds.reuters.com/reuters/environment",
            "https://rss.cnn.com/rss/edition.rss",
            "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"
        ]
        
        disaster_keywords = [
            "earthquake", "tsunami", "hurricane", "tornado", "flood", "wildfire",
            "volcano", "landslide", "avalanche", "drought", "storm", "cyclone",
            "typhoon", "disaster", "emergency", "evacuation"
        ]
        
        for feed_url in feeds:
            try:
                response = await self.client.get(feed_url)
                response.raise_for_status()
                
                feed = feedparser.parse(response.text)
                
                for entry in feed.entries:
                    title = entry.get("title", "")
                    summary = entry.get("summary", "")
                    content = title + " " + summary
                    
                    # Check if article contains disaster keywords
                    found_keywords = [kw for kw in disaster_keywords if kw.lower() in content.lower()]
                    
                    if found_keywords:
                        published_time = entry.get("published_parsed")
                        published_at = datetime(*published_time[:6]) if published_time else datetime.now()
                        
                        article = NewsArticleCreate(
                            title=title,
                            summary=summary,
                            url=entry.get("link", ""),
                            source=feed.feed.get("title", "RSS Feed"),
                            published_at=published_at,
                            disaster_keywords=json.dumps(found_keywords)
                        )
                        articles.append(article)
                        
            except Exception as e:
                logger.error(f"Error crawling news feed {feed_url}: {e}")
                
        return articles

    async def crawl_fire_data(self) -> List[DisasterCreate]:
        """Crawl wildfire data from NASA FIRMS"""
        disasters = []
        try:
            # NASA FIRMS active fire data (last 24 hours)
            url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv"
            
            response = await self.client.get(url)
            response.raise_for_status()
            
            lines = response.text.strip().split('\n')
            if len(lines) > 1:  # Skip header
                header = lines[0].split(',')
                
                for line in lines[1:100]:  # Limit to 100 most recent
                    data = line.split(',')
                    if len(data) >= len(header):
                        row = dict(zip(header, data))
                        
                        try:
                            latitude = float(row.get('latitude', 0))
                            longitude = float(row.get('longitude', 0))
                            confidence = int(row.get('confidence', 0))
                            
                            # Determine severity based on confidence
                            if confidence >= 80:
                                severity = "high"
                            elif confidence >= 50:
                                severity = "medium"
                            else:
                                severity = "low"
                            
                            disaster = DisasterCreate(
                                type="wildfire",
                                title=f"Active Fire Detection - Confidence {confidence}%",
                                description=f"Satellite detected active fire with {confidence}% confidence",
                                severity=severity,
                                latitude=latitude,
                                longitude=longitude,
                                source="NASA FIRMS",
                                occurred_at=datetime.now(),
                                external_id=f"FIRMS_{latitude}_{longitude}_{row.get('acq_date')}"
                            )
                            disasters.append(disaster)
                            
                        except (ValueError, TypeError) as e:
                            logger.warning(f"Error parsing fire data row: {e}")
                            continue
                            
        except Exception as e:
            logger.error(f"Error crawling fire data: {e}")
            
        return disasters

    async def store_disasters(self, disasters: List[DisasterCreate]):
        """Store disasters in database"""
        if not disasters:
            return
            
        db = await get_database()
        
        for disaster in disasters:
            try:
                # Check if disaster already exists
                existing = await db.disaster.find_first(
                    where={"external_id": disaster.external_id}
                )
                
                if not existing:
                    await db.disaster.create(data=disaster.dict())
                    
            except Exception as e:
                logger.error(f"Error storing disaster: {e}")

    async def store_weather_alerts(self, alerts: List[WeatherAlertCreate]):
        """Store weather alerts in database"""
        if not alerts:
            return
            
        db = await get_database()
        
        for alert in alerts:
            try:
                # Check if alert already exists
                existing = await db.weatheralert.find_first(
                    where={"source_id": alert.source_id}
                )
                
                if not existing:
                    await db.weatheralert.create(data=alert.dict())
                    
            except Exception as e:
                logger.error(f"Error storing weather alert: {e}")

    async def store_news_articles(self, articles: List[NewsArticleCreate]):
        """Store news articles in database"""
        if not articles:
            return
            
        db = await get_database()
        
        for article in articles:
            try:
                # Check if article already exists
                existing = await db.newsarticle.find_first(
                    where={"url": article.url}
                )
                
                if not existing:
                    await db.newsarticle.create(data=article.dict())
                    
            except Exception as e:
                logger.error(f"Error storing news article: {e}")

    async def run_full_crawl(self):
        """Run a complete crawling session"""
        logger.info("Starting disaster data crawl")
        
        try:
            # Crawl all data sources
            earthquakes = await self.crawl_usgs_earthquakes()
            weather_alerts = await self.crawl_noaa_weather_alerts()
            news_articles = await self.crawl_disaster_news()
            fires = await self.crawl_fire_data()
            
            # Store all data
            await self.store_disasters(earthquakes + fires)
            await self.store_weather_alerts(weather_alerts)
            await self.store_news_articles(news_articles)
            
            logger.info(f"Crawl completed: {len(earthquakes)} earthquakes, {len(fires)} fires, {len(weather_alerts)} weather alerts, {len(news_articles)} news articles")
            
        except Exception as e:
            logger.error(f"Error in full crawl: {e}")
        finally:
            await self.close()

# Global crawler instance
crawler = DisasterCrawler()
