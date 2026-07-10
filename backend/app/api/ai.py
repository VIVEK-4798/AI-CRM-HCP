from fastapi import APIRouter, status
from app.services.llm_service import llm_service

router = APIRouter(
    prefix="/ai",
    tags=["AI Core"]
)

@router.get("/test", status_code=status.HTTP_200_OK)
def test_ai_connection():
    """
    Test Route for AI integration.
    Verifies connection to the Groq API by requesting a one-sentence greeting
    from the llama-3.1-8b-instant model.
    """
    prompt = "Say hello in one sentence."
    response = llm_service.generate_response(prompt)
    
    return {
        "model": "llama-3.1-8b-instant",
        "response": response
    }
