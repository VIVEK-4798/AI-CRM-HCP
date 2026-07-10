from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    """
    LangGraph State definition representing the transactional state 
    propagated through the cognitive agent lifecycle.
    """
    user_input: str
    intent: str
    selected_tool: str
    response: str
    metadata: Dict[str, Any]
    messages: List[Dict[str, Any]]
