# CaseMind AI: Forensic Investigation Machine Learning Service
### 3rd Semester Machine Learning Project & College Defense Documentation

---

## 1. Project Overview
**CaseMind AI** transforms the detective mystery game into a legitimate **Supervised Machine Learning System**. The system evaluates investigative crime scene features (alibi discrepancies, forensic trace match, motive severity, scene access, and interrogation contradictions) to predict **Suspect Culprit Probability** with calibrated confidence.

---

## 2. Machine Learning Architecture

### Benchmark Dataset
- **Records**: 3,200 suspect profiles across 800 criminal investigation incidents.
- **Features**:
  - `forensic_trace_score`: Physical trace match percentage (DNA, fingerprints, fiber) at the crime scene.
  - `alibi_gap_minutes`: Unaccounted time window in the verified alibi.
  - `contradiction_level`: Number of conflicting statements between witness notes and camera/phone logs.
  - `motive_severity`: Motive categorization (`none`, `low`, `medium`, `high`, `critical`).
  - `access_to_crime_scene`: Scene access level (`none`, `public_area`, `key_access`, `exclusive_access`).
  - `weapon_accessibility`: Familiarity or documented access to the murder weapon (Binary: 0 or 1).
  - `prior_criminal_record`: Prior arrest or conviction history (Binary: 0 or 1).
  - `nervousness_biomarker`: Stress biomarker score during formal interrogation (0 to 100).
- **Target Variable**: `is_culprit` (Binary: 0 = Innocent, 1 = Culprit).

### Multi-Model Benchmarking Results (80/20 Stratified Split)

| Algorithm | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Status |
|---|---|---|---|---|---|---|
| **Logistic Regression (Champion)** | **99.69%** | **99.38%** | **99.38%** | **0.9938** | **0.9999** | **Active Pipeline** |
| Random Forest Classifier | 99.53% | 98.76% | 99.38% | 0.9907 | 0.9998 | Evaluated |
| Gradient Boosting Classifier | 98.28% | 96.27% | 96.88% | 0.9657 | 0.9992 | Evaluated |
| Decision Tree Classifier | 97.81% | 95.63% | 95.63% | 0.9563 | 0.9773 | Evaluated |

### Confusion Matrix (Test Set N = 640)
- **True Negative (Innocent correctly identified)**: 479
- **False Positive (Type I error - Wrongful accusation)**: 1 (0.2%)
- **False Negative (Type II error - Culprit missed)**: 1 (0.6%)
- **True Positive (Culprit correctly indicted)**: 159

---

## 3. How to Run for Demo / College Viva

### Step 1: Start the Python FastAPI ML Server
Run the batch file or open terminal in `ml_backend`:
```bash
cd ml_backend
py -3 -m uvicorn app:app --port 8000 --reload
```
You can view interactive Swagger API docs at: [http://localhost:8000/docs](http://localhost:8000/docs)

### Step 2: Start the React Frontend
In the root directory:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Key Files for Submission
1. **`train_forensic_model.ipynb`**: Complete Jupyter notebook with data loading, EDA boxplots, training loops, confusion matrix heatmap, and ROC curves.
2. **`generate_dataset.py`**: Generates `forensic_cases.csv` using criminological distributions.
3. **`train_model.py`**: Model training, preprocessing pipeline, cross-validation, and metrics export.
4. **`forensic_pipeline.pkl`**: Serialized Scikit-learn Pipeline (OneHotEncoder + StandardScaler + Model).
5. **`metrics.json`**: Model benchmark evaluation metrics consumed by the frontend diagnostics dashboard.
6. **`app.py`**: FastAPI REST server providing live predictions and metrics.

---

## 5. College Viva Questions & Answers

**Q1: Why did you benchmark multiple algorithms instead of picking just one?**
> *Answer*: Different algorithms make different assumptions about data distributions. We evaluated linear baselines (Logistic Regression), tree-based models (Decision Tree), and ensemble techniques (Random Forest and Gradient Boosting) to empirically determine the model with the highest harmonic F1-score and lowest False Positive rate.

**Q2: What is the significance of the False Positive rate in this domain?**
> *Answer*: In criminological and forensic applications, a False Positive means indicting an innocent person. Therefore, minimizing Type I error (achieved at 0.2%) is critical to prevent wrongful conviction while maintaining high sensitivity (Recall: 99.38%).

**Q3: How are categorical features handled in inference?**
> *Answer*: We built an end-to-end `ColumnTransformer` pipeline combining `StandardScaler` for continuous numerical features and `OneHotEncoder(handle_unknown='ignore')` for categories. The entire pipeline is serialized in `forensic_pipeline.pkl`, meaning raw JSON queries are transformed automatically without manual data encoding.

**Q4: What is Explainable AI (XAI) and why did you integrate SHAP?**
> *Answer*: High prediction accuracy is insufficient in criminal justice; models cannot operate as "black boxes". We integrated **SHAP (SHapley Additive exPlanations)** grounded in cooperative game theory. SHAP computes the exact marginal contribution (Shapley value) of each forensic clue towards or away from the baseline log-odds threshold. This provides both:
> 1. **Global Explanations**: Overall rank of decisive forensic clues across 640 test suspects (physical trace match and nervousness leading).
> 2. **Local Explanations**: For any specific suspect, a waterfall breakdown showing exactly which clues were incriminating (e.g., `+7.24` for physical trace) versus exonerating (e.g., `-0.50` for low interrogation stress).

