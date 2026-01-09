import pandas as pd
import numpy as np
import random
import uuid
from datetime import datetime, timedelta

class FraudDataGenerator:
    def __init__(self, num_samples=1000):
        self.num_samples = num_samples
        self.agencies = [
            'Ministry of Railways', 
            'Ministry of Defence', 
            'NHAI (National Highways Authority of India)', 
            'CPWD (Central Public Works Department)', 
            'Ministry of Health & Family Welfare', 
            'Ministry of Rural Development'
        ]
        self.vendors = [
            'Larsen & Toubro Ltd', 'Tata Projects Ltd', 'GMR Infrastructure', 
            'Adani Enterprises', 'Reliance Infrastructure', 'Hindustan Construction Co',
            'Bharat Electronics Ltd', 'Infosys Ltd', 'Wipro Government Solutions',
            'Rail Vikas Nigam Ltd', 'Patanjali Ayurved', 'Shapoorji Pallonji Group'
        ]
        self.contract_types = ['Item Rate', 'Lump Sum', 'EPC (Engineering Procurement Construction)', 'Consultancy']
        
    def generate_description(self, agency, is_anomaly=False):
        # Context-aware templates
        templates = {
            'Ministry of Railways': [
                "Track renewal works for {zone} Zone",
                "Signalling modernization for {station}",
                "Procurement of rolling stock components"
            ],
            'Ministry of Defence': [
                "Supply of high-altitude clothing",
                "Maintenance of cantonment roads",
                "Procurement of spare parts for vehicles"
            ],
            'NHAI (National Highways Authority of India)': [
                "Construction of 4-lane highway section {section}",
                "Toll plaza operation and maintenance",
                "Road safety consultancy services"
            ],
            'CPWD (Central Public Works Department)': [
                "Renovation of government quarters",
                "Electrical maintenance of {building}",
                "Horticulture works for central vista"
            ],
            'Ministry of Health & Family Welfare': [
                "Supply of medical equipment for AIIMS",
                "Procurement of vaccines",
                "Hospital management works"
            ],
            'Ministry of Rural Development': [
                "Road construction under PMGSY",
                "Water conservation project",
                "Skill development training program"
            ]
        }
        
        # Generic fill-ins
        zones = ["Northern", "Southern", "Western", "Eastern"]
        stations = ["New Delhi", "Mumbai CST", "Howrah", "Chennai Central"]
        sections = ["km 10-50", "Package-IV", "Phase-2"]
        buildings = ["Shastri Bhawan", "Nirman Bhawan", "Parliament Annexe"]
        
        # Anomalous templates
        fraud_templates = [
            "Emergency procurement of unspecified consumables",
            "Miscellaneous liaisoning charges",
            "Facilitation fee for clearance",
            "Urgent supply - Vendor TBD",
            "Ghost material entry for site #99"
        ]
        
        if is_anomaly:
            return random.choice(fraud_templates)
        else:
            # Pick a template relevant to agency or generic if not found
            if agency in templates:
                tmpl = random.choice(templates[agency])
                # Simple formatting
                if "{zone}" in tmpl: tmpl = tmpl.format(zone=random.choice(zones))
                if "{station}" in tmpl: tmpl = tmpl.format(station=random.choice(stations))
                if "{section}" in tmpl: tmpl = tmpl.format(section=random.choice(sections))
                if "{building}" in tmpl: tmpl = tmpl.format(building=random.choice(buildings))
                return tmpl
            return f"General procurement for {agency}"

    def generate_data(self):
        data = []
        for _ in range(self.num_samples):
            is_anomaly = random.random() < 0.05
            
            # Numerical features (INR typically has higher magnitude)
            amount = np.random.lognormal(mean=14, sigma=1.5) # Higher mean for INR
            
            if is_anomaly:
                if random.random() < 0.5:
                    amount = amount * 50 # Massive overbilling
                else:
                    amount = round(amount, -5) # Suspiciously round crore figure
            
            agency = random.choice(self.agencies)
            vendor = random.choice(self.vendors)
            contract_type = random.choice(self.contract_types)
            date = datetime.now() - timedelta(days=random.randint(0, 365))
            
            description = self.generate_description(agency, is_anomaly)
            
            entry = {
                'transaction_id': str(uuid.uuid4())[:8],
                'date': date.strftime('%Y-%m-%d'),
                'agency': agency,
                'vendor_id': vendor,
                'contract_type': contract_type,
                'amount': round(amount, 2),
                'description': description,
                'currency': 'INR',
                'is_anomaly': 1 if is_anomaly else 0
            }
            data.append(entry)
            
        return pd.DataFrame(data)

if __name__ == "__main__":
    generator = FraudDataGenerator(num_samples=5000)
    df = generator.generate_data()
    file_path = "public_sector_data.csv"
    df.to_csv(file_path, index=False)
    print(f"Generated {len(df)} records. Saved to {file_path}")
    print(df['is_anomaly'].value_counts())
