import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.llm_service import llm_service
from app.services.hcp_service import HCPService
from app.services.interaction_service import InteractionService
from app.schemas.interaction import InteractionUpdate
from app.models.enums import InteractionType, InteractionStatus

# Configure logger
logger = logging.getLogger(__name__)

class EditInteractionTool:
    """
    Class-based tool to locate an existing interaction (by ID or Doctor Name)
    and apply updates to its log fields.
    """
    
    def execute(self, db: Session, natural_language_message: str) -> dict:
        """
        Executes the tool logic.
        
        Args:
            db (Session): Database session.
            natural_language_message (str): Rep prompt notes explaining edits.
            
        Returns:
            dict: Operation status and updated record ID.
        """
        logger.info("[EditInteractionTool] Starting execution.")
        start_time = datetime.now()

        prompt = f"""You are an AI assistant for a medical CRM. Identify which fields are requested to be updated from the user request.

Allowed Interaction Types: "IN_PERSON", "CALL", "EMAIL", "VIDEO"
Allowed Statuses: "COMPLETED", "FOLLOW_UP_PENDING", "CANCELLED"

Provide a response in strict JSON format matching this schema:
{{
  "interaction_id": "extracted interaction ID (integer) or null if not explicitly mentioned",
  "doctor_name": "doctor name (string) if mentioned to identify the interaction, otherwise null",
  "interaction_type": "one of: IN_PERSON, CALL, EMAIL, VIDEO or null if not mentioned",
  "summary": "updated summary notes or null if not mentioned",
  "products_discussed": "updated products discussed or null if not mentioned",
  "follow_up_date": "updated YYYY-MM-DD follow-up date or null if not mentioned",
  "status": "one of: COMPLETED, FOLLOW_UP_PENDING, CANCELLED or null if not mentioned"
}}

Do not include conversational text. Respond ONLY with the JSON string.

User Request: {natural_language_message}
"""
        try:
            # Query LLM to parse updates
            raw_response = llm_service.generate_response(prompt)
            
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            interaction_id_raw = parsed.get("interaction_id")
            doctor_name = parsed.get("doctor_name")
            interaction_type_str = parsed.get("interaction_type")
            summary = parsed.get("summary")
            products_discussed = parsed.get("products_discussed")
            follow_up_date_str = parsed.get("follow_up_date")
            status_str = parsed.get("status")
        except Exception as exc:
            logger.error(f"[EditInteractionTool] LLM extraction failed: {exc}")
            return {
                "status": "error",
                "message": f"Failed to extract edit fields: {str(exc)}"
            }

        # Parse ID
        interaction_id = None
        if interaction_id_raw and str(interaction_id_raw).isdigit():
            interaction_id = int(interaction_id_raw)

        # Resolve ID from doctor name lookup if missing
        if not interaction_id and doctor_name:
            hcp = HCPService.get_hcp_by_name(db, doctor_name)
            if hcp and hcp.interactions:
                # Find the most recently logged interaction for this doctor
                last_interaction = sorted(hcp.interactions, key=lambda i: i.interaction_date, reverse=True)[0]
                interaction_id = last_interaction.id
                logger.info(f"[EditInteractionTool] Resolved ID {interaction_id} for Dr. {hcp.name}")

        if not interaction_id:
            return {
                "status": "error",
                "message": "Lookup Error: Could not determine which interaction to update. Please specify a log ID or doctor name."
            }

        # Verify interaction exists
        existing = InteractionService.get_interaction(db, interaction_id)
        if not existing:
            return {
                "status": "error",
                "message": f"HCP Lookup Error: Interaction log ID {interaction_id} does not exist."
            }

        # Map updates
        update_data = {}
        if interaction_type_str:
            try:
                update_data["interaction_type"] = InteractionType(interaction_type_str)
            except ValueError:
                return {
                    "status": "error",
                    "message": f"Validation Error: Invalid Interaction Type '{interaction_type_str}'."
                }
        if summary:
            update_data["summary"] = summary
        if products_discussed:
            update_data["products_discussed"] = products_discussed
        if status_str:
            try:
                update_data["status"] = InteractionStatus(status_str)
            except ValueError:
                return {
                    "status": "error",
                    "message": f"Validation Error: Invalid Interaction Status '{status_str}'."
                }
        if follow_up_date_str:
            try:
                update_data["follow_up_date"] = datetime.strptime(follow_up_date_str, "%Y-%m-%d")
            except ValueError:
                return {
                    "status": "error",
                    "message": f"Validation Error: Invalid date format '{follow_up_date_str}' (expected YYYY-MM-DD)."
                }

        if not update_data:
            return {
                "status": "error",
                "message": "Validation Error: No valid update parameters were identified from the query."
            }

        try:
            update_schema = InteractionUpdate(**update_data)
            updated = InteractionService.update_interaction(db, interaction_id, update_schema)
            
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(f"[EditInteractionTool] Updated ID {updated.id} successfully in {elapsed:.4f}s.")

            # Fetch hcp name for response rendering
            doc = HCPService.get_hcp(db, updated.hcp_id)
            doc_name = doc.name if doc else "Unknown Doctor"

            return {
                "status": "success",
                "interaction_id": updated.id,
                "summary": f"Successfully updated interaction record ID {updated.id} for Dr. {doc_name}."
            }
        except Exception as db_exc:
            logger.error(f"[EditInteractionTool] DB update transaction failed: {db_exc}")
            return {
                "status": "error",
                "message": f"Database update failed: {str(db_exc)}"
            }
