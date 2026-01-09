"""
API Routes for Synthetic Data Genie
"""

from fastapi import APIRouter, HTTPException
from models.schemas import GenerateRequest, GenerateResponse, HealthResponse
from core.generator import TransactionGenerator
from core.anomaly import AnomalyInjector
from core.metrics import calculate_metrics
import time

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_transactions(request: GenerateRequest):
    """
    Generate synthetic financial transactions.

    - **num_records**: Number of transactions to generate (100-100,000)
    - **start_date**: Start date for transaction range (YYYY-MM-DD)
    - **end_date**: End date for transaction range (YYYY-MM-DD)
    - **anomaly_rate**: Percentage of anomalies to inject (0-20%)
    - **region**: Geographic region (currently only US_MAJOR_CITIES)
    """
    try:
        start_time = time.time()

        # Initialize generator with region
        generator = TransactionGenerator(region=request.region)

        # Generate transactions
        transactions = generator.generate_batch(
            num_records=request.num_records,
            start_date=request.start_date,
            end_date=request.end_date
        )

        # Inject anomalies
        if request.anomaly_rate > 0:
            injector = AnomalyInjector()
            transactions = injector.inject(transactions, rate=request.anomaly_rate)

        # Calculate metrics
        metrics = calculate_metrics(transactions)

        # Calculate generation time
        generation_time = round(time.time() - start_time, 2)
        metrics["generation_time"] = generation_time

        return GenerateResponse(
            transactions=transactions,
            metrics=metrics,
            generation_time=generation_time,
            request_params=request
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health status."""
    return HealthResponse(
        status="healthy",
        service="Synthetic Data Genie",
        version="1.0.0"
    )


@router.get("/anomaly-types")
async def get_anomaly_types():
    """Get list of available anomaly types with descriptions."""
    return {
        "anomaly_types": [
            {
                "type": "geographic",
                "emoji": "🌍",
                "label": "Geo Jump",
                "description": "Impossible travel - transaction locations too far apart in short time"
            },
            {
                "type": "velocity",
                "emoji": "⚡",
                "label": "High Velocity",
                "description": "Multiple rapid transactions in a short time window"
            },
            {
                "type": "amount",
                "emoji": "💰",
                "label": "Unusual Amount",
                "description": "Transaction amount far outside customer's normal range"
            },
            {
                "type": "category",
                "emoji": "🏷️",
                "label": "New Category",
                "description": "Transaction in a category the customer has never used"
            },
            {
                "type": "temporal",
                "emoji": "🕐",
                "label": "Odd Hour",
                "description": "Transaction at unusual time for this customer"
            },
            {
                "type": "merchant_risk",
                "emoji": "⚠️",
                "label": "High Risk",
                "description": "Transaction at high-risk merchant (crypto, gambling, etc.)"
            }
        ]
    }
