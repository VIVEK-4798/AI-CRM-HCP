from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.interaction import InteractionCreate, InteractionUpdate, InteractionResponse
from app.services.interaction_service import InteractionService

router = APIRouter(
    prefix="/interactions",
    tags=["Interactions"]
)

@router.get("/", response_model=List[InteractionResponse], status_code=status.HTTP_200_OK)
def read_interactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve multiple interaction logs.
    Supports basic pagination query parameters (`skip`, `limit`).
    """
    return InteractionService.get_interactions(db, skip=skip, limit=limit)

@router.get("/{interaction_id}", response_model=InteractionResponse, status_code=status.HTTP_200_OK)
def read_interaction(interaction_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single interaction log by its primary key ID.
    Raises:
        HTTPException: 404 if the interaction does not exist.
    """
    db_interaction = InteractionService.get_interaction(db, interaction_id)
    if not db_interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interaction with ID {interaction_id} not found"
        )
    return db_interaction

@router.post("/", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
def create_interaction(interaction_data: InteractionCreate, db: Session = Depends(get_db)):
    """
    Create a new interaction log.
    Raises:
        HTTPException: 400 if the referenced HCP ID does not exist in the database.
    """
    try:
        return InteractionService.create_interaction(db, interaction_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{interaction_id}", response_model=InteractionResponse, status_code=status.HTTP_200_OK)
def update_interaction(interaction_id: int, interaction_data: InteractionUpdate, db: Session = Depends(get_db)):
    """
    Update an existing interaction log.
    Raises:
        HTTPException: 404 if the interaction does not exist.
        HTTPException: 400 if updating to an invalid HCP ID reference.
    """
    try:
        db_interaction = InteractionService.update_interaction(db, interaction_id, interaction_data)
        if not db_interaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interaction with ID {interaction_id} not found"
            )
        return db_interaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{interaction_id}", status_code=status.HTTP_200_OK)
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    """
    Delete an interaction log.
    Raises:
        HTTPException: 404 if the interaction does not exist.
    """
    success = InteractionService.delete_interaction(db, interaction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interaction with ID {interaction_id} not found"
        )
    return {"message": "Interaction record deleted successfully"}
