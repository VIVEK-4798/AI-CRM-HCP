import logging
import time
from typing import Dict, Any
from app.agents.graph import app as graph_app

logger = logging.getLogger(__name__)

class CRMInteractionAgent:
    """
    Agent facade wrapping the compiled LangGraph StateGraph pipeline.
    Exposes a unified invoke interface suitable for routes and business logic.
    """
    
    def __init__(self) -> None:
        self.graph = graph_app

    def invoke(self, user_input: str) -> Dict[str, Any]:
        """
        Executes the agent graph sequence synchronously.
        
        Args:
            user_input (str): Incoming unstructured user query.
            
        Returns:
            Dict[str, Any]: Extracted intent and selected placeholder tool structure.
        """
        start_time = time.time()
        logger.info(f"CRMInteractionAgent received input message: '{user_input}'")

        initial_state = {
            "user_input": user_input,
            "intent": "unknown",
            "selected_tool": "unknown_tool",
            "response": "",
            "metadata": {},
            "messages": []
        }

        try:
            # Execute StateGraph sync pipeline
            final_state = self.graph.invoke(initial_state)
            
            elapsed = time.time() - start_time
            logger.info(
                f"CRMInteractionAgent execution completed in {elapsed:.4f}s. "
                f"Intent: '{final_state.get('intent')}', "
                f"Tool: '{final_state.get('selected_tool')}'"
            )

            return {
                "intent": final_state.get("intent", "unknown"),
                "selected_tool": final_state.get("selected_tool", "unknown_tool"),
                "response": final_state.get("response", ""),
                "metadata": final_state.get("metadata", {})
            }
        except Exception as exc:
            logger.error(f"CRMInteractionAgent failed during invoke graph execution: {exc}")
            raise exc

# Instantiate agent instance for application import
crm_agent = CRMInteractionAgent()
