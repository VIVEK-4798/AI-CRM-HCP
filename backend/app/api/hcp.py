from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.hcp import HCPCreate, HCPUpdate, HCPResponse
from app.services.hcp_service import HCPService

router = APIRouter(
    prefix="/hcps",
    tags=["HCPs"]
)

@router.get("/", response_model=List[HCPResponse], status_code=status.HTTP_200_OK)
def read_hcps(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve multiple HCP profiles.
    Supports basic pagination query parameters (`skip`, `limit`).
    """
    return HCPService.get_hcps(db, skip=skip, limit=limit)

@router.get("/{hcp_id}", response_model=HCPResponse, status_code=status.HTTP_200_OK)
def read_hcp(hcp_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single HCP profile by its primary key ID.
    Raises:
        HTTPException: 404 if the HCP does not exist.
    """
    db_hcp = HCPService.get_hcp(db, hcp_id)
    if not db_hcp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"HCP with ID {hcp_id} not found"
        )
    return db_hcp

@router.post("/", response_model=HCPResponse, status_code=status.HTTP_201_CREATED)
def create_hcp(hcp_data: HCPCreate, db: Session = Depends(get_db)):
    """
    Create a new HCP profile.
    Raises:
        HTTPException: 400 if the email is already in use.
    """
    try:
        return HCPService.create_hcp(db, hcp_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{hcp_id}", response_model=HCPResponse, status_code=status.HTTP_200_OK)
def update_hcp(hcp_id: int, hcp_data: HCPUpdate, db: Session = Depends(get_db)):
    """
    Update an existing HCP profile.
    Raises:
        HTTPException: 404 if the HCP does not exist.
        HTTPException: 400 if the email is already in use by another HCP profile.
    """
    try:
        db_hcp = HCPService.update_hcp(db, hcp_id, hcp_data)
        if not db_hcp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"HCP with ID {hcp_id} not found"
            )
        return db_hcp
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{hcp_id}", status_code=status.HTTP_200_OK)
def delete_hcp(hcp_id: int, db: Session = Depends(get_db)):
    """
    Delete an HCP profile.
    Raises:
        HTTPException: 404 if the HCP does not exist.
    """
    success = HCPService.delete_hcp(db, hcp_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"HCP with ID {hcp_id} not found"
        )
    return {"message": "HCP profile deleted successfully"}
