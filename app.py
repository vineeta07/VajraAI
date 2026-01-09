import streamlit as st
import pandas as pd
import requests
import io

st.set_page_config(page_title="GPFT Fraud Detection", layout="wide")

st.title("🏛️ Generalized Public Fraud Transformer (GPFT)")
st.markdown("### Public Sector Anomaly Detection System")

st.sidebar.header("Configuration")
api_url = st.sidebar.text_input("API URL", "http://127.0.0.1:8000/predict")

st.divider()

st.header("Upload Transaction Log")
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.write("Preview:", df.head())
    
    if st.button("Analyze Transactions"):
        results = []
        progress_bar = st.progress(0)
        
        for i, row in df.iterrows():
            # Prepare payload
            payload = {
                "agency": str(row['agency']),
                "vendor_id": str(row['vendor_id']),
                "contract_type": str(row['contract_type']),
                "amount": float(row['amount']),
                "description": str(row['description'])
            }
            
            try:
                response = requests.post(api_url, json=payload)
                if response.status_code == 200:
                    res = response.json()
                    results.append({
                        **row.to_dict(),
                        "Anomaly Score": res['anomaly_score'],
                        "Is Anomaly": res['is_anomaly']
                    })
                else:
                    st.error(f"Error processing row {i}: {response.text}")
                    results.append({**row.to_dict(), "Anomaly Score": -1, "Is Anomaly": "Error"})
            except Exception as e:
                st.error(f"Connection Error: {e}")
                break
                
            progress_bar.progress((i + 1) / len(df))
            
        results_df = pd.DataFrame(results)
        
        st.subheader("Analysis Results")
        
        # Highlight anomalies
        def highlight_anomaly(s):
            return ['background-color: #ffcccc' if v else '' for v in s]

        # Styler not supported well in st.dataframe with custom logic per row/col easily, 
        # but we can filter.
        
        st.dataframe(results_df.style.apply(lambda x: ['background-color: red' if x['Is Anomaly'] == True else '' for i in x], axis=1))
        
        anomalies = results_df[results_df['Is Anomaly'] == True]
        st.error(f"Found {len(anomalies)} anomalies out of {len(results_df)} transactions.")
        st.expander("View Anomalies Details").dataframe(anomalies)

st.markdown("---")
st.markdown("Generated for Hackathon Demo")
