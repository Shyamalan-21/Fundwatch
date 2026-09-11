# FUNDWATCH
### An Explainable MPLADS Spending-Anomaly Detection System
**Ministry of Statistics and Programme Implementation (MoSPI) — Problem Statement 10**

---

## 1. Executive Summary
**FundWatch** is an investigator-facing intelligence platform that analyzes real Member of Parliament Local Area Development Scheme (MPLADS) expenditure data to detect anomalous agency spending behaviors. Rather than flagging isolated transactions (which produce noisy, low-trust alerts), FundWatch models each implementing agency's individual historical spending baseline and flags statistically significant deviations in **spending velocity**, **cumulative disbursement surges**, and **peer discrepancy**.

Every flagged anomaly is paired with an **Investigation Copilot brief** in clear natural language where 100% of figures are mathematically traceable to deterministic computed statistics.

---

## 2. Key Architecture Pillars

```
+----------------------------------------------------------------------------------------+
|                                  FUNDWATCH SYSTEM PIPELINE                              |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  [ 1. Data Pipeline ]                                                                  |
|   * Ingests MoSPI MPLADS Fund Summaries (Dataset A) & Granular Works (Dataset B)       |
|   * RapidFuzz agency name clustering (reduces 161 messy variants -> 37 canonical IDs)   |
|   * Auditable decision log written to agency_alias_map.csv                             |
|   * Generates clean_agency_month.csv & clean_works.csv                                 |
|                                                                                        |
|  [ 2. Statistical Anomaly Detection Engine ]                                          |
|   * Signal 1: Robust MAD Modified Z-Score (Iglewicz & Hoaglin, flag if > 3.5)          |
|   * Signal 2: IQR Upper Fencing (Q3 + 1.5 * IQR)                                       |
|   * Signal 3: Spend Velocity Surge (x / 6m-trailing-median > 3.0x) & Acceleration      |
|   * Signal 4: Size-Bucketed Peer Comparison within State & Category                    |
|   * Composite Risk Score (0-100) & Cold-Start (<3 months) Handling                     |
|                                                                                        |
|  [ 3. FastAPI Backend & Investigation Copilot ]                                        |
|   * SQLite persistence for instant query performance                                   |
|   * REST Endpoints: /api/stats, /api/anomalies, /api/agencies, /api/investigate        |
|   * Grounded narrative engine with strict numeric verification & anti-hallucination    |
|                                                                                        |
|  [ 4. Modern React + Recharts Intelligence Dashboard ]                                 |
|   * Screen 1: Ranked Anomaly Dashboard with multi-tier filters & KPI metrics           |
|   * Screen 2: Agency Drilldown with interactive Recharts timeline & baseline lines     |
|   * Screen 3: Grounded Investigation Brief & printable Referral Packet                 |
|   * Audit View: Full transparency into fuzzy matching decisions                        |
+----------------------------------------------------------------------------------------+
```

---

## 3. Statistical Detection Formulas

### Signal 1: Robust Modified Z-Score (MAD-Based)
$$M_i = 0.6745 \times \frac{x_i - \text{median}}{\text{MAD}}$$
*Flagged when $M_i > 3.5$* (Standard robust statistics threshold). Unlike standard deviations, MAD is resistant to distortion from extreme outliers.

### Signal 2: IQR Fencing
$$\text{Upper Fence} = Q_3 + 1.5 \times \text{IQR}$$
$$\text{IQR Ratio} = \frac{x_i - \text{Upper Fence}}{\text{IQR}}$$

### Signal 3: Spend Velocity & Acceleration
$$\text{Velocity Ratio} = \frac{x_i}{\text{Median}(x_{i-6} \dots x_{i-1})}$$
$$\text{Acceleration} = \text{Velocity Ratio}_t - \text{Velocity Ratio}_{t-1}$$

### Signal 4: Cross-Agency Peer Comparison
Agencies are categorized by state and size terciles (Small, Medium, Large based on median spend).
$$\text{Peer Ratio} = \frac{x_i}{\text{Peer Bucket Median}}$$

### Composite Risk Score (0 - 100)
$$\text{Score} = 100 \times \left[ 0.35 \min\left(\frac{M_i}{5}, 1\right) + 0.20 \min\left(\frac{\text{IQR Ratio}}{3}, 1\right) + 0.30 \min\left(\frac{\text{Velocity} - 1}{4}, 1\right) + 0.15 \min\left(\frac{\text{Peer Ratio} - 1}{3}, 1\right) \right]$$

---

## 4. Running the System Locally

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Step 1: Run Data Pipeline & Detector
```bash
# Clean raw datasets and cluster agency names
python data/clean_pipeline.py

# Run statistical anomaly detection engine
python detector/run_detector.py

# Run detector test suite
python -m unittest detector/tests/test_signals.py
```

### Step 2: Start Backend API
```bash
cd backend
python main.py
# Backend runs at http://localhost:8000
# OpenAPI Docs at http://localhost:8000/docs
```

### Step 3: Start Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
# Dashboard runs at http://localhost:5173
```

---

## 5. Demonstration Walkthrough & Pitch

1. **The Problem Statement (15s)**: MPLADS spans thousands of projects across hundreds of agencies with no centralized spending-velocity intelligence.
2. **Deterministic Statistics Over AI Guesswork (45s)**: Show the **Agency Drilldown** chart. Point out the cyan historical median line, the amber IQR upper fence, and the sudden $6.3\times$ velocity surge.
3. **The Standout Feature — Investigation Copilot (45s)**: Click **"Generate Copilot Brief"**. Notice how the narrative references exact computed figures ($71.6\text{L}$, $6.3\times$ acceleration, $49.6$ MAD Z-score) with 100% Grounding Verification passed.
4. **Fuzzy Merge Audit (30s)**: Open the **Fuzzy Merge Audit** tab to show judges how raw government data messiness was resolved transparently with logged rapidfuzz confidence scores.
