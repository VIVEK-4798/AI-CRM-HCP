import json
import logging
from datetime import datetime
from typing import Dict, Any

from app.database.session import SessionLocal
from app.services.llm_service import llm_service
from app.agents.state import AgentState

# Import concrete CRM tools
from app.tools.log_interaction_tool import LogInteractionTool
from app.tools.edit_interaction_tool import EditInteractionTool
from app.tools.search_interaction_tool import SearchInteractionTool
from app.tools.hcp_summary_tool import HCPSummaryTool
from app.tools.recommend_next_action_tool import RecommendNextActionTool

# Configure logger for node execution tracing
logger = logging.getLogger(__name__)

# Strict classification instructions for LLM intent mapping
CLASSIFICATION_PROMPT = """You are an AI assistant for a pharmaceutical CRM system.
Healthcare Representatives (reps) interact with Healthcare Professionals (HCPs / Doctors) and log their visits, calls, meetings, or requests.

Analyze the user's input request and classify it into exactly one of the following intents:

1. `log_interaction`: User wants to log, submit, record, or save details about a new doctor visit, meeting, email, video call, or phone call.
   - Example: "Just met Dr. Sharma. Discussed CardioHeart-Z."
   - Example: "Please record a call with Dr. Stone regarding Onco抑制-Alpha."

2. `edit_interaction`: User wants to update, modify, fix, edit, or change an existing logged interaction, date, summary, or details.
   - Example: "Change the date of my last meeting with Dr. Stone to yesterday."
   - Example: "Edit the products discussed for the phone call to CardioHeart-Z."

3. `search_interaction`: User wants to find, search, lookup, retrieve, list, or see historical interaction logs, visits, or meetings.
   - Example: "Show me all interactions with Dr. Emily from last week."
   - Example: "Find phone calls where Onco抑制-Alpha was discussed."

4. `hcp_summary`: User wants to get a summary, overview, detailed profile, or history of a specific Healthcare Professional (HCP / Doctor).
   - Example: "Give me an overview of Dr. Emily's profile."
   - Example: "Summarize my relationship or interactions history with Dr. Arthur."

5. `recommend_next_action`: User wants recommendation, advice, next steps, action plans, or tips on what to do next for a doctor or relationship.
   - Example: "What is the recommended next action for Dr. Emily?"
   - Example: "Give me next step suggestions for Dr. Arthur."

6. `unknown`: The request does not match any of the above CRM intentions, is general chitchat, or is ambiguous.
   - Example: "Hello there."
   - Example: "What is the weather today?"

You MUST respond ONLY with a valid JSON object containing the "intent" key. Do not provide any conversational text, explanations, markdown formatting, or wrappers.

JSON Output Format:
{{
  "intent": "<one_of_the_above_intents>"
}}

User Request: {user_input}
"""


def detect_intent_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 1: Intent Detection.
    Submits user prompt to LLM to parse intent, outputs intent classification to state.
    """
    user_input: str = state.get("user_input", "")
    logger.info(f"[detect_intent_node] Processing request: '{user_input}'")

    prompt: str = CLASSIFICATION_PROMPT.format(user_input=user_input)
    intent: str = "unknown"

    try:
        raw_response: str = llm_service.generate_response(prompt)
        
        # Clean potential markdown JSON formatting blocks from response text
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        parsed = json.loads(cleaned)
        intent = parsed.get("intent", "unknown")
    except Exception as exc:
        logger.error(f"[detect_intent_node] Failed to parse JSON response: {exc}. Falling back to text searches.")
        
        # Robust fallback parsing strategy utilizing keyword match scans
        lower_resp = raw_response.lower()
        if "log_interaction" in lower_resp:
            intent = "log_interaction"
        elif "edit_interaction" in lower_resp:
            intent = "edit_interaction"
        elif "search_interaction" in lower_resp:
            intent = "search_interaction"
        elif "hcp_summary" in lower_resp:
            intent = "hcp_summary"
        elif "recommend_next_action" in lower_resp:
            intent = "recommend_next_action"
        else:
            intent = "unknown"

    # Validate intent is one of the supported categories
    valid_intents = {
        "log_interaction", 
        "edit_interaction", 
        "search_interaction", 
        "hcp_summary", 
        "recommend_next_action", 
        "unknown"
    }
    if intent not in valid_intents:
        logger.warning(f"[detect_intent_node] Classified intent '{intent}' is unsupported, falling back to 'unknown'")
        intent = "unknown"

    logger.info(f"[detect_intent_node] Assigned intent category: '{intent}'")
    return {"intent": intent}


def tool_selection_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 2: Tool Selection and Execution.
    Maps intent to concrete tools, instantiates and executes the selected tool using a DB session context.
    """
    intent: str = state.get("intent", "unknown")
    user_input: str = state.get("user_input", "")
    logger.info(f"[tool_selection_node] Invoking tool matching intent: '{intent}'")

    # Domain Intent mapping register matching tool classes and identifiers
    mapping = {
        "log_interaction": (LogInteractionTool, "log_interaction_tool"),
        "edit_interaction": (EditInteractionTool, "edit_interaction_tool"),
        "search_interaction": (SearchInteractionTool, "search_interaction_tool"),
        "hcp_summary": (HCPSummaryTool, "hcp_summary_tool"),
        "recommend_next_action": (RecommendNextActionTool, "recommend_next_action_tool")
    }

    if intent in mapping:
        tool_cls, tool_name = mapping[intent]
        tool_instance = tool_cls()
        logger.info(f"[tool_selection_node] Routing request payload to tool: '{tool_name}'")

        # Open database session context explicitly for tool CRUD operations
        with SessionLocal() as db:
            try:
                tool_output = tool_instance.execute(db, user_input)
            except Exception as e:
                logger.error(f"[tool_selection_node] Tool '{tool_name}' execution threw exception: {e}")
                tool_output = {
                    "status": "error",
                    "message": f"Tool execution failed: {str(e)}"
                }
    else:
        tool_name = "unknown_tool"
        tool_output = {
            "status": "success",
            "message": "Hello! I am your pharmaceutical assistant. You can log meetings, edit logged items, search history, summarize profiles, or request recommendation metrics."
        }

    return {
        "selected_tool": tool_name,
        "response": tool_output.get("summary") or tool_output.get("message") or f"Executed tool: {tool_name}",
        "metadata": {
            "tool_output": tool_output
        }
    }
