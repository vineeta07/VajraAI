VajraAI is an intelligent, real-time fraud detection and anomaly identification system designed specifically for Indian government spending, procurement, welfare delivery, and contract management. Built with cutting-edge AI/ML techniques, it detects irregularities in government transactions with 92% faster audits and zero human oversight bias.

Mission
Protect public money from fraud, corruption, and wastage by leveraging machine learning, graph analysis, and rule-based systems to flag high-risk transactions in real-time for auditors, vigilance officers, and district administrators.

Key Features:
-> AI-Powered Detection
Isolation Forest – Duplicate beneficiary detection

Local Outlier Factor – Spending anomaly detection

K-Means Clustering – Vendor cartel identification

Graph Analysis (Neo4j) – Vendor network mapping

-> Real-Time Analytics
Live Risk Heatmap – District-wise fraud scores (GIS visualization with Leaflet.js)

Savings Tracker – ₹4.7Cr blocked | 247 ghosts caught | 350 FIRs filed

Vendor Network Graph – Identify colluding vendors (3+ firms winning 70%+ bids)

Interactive Dashboards – Case management, timeline tracking, ROI analytics

-> Rule-Based Flagging
Deceased Beneficiary Payments – Cross-check with death registry API

Off-Hours Transactions – Flag payments outside business hours

Amount Anomalies – 3x+ spike from vendor historical average

Repeated Bid Winners – Vendors winning 70%+ of procurements

Shell Company Indicators – Low turnover (₹<5Cr) with high contracts (₹>50Cr)

-> Multi-User Workflows
Auditors – Data upload, anomaly investigation, case creation

District Magistrates – District risk overview, heatmap filtering

Vigilance Officers – Case assignment, field investigations, payment blocking

Admin Dashboard – User management, system health monitoring

-> Export & Compliance
CAG-Ready PDF Reports – One-click export with evidence & citations

RTI-Compliant Outputs – Public Interest Litigation-ready formats

CSV Data Export – For further analysis

Tech Stack
Frontend-
React | Vite | TailwindCSS
Framer Motion (Animations) | Leaflet.js (Maps) 
Backend & APIs-
Node.js + Express.js (REST APIs)
Socket.IO (Real-time updates)
JWT Authentication + OTP (SMS-based login)
Databases-
PostgreSQL 15 (ACID compliance for financial audit trails)
Neo4j 5.1 (Vendor network graphs & cartel detection)
Redis 7 (Session caching & rate limiting)
ML & Data Processing-
Python 3.11
Scikit-learn (Isolation Forest, LOF, KMeans)
Pandas (Data validation & cleaning)
NumPy (Numerical operations)
MLflow (Model tracking & explainability)
Deployment-
Docker & Docker Compose (Containerized microservices)
Vercel (Frontend CDN)

Thankyou!!
