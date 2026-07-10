from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from app.agents.agent import crm_agent

# Initialize API router for the AI CRM Agent module
router = APIRouter(
    prefix="/agent",
    tags=["AI Agent Core"]
)

class AgentExecutionRequest(BaseModel):
    """
    Pydantic request validator for agent message payloads.
    """
    message: str


@router.post("/test", status_code=status.HTTP_200_OK)
def test_agent_graph(payload: AgentExecutionRequest):
    """
    Test Route for LangGraph Agent execution.
    Invokes the agent graph sequence and returns the mapped intent and tool name.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request message cannot be empty or whitespaces."
        )

    try:
        # Run LangGraph Agent invoke pipeline
        result = crm_agent.invoke(payload.message)
        
        return {
            "intent": result["intent"],
            "selected_tool": result["selected_tool"]
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent graph execution failed: {str(exc)}"
        )


@router.post("/execute", status_code=status.HTTP_200_OK)
def execute_agent_tool(payload: AgentExecutionRequest):
    """
    Execution Route for the AI Agent.
    Invokes the LangGraph agent, runs the selected tool, and returns the tool's structured output.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request message cannot be empty or whitespaces."
        )

    try:
        # Run LangGraph Agent pipeline to select and run the correct tool
        result = crm_agent.invoke(payload.message)
        
        # Retrieve the tool's structured output from metadata
        tool_output = result.get("metadata", {}).get("tool_output", {})
        
        # If the tool returned an error status, raise a structured exception or return it directly
        return tool_output
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent command execution failed: {str(exc)}"
        )
