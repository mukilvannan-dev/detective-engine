# CaseMind AI: Forensic Machine Learning & Guilt Prediction Engine
## 3rd Semester Machine Learning Project Plan & Implementation Roadmap

---

## 1. Executive Summary & Academic Alignment

### The Problem
The current application provides an interactive detective mystery interface, but currently relies on predefined, deterministic string-matching logic. To fulfill academic requirements for a 3rd-semester Machine Learning course, the system requires a **real machine learning pipeline**: a structured dataset, statistical data preprocessing, multi-model training/comparison, rigorous evaluation metrics, and a production-grade inference API integrated into the React frontend.

### Project Objective
Implement **"CaseMind AI"**: a dual-model forensic machine learning system:
1. **Primary Model: Suspect Culprit Probability Classifier**
   - Predicts whether a suspect is the guilty party ($0$ or $1$) along with calibrated confidence ($0\% - 100\%$) based on forensic evidence, alibi discrepancies, motive severity, and relationship vectors.
2. **Secondary Model: Case Solvability & Cold-Case Predictor**
   - Assesses crime scene attributes to predict the likelihood of closing a case vs. it becoming a cold case.
3. **Professor Viva / Demo Feature: Live Model Metrics Dashboard**
   - A dedicated tab in the frontend that visualizes the model's confusion matrix, ROC-AUC score, accuracy, and feature importances to demonstrate that the model is genuinely trained and evaluated.

---

## 2. Machine Learning Architecture & Methodology

```
+--------------------------------------------------------------+
|                    DATA ENGINEERING PIPELINE                 |
|  - Forensic Feature Schema (Alibi gap, DNA match, Motives)   |
|  - Train-Test Split (80/20 Stratified)                       |
|  - One-Hot Encoding + Robust Standard Scaler                 |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                     MODEL BENCHMARKING                       |
|  1. Logistic Regression (Baseline)                           |
|  2. Gaussian Naive Bayes                                     |
|  3. Decision Tree Classifier                                 |
|  4. Random Forest Classifier (Bagging Ensemble)              |
|  5. Gradient Boosting / XGBoost (Boosting Ensemble) ⭐ Best   |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                     EVALUATION & ARTIFACTS                   |
|  - Accuracy, Precision, Recall, F1-Score, ROC-AUC            |
|  - Confusion Matrix & Classification Report                  |
|  - Feature Importance (Gini / SHAP values)                   |
|  - Serialized Model Pipeline (`forensic_model.pkl`)          |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                  FASTAPI BACKEND (`/ml_backend`)             |
|  - `POST /api/predict/suspect` (Live Inference)              |
|  - `GET /api/model/metrics` (Accuracy & Confusion Matrix)    |
|  - `POST /api/predict/solvability`                           |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                 REACT FRONTEND INTEGRATION                   |
|  - Live "AI Forensic Assessment" Badge & Gauge on Suspects   |
|  - Interactive "Feature Importance Breakdown"                |
|  - Real-time Accusation Scoring via Model Inference          |
|  - "ML Model Diagnostics" Dashboard for Viva                 |
+------------------------------+-------------------------------+
```

---

## 3. Feature Engineering Schema

Each training instance consists of investigative forensic variables:

| Feature Name | Type | Description |
|---|---|---|
| `motive_severity` | Categorical | `none`, `low`, `medium`, `high`, `critical` |
| `relationship_to_victim` | Categorical | `stranger`, `acquaintance`, `employee`, `business_partner`, `family`, `heir` |
| `alibi_gap_minutes` | Numerical | Unaccounted window in minutes (e.g., 0 to 180 min) |
| `forensic_trace_score` | Numerical (0-100) | Physical trace at scene (fingerprints, fibers, DNA match %) |
| `access_to_crime_scene` | Categorical | `none`, `public_area`, `key_access`, `exclusive_access` |
| `weapon_accessibility` | Binary (0 or 1) | Whether suspect had access/familiarity with murder weapon |
| `contradiction_level` | Numerical (0-5) | Number of contradictions found between statements and phone/camera logs |
| `prior_criminal_record` | Binary (0 or 1) | Prior arrest/conviction record |
| **`is_culprit` (Target)** | **Binary (0 or 1)** | **Ground Truth Culprit label** |

---

## 4. Academic Evaluation Criteria & Deliverables

For project defense and viva presentation, we provide:
1. **Jupyter Notebook (`train_forensic_model.ipynb`)**:
   - Exploratory Data Analysis (EDA) with distribution plots.
   - Correlation heatmaps.
   - Comparison table showing **Accuracy**, **Precision**, **Recall**, and **F1-Score** across all 5 algorithms.
   - Confusion Matrix and ROC Curve plots.
   - Feature Importance Bar Chart showing which factors influence guilt the most.
2. **Exported Trained Pipeline**:
   - Saved `forensic_pipeline.pkl` with full preprocessing transformers included.
3. **RESTful API Service (`ml_backend/app.py` & `main.py`)**:
   - Ultra-fast, lightweight Python FastAPI server capable of serving predictions in <15ms.
4. **React Frontend Enhancements**:
   - Seamlessly integrated with [src/services/api.js](file:///e:/Mukil/3rd%20sem/Ml/project/detective-frontend/src/services/api.js).
   - Dynamic AI suspect analysis cards with risk percentage gauges.
   - "ML Model Diagnostics & Viva Metrics" tab so your professor can view the model's F1 score, confusion matrix, and feature rankings directly in the app.

---

## 5. Implementation Status

### Phase 1: Machine Learning Environment & Dataset Creation
- [x] Create `ml_backend/` folder in the project.
- [x] Write `generate_dataset.py` to create a statistically sound forensic investigation dataset with realistic correlations (`forensic_cases.csv` - 3,200 records).
- [x] Write `train_model.py` and `train_forensic_model.ipynb` to train, cross-validate, and compare Logistic Regression, Random Forest, Decision Tree, and Gradient Boosting.
- [x] Serialize the champion model to `forensic_pipeline.pkl` and export metrics to `metrics.json`.

### Phase 2: FastAPI Prediction Service
- [x] Create `ml_backend/app.py` and `ml_backend/main.py` using FastAPI and CORS middleware.
- [x] Expose endpoints:
  - `POST /api/predict/suspect`: takes suspect features and outputs guilt probability + top contributing risk factors.
  - `GET /api/model/metrics`: returns accuracy, precision, recall, F1, and confusion matrix data for UI visualization.
  - `POST /api/predict/solvability`: evaluates case clearance probability and cold-case risks.
- [x] Add `requirements.txt` (`fastapi`, `uvicorn`, `scikit-learn`, `pandas`, `numpy`, `joblib`).
- [x] Create 1-click batch launcher `run_server.bat`.

### Phase 3: Frontend Connection
- [x] Connect [src/services/api.js](file:///e:/Mukil/3rd%20sem/Ml/project/detective-frontend/src/services/api.js) to the real FastAPI backend endpoint.
- [x] Enhance suspect cards on [CaseInvestigationPage.jsx](file:///e:/Mukil/3rd%20sem/Ml/project/detective-frontend/src/pages/CaseInvestigationPage.jsx) with a live **"AI Forensic Risk Assessment"** card and probability gauge.
- [x] Add an **"ML Model Diagnostics"** tab and header shortcut displaying model accuracy, ROC curve data, confusion matrix, and feature importances.
- [x] Keep graceful offline fallback so the UI never breaks if the Python backend is paused.

### Phase 4: Final Verification & Viva Preparation
- [x] Verify frontend-backend end-to-end communication and build (`npm run build`).
- [x] Document common viva questions and theoretical justification in [ml_backend/README.md](file:///e:/Mukil/3rd%20sem/Ml/project/detective-frontend/ml_backend/README.md).
