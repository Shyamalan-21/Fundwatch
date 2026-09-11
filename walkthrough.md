# FundWatch Black & Green Cybernetic Theme & Cross-Agency Peer Intelligence

## 🚀 Key Feature: Cross-Agency Peer Comparison Engine

We built and verified the **Cross-Agency Peer Comparison Engine**, enabling the identification of **systematic agency outliers for identical work categories**, rather than just individual transaction anomalies.

### 1. Architectural Implementation

- **Backend (`backend/routers/dataset.py`)**:
  - Added `GET /api/cross-agency-comparison` endpoint.
  - Groups transactions by `work_category` (e.g. Roads & Bridges, Drinking Water Supply, Community Halls).
  - Computes category peer median costs, IQR bounds, and deviation thresholds:
    - **OUTLIER**: Median cost $\ge 2.0\times$ peer median (systemic inflation).
    - **ELEVATED**: Median cost $\ge 1.5\times$ peer median.
    - **NORMAL**: Within peer bounds.
  - Formats agency metrics, deviation percentages, risk scores, ghost bill counts, and sample works for drilldown.

- **Frontend Client (`frontend/src/api/client.js`)**:
  - Implemented `fetchCrossAgencyComparison()` with automatic API consumption and structured local fallbacks.

- **Dedicated Page Component (`frontend/src/pages/CrossAgencyComparison.jsx`)**:
  - Follows the sleek dark `#020406` & mint-green `#6effc8` glassmorphic design system.
  - **Left Sidebar**: Work category selector showing works counts and active outlier counts.
  - **Benchmark Strip**: Real-time display of Category Peer Median, Outlier Limit (2×), Total Works, and Total Outlay.
  - **Visual Comparison Bar Chart (Recharts)**:
    - Ranked vertical-layout bar chart showing agency median costs.
    - Reference lines for **Peer Median** (mint) and **2× Outlier Limit** (rose dashed).
    - Color-coded bars (Rose for `OUTLIER`, Amber for `ELEVATED`, Mint for `NORMAL`).
  - **Agency Ranking Table**:
    - Columns: Rank, Agency & Location, Works Count, Median Cost, vs Peer Ratio, Avg Risk Score, Ghost Bills, Status Badge, and Drilldown.
    - Filterable by risk tier pills (`ALL`, `OUTLIER`, `ELEVATED`, `NORMAL`) and search query.
    - Expandable rows revealing specific sample works, costs, risk scores, and ghost bill indicators.
  - **Sticky Top Bar**: Includes `← Back to Analytics Dashboard` returning cleanly to the main dashboard.

- **Navigation Integration (`frontend/src/App.jsx` & `AnomalyRegistrySection.jsx`)**:
  - Hash routing support for `#comparison` with smooth scroll-to-top.
  - Added mint-accented **"Cross-Agency Comparison"** action buttons in both the header and bottom callout box of the Anomaly Registry section.
