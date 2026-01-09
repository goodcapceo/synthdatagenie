"""
Data Quality Metrics Calculator

Calculates comprehensive statistics to prove data realism:
- Transaction counts and unique entities
- Amount distribution statistics
- Temporal pattern analysis
- Geographic coherence metrics
- Anomaly breakdown
- Customer behavior consistency
"""

from datetime import datetime
from typing import List, Dict, Any
from collections import Counter, defaultdict
import statistics


def calculate_metrics(transactions: List[Dict]) -> Dict[str, Any]:
    """
    Calculate comprehensive metrics for generated transaction data.

    Args:
        transactions: List of transaction dictionaries

    Returns:
        Dictionary containing all calculated metrics
    """
    if not transactions:
        return _empty_metrics()

    # Extract basic counts
    total = len(transactions)
    customers = set(t["customer_id"] for t in transactions)
    merchants = set(t["merchant_id"] for t in transactions)

    # Parse timestamps
    timestamps = []
    for t in transactions:
        try:
            ts = datetime.fromisoformat(t["timestamp"].replace("Z", ""))
            timestamps.append(ts)
        except:
            pass

    # Date range
    if timestamps:
        date_range = {
            "start": min(timestamps).strftime("%Y-%m-%d"),
            "end": max(timestamps).strftime("%Y-%m-%d")
        }
    else:
        date_range = {"start": "N/A", "end": "N/A"}

    # Amount statistics
    amounts = [t["amount"] for t in transactions]
    amount_stats = _calculate_amount_stats(amounts)

    # Temporal patterns
    temporal_patterns = _calculate_temporal_patterns(timestamps)

    # Geographic coherence
    geographic = _calculate_geographic_metrics(transactions)

    # Anomaly breakdown
    anomaly_breakdown = _calculate_anomaly_breakdown(transactions)

    # Customer behavior
    customer_behavior = _calculate_customer_behavior(transactions, customers)

    # Category distribution
    category_distribution = _calculate_category_distribution(transactions)

    return {
        "total_transactions": total,
        "unique_customers": len(customers),
        "unique_merchants": len(merchants),
        "date_range": date_range,
        "amount_stats": amount_stats,
        "temporal_patterns": temporal_patterns,
        "geographic_coherence": geographic,
        "anomaly_breakdown": anomaly_breakdown,
        "customer_behavior": customer_behavior,
        "category_distribution": category_distribution
    }


def _empty_metrics() -> Dict[str, Any]:
    """Return empty metrics structure."""
    return {
        "total_transactions": 0,
        "unique_customers": 0,
        "unique_merchants": 0,
        "date_range": {"start": "N/A", "end": "N/A"},
        "amount_stats": {
            "mean": 0,
            "median": 0,
            "std": 0,
            "min": 0,
            "max": 0,
            "percentiles": {"25": 0, "50": 0, "75": 0, "95": 0}
        },
        "temporal_patterns": {
            "peak_hour": "N/A",
            "peak_day": "N/A",
            "weekend_pct": 0,
            "business_hours_pct": 0,
            "hourly_distribution": []
        },
        "geographic_coherence": {
            "within_10km": 0,
            "within_50km": 0,
            "long_distance": 0,
            "online_pct": 0
        },
        "anomaly_breakdown": {
            "total_anomalies": 0,
            "anomaly_rate": 0,
            "by_type": {}
        },
        "customer_behavior": {
            "avg_transactions_per_customer": 0,
            "consistency_score": 0
        },
        "category_distribution": []
    }


def _calculate_amount_stats(amounts: List[float]) -> Dict[str, Any]:
    """Calculate amount distribution statistics."""
    if not amounts:
        return _empty_metrics()["amount_stats"]

    sorted_amounts = sorted(amounts)
    n = len(sorted_amounts)

    def percentile(p):
        idx = int(n * p / 100)
        return round(sorted_amounts[min(idx, n-1)], 2)

    return {
        "mean": round(statistics.mean(amounts), 2),
        "median": round(statistics.median(amounts), 2),
        "std": round(statistics.stdev(amounts) if len(amounts) > 1 else 0, 2),
        "min": round(min(amounts), 2),
        "max": round(max(amounts), 2),
        "percentiles": {
            "25": percentile(25),
            "50": percentile(50),
            "75": percentile(75),
            "95": percentile(95)
        }
    }


def _calculate_temporal_patterns(timestamps: List[datetime]) -> Dict[str, Any]:
    """Calculate temporal distribution patterns."""
    if not timestamps:
        return _empty_metrics()["temporal_patterns"]

    # Hour distribution
    hours = [ts.hour for ts in timestamps]
    hour_counts = Counter(hours)
    peak_hour = hour_counts.most_common(1)[0][0]

    # Day distribution
    days = [ts.strftime("%A") for ts in timestamps]
    day_counts = Counter(days)
    peak_day = day_counts.most_common(1)[0][0]

    # Weekend percentage
    weekend_count = sum(1 for ts in timestamps if ts.weekday() >= 5)
    weekend_pct = round(weekend_count / len(timestamps) * 100, 1)

    # Business hours (9am-6pm) percentage
    business_count = sum(1 for ts in timestamps if 9 <= ts.hour < 18)
    business_pct = round(business_count / len(timestamps) * 100, 1)

    # Hourly distribution for charts
    hourly_distribution = [
        {"hour": h, "count": hour_counts.get(h, 0)}
        for h in range(24)
    ]

    # Day distribution for charts
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    daily_distribution = [
        {"day": d, "count": day_counts.get(d, 0)}
        for d in day_order
    ]

    return {
        "peak_hour": f"{peak_hour:02d}:00-{(peak_hour+1) % 24:02d}:00",
        "peak_day": peak_day,
        "weekend_pct": weekend_pct,
        "business_hours_pct": business_pct,
        "hourly_distribution": hourly_distribution,
        "daily_distribution": daily_distribution
    }


def _calculate_geographic_metrics(transactions: List[Dict]) -> Dict[str, Any]:
    """Calculate geographic coherence metrics."""
    if not transactions:
        return _empty_metrics()["geographic_coherence"]

    distances = [t["distance_km"] for t in transactions if not t.get("is_online", False)]

    if not distances:
        return {
            "within_10km": 0,
            "within_50km": 0,
            "long_distance": 0,
            "online_pct": 100
        }

    within_10 = sum(1 for d in distances if d <= 10)
    within_50 = sum(1 for d in distances if d <= 50)
    long_dist = sum(1 for d in distances if d > 50)

    total_physical = len(distances)
    online_count = sum(1 for t in transactions if t.get("is_online", False))

    return {
        "within_10km": round(within_10 / total_physical * 100, 1) if total_physical > 0 else 0,
        "within_50km": round(within_50 / total_physical * 100, 1) if total_physical > 0 else 0,
        "long_distance": round(long_dist / total_physical * 100, 1) if total_physical > 0 else 0,
        "online_pct": round(online_count / len(transactions) * 100, 1)
    }


def _calculate_anomaly_breakdown(transactions: List[Dict]) -> Dict[str, Any]:
    """Calculate anomaly statistics and breakdown by type."""
    if not transactions:
        return _empty_metrics()["anomaly_breakdown"]

    anomalies = [t for t in transactions if t.get("is_anomaly", False)]
    total_anomalies = len(anomalies)

    # Count by type
    type_counts = Counter(t.get("anomaly_type", "unknown") for t in anomalies)

    return {
        "total_anomalies": total_anomalies,
        "anomaly_rate": round(total_anomalies / len(transactions) * 100, 2),
        "by_type": dict(type_counts)
    }


def _calculate_customer_behavior(transactions: List[Dict], customers: set) -> Dict[str, Any]:
    """Calculate customer behavior consistency metrics."""
    if not transactions or not customers:
        return _empty_metrics()["customer_behavior"]

    # Transactions per customer
    customer_txn_counts = Counter(t["customer_id"] for t in transactions)
    avg_txn_per_customer = round(len(transactions) / len(customers), 1)

    # Calculate consistency score based on spending patterns
    # (how consistent are customers with their categories and amounts)
    customer_amounts = defaultdict(list)
    for t in transactions:
        if not t.get("is_anomaly", False):
            customer_amounts[t["customer_id"]].append(t["amount"])

    # Calculate coefficient of variation for each customer
    cv_scores = []
    for customer_id, amounts in customer_amounts.items():
        if len(amounts) > 1:
            mean_amt = statistics.mean(amounts)
            if mean_amt > 0:
                std_amt = statistics.stdev(amounts)
                cv = std_amt / mean_amt
                # Lower CV = more consistent = higher score
                consistency = max(0, 1 - min(cv, 1))
                cv_scores.append(consistency)

    avg_consistency = round(statistics.mean(cv_scores), 2) if cv_scores else 0.5

    return {
        "avg_transactions_per_customer": avg_txn_per_customer,
        "consistency_score": avg_consistency
    }


def _calculate_category_distribution(transactions: List[Dict]) -> List[Dict]:
    """Calculate merchant category distribution."""
    if not transactions:
        return []

    categories = Counter(t["merchant_category"] for t in transactions)
    total = len(transactions)

    distribution = [
        {
            "category": cat,
            "count": count,
            "percentage": round(count / total * 100, 1)
        }
        for cat, count in categories.most_common(15)
    ]

    return distribution


# Quick test
if __name__ == "__main__":
    from generator import TransactionGenerator
    from anomaly import AnomalyInjector

    # Generate sample data
    gen = TransactionGenerator(seed=42)
    transactions = gen.generate_batch(num_records=1000)

    # Inject anomalies
    injector = AnomalyInjector(seed=42)
    transactions = injector.inject(transactions, rate=8.0)

    # Calculate metrics
    metrics = calculate_metrics(transactions)

    print("=== Generated Data Metrics ===\n")
    print(f"Total Transactions: {metrics['total_transactions']}")
    print(f"Unique Customers: {metrics['unique_customers']}")
    print(f"Unique Merchants: {metrics['unique_merchants']}")
    print(f"Date Range: {metrics['date_range']['start']} to {metrics['date_range']['end']}")

    print(f"\nAmount Stats:")
    print(f"  Mean: ${metrics['amount_stats']['mean']}")
    print(f"  Median: ${metrics['amount_stats']['median']}")
    print(f"  Std Dev: ${metrics['amount_stats']['std']}")
    print(f"  Range: ${metrics['amount_stats']['min']} - ${metrics['amount_stats']['max']}")

    print(f"\nTemporal Patterns:")
    print(f"  Peak Hour: {metrics['temporal_patterns']['peak_hour']}")
    print(f"  Peak Day: {metrics['temporal_patterns']['peak_day']}")
    print(f"  Business Hours: {metrics['temporal_patterns']['business_hours_pct']}%")

    print(f"\nGeographic Coherence:")
    print(f"  Within 10km: {metrics['geographic_coherence']['within_10km']}%")
    print(f"  Within 50km: {metrics['geographic_coherence']['within_50km']}%")
    print(f"  Online: {metrics['geographic_coherence']['online_pct']}%")

    print(f"\nAnomaly Breakdown:")
    print(f"  Total Anomalies: {metrics['anomaly_breakdown']['total_anomalies']}")
    print(f"  Anomaly Rate: {metrics['anomaly_breakdown']['anomaly_rate']}%")
    print(f"  By Type: {metrics['anomaly_breakdown']['by_type']}")
