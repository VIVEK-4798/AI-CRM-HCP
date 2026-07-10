import json
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.services.llm_service import llm_service
from app.services.hcp_service import HCPService
from app.services.interaction_service import InteractionService

# Configure logger
logger = logging.getLogger(__name__)

class SearchInteractionTool:
    """
    Class-based tool to search historical CRM logged interactions
    by parsing natural query filters and querying the database service.
    """
    
    def execute(self, db: Session, natural_language_message: str) -> dict:
        """
        Executes the tool logic.
        
        Args:
            db (Session): Database session.
            natural_language_message (str): Rep search query.
            
        Returns:
            dict: Search results count and records array.
        """
        logger.info("[SearchInteractionTool] Starting execution.")
        start_time = datetime.now()

        prompt = f"""You are an AI assistant for a medical CRM. Extract search filter parameters from the user's search query.

Allowed Interaction Types: "IN_PERSON", "CALL", "EMAIL", "VIDEO"
Allowed Statuses: "COMPLETED", "FOLLOW_UP_PENDING", "CANCELLED"

Provide a response in strict JSON format matching this schema:
{{
  "doctor_name": "doctor name or null if not mentioned",
  "interaction_type": "one of: IN_PERSON, CALL, EMAIL, VIDEO or null if not mentioned",
  "status": "one of: COMPLETED, FOLLOW_UP_PENDING, CANCELLED or null if not mentioned",
  "days_ago": "integer representing how many days in the past to query, or null if not mentioned",
  "date_after": "ISO date YYYY-MM-DD or null if not mentioned",
  "date_before": "ISO date YYYY-MM-DD or null if not mentioned"
}}

Do not include conversational text. Respond ONLY with the JSON string.

Query: {natural_language_message}
"""
        try:
            # Query LLM to parse filters
            raw_response = llm_service.generate_response(prompt)
            
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            doctor_name = parsed.get("doctor_name")
            interaction_type = parsed.get("interaction_type")
            status_val = parsed.get("status")
            days_ago = parsed.get("days_ago")
            date_after_str = parsed.get("date_after")
            date_before_str = parsed.get("date_before")
        except Exception as exc:
            logger.error(f"[SearchInteractionTool] LLM extraction failed: {exc}")
            return {
                "status": "error",
                "message": f"Failed to extract filter variables: {str(exc)}"
            }

        # Resolve HCP ID if name is set
        hcp_id = None
        if doctor_name:
            hcp = HCPService.get_hcp_by_name(db, doctor_name)
            if hcp:
                hcp_id = hcp.id
            else:
                return {
                    "status": "success",
                    "results_count": 0,
                    "records": []
                }

        # Parse date range filters
        date_after = None
        date_before = None

        if date_after_str:
            try:
                date_after = datetime.strptime(date_after_str, "%Y-%m-%d")
            except ValueError:
                pass
        if date_before_str:
            try:
                date_before = datetime.strptime(date_before_str, "%Y-%m-%d")
            except ValueError:
                pass

        if days_ago:
            try:
                date_after = datetime.now() - timedelta(days=int(days_ago))
            except Exception:
                pass

        try:
            # Query database search service method
            results = InteractionService.search_interactions(
                db=db,
                hcp_id=hcp_id,
                interaction_type=interaction_type,
                status=status_val,
                date_after=date_after,
                date_before=date_before
            )

            # Map database records to structured output format
            records = []
            for item in results:
                # Cross-reference doctor profile
                doc = HCPService.get_hcp(db, item.hcp_id)
                doc_name = doc.name if doc else "Unknown Doctor"

                records.append({
                    "id": item.id,
                    "doctor_name": doc_name,
                    "interaction_mode": item.interaction_mode,
                    "interaction_type": item.interaction_type,
                    "interaction_date": item.interaction_date.strftime("%Y-%m-%d %H:%M"),
                    "summary": item.summary,
                    "products_discussed": item.products_discussed,
                    "follow_up_date": item.follow_up_date.strftime("%Y-%m-%d") if item.follow_up_date else None,
                    "status": item.status
                })

            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(f"[SearchInteractionTool] Found {len(records)} records in {elapsed:.4f}s.")

            return {
                "status": "success",
                "results_count": len(records),
                "records": records
            }
        except Exception as db_exc:
            logger.error(f"[SearchInteractionTool] Database search query failure: {db_exc}")
            return {
                "status": "error",
                "message": f"Database search failed: {str(db_exc)}"
            }
