import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.llm_service import llm_service
from app.services.hcp_service import HCPService
from app.services.interaction_service import InteractionService
from app.schemas.interaction import InteractionCreate
from app.models.enums import InteractionMode, InteractionType, InteractionStatus

# Configure logger for tracking tool execution
logger = logging.getLogger(__name__)

class LogInteractionTool:
    """
    Class-based tool to convert unstructured rep notes into structured CRM interaction logs
    and commit them to the database under the correct HCP profile.
    """
    
    def execute(self, db: Session, natural_language_message: str) -> dict:
        """
        Executes the tool logic.
        
        Args:
            db (Session): SQLAlchemy database session.
            natural_language_message (str): Rep notes explaining the interaction.
            
        Returns:
            dict: Structured log response or error payload.
        """
        logger.info("[LogInteractionTool] Starting execution.")
        start_time = datetime.now()

        prompt = f"""You are an AI assistant for a medical CRM. Extract structured interaction details from the following rep meeting notes.

Allowed Interaction Types: "IN_PERSON", "CALL", "EMAIL", "VIDEO"

Provide a response in strict JSON format matching this schema:
{{
  "doctor_name": "extracted doctor name, strip prefix like Dr. or Dr",
  "interaction_type": "one of: IN_PERSON, CALL, EMAIL, VIDEO",
  "products_discussed": "comma-separated list of medicines or products discussed",
  "summary": "a professional summary of the discussion",
  "follow_up_date": "ISO date YYYY-MM-DD for the follow-up meeting if mentioned, otherwise null",
  "confidence": "an integer between 0 and 100 representing your extraction accuracy/confidence level"
}}

Do not include conversational text, explanation tags, or markdown blocks. Respond ONLY with the JSON string.

Rep Notes: {natural_language_message}
"""
        try:
            # Query LLM to parse prompt notes
            raw_response = llm_service.generate_response(prompt)
            
            # Sanitize response
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            doctor_name = parsed.get("doctor_name")
            interaction_type_str = parsed.get("interaction_type")
            products_discussed = parsed.get("products_discussed", "")
            summary = parsed.get("summary", "")
            follow_up_date_str = parsed.get("follow_up_date")
            confidence = parsed.get("confidence", 85)
        except Exception as exc:
            logger.error(f"[LogInteractionTool] LLM extraction or parsing failed: {exc}")
            return {
                "status": "error",
                "message": f"Failed to extract structured CRM fields from the message: {str(exc)}"
            }

        # Check required fields
        if not doctor_name:
            return {
                "status": "error",
                "message": "Validation Error: Doctor name could not be identified."
            }
        if not interaction_type_str:
            return {
                "status": "error",
                "message": "Validation Error: Interaction type could not be identified."
            }

        # Find HCP Doctor by name in database
        hcp = HCPService.get_hcp_by_name(db, doctor_name)
        if not hcp:
            return {
                "status": "error",
                "message": f"HCP Lookup Error: Doctor '{doctor_name}' does not exist in the database directory. Please create the HCP profile first."
            }

        # Validate Date formats
        follow_up_date = None
        if follow_up_date_str:
            try:
                follow_up_date = datetime.strptime(follow_up_date_str, "%Y-%m-%d")
            except ValueError:
                logger.warning(f"Malformed follow up date format: '{follow_up_date_str}', utilizing null.")

        # Map interaction type
        try:
            interaction_type = InteractionType(interaction_type_str)
        except ValueError:
            return {
                "status": "error",
                "message": f"Validation Error: Invalid Interaction Type '{interaction_type_str}'."
            }

        # Determine status
        status = InteractionStatus.FOLLOW_UP_PENDING if follow_up_date else InteractionStatus.COMPLETED

        try:
            # DO NOT save directly to database. Return Preview JSON only.
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(f"[LogInteractionTool] Structured fields extracted successfully in {elapsed:.4f}s.")

            # Safe cast confidence to integer
            try:
                confidence_score = int(confidence)
            except Exception:
                confidence_score = 85

            return {
                "status": "success",
                "preview": {
                    "hcp_id": hcp.id,
                    "doctor_name": hcp.name,
                    "interaction_type": interaction_type.value,
                    "products_discussed": products_discussed,
                    "summary": summary,
                    "follow_up_date": follow_up_date_str if follow_up_date_str else None,
                    "status": status.value,
                    "confidence": confidence_score
                }
            }
        except Exception as exc:
            logger.error(f"[LogInteractionTool] Preview generation failed: {exc}")
            return {
                "status": "error",
                "message": f"Preview generation failed: {str(exc)}"
            }
