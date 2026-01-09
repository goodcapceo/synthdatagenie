# Synthetic Data Genie

A full-stack application for generating realistic synthetic financial transaction data with configurable anomalies. Built for training fraud detection ML models.

## Features

- **Realistic Transaction Generation**: Lognormal amount distribution, temporal patterns (peak hours), geographic coherence
- **6 Anomaly Types**: Geographic jumps, velocity spikes, unusual amounts, new categories, odd hours, high-risk merchants
- **Regional Filtering**: US Major Cities, Northeast, West Coast, Midwest, South
- **Data Export**: Download as CSV or JSON
- **Interactive Dashboard**: Stats grid, data table, and visualizations

## Tech Stack

**Backend**: Python, FastAPI, Pydantic
**Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide Icons

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Configuration Options

| Parameter | Range | Description |
|-----------|-------|-------------|
| Records | 100 - 100,000 | Number of transactions to generate |
| Date Range | Any valid dates | Transaction timestamp range |
| Anomaly Rate | 0 - 20% | Percentage of anomalous transactions |
| Region | 5 options | Geographic filter for transaction locations |

## Anomaly Types

| Type | Description |
|------|-------------|
| Geographic | Impossible travel - transactions too far apart in short time |
| Velocity | Multiple rapid transactions in a short window |
| Amount | Transaction amount far outside customer's normal range |
| Category | Transaction in a category the customer has never used |
| Temporal | Transaction at unusual time for this customer |
| Merchant Risk | Transaction at high-risk merchant (crypto, gambling) |

## API Endpoints

- `POST /api/generate` - Generate synthetic transactions
- `GET /api/health` - Health check
- `GET /api/anomaly-types` - List anomaly type definitions

## Project Structure

```
synthdatagenie/
├── backend/
│   ├── api/
│   │   └── routes.py       # API endpoints
│   ├── core/
│   │   ├── generator.py    # Transaction generation
│   │   ├── anomaly.py      # Anomaly injection
│   │   └── metrics.py      # Statistics calculation
│   ├── models/
│   │   └── schemas.py      # Pydantic models
│   └── main.py             # FastAPI app
└── frontend/
    └── src/
        ├── components/     # React components
        ├── services/       # API client
        └── App.jsx         # Main app
```

## License

MIT
