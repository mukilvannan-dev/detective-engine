"""
CaseMind AI - Forensic Investigation Dataset Generator
Generates a realistic, statistically calibrated benchmark dataset of 3,200 suspect profiles across 800 criminal investigations.
Modeled after criminological patterns (motive, alibi discrepancies, forensic trace, and interrogation contradictions).
"""

import numpy as np
import pandas as pd
import random

def generate_forensic_dataset(n_cases=800, suspects_per_case=4, random_state=42):
    np.random.seed(random_state)
    random.seed(random_state)

    relationships = ['stranger', 'acquaintance', 'employee', 'business_partner', 'family', 'heir']
    motives = ['none', 'low', 'medium', 'high', 'critical']
    access_levels = ['none', 'public_area', 'key_access', 'exclusive_access']

    records = []

    for case_idx in range(1, n_cases + 1):
        case_id = f"CASE-{case_idx:04d}"
        culprit_slot = random.randint(0, suspects_per_case - 1)

        for s_idx in range(suspects_per_case):
            is_culprit = 1 if (s_idx == culprit_slot) else 0
            suspect_id = f"{case_id}-S{s_idx + 1}"

            if is_culprit:
                # Distribution for culprits
                rel = np.random.choice(relationships, p=[0.05, 0.15, 0.20, 0.25, 0.20, 0.15])
                motive = np.random.choice(motives, p=[0.02, 0.08, 0.20, 0.40, 0.30])
                
                # Alibi gap: typically significant with noise
                alibi_gap = float(np.clip(np.random.normal(loc=55.0, scale=25.0), 5.0, 180.0))
                
                # Forensic trace (DNA, fingerprints, fiber): high probability of strong trace
                trace_score = float(np.clip(np.random.normal(loc=74.0, scale=16.0), 10.0, 100.0))
                
                # Access to scene
                access = np.random.choice(access_levels, p=[0.02, 0.10, 0.48, 0.40])
                
                # Weapon accessibility: usually had means
                weapon_acc = int(np.random.choice([0, 1], p=[0.12, 0.88]))
                
                # Contradictions in statements
                contradictions = int(np.clip(np.random.poisson(lam=2.8), 0, 5))
                
                # Criminal record
                prior_record = int(np.random.choice([0, 1], p=[0.60, 0.40]))
                
                # Physiological / behavioral tension score
                nervousness = float(np.clip(np.random.normal(loc=72.0, scale=14.0), 20.0, 100.0))
            else:
                # Distribution for innocent suspects
                rel = np.random.choice(relationships, p=[0.20, 0.25, 0.20, 0.15, 0.12, 0.08])
                motive = np.random.choice(motives, p=[0.35, 0.30, 0.22, 0.10, 0.03])
                
                # Alibi gap: usually short, but occasional innocent discrepancy
                alibi_gap = float(np.clip(np.random.exponential(scale=14.0), 0.0, 120.0))
                
                # Forensic trace: generally low background traces
                trace_score = float(np.clip(np.random.beta(a=1.5, b=5.0) * 80.0, 0.0, 65.0))
                
                # Access to scene
                access = np.random.choice(access_levels, p=[0.30, 0.45, 0.20, 0.05])
                
                # Weapon accessibility
                weapon_acc = int(np.random.choice([0, 1], p=[0.75, 0.25]))
                
                # Contradictions in statements: rarely more than 1
                contradictions = int(np.clip(np.random.poisson(lam=0.5), 0, 4))
                
                # Criminal record
                prior_record = int(np.random.choice([0, 1], p=[0.88, 0.12]))
                
                # Physiological / behavioral tension score
                nervousness = float(np.clip(np.random.normal(loc=38.0, scale=18.0), 5.0, 95.0))

            records.append({
                'case_id': case_id,
                'suspect_id': suspect_id,
                'relationship_to_victim': rel,
                'motive_severity': motive,
                'alibi_gap_minutes': round(alibi_gap, 1),
                'forensic_trace_score': round(trace_score, 1),
                'access_to_crime_scene': access,
                'weapon_accessibility': weapon_acc,
                'contradiction_level': contradictions,
                'prior_criminal_record': prior_record,
                'nervousness_biomarker': round(nervousness, 1),
                'is_culprit': is_culprit
            })

    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    print("Generating Forensic Investigation Dataset...")
    df = generate_forensic_dataset(n_cases=800, suspects_per_case=4)
    output_path = 'forensic_cases.csv'
    df.to_csv(output_path, index=False)
    print(f"Successfully generated {len(df)} records in '{output_path}'")
    print(f"Culprit distribution:\n{df['is_culprit'].value_counts(normalize=True)}")
    print("\nDataset sample:")
    print(df.head())
