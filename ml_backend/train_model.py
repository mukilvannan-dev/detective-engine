"""
CaseMind AI - Model Training & Evaluation Engine
Trains and benchmarks multiple ML classifiers on the forensic dataset:
1. Logistic Regression
2. Decision Tree Classifier
3. Random Forest Classifier
4. Gradient Boosting Classifier

Exports:
- forensic_pipeline.pkl (Full Scikit-Learn Pipeline with preprocessors)
- metrics.json (Academic benchmark metrics, confusion matrix, feature importances)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

from generate_dataset import generate_forensic_dataset

def run_training_pipeline():
    dataset_file = os.path.join(os.path.dirname(__file__), 'forensic_cases.csv')
    
    if not os.path.exists(dataset_file):
        print(f"Generating new forensic dataset at {dataset_file}...")
        df = generate_forensic_dataset(n_cases=800, suspects_per_case=4)
        df.to_csv(dataset_file, index=False)
    else:
        print(f"Loading existing dataset from {dataset_file}...")
        df = pd.read_csv(dataset_file)

    print(f"Total dataset records: {len(df)}")
    print(f"Target distribution:\n{df['is_culprit'].value_counts(normalize=True)}")

    # Features and Target
    categorical_features = ['relationship_to_victim', 'motive_severity', 'access_to_crime_scene']
    numerical_features = [
        'alibi_gap_minutes',
        'forensic_trace_score',
        'weapon_accessibility',
        'contradiction_level',
        'prior_criminal_record',
        'nervousness_biomarker'
    ]
    target = 'is_culprit'

    X = df[categorical_features + numerical_features]
    y = df[target]

    # Stratified Train/Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"\nTraining set size: {len(X_train)} | Test set size: {len(X_test)}")

    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    # Models to benchmark
    candidate_models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=9, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42)
    }

    benchmark_results = {}
    fitted_pipelines = {}

    print("\n" + "="*70)
    print("MODEL BENCHMARKING (3rd Semester ML Evaluation)")
    print("="*70)

    best_model_name = None
    best_f1 = -1.0

    for name, clf in candidate_models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])

        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else y_pred

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        benchmark_results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm
        }

        print(f"[{name}] Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f} | AUC: {auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

    print("\n" + "="*70)
    print(f"CHAMPION MODEL: {best_model_name} (F1-Score: {best_f1:.4f})")
    print("="*70)

    champion_pipeline = fitted_pipelines[best_model_name]

    # Extract Feature Importances if available
    feature_importances = []
    try:
        classifier_step = champion_pipeline.named_steps['classifier']
        prep_step = champion_pipeline.named_steps['preprocessor']
        
        # Get feature names after one-hot encoding
        cat_encoder = prep_step.named_transformers_['cat']
        cat_feature_names = list(cat_encoder.get_feature_names_out(categorical_features))
        all_feature_names = numerical_features + cat_feature_names

        if hasattr(classifier_step, 'feature_importances_'):
            importances = classifier_step.feature_importances_
        elif hasattr(classifier_step, 'coef_'):
            raw_coef = np.abs(classifier_step.coef_[0])
            importances = raw_coef / np.sum(raw_coef)
        else:
            importances = np.ones(len(all_feature_names)) / len(all_feature_names)

        feature_importances = sorted([
            {"feature": str(f), "importance": round(float(imp), 4)}
            for f, imp in zip(all_feature_names, importances)
        ], key=lambda x: x['importance'], reverse=True)
    except Exception as e:
        print(f"Note: Could not extract feature importances: {e}")

    # Compute SHAP (SHapley Additive exPlanations) for Explainable AI (XAI)
    shap_summary = []
    shap_base_value = -4.19
    try:
        import shap
        print("\nComputing SHAP (SHapley Additive exPlanations) for Explainable AI...")
        X_train_trans = prep_step.transform(X_train)
        X_test_trans = prep_step.transform(X_test)
        
        # Masker background using training mean
        explainer = shap.LinearExplainer(classifier_step, X_train_trans)
        test_shap_values = explainer(X_test_trans)
        
        # Calculate mean absolute SHAP value for each feature
        mean_abs_shaps = np.mean(np.abs(test_shap_values.values), axis=0)
        shap_summary = sorted([
            {
                "feature": str(f),
                "mean_abs_shap": round(float(val), 4),
                "rank": rank + 1
            }
            for rank, (f, val) in enumerate(sorted(zip(all_feature_names, mean_abs_shaps), key=lambda x: x[1], reverse=True))
        ], key=lambda x: x['mean_abs_shap'], reverse=True)

        if hasattr(explainer.expected_value, '__len__'):
            shap_base_value = float(explainer.expected_value[0])
        else:
            shap_base_value = float(explainer.expected_value)

        print(f"Computed SHAP values successfully for {len(all_feature_names)} features. Baseline: {shap_base_value:.4f}")
    except Exception as e:
        print(f"Note: SHAP calculation skipped or fallback: {e}")

    # Output artifacts
    model_output_path = os.path.join(os.path.dirname(__file__), 'forensic_pipeline.pkl')
    metrics_output_path = os.path.join(os.path.dirname(__file__), 'metrics.json')

    joblib.dump(champion_pipeline, model_output_path)
    print(f"Saved champion pipeline to: {model_output_path}")

    # Classification report for champion model
    y_champion_pred = champion_pipeline.predict(X_test)
    report_dict = classification_report(y_test, y_champion_pred, output_dict=True)

    summary_data = {
        "champion_model": best_model_name,
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "features": {
            "numerical": numerical_features,
            "categorical": categorical_features
        },
        "models": benchmark_results,
        "champion_metrics": benchmark_results[best_model_name],
        "classification_report": report_dict,
        "feature_importances": feature_importances[:10],  # Top 10 factors
        "shap_summary": shap_summary[:10],
        "shap_base_value": round(shap_base_value, 4)
    }

    with open(metrics_output_path, 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, indent=2)

    print(f"Saved evaluation metrics to: {metrics_output_path}")
    print("\nTop 5 Most Decisive Forensic Features:")
    for item in feature_importances[:5]:
        print(f" - {item['feature']}: {item['importance']*100:.1f}%")

if __name__ == '__main__':
    run_training_pipeline()
