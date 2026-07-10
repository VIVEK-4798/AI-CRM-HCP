from typing import List
from sqlalchemy.orm import Session
from app.models.interaction import Interaction
from app.models.hcp import HCP
from app.schemas.interaction import InteractionCreate, InteractionUpdate

class InteractionService:
    """
    Service layer containing CRUD business logic for Interaction resource management.
    Keeps database operations separated from routing endpoints.
    """

    @staticmethod
    def get_interaction(db: Session, interaction_id: int) -> Interaction | None:
        """Fetch a single interaction record by primary key ID."""
        return db.query(Interaction).filter(Interaction.id == interaction_id).first()

    @staticmethod
    def get_interactions(db: Session, skip: int = 0, limit: int = 100) -> List[Interaction]:
        """Fetch multiple interaction records with pagination support."""
        return db.query(Interaction).offset(skip).limit(limit).all()

    @staticmethod
    def create_interaction(db: Session, interaction_data: InteractionCreate) -> Interaction:
        """
        Create a new interaction record.
        Raises:
            ValueError: If hcp_id reference does not exist in the HCP database.
        """
        # Validate that the referenced HCP exists
        hcp_exists = db.query(HCP).filter(HCP.id == interaction_data.hcp_id).first()
        if not hcp_exists:
            raise ValueError(f"Referenced HCP with ID {interaction_data.hcp_id} does not exist.")

        db_interaction = Interaction(
            hcp_id=interaction_data.hcp_id,
            interaction_mode=interaction_data.interaction_mode.value,
            interaction_type=interaction_data.interaction_type.value,
            interaction_date=interaction_data.interaction_date,
            summary=interaction_data.summary,
            products_discussed=interaction_data.products_discussed,
            follow_up_date=interaction_data.follow_up_date,
            status=interaction_data.status.value
        )
        db.add(db_interaction)
        db.commit()
        db.refresh(db_interaction)
        return db_interaction

    @staticmethod
    def update_interaction(db: Session, interaction_id: int, interaction_data: InteractionUpdate) -> Interaction | None:
        """
        Update an existing interaction record.
        Raises:
            ValueError: If referenced hcp_id is set to a non-existent HCP profile.
        """
        db_interaction = InteractionService.get_interaction(db, interaction_id)
        if not db_interaction:
            return None

        update_dict = interaction_data.model_dump(exclude_unset=True)

        # Validate hcp_id if it's being modified
        if "hcp_id" in update_dict:
            hcp_exists = db.query(HCP).filter(HCP.id == update_dict["hcp_id"]).first()
            if not hcp_exists:
                raise ValueError(f"Referenced HCP with ID {update_dict['hcp_id']} does not exist.")

        for key, value in update_dict.items():
            # Convert enum values to string if relevant
            if hasattr(value, "value"):
                value = value.value
            setattr(db_interaction, key, value)

        db.commit()
        db.refresh(db_interaction)
        return db_interaction

    @staticmethod
    def search_interactions(
        db: Session,
        hcp_id: int | None = None,
        interaction_type: str | None = None,
        status: str | None = None,
        date_after = None,
        date_before = None
    ) -> List[Interaction]:
        """Query and filter interaction records dynamically from the database."""
        query = db.query(Interaction)
        if hcp_id is not None:
            query = query.filter(Interaction.hcp_id == hcp_id)
        if interaction_type is not None:
            query = query.filter(Interaction.interaction_type == interaction_type)
        if status is not None:
            query = query.filter(Interaction.status == status)
        if date_after is not None:
            query = query.filter(Interaction.interaction_date >= date_after)
        if date_before is not None:
            query = query.filter(Interaction.interaction_date <= date_before)
        return query.order_by(Interaction.interaction_date.desc()).all()

    @staticmethod
    def delete_interaction(db: Session, interaction_id: int) -> bool:
        """
        Delete an interaction record.
        Returns:
            bool: True if record existed and was deleted, False otherwise.
        """
        db_interaction = InteractionService.get_interaction(db, interaction_id)
        if not db_interaction:
            return False
        
        db.delete(db_interaction)
        db.commit()
        return True
