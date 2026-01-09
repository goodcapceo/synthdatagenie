"""
Transaction Generator Engine

Generates realistic synthetic financial transactions with:
- Customer profiles with consistent spending behavior
- Realistic merchants with proper MCC codes
- Geographic coherence (80% within 10km)
- Temporal patterns (peak 12pm-2pm, 6pm-8pm)
- Lognormal amount distribution ($5-$10,000)
"""

import random
import string
import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
import numpy as np
from faker import Faker

fake = Faker()

# US Major Cities with coordinates and region tags
US_CITIES = [
    {"city": "New York", "state": "NY", "zip_prefix": "100", "lat": 40.7128, "lon": -74.0060, "region": "northeast"},
    {"city": "Los Angeles", "state": "CA", "zip_prefix": "900", "lat": 34.0522, "lon": -118.2437, "region": "west_coast"},
    {"city": "Chicago", "state": "IL", "zip_prefix": "606", "lat": 41.8781, "lon": -87.6298, "region": "midwest"},
    {"city": "Houston", "state": "TX", "zip_prefix": "770", "lat": 29.7604, "lon": -95.3698, "region": "south"},
    {"city": "Phoenix", "state": "AZ", "zip_prefix": "850", "lat": 33.4484, "lon": -112.0740, "region": "west_coast"},
    {"city": "Philadelphia", "state": "PA", "zip_prefix": "191", "lat": 39.9526, "lon": -75.1652, "region": "northeast"},
    {"city": "San Antonio", "state": "TX", "zip_prefix": "782", "lat": 29.4241, "lon": -98.4936, "region": "south"},
    {"city": "San Diego", "state": "CA", "zip_prefix": "921", "lat": 32.7157, "lon": -117.1611, "region": "west_coast"},
    {"city": "Dallas", "state": "TX", "zip_prefix": "752", "lat": 32.7767, "lon": -96.7970, "region": "south"},
    {"city": "San Jose", "state": "CA", "zip_prefix": "951", "lat": 37.3382, "lon": -121.8863, "region": "west_coast"},
    {"city": "Austin", "state": "TX", "zip_prefix": "787", "lat": 30.2672, "lon": -97.7431, "region": "south"},
    {"city": "Seattle", "state": "WA", "zip_prefix": "981", "lat": 47.6062, "lon": -122.3321, "region": "west_coast"},
    {"city": "Denver", "state": "CO", "zip_prefix": "802", "lat": 39.7392, "lon": -104.9903, "region": "midwest"},
    {"city": "Boston", "state": "MA", "zip_prefix": "021", "lat": 42.3601, "lon": -71.0589, "region": "northeast"},
    {"city": "Miami", "state": "FL", "zip_prefix": "331", "lat": 25.7617, "lon": -80.1918, "region": "south"},
    {"city": "Atlanta", "state": "GA", "zip_prefix": "303", "lat": 33.7490, "lon": -84.3880, "region": "south"},
    {"city": "Portland", "state": "OR", "zip_prefix": "972", "lat": 45.5155, "lon": -122.6789, "region": "west_coast"},
    {"city": "Las Vegas", "state": "NV", "zip_prefix": "891", "lat": 36.1699, "lon": -115.1398, "region": "west_coast"},
    {"city": "Minneapolis", "state": "MN", "zip_prefix": "554", "lat": 44.9778, "lon": -93.2650, "region": "midwest"},
    {"city": "Detroit", "state": "MI", "zip_prefix": "482", "lat": 42.3314, "lon": -83.0458, "region": "midwest"},
    {"city": "Washington", "state": "DC", "zip_prefix": "200", "lat": 38.9072, "lon": -77.0369, "region": "northeast"},
    {"city": "San Francisco", "state": "CA", "zip_prefix": "941", "lat": 37.7749, "lon": -122.4194, "region": "west_coast"},
]

# Region mappings
REGION_FILTERS = {
    "US_MAJOR_CITIES": None,  # All cities
    "US_NORTHEAST": "northeast",
    "US_WEST_COAST": "west_coast",
    "US_MIDWEST": "midwest",
    "US_SOUTH": "south",
}

def get_cities_for_region(region: str) -> List[Dict]:
    """Get cities filtered by region."""
    region_filter = REGION_FILTERS.get(region)
    if region_filter is None:
        return US_CITIES
    return [c for c in US_CITIES if c.get("region") == region_filter]

# Merchant categories with MCC codes
MERCHANT_CATEGORIES = [
    {"category": "Grocery Stores", "mcc": "5411", "avg_amount": 65, "std": 45},
    {"category": "Restaurants", "mcc": "5812", "avg_amount": 35, "std": 25},
    {"category": "Gas Stations", "mcc": "5541", "avg_amount": 45, "std": 20},
    {"category": "Coffee Shops", "mcc": "5814", "avg_amount": 8, "std": 5},
    {"category": "Department Stores", "mcc": "5311", "avg_amount": 85, "std": 60},
    {"category": "Electronics Stores", "mcc": "5732", "avg_amount": 250, "std": 200},
    {"category": "Pharmacies", "mcc": "5912", "avg_amount": 30, "std": 25},
    {"category": "Fast Food", "mcc": "5814", "avg_amount": 12, "std": 6},
    {"category": "Online Shopping", "mcc": "5999", "avg_amount": 75, "std": 50},
    {"category": "Streaming Services", "mcc": "4899", "avg_amount": 15, "std": 5},
    {"category": "Utilities", "mcc": "4900", "avg_amount": 120, "std": 50},
    {"category": "Insurance", "mcc": "6300", "avg_amount": 180, "std": 80},
    {"category": "Hotels", "mcc": "7011", "avg_amount": 180, "std": 100},
    {"category": "Airlines", "mcc": "4511", "avg_amount": 350, "std": 200},
    {"category": "Clothing Stores", "mcc": "5651", "avg_amount": 65, "std": 45},
    {"category": "Fitness", "mcc": "7941", "avg_amount": 50, "std": 30},
    {"category": "Entertainment", "mcc": "7832", "avg_amount": 25, "std": 15},
    {"category": "Auto Services", "mcc": "7538", "avg_amount": 150, "std": 100},
    {"category": "Home Improvement", "mcc": "5200", "avg_amount": 120, "std": 90},
    {"category": "Pet Stores", "mcc": "5995", "avg_amount": 45, "std": 30},
]

# Merchant name prefixes by category
MERCHANT_NAMES = {
    "Grocery Stores": ["Whole Foods", "Trader Joe's", "Safeway", "Kroger", "Publix", "Albertsons", "Wegmans"],
    "Restaurants": ["Olive Garden", "Applebee's", "Chili's", "Red Lobster", "Outback", "Cheesecake Factory"],
    "Gas Stations": ["Shell", "Chevron", "ExxonMobil", "BP", "76", "Costco Gas", "Speedway"],
    "Coffee Shops": ["Starbucks", "Dunkin'", "Peet's Coffee", "Dutch Bros", "Blue Bottle"],
    "Department Stores": ["Target", "Walmart", "Macy's", "Nordstrom", "Kohl's", "JCPenney"],
    "Electronics Stores": ["Best Buy", "Apple Store", "Micro Center", "B&H Photo"],
    "Pharmacies": ["CVS", "Walgreens", "Rite Aid", "Duane Reade"],
    "Fast Food": ["McDonald's", "Burger King", "Wendy's", "Taco Bell", "Chick-fil-A", "Subway"],
    "Online Shopping": ["Amazon", "eBay", "Etsy", "Shopify Store", "Wayfair"],
    "Streaming Services": ["Netflix", "Spotify", "Apple Music", "Disney+", "HBO Max"],
    "Utilities": ["City Power", "Water Utility", "Gas Company", "Electric Co"],
    "Insurance": ["State Farm", "Geico", "Progressive", "Allstate"],
    "Hotels": ["Marriott", "Hilton", "Hyatt", "Holiday Inn", "Best Western"],
    "Airlines": ["Delta", "United", "American Airlines", "Southwest", "JetBlue"],
    "Clothing Stores": ["H&M", "Zara", "Gap", "Old Navy", "Uniqlo", "Nike"],
    "Fitness": ["Planet Fitness", "LA Fitness", "24 Hour Fitness", "Equinox", "CrossFit"],
    "Entertainment": ["AMC Theatres", "Regal Cinemas", "Dave & Buster's", "TopGolf"],
    "Auto Services": ["Jiffy Lube", "Pep Boys", "AutoZone", "Firestone"],
    "Home Improvement": ["Home Depot", "Lowe's", "Ace Hardware", "Menards"],
    "Pet Stores": ["PetSmart", "Petco", "Pet Supplies Plus", "Chewy"],
}

TRANSACTION_TYPES = ["debit_card", "credit_card", "mobile_payment", "online"]
DEVICE_TYPES = ["chip_and_pin", "contactless", "swipe", "online", "mobile_app"]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers."""
    R = 6371  # Earth's radius in km

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c


@dataclass
class CustomerProfile:
    """Represents a customer with consistent spending patterns."""
    customer_id: str
    home_city: Dict
    preferred_categories: List[str]
    avg_transaction_amount: float
    transaction_frequency: float  # avg transactions per day
    active_hours: Tuple[int, int]  # typical active hours (start, end)
    card_last_4: str

    @classmethod
    def generate(cls, customer_id: str, cities: Optional[List[Dict]] = None) -> 'CustomerProfile':
        """Generate a new customer profile with realistic attributes."""
        available_cities = cities if cities else US_CITIES
        home_city = random.choice(available_cities)

        # Each customer has 3-7 preferred categories
        num_preferred = random.randint(3, 7)
        preferred_categories = random.sample(
            [cat["category"] for cat in MERCHANT_CATEGORIES],
            num_preferred
        )

        # Lognormal distribution for average transaction amount
        avg_amount = np.random.lognormal(mean=3.5, sigma=0.8)
        avg_amount = max(10, min(500, avg_amount))

        # Transaction frequency: 0.5 to 5 per day
        freq = random.uniform(0.5, 5)

        # Active hours: most people 7am-11pm, some night owls
        if random.random() < 0.9:
            active_start = random.randint(7, 10)
            active_end = random.randint(20, 23)
        else:
            active_start = random.randint(0, 6)
            active_end = random.randint(2, 8)

        card_last_4 = ''.join(random.choices(string.digits, k=4))

        return cls(
            customer_id=customer_id,
            home_city=home_city,
            preferred_categories=preferred_categories,
            avg_transaction_amount=avg_amount,
            transaction_frequency=freq,
            active_hours=(active_start, active_end),
            card_last_4=card_last_4
        )


@dataclass
class Merchant:
    """Represents a merchant with location and category."""
    merchant_id: str
    merchant_name: str
    category: str
    mcc_code: str
    location: Dict
    avg_amount: float
    std_amount: float
    is_high_risk: bool = False

    @classmethod
    def generate(cls, merchant_id: str, near_city: Optional[Dict] = None, cities: Optional[List[Dict]] = None) -> 'Merchant':
        """Generate a merchant, optionally near a specific city."""
        available_cities = cities if cities else US_CITIES
        category_info = random.choice(MERCHANT_CATEGORIES)
        category = category_info["category"]

        # Get merchant name
        names = MERCHANT_NAMES.get(category, ["Local Store"])
        base_name = random.choice(names)
        store_num = random.randint(100, 9999)
        merchant_name = f"{base_name} #{store_num}"

        # Location: either near specified city or random
        if near_city:
            city_info = near_city
        else:
            city_info = random.choice(available_cities)

        # Add some randomness to location (within ~10km)
        lat_offset = random.uniform(-0.1, 0.1)
        lon_offset = random.uniform(-0.1, 0.1)

        location = {
            "city": city_info["city"],
            "state": city_info["state"],
            "zip": city_info["zip_prefix"] + ''.join(random.choices(string.digits, k=2)),
            "lat": city_info["lat"] + lat_offset,
            "lon": city_info["lon"] + lon_offset
        }

        # Some merchants are high risk (casinos, crypto ATMs, etc.)
        is_high_risk = random.random() < 0.02
        if is_high_risk:
            merchant_name = random.choice([
                f"Crypto ATM #{store_num}",
                f"Online Casino #{store_num}",
                f"Wire Transfer #{store_num}",
                f"Gift Card Kiosk #{store_num}"
            ])

        return cls(
            merchant_id=merchant_id,
            merchant_name=merchant_name,
            category=category,
            mcc_code=category_info["mcc"],
            location=location,
            avg_amount=category_info["avg_amount"],
            std_amount=category_info["std"],
            is_high_risk=is_high_risk
        )


class TransactionGenerator:
    """Main engine for generating synthetic financial transactions."""

    def __init__(self, seed: Optional[int] = None, region: str = "US_MAJOR_CITIES"):
        if seed:
            random.seed(seed)
            np.random.seed(seed)
            Faker.seed(seed)

        self.region = region
        self.cities = get_cities_for_region(region)
        self.customers: Dict[str, CustomerProfile] = {}
        self.merchants: Dict[str, Merchant] = {}
        self._transaction_counter = 0

    def _get_or_create_customer(self, customer_id: str) -> CustomerProfile:
        """Get existing customer or create new one."""
        if customer_id not in self.customers:
            self.customers[customer_id] = CustomerProfile.generate(customer_id, cities=self.cities)
        return self.customers[customer_id]

    def _get_or_create_merchant(self, merchant_id: str, near_city: Optional[Dict] = None) -> Merchant:
        """Get existing merchant or create new one."""
        if merchant_id not in self.merchants:
            self.merchants[merchant_id] = Merchant.generate(merchant_id, near_city, cities=self.cities)
        return self.merchants[merchant_id]

    def _generate_timestamp(self, start_date: datetime, end_date: datetime,
                           customer: CustomerProfile) -> datetime:
        """Generate a realistic timestamp based on customer patterns."""
        # Random date in range
        date_range = (end_date - start_date).days
        random_days = random.randint(0, date_range)
        base_date = start_date + timedelta(days=random_days)

        # Hour distribution with peaks at lunch and dinner
        hour_weights = [
            0.5, 0.3, 0.2, 0.2, 0.3, 0.5,  # 0-5 (night)
            1.0, 2.0, 3.0, 4.0, 5.0, 6.0,  # 6-11 (morning)
            8.0, 7.0, 5.0, 4.0, 4.0, 5.0,  # 12-17 (afternoon, peak at lunch)
            7.0, 8.0, 6.0, 4.0, 2.0, 1.0   # 18-23 (evening, peak at dinner)
        ]

        # Adjust weights based on customer's active hours
        start_h, end_h = customer.active_hours
        for h in range(24):
            if h < start_h or h > end_h:
                hour_weights[h] *= 0.1

        hour = random.choices(range(24), weights=hour_weights)[0]
        minute = random.randint(0, 59)
        second = random.randint(0, 59)

        return base_date.replace(hour=hour, minute=minute, second=second)

    def _generate_amount(self, customer: CustomerProfile, merchant: Merchant) -> float:
        """Generate transaction amount based on customer and merchant patterns."""
        # Combine customer average with merchant category average
        base_amount = (customer.avg_transaction_amount + merchant.avg_amount) / 2

        # Lognormal distribution for realistic spread
        amount = np.random.lognormal(
            mean=math.log(base_amount),
            sigma=0.5
        )

        # Clamp to realistic range
        amount = max(1.0, min(10000.0, amount))

        # Round to cents
        return round(amount, 2)

    def generate_transaction(self,
                            customer_id: Optional[str] = None,
                            start_date: Optional[datetime] = None,
                            end_date: Optional[datetime] = None) -> Dict:
        """Generate a single realistic transaction."""
        self._transaction_counter += 1

        # Default date range
        if not start_date:
            start_date = datetime(2024, 1, 1)
        if not end_date:
            end_date = datetime(2024, 12, 31)

        # Get or create customer
        if not customer_id:
            customer_id = f"CUST_{random.randint(1000000, 9999999)}"
        customer = self._get_or_create_customer(customer_id)

        # Generate merchant near customer (80% of time) or random (20%)
        merchant_id = f"MERCH_{random.randint(10000, 99999)}"
        if random.random() < 0.8:
            merchant = self._get_or_create_merchant(merchant_id, customer.home_city)
        else:
            merchant = self._get_or_create_merchant(merchant_id)

        # Generate timestamp
        timestamp = self._generate_timestamp(start_date, end_date, customer)

        # Generate amount
        amount = self._generate_amount(customer, merchant)

        # Calculate distance
        customer_lat = customer.home_city["lat"] + random.uniform(-0.05, 0.05)
        customer_lon = customer.home_city["lon"] + random.uniform(-0.05, 0.05)
        distance = haversine_distance(
            customer_lat, customer_lon,
            merchant.location["lat"], merchant.location["lon"]
        )

        # Determine if online
        is_online = merchant.category in ["Online Shopping", "Streaming Services"] or random.random() < 0.15

        # Device type
        if is_online:
            device_type = random.choice(["online", "mobile_app"])
        else:
            device_type = random.choice(["chip_and_pin", "contactless", "swipe"])

        # Transaction type
        if is_online:
            txn_type = "online"
        else:
            txn_type = random.choices(
                ["debit_card", "credit_card", "mobile_payment"],
                weights=[0.4, 0.4, 0.2]
            )[0]

        # Generate transaction ID
        date_str = timestamp.strftime("%Y%m%d")
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        transaction_id = f"TXN_{date_str}_{suffix}"

        return {
            "transaction_id": transaction_id,
            "timestamp": timestamp.isoformat() + "Z",
            "customer_id": customer.customer_id,
            "merchant_id": merchant.merchant_id,
            "merchant_name": merchant.merchant_name,
            "merchant_category": merchant.category,
            "mcc_code": merchant.mcc_code,
            "amount": amount,
            "currency": "USD",
            "transaction_type": txn_type,
            "card_last_4": customer.card_last_4,
            "customer_location": {
                "city": customer.home_city["city"],
                "state": customer.home_city["state"],
                "zip": customer.home_city["zip_prefix"] + ''.join(random.choices(string.digits, k=2))
            },
            "merchant_location": {
                "city": merchant.location["city"],
                "state": merchant.location["state"],
                "zip": merchant.location["zip"]
            },
            "distance_km": round(distance, 2),
            "is_online": is_online,
            "device_type": device_type,
            "is_anomaly": False,
            "anomaly_type": None,
            "risk_score": round(random.uniform(0.01, 0.25), 2)
        }

    def generate_batch(self,
                      num_records: int = 10000,
                      start_date: str = "2024-01-01",
                      end_date: str = "2024-12-31",
                      num_customers: Optional[int] = None) -> List[Dict]:
        """Generate a batch of transactions."""
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)

        # Determine number of unique customers (roughly 1 per 40 transactions)
        if not num_customers:
            num_customers = max(10, num_records // 40)

        # Pre-generate customer IDs
        customer_ids = [f"CUST_{random.randint(1000000, 9999999)}" for _ in range(num_customers)]

        transactions = []
        for _ in range(num_records):
            customer_id = random.choice(customer_ids)
            txn = self.generate_transaction(
                customer_id=customer_id,
                start_date=start,
                end_date=end
            )
            transactions.append(txn)

        # Sort by timestamp
        transactions.sort(key=lambda x: x["timestamp"])

        return transactions


# Quick test
if __name__ == "__main__":
    generator = TransactionGenerator(seed=42)
    txn = generator.generate_transaction()
    print("Sample transaction:")
    for key, value in txn.items():
        print(f"  {key}: {value}")
