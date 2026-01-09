"""
Pydantic Models for API Request/Response Validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class GenerateRequest(BaseModel):
    """Request model for transaction generation."""
    num_records: int = Field(default=10000, ge=100, le=100000, description="Number of transactions to generate")
    start_date: str = Field(default="2024-01-01", description="Start date (YYYY-MM-DD)")
    end_date: str = Field(default="2024-12-31", description="End date (YYYY-MM-DD)")
    anomaly_rate: float = Field(default=5.0, ge=0, le=20, description="Percentage of anomalies (0-20%)")
    region: str = Field(default="US_MAJOR_CITIES", description="Geographic region for transactions")

    class Config:
        json_schema_extra = {
            "example": {
                "num_records": 10000,
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "anomaly_rate": 5.0,
                "region": "US_MAJOR_CITIES"
            }
        }


class Location(BaseModel):
    """Location model with city, state, zip."""
    city: str
    state: str
    zip: str


class Transaction(BaseModel):
    """Single transaction model."""
    transaction_id: str
    timestamp: str
    customer_id: str
    merchant_id: str
    merchant_name: str
    merchant_category: str
    mcc_code: str
    amount: float
    currency: str
    transaction_type: str
    card_last_4: str
    customer_location: Location
    merchant_location: Location
    distance_km: float
    is_online: bool
    device_type: str
    is_anomaly: bool
    anomaly_type: Optional[str] = None
    risk_score: float


class AmountStats(BaseModel):
    """Amount distribution statistics."""
    mean: float
    median: float
    std: float
    min: float
    max: float
    percentiles: Dict[str, float]


class TemporalPatterns(BaseModel):
    """Temporal distribution patterns."""
    peak_hour: str
    peak_day: str
    weekend_pct: float
    business_hours_pct: float
    hourly_distribution: List[Dict[str, Any]]
    daily_distribution: Optional[List[Dict[str, Any]]] = None


class GeographicCoherence(BaseModel):
    """Geographic distribution metrics."""
    within_10km: float
    within_50km: float
    long_distance: float
    online_pct: float


class AnomalyBreakdown(BaseModel):
    """Anomaly statistics and breakdown."""
    total_anomalies: int
    anomaly_rate: float
    by_type: Dict[str, int]


class CustomerBehavior(BaseModel):
    """Customer behavior metrics."""
    avg_transactions_per_customer: float
    consistency_score: float


class DateRange(BaseModel):
    """Date range for transactions."""
    start: str
    end: str


class Metrics(BaseModel):
    """Complete metrics model."""
    total_transactions: int
    unique_customers: int
    unique_merchants: int
    date_range: DateRange
    amount_stats: AmountStats
    temporal_patterns: TemporalPatterns
    geographic_coherence: GeographicCoherence
    anomaly_breakdown: AnomalyBreakdown
    customer_behavior: CustomerBehavior
    category_distribution: List[Dict[str, Any]]


class GenerateResponse(BaseModel):
    """Response model for transaction generation."""
    transactions: List[Transaction]
    metrics: Dict[str, Any]
    generation_time: float
    request_params: GenerateRequest

    class Config:
        json_schema_extra = {
            "example": {
                "transactions": [],
                "metrics": {},
                "generation_time": 1.23,
                "request_params": {
                    "num_records": 10000,
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31",
                    "anomaly_rate": 5.0,
                    "region": "US_MAJOR_CITIES"
                }
            }
        }


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str = "1.0.0"
