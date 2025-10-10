import google.generativeai as genai
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.database.connection import get_database
from app.models.schemas import ChatMessage, ChatResponse

logger = logging.getLogger(__name__)

class DisasterChatbot:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def get_disaster_context(self, query: str) -> Dict[str, Any]:
        """Get relevant disaster data based on the query"""
        db = await get_database()
        context = {}
        
        try:
            # Get recent disasters
            recent_disasters = await db.disaster.find_many(
                where={
                    "occurred_at": {
                        "gte": datetime.now() - timedelta(days=30)
                    }
                },
                order_by={"occurred_at": "desc"},
                take=50
            )
            
            # Get active weather alerts
            active_alerts = await db.weatheralert.find_many(
                where={
                    "OR": [
                        {"expires_at": {"gte": datetime.now()}},
                        {"expires_at": None}
                    ]
                },
                order_by={"issued_at": "desc"},
                take=20
            )
            
            # Get recent news articles
            recent_news = await db.newsarticle.find_many(
                where={
                    "published_at": {
                        "gte": datetime.now() - timedelta(days=7)
                    }
                },
                order_by={"published_at": "desc"},
                take=10
            )
            
            # Filter based on query keywords
            query_lower = query.lower()
            
            # Filter disasters
            relevant_disasters = []
            for disaster in recent_disasters:
                if any(keyword in query_lower for keyword in [
                    disaster.type, disaster.severity, "earthquake", "fire", "flood", 
                    "hurricane", "tornado", "disaster", "emergency"
                ]):
                    relevant_disasters.append({
                        "id": disaster.id,
                        "type": disaster.type,
                        "title": disaster.title,
                        "severity": disaster.severity,
                        "location": f"{disaster.latitude}, {disaster.longitude}",
                        "occurred_at": disaster.occurred_at.isoformat(),
                        "magnitude": disaster.magnitude,
                        "casualties": disaster.casualties,
                        "status": disaster.status
                    })
            
            # Filter alerts
            relevant_alerts = []
            for alert in active_alerts:
                if any(keyword in query_lower for keyword in [
                    alert.alert_type, alert.severity, "weather", "storm", "warning", "alert"
                ]):
                    relevant_alerts.append({
                        "type": alert.alert_type,
                        "title": alert.title,
                        "severity": alert.severity,
                        "location": f"{alert.latitude}, {alert.longitude}",
                        "area": alert.area_desc,
                        "urgency": alert.urgency,
                        "expires_at": alert.expires_at.isoformat() if alert.expires_at else None
                    })
            
            # Filter news
            relevant_news = []
            for article in recent_news:
                if any(keyword in query_lower for keyword in [
                    "news", "article", "report", article.title.lower()
                ]):
                    relevant_news.append({
                        "title": article.title,
                        "summary": article.summary,
                        "source": article.source,
                        "published_at": article.published_at.isoformat(),
                        "keywords": json.loads(article.disaster_keywords) if article.disaster_keywords else []
                    })
            
            context = {
                "disasters": relevant_disasters[:10],  # Limit for context
                "weather_alerts": relevant_alerts[:5],
                "news": relevant_news[:3],
                "stats": {
                    "total_recent_disasters": len(recent_disasters),
                    "active_alerts": len(active_alerts),
                    "disaster_types": list(set([d.type for d in recent_disasters]))
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting disaster context: {e}")
            context = {"error": "Unable to retrieve current disaster data"}
            
        return context
    
    def create_system_prompt(self, context: Dict[str, Any]) -> str:
        """Create a system prompt with disaster context"""
        prompt = """You are Sentinel Globe Assistant, an AI chatbot specialized in disaster monitoring and emergency information. You have access to real-time disaster data, weather alerts, and related news.

Current Disaster Context:
"""
        
        if context.get("disasters"):
            prompt += f"\nActive/Recent Disasters ({len(context['disasters'])} shown):\n"
            for disaster in context["disasters"]:
                prompt += f"- {disaster['type'].title()}: {disaster['title']} (Severity: {disaster['severity']}, Location: {disaster['location']}, Status: {disaster['status']})\n"
        
        if context.get("weather_alerts"):
            prompt += f"\nActive Weather Alerts ({len(context['weather_alerts'])} shown):\n"
            for alert in context["weather_alerts"]:
                prompt += f"- {alert['type'].title()}: {alert['title']} (Severity: {alert['severity']}, Area: {alert.get('area', 'N/A')})\n"
        
        if context.get("news"):
            prompt += f"\nRecent News ({len(context['news'])} shown):\n"
            for article in context["news"]:
                prompt += f"- {article['title']} ({article['source']})\n"
        
        if context.get("stats"):
            stats = context["stats"]
            prompt += f"\nOverall Statistics:\n"
            prompt += f"- Total recent disasters: {stats.get('total_recent_disasters', 0)}\n"
            prompt += f"- Active weather alerts: {stats.get('active_alerts', 0)}\n"
            prompt += f"- Disaster types monitored: {', '.join(stats.get('disaster_types', []))}\n"
        
        prompt += """
Your role:
1. Provide accurate, helpful information about disasters and emergencies
2. Answer questions about current disasters, weather alerts, and safety measures
3. Explain disaster data in a clear, understandable way
4. Offer practical advice for emergency preparedness
5. Be empathetic when discussing disasters that affect people

Guidelines:
- Always prioritize safety and official emergency information
- Provide specific details when available (locations, magnitudes, severity levels)
- Explain technical terms in simple language
- Suggest reliable sources for more information
- Be clear about data limitations and encourage users to follow official emergency channels

Please respond to the user's question using the current disaster context provided above.
"""
        return prompt
    
    async def chat(self, message: str) -> ChatResponse:
        """Process a chat message and return response with context"""
        try:
            # Get relevant disaster context
            context = await self.get_disaster_context(message)
            
            # Create system prompt with context
            system_prompt = self.create_system_prompt(context)
            
            # Generate response
            full_prompt = f"{system_prompt}\n\nUser Question: {message}\n\nAssistant:"
            
            response = self.model.generate_content(full_prompt)
            
            return ChatResponse(
                reply=response.text,
                context={
                    "disasters_count": len(context.get("disasters", [])),
                    "alerts_count": len(context.get("weather_alerts", [])),
                    "news_count": len(context.get("news", [])),
                    "has_current_data": len(context.get("disasters", [])) > 0 or len(context.get("weather_alerts", [])) > 0
                }
            )
            
        except Exception as e:
            logger.error(f"Error in chatbot response: {e}")
            return ChatResponse(
                reply="I apologize, but I'm having trouble processing your request right now. Please try again later or check official emergency services for critical information.",
                context={"error": str(e)}
            )
    
    async def get_disaster_summary(self) -> str:
        """Get a summary of current disaster situation"""
        try:
            context = await self.get_disaster_context("current disaster situation summary")
            
            prompt = f"""Based on the current disaster data, provide a concise summary of the global disaster situation. 
            Include key statistics and highlight the most significant current events.
            
            Current Data:
            - {len(context.get('disasters', []))} recent disasters
            - {len(context.get('weather_alerts', []))} active weather alerts
            - Recent disaster types: {', '.join(context.get('stats', {}).get('disaster_types', []))}
            
            Provide a 2-3 paragraph summary suitable for a dashboard overview."""
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating disaster summary: {e}")
            return "Current disaster monitoring data is temporarily unavailable. Please check back later for updates."

# Global chatbot instance (will be initialized with API key)
chatbot = None

def initialize_chatbot(api_key: str):
    """Initialize the global chatbot instance"""
    global chatbot
    chatbot = DisasterChatbot(api_key)
    return chatbot
