import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.llm_service import llm_service
from app.services.hcp_service import HCPService

# Configure logger
logger = logging.getLogger(__name__)

class RecommendNextActionTool:
    """
    Class-based tool to analyze previous interactions and profile details
    and generate strategic recommendations for the representative.
    """
    
    def execute(self, db: Session, natural_language_message: str) -> dict:
        """
        Executes the tool logic.
        
        Args:
            db (Session): Database session.
            natural_language_message (str): Rep query.
            
        Returns:
            dict: Recommendations list, priority, and reasoning.
        """
        logger.info("[RecommendNextActionTool] Starting execution.")
        start_time = datetime.now()

        # Step 1: Extract doctor name from query using LLM
        extract_prompt = f"""Extract the doctor's name from the following request. Return ONLY the name (strip prefixes like Dr. or Dr). If no name exists, return null.

User Request: {natural_language_message}
"""
        try:
            raw_doc_name = llm_service.generate_response(extract_prompt).strip()
            doctor_name = raw_doc_name.replace("Dr.", "").replace("Dr", "").replace('"', '').strip()
            if doctor_name.lower() == "null" or not doctor_name:
                return {
                    "status": "error",
                    "message": "Validation Error: Doctor name could not be identified from the request."
                }
        except Exception as exc:
            logger.error(f"[RecommendNextActionTool] Doctor name extraction failed: {exc}")
            return {
                "status": "error",
                "message": f"Failed to parse doctor name: {str(exc)}"
            }

        # Step 2: Query HCP in database
        hcp = HCPService.get_hcp_by_name(db, doctor_name)
        if not hcp:
            return {
                "status": "error",
                "message": f"HCP Lookup Error: Doctor '{doctor_name}' was not found in the database directory."
            }

        # Step 3: Format recent interaction logs for prompt context
        interactions = sorted(hcp.interactions, key=lambda x: x.interaction_date, reverse=True)[:5]
        logs_formatted_list = []
        for i in interactions:
            logs_formatted_list.append(
                f"- [{i.interaction_date.strftime('%Y-%m-%d')}] {i.interaction_type} visit: discussing '{i.products_discussed}'. Summary: {i.summary}"
            )
        logs_str = "\n".join(logs_formatted_list) if logs_formatted_list else "No historical interaction records found."

        # Step 4: Call LLM to generate recommendations
        recommend_prompt = f"""You are a senior sales strategy AI assistant for a medical CRM. Based on the physician's profile and previous CRM interaction logs, suggest the next best sales action steps for the pharmaceutical representative.

HCP Doctor: Dr. {hcp.name} ({hcp.specialization})
Hospital Affiliation: {hcp.hospital}

Recent CRM Interaction Logs:
{logs_str}

Provide a response in strict JSON format matching this schema:
{{
  "recommendations": [
    "action recommendation 1 (e.g. deliver clinical trial sheets, schedule visit)",
    "action recommendation 2"
  ],
  "priority": "HIGH or MEDIUM or LOW",
  "reasoning": "professional reasoning explaining why these actions are suggested based on recent history"
}}

Respond ONLY with the JSON string. Do not explain anything.
"""
        try:
            raw_recommendations = llm_service.generate_response(recommend_prompt)
            
            cleaned = raw_recommendations.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            recommendations_list = parsed.get("recommendations", [])
            priority = parsed.get("priority", "MEDIUM")
            reasoning = parsed.get("reasoning", "Generated recommendations based on history logs.")

            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(f"[RecommendNextActionTool] Generated recommendations in {elapsed:.4f}s.")

            return {
                "status": "success",
                "recommendations": recommendations_list,
                "priority": priority,
                "reasoning": reasoning
            }
        except Exception as exc:
            logger.error(f"[RecommendNextActionTool] LLM recommendation execution failed: {exc}")
            return {
                "status": "error",
                "message": f"Recommendations generation failed: {str(exc)}"
            }
