from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from app.database.connection import get_database
from app.models.schemas import DisasterResponse, DisasterFilter, DisasterStats, MapBounds
from prisma import Prisma

router = APIRouter(prefix="/disasters", tags=["disasters"])

@router.get("/", response_model=List[DisasterResponse])
async def get_disasters(
    type: Optional[str] = Query(None, description="Filter by disaster type"),
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, description="Maximum number of results", le=500),
    offset: int = Query(0, description="Number of results to skip"),
    db: Prisma = Depends(get_database)
):
    """Get disasters with optional filtering"""
    where_conditions = {}
    
    if type:
        where_conditions["type"] = type
    if severity:
        where_conditions["severity"] = severity
    if status:
        where_conditions["status"] = status
    
    disasters = await db.disaster.find_many(
        where=where_conditions,
        order_by={"occurred_at": "desc"},
        take=limit,
        skip=offset
    )
    
    return disasters

@router.get("/recent", response_model=List[DisasterResponse])
async def get_recent_disasters(
    days: int = Query(7, description="Number of days to look back", ge=1, le=365),
    db: Prisma = Depends(get_database)
):
    """Get disasters from the last N days"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    disasters = await db.disaster.find_many(
        where={
            "occurred_at": {"gte": cutoff_date}
        },
        order_by={"occurred_at": "desc"},
        take=100
    )
    
    return disasters

@router.get("/map", response_model=List[DisasterResponse])
async def get_disasters_for_map(
    north: float = Query(..., description="Northern boundary"),
    south: float = Query(..., description="Southern boundary"),
    east: float = Query(..., description="Eastern boundary"),
    west: float = Query(..., description="Western boundary"),
    type: Optional[str] = Query(None, description="Filter by disaster type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    db: Prisma = Depends(get_database)
):
    """Get disasters within map bounds"""
    where_conditions = {
        "latitude": {"gte": south, "lte": north},
        "longitude": {"gte": west, "lte": east}
    }
    
    if type:
        where_conditions["type"] = type
    if severity:
        where_conditions["severity"] = severity
    
    disasters = await db.disaster.find_many(
        where=where_conditions,
        order_by={"occurred_at": "desc"},
        take=200
    )
    
    return disasters

@router.get("/stats", response_model=DisasterStats)
async def get_disaster_stats(db: Prisma = Depends(get_database)):
    """Get disaster statistics"""
    
    # Total disasters
    total_disasters = await db.disaster.count()
    
    # Active disasters
    active_disasters = await db.disaster.count(
        where={"status": "active"}
    )
    
    # Recent disasters (last 30 days)
    recent_cutoff = datetime.now() - timedelta(days=30)
    recent_count = await db.disaster.count(
        where={"occurred_at": {"gte": recent_cutoff}}
    )
    
    # All disasters for grouping
    all_disasters = await db.disaster.find_many()
    
    # Group by type
    by_type = {}
    by_severity = {}
    
    for disaster in all_disasters:
        # Count by type
        disaster_type = disaster.type
        by_type[disaster_type] = by_type.get(disaster_type, 0) + 1
        
        # Count by severity
        severity = disaster.severity
        by_severity[severity] = by_severity.get(severity, 0) + 1
    
    return DisasterStats(
        total_disasters=total_disasters,
        active_disasters=active_disasters,
        recent_count=recent_count,
        by_type=by_type,
        by_severity=by_severity
    )

@router.get("/types")
async def get_disaster_types(db: Prisma = Depends(get_database)):
    """Get all unique disaster types"""
    disasters = await db.disaster.find_many(
        select={"type": True}
    )
    
    types = list(set([d.type for d in disasters]))
    return {"types": sorted(types)}

@router.get("/{disaster_id}", response_model=DisasterResponse)
async def get_disaster(disaster_id: str, db: Prisma = Depends(get_database)):
    """Get a specific disaster by ID"""
    disaster = await db.disaster.find_unique(
        where={"id": disaster_id}
    )
    
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    
    return disaster
