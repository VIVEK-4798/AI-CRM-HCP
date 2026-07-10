from langgraph.graph import StateGraph, START, END
from app.agents.state import AgentState
from app.agents.nodes import detect_intent_node, tool_selection_node

# Initialize modular StateGraph with AgentState structure
builder = StateGraph(AgentState)

# Add Node mapping logic
builder.add_node("detect_intent", detect_intent_node)
builder.add_node("select_tool", tool_selection_node)

# Set up sequential edges
builder.add_edge(START, "detect_intent")
builder.add_edge("detect_intent", "select_tool")
builder.add_edge("select_tool", END)

# Compile graph into executable application object
app = builder.compile()
