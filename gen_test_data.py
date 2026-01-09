from data_gen import FraudDataGenerator
import pandas as pd
import random

if __name__ == "__main__":
    # Generate Normal Data
    gen = FraudDataGenerator(num_samples=100)
    df_normal = gen.generate_data()
    # Force them to be normal
    df_normal['is_anomaly'] = 0
    
    # Generate Anomalies manually or filter
    # Let's create specific edge cases
    edge_cases = [
        {
            'transaction_id': 'fraud-001',
            'date': '2025-01-01',
            'agency': 'Ministry of Defence',
            'vendor_id': 'Vendor_Unknown_99', 
            'contract_type': 'Item Rate',
            'amount': 999999999.00, # Huge amount INR
            'description': 'Ghost supply delivery for non-existent site',
            'currency': 'INR',
            'is_anomaly': 1
        },
        {
            'transaction_id': 'fraud-002',
            'date': '2025-01-02',
            'agency': 'Ministry of Health & Family Welfare',
            'vendor_id': 'Vendor_X',
            'contract_type': 'Consultancy',
            'amount': 500.00, # Tiny amount
            'description': 'Facilitation fee for clearance',
            'currency': 'INR',
            'is_anomaly': 1
        }
    ]
    
    df_anomalies = pd.DataFrame(edge_cases)
    
    # Combine
    df_eval = pd.concat([df_normal.head(10), df_anomalies])
    
    df_eval.to_csv("anomaly_test.csv", index=False)
    print("Created anomaly_test.csv with 12 records (2 anomalies).")
