from typing import List
from sqlalchemy.orm import Session
from app.models.hcp import HCP
from app.schemas.hcp import HCPCreate, HCPUpdate

class HCPService:
    """
    Service layer containing CRUD business logic for HCP resource management.
    Keeps database operations separated from routing endpoints.
    """

    @staticmethod
    def get_hcp(db: Session, hcp_id: int) -> HCP | None:
        """Fetch a single HCP profile by primary key ID."""
        return db.query(HCP).filter(HCP.id == hcp_id).first()

    @staticmethod
    def get_hcp_by_email(db: Session, email: str) -> HCP | None:
        """Fetch an HCP profile by email address."""
        return db.query(HCP).filter(HCP.email == email.lower()).first()

    @staticmethod
    def get_hcp_by_name(db: Session, name: str) -> HCP | None:
        """Fetch an HCP profile by checking if the name matches case-insensitively."""
        clean_name = name.lower().replace("dr.", "").replace("dr", "").strip()
        return db.query(HCP).filter(HCP.name.ilike(f"%{clean_name}%")).first()

    @staticmethod
    def get_hcps(db: Session, skip: int = 0, limit: int = 100) -> List[HCP]:
        """Fetch multiple HCP profiles with pagination support."""
        return db.query(HCP).offset(skip).limit(limit).all()

    @staticmethod
    def create_hcp(db: Session, hcp_data: HCPCreate) -> HCP:
        """
        Create a new HCP profile.
        Raises:
            ValueError: If email address is already registered.
        """
        # Lowercase email for case-insensitive uniqueness checks
        email_normalized = hcp_data.email.lower()
        existing_hcp = HCPService.get_hcp_by_email(db, email_normalized)
        if existing_hcp:
            raise ValueError(f"HCP with email '{hcp_data.email}' already exists.")

        db_hcp = HCP(
            name=hcp_data.name,
            specialization=hcp_data.specialization,
            hospital=hcp_data.hospital,
            city=hcp_data.city,
            email=email_normalized,
            phone=hcp_data.phone
        )
        db.add(db_hcp)
        db.commit()
        db.refresh(db_hcp)
        return db_hcp

    @staticmethod
    def update_hcp(db: Session, hcp_id: int, hcp_data: HCPUpdate) -> HCP | None:
        """
        Update an existing HCP profile.
        Raises:
            ValueError: If attempting to change email to another existing registered address.
        """
        db_hcp = HCPService.get_hcp(db, hcp_id)
        if not db_hcp:
            return None

        update_dict = hcp_data.model_dump(exclude_unset=True)
        
        # Check email uniqueness if email is being updated
        if "email" in update_dict:
            email_normalized = update_dict["email"].lower()
            if email_normalized != db_hcp.email:
                existing_hcp = HCPService.get_hcp_by_email(db, email_normalized)
                if existing_hcp:
                    raise ValueError(f"HCP with email '{update_dict['email']}' already exists.")
                update_dict["email"] = email_normalized

        for key, value in update_dict.items():
            setattr(db_hcp, key, value)

        db.commit()
        db.refresh(db_hcp)
        return db_hcp

    @staticmethod
    def delete_hcp(db: Session, hcp_id: int) -> bool:
        """
        Delete an HCP profile.
        Returns:
            bool: True if profile existed and was deleted, False otherwise.
        """
        db_hcp = HCPService.get_hcp(db, hcp_id)
        if not db_hcp:
            return False
        
        db.delete(db_hcp)
        db.commit()
        return True
