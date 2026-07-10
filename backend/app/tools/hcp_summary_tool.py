import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.llm_service import llm_service
from app.services.hcp_service import HCPService

# Configure logger
logger = logging.getLogger(__name__)

class HCPSummaryTool:
    """
    Class-based tool to fetch HCP details and historical log records
    and generate a professional relationship overview summary using LLM.
    """
    
    def execute(self, db: Session, natural_language_message: str) -> dict:
        """
        Executes the tool logic.
        
        Args:
            db (Session): Database session.
            natural_language_message (str): Rep query.
            
        Returns:
            dict: Summary string and relationship statistics.
        """
        logger.info("[HCPSummaryTool] Starting execution.")
        start_time = datetime.now()

        # Step 1: Extract Doctor name from query using LLM
        extract_prompt = f"""Extract the doctor's name from the following request. Return ONLY the name (strip prefixes like Dr. or Dr). If no name exists, return null.

User Request: {natural_language_message}
"""
        try:
            raw_doc_name = llm_service.generate_response(extract_prompt).strip()
            # Clean response text if LLM returns "Dr. Emily Stone" or wraps in quotes
            doctor_name = raw_doc_name.replace("Dr.", "").replace("Dr", "").replace('"', '').strip()
            if doctor_name.lower() == "null" or not doctor_name:
                return {
                    "status": "error",
                    "message": "Validation Error: Doctor name could not be identified from the request."
                }
        except Exception as exc:
            logger.error(f"[HCPSummaryTool] LLM doctor name extraction failed: {exc}")
            return {
                "status": "error",
                "message": f"Failed to extract doctor name: {str(exc)}"
            }

        # Step 2: Query HCP in database
        hcp = HCPService.get_hcp_by_name(db, doctor_name)
        if not hcp:
            return {
                "status": "error",
                "message": f"HCP Lookup Error: Doctor '{doctor_name}' was not found in the database directory."
            }

        # Step 3: Compute relationship statistics in memory
        interactions = hcp.interactions
        total_count = len(interactions)
        
        # Parse products discussed
        products_list = []
        for i in interactions:
            if i.products_discussed:
                # split products by comma and clean spaces
                for p in i.products_discussed.split(","):
                    p_clean = p.strip()
                    if p_clean and p_clean not in products_list:
                        products_list.append(p_clean)
        products_str = ", ".join(products_list) if products_list else "None registered"

        # Filter pending follow-ups
        pending_followups = [i for i in interactions if i.status == "FOLLOW_UP_PENDING" and i.follow_up_date]
        pending_count = len(pending_followups)
        pending_followups_dates = [i.follow_up_date.strftime("%Y-%m-%d") for i in pending_followups]
        pending_dates_str = ", ".join(pending_followups_dates) if pending_followups_dates else "None scheduled"

        # Resolve last meeting details
        last_meeting_date = "None logged"
        last_meeting_type = "N/A"
        if total_count > 0:
            sorted_by_date = sorted(interactions, key=lambda x: x.interaction_date, reverse=True)
            last_meeting_date = sorted_by_date[0].interaction_date.strftime("%Y-%m-%d")
            last_meeting_type = sorted_by_date[0].interaction_type

        # Step 4: Call LLM to generate narrative summary
        summary_prompt = f"""You are an AI assistant for a medical CRM. Write a professional, concise summary of the rep's relationship history with this Healthcare Professional (HCP).

Doctor Profile:
Name: {hcp.name}
Specialization: {hcp.specialization}
Hospital: {hcp.hospital}
City: {hcp.city}

CRM Interaction Statistics:
Total Interactions: {total_count}
Products Discussed: {products_str}
Pending Follow-up Dates: {pending_dates_str}
Last Meeting: Date {last_meeting_date}, Type {last_meeting_type}

Provide a concise professional summary highlighting:
- Key discussion products and topics.
- Pending tasks or next meetings.
- Current engagement level.

Respond in strict JSON format matching this schema:
{{
  "summary": "concise narrative summary paragraph"
}}

Respond ONLY with the JSON string. Do not explain anything.
"""
        try:
            raw_summary = llm_service.generate_response(summary_prompt)
            cleaned = raw_summary.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            summary_paragraph = parsed.get("summary", "Summary generation completed.")
            
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(f"[HCPSummaryTool] Generated summary in {elapsed:.4f}s.")

            return {
                "status": "success",
                "summary": summary_paragraph,
                "statistics": {
                    "total_interactions": total_count,
                    "pending_followups_count": pending_count,
                    "last_meeting_date": last_meeting_date,
                    "last_meeting_type": last_meeting_type,
                    "products_discussed": products_list
                }
            }
        except Exception as exc:
            logger.error(f"[HCPSummaryTool] Narrative summary LLM query failed: {exc}")
            return {
                "status": "error",
                "message": f"Summary generation failed: {str(exc)}"
            }
