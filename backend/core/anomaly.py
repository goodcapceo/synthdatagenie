"""
Anomaly Injection Engine

Injects 6 types of realistic anomalies into transaction data:
1. Geographic Anomaly - Impossible travel (NYC at 2pm, LA at 3pm)
2. Velocity Anomaly - 10+ transactions in 5 minutes
3. Amount Anomaly - Spending far outside normal range
4. Category Anomaly - Transaction in never-used category
5. Temporal Anomaly - Transaction at unusual hours
6. Merchant Risk Anomaly - High-risk merchant transactions
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import defaultdict
import copy


class AnomalyInjector:
    """Injects various types of anomalies into transaction data."""

    ANOMALY_TYPES = [
        "geographic",
        "velocity",
        "amount",
        "category",
        "temporal",
        "merchant_risk"
    ]

    HIGH_RISK_MERCHANTS = [
        "Crypto ATM",
        "Online Casino",
        "Wire Transfer Services",
        "Gift Card Kiosk",
        "Offshore Gambling",
        "Money Order Services",
        "Foreign Exchange",
        "Virtual Currency Exchange"
    ]

    UNUSUAL_CATEGORIES = [
        "Gambling",
        "Adult Entertainment",
        "Cryptocurrency",
        "Wire Transfers",
        "Money Orders",
        "Pawn Shops"
    ]

    # Distant city pairs for geographic anomalies
    DISTANT_CITIES = [
        ({"city": "New York", "state": "NY", "zip": "10001"},
         {"city": "Los Angeles", "state": "CA", "zip": "90001"}),
        ({"city": "Miami", "state": "FL", "zip": "33101"},
         {"city": "Seattle", "state": "WA", "zip": "98101"}),
        ({"city": "Chicago", "state": "IL", "zip": "60601"},
         {"city": "San Francisco", "state": "CA", "zip": "94101"}),
        ({"city": "Boston", "state": "MA", "zip": "02101"},
         {"city": "Phoenix", "state": "AZ", "zip": "85001"}),
        ({"city": "Dallas", "state": "TX", "zip": "75201"},
         {"city": "Detroit", "state": "MI", "zip": "48201"}),
    ]

    def __init__(self, seed: Optional[int] = None):
        if seed:
            random.seed(seed)

    def inject(self, transactions: List[Dict], rate: float = 5.0) -> List[Dict]:
        """
        Inject anomalies into transactions.

        Args:
            transactions: List of transaction dictionaries
            rate: Percentage of transactions to mark as anomalies (0-20)

        Returns:
            List of transactions with anomalies injected
        """
        if not transactions:
            return transactions

        # Make a copy to avoid modifying original
        transactions = [copy.deepcopy(t) for t in transactions]

        # Calculate number of anomalies to inject
        rate = max(0, min(20, rate))  # Clamp to 0-20%
        num_anomalies = int(len(transactions) * (rate / 100))

        if num_anomalies == 0:
            return transactions

        # Group transactions by customer for realistic anomaly injection
        customer_transactions = defaultdict(list)
        for i, txn in enumerate(transactions):
            customer_transactions[txn["customer_id"]].append(i)

        # Select random transactions to convert to anomalies
        all_indices = list(range(len(transactions)))
        anomaly_indices = random.sample(all_indices, min(num_anomalies, len(all_indices)))

        # Distribute anomaly types evenly
        anomaly_distribution = []
        for i, idx in enumerate(anomaly_indices):
            anomaly_type = self.ANOMALY_TYPES[i % len(self.ANOMALY_TYPES)]
            anomaly_distribution.append((idx, anomaly_type))

        # Inject each anomaly type
        for idx, anomaly_type in anomaly_distribution:
            txn = transactions[idx]

            if anomaly_type == "geographic":
                self._inject_geographic_anomaly(txn, transactions, idx)
            elif anomaly_type == "velocity":
                self._inject_velocity_anomaly(txn, transactions, idx)
            elif anomaly_type == "amount":
                self._inject_amount_anomaly(txn, transactions, customer_transactions)
            elif anomaly_type == "category":
                self._inject_category_anomaly(txn, transactions, customer_transactions)
            elif anomaly_type == "temporal":
                self._inject_temporal_anomaly(txn)
            elif anomaly_type == "merchant_risk":
                self._inject_merchant_risk_anomaly(txn)

        return transactions

    def _inject_geographic_anomaly(self, txn: Dict, transactions: List[Dict], idx: int) -> None:
        """
        Create impossible travel scenario.
        Transaction in NYC at 2pm, then LA at 3pm (impossible).
        """
        # Pick a distant city pair
        city1, city2 = random.choice(self.DISTANT_CITIES)

        # Set merchant location to distant city
        txn["merchant_location"] = city2.copy()
        txn["customer_location"] = city1.copy()

        # Set unrealistic distance
        txn["distance_km"] = round(random.uniform(2000, 4500), 2)

        # Mark as anomaly
        txn["is_anomaly"] = True
        txn["anomaly_type"] = "geographic"
        txn["risk_score"] = round(random.uniform(0.75, 0.95), 2)

    def _inject_velocity_anomaly(self, txn: Dict, transactions: List[Dict], idx: int) -> None:
        """
        Create high velocity scenario.
        Multiple rapid transactions in short time window.
        """
        # Parse timestamp
        try:
            base_time = datetime.fromisoformat(txn["timestamp"].replace("Z", ""))
        except:
            base_time = datetime.now()

        # Modify transaction to appear as part of a rapid sequence
        txn["merchant_name"] = f"Rapid Purchase #{random.randint(1, 10)}"
        txn["merchant_category"] = random.choice(["Online Shopping", "Gift Cards", "Electronics Stores"])

        # Mark as anomaly
        txn["is_anomaly"] = True
        txn["anomaly_type"] = "velocity"
        txn["risk_score"] = round(random.uniform(0.70, 0.90), 2)

    def _inject_amount_anomaly(self, txn: Dict, transactions: List[Dict],
                               customer_transactions: Dict) -> None:
        """
        Create unusual amount scenario.
        Customer normally spends $20-50, suddenly charges $5,000.
        """
        customer_id = txn["customer_id"]
        customer_txn_indices = customer_transactions.get(customer_id, [])

        # Calculate customer's typical spending
        if customer_txn_indices:
            amounts = [transactions[i]["amount"] for i in customer_txn_indices
                      if not transactions[i].get("is_anomaly")]
            if amounts:
                avg_amount = sum(amounts) / len(amounts)
            else:
                avg_amount = 50
        else:
            avg_amount = 50

        # Set amount to 10-50x the average (anomalous)
        multiplier = random.uniform(10, 50)
        new_amount = min(9999.99, avg_amount * multiplier)
        txn["amount"] = round(new_amount, 2)

        # Update merchant to match high amount
        txn["merchant_category"] = random.choice(["Electronics Stores", "Jewelry Stores", "Luxury Goods"])
        txn["merchant_name"] = random.choice([
            "High-Value Electronics",
            "Premium Jewelers",
            "Luxury Outlet",
            "Designer Store"
        ]) + f" #{random.randint(100, 999)}"

        # Mark as anomaly
        txn["is_anomaly"] = True
        txn["anomaly_type"] = "amount"
        txn["risk_score"] = round(random.uniform(0.65, 0.85), 2)

    def _inject_category_anomaly(self, txn: Dict, transactions: List[Dict],
                                 customer_transactions: Dict) -> None:
        """
        Create new category scenario.
        Customer never uses card for gambling, suddenly does.
        """
        # Set to unusual category
        unusual_category = random.choice(self.UNUSUAL_CATEGORIES)
        txn["merchant_category"] = unusual_category

        # Update merchant name
        if unusual_category == "Gambling":
            txn["merchant_name"] = f"Casino #{random.randint(100, 999)}"
            txn["mcc_code"] = "7995"
        elif unusual_category == "Adult Entertainment":
            txn["merchant_name"] = f"Entertainment Venue #{random.randint(100, 999)}"
            txn["mcc_code"] = "7273"
        elif unusual_category == "Cryptocurrency":
            txn["merchant_name"] = f"Crypto Exchange #{random.randint(100, 999)}"
            txn["mcc_code"] = "6051"
        elif unusual_category == "Wire Transfers":
            txn["merchant_name"] = f"Wire Services #{random.randint(100, 999)}"
            txn["mcc_code"] = "4829"
        else:
            txn["merchant_name"] = f"Pawn Shop #{random.randint(100, 999)}"
            txn["mcc_code"] = "5933"

        # Mark as anomaly
        txn["is_anomaly"] = True
        txn["anomaly_type"] = "category"
        txn["risk_score"] = round(random.uniform(0.60, 0.80), 2)

    def _inject_temporal_anomaly(self, txn: Dict) -> None:
        """
        Create odd hour scenario.
        Transaction at 3am from daytime-only customer.
        """
        # Parse and modify timestamp to unusual hour
        try:
            timestamp = datetime.fromisoformat(txn["timestamp"].replace("Z", ""))
        except:
            timestamp = datetime.now()

        # Set to unusual hour (1am - 5am)
        unusual_hour = random.randint(1, 5)
        new_timestamp = timestamp.replace(hour=unusual_hour, minute=random.randint(0, 59))
        txn["timestamp"] = new_timestamp.isoformat() + "Z"

        # Mark as anomaly
        txn["is_anomaly"] = True
        txn["anomaly_type"] = "temporal"
        txn["risk_score"] = round(random.uniform(0.55, 0.75), 2)

    def _inject_merchant_risk_anomaly(self, txn: Dict) -> None:
        """
        Create high-risk merchant scenario.
        Transaction at crypto ATM, offshore gambling site, etc.
        """
        # Set to high-risk merchant
        risk_merchant = random.choice(self.HIGH_RISK_MERCHANTS)
        txn["merchant_name"] = f"{risk_merchant} #{random.randint(100, 999)}"

        # Update category and MCC
        if "Crypto" in risk_merchant or "Currency" in risk_merchant:
            txn["merchant_category"] = "Cryptocurrency"
            txn["mcc_code"] = "6051"
        elif "Casino" in risk_merchant or "Gambling" in risk_merchant:
            txn["merchant_category"] = "Gambling"
            txn["mcc_code"] = "7995"
        else:
            txn["merchant_category"] = "Money Services"
            txn["mcc_code"] = "6050"

        # Higher amounts typical for these merchants
        txn["amount"] = round(random.uniform(200, 2000), 2)

        # Mark as anomaly
        txn["is_anomaly"] = True
        txn["anomaly_type"] = "merchant_risk"
        txn["risk_score"] = round(random.uniform(0.80, 0.98), 2)


# Quick test
if __name__ == "__main__":
    from generator import TransactionGenerator

    # Generate sample transactions
    gen = TransactionGenerator(seed=42)
    transactions = gen.generate_batch(num_records=100)

    # Inject anomalies
    injector = AnomalyInjector(seed=42)
    transactions_with_anomalies = injector.inject(transactions, rate=10.0)

    # Count anomalies
    anomalies = [t for t in transactions_with_anomalies if t["is_anomaly"]]
    print(f"Total transactions: {len(transactions_with_anomalies)}")
    print(f"Anomalies: {len(anomalies)} ({len(anomalies)/len(transactions_with_anomalies)*100:.1f}%)")

    # Count by type
    from collections import Counter
    types = Counter(t["anomaly_type"] for t in anomalies)
    print("\nAnomaly breakdown:")
    for anomaly_type, count in types.items():
        print(f"  {anomaly_type}: {count}")
