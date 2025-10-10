from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatMessage, ChatResponse
from app.services.chatbot import chatbot

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat_with_bot(message: ChatMessage):
    """Chat with the disaster monitoring assistant"""
    if not chatbot:
        raise HTTPException(status_code=503, detail="Chatbot service is not available")
    
    try:
        response = await chatbot.chat(message.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")

@router.get("/summary")
async def get_disaster_summary():
    """Get a summary of current disaster situation"""
    if not chatbot:
        raise HTTPException(status_code=503, detail="Chatbot service is not available")
    
    try:
        summary = await chatbot.get_disaster_summary()
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")
