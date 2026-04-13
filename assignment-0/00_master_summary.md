# Task 0-2: AI & Deep Learning in Security — Master Summary
# Final Decisions Based on 2022–2025 Research

---

## Domain: Cybersecurity / Information Security

---

## USE CASES — FINAL STATUS

| Use Case                       | Status                    | Key Limitation                          |
|-------------------------------|---------------------------|-----------------------------------------|
| IDS (CNN + LSTM)               | INCLUDE WITH CAVEATS      | FPR unsolved at real scale              |
| Malware Detection (CNN)        | INCLUDE WITH CAVEATS      | Static only; packing/obfuscation evades |
| Phishing Detection (BERT/NLP)  | INCLUDE WITH CAVEATS      | Concept drift is unsolved               |
| Fraud Detection (GNN)          | INCLUDE WITH CAVEATS      | Adversarial concept drift               |
| Vulnerability Detection (LLM)  | INCLUDE — cutting-edge    | 512 token limit; still research stage   |
| Facial Recognition             | INCLUDE + EU AI Act note  | Banned in public spaces in EU           |
| Deepfake Detection             | REFRAME as open problem   | Lab→real drop from 96% to 50–65%       |
| Log Analysis / SIEM            | INCLUDE WITH CAVEATS      | Parsing quality; real-time cost         |

---

## DATASETS — FINAL STATUS

| Dataset        | Decision           | Replacement if needed    |
|----------------|--------------------|--------------------------|
| NSL-KDD        | DO NOT USE         | UNSW-NB15                |
| CICIDS 2017/18 | USE WITH CAVEAT    | Note labeling errors     |
| UNSW-NB15      | USE                | —                        |
| EMBER (orig)   | SUPERSEDED         | EMBER2024                |
| EMBER2024      | USE                | —                        |
| PhishTank      | USE WITH CAVEAT    | Note URL decay           |
| VirusShare     | USE WITH CAVEAT    | Note invite-only + noise |
| CERT v6.2      | USE WITH CAVEAT    | SPEDIA (2025) for future |
| Balabit Mouse  | USE                | —                        |

---

## COMMERCIAL PRODUCTS

| Product               | What to cite it for                        | Correction needed               |
|-----------------------|--------------------------------------------|----------------------------------|
| Darktrace             | Unsupervised behavioral baseline           | Note real-world alert fatigue    |
| CrowdStrike Falcon    | Production ML endpoint security (best)    | —                                |
| Microsoft Defender    | AI security at scale (billions endpoints) | —                                |
| Vectra AI             | NDR / network anomaly detection            | Self-reported claims — be careful|
| VirusTotal            | Data source ONLY — not an AI product      | Remove from AI products list     |

---

## PROPOSED INNOVATION IDEA

Title: "Multimodal Insider Threat Detection using Transformer Encoder +
        Cross-Attention Fusion with Federated Learning"
        (Mamba/SSM as cutting-edge frontier direction)

Feasibility: STRONG THEORETICAL PROPOSAL
             Supported by 3 independent 2025 papers on exact dataset (CERT)

Core architecture:
  - PRIMARY: Per-stream Transformer Encoder (temporal positional encoding)
             → 99.4% recall on CERT (arXiv 2506.23446, 2025)
  - ALTERNATIVE: Hybrid TCN + Transformer → 95% recall on CERT (Nature 2025)
  - FRONTIER: Mamba/SSM → F1 91.5%, 5× faster, 7.3MB memory (MambaITD 2025)
  - BASELINE: LSTM/GRU retained for comparison only
  - Cross-Attention Fusion layer (not simple attention)
  - Federated Learning (local training, aggregate weights only)
  - Differential privacy (DP-SGD) on gradient updates
  - Output: anomaly score → human analyst review queue (not automated action)

Datasets: CERT v6.2 + Balabit Mouse Dynamics

Known limitations to state openly:
  1. CERT dataset is synthetic → unknown real-world validity
  2. Extreme class imbalance (1 in 10,000–100,000 user-days)
  3. Behavioral baseline requires 30+ days per user
  4. GDPR/EU labor law compliance required before deployment
  5. FL model poisoning and gradient inference vulnerabilities
  6. LSTM outputs require human-in-the-loop for legal defensibility

Metrics to use (NOT accuracy):
  - Precision and Recall on threat class
  - F1 at fixed FPR thresholds (e.g., ≤1 false alarm per 100 users/day)

---

## ESSAY STRUCTURE

1. Introduction — Why security is a critical AI/DL domain
2. AI/DL Techniques in Security (CNN, LSTM, Transformers, GNN, Autoencoders, FL)
3. Use Cases
   a. Network Intrusion Detection
   b. Malware Detection
   c. Phishing / Fraud Detection
   d. Vulnerability Detection in Code
   e. Deepfake Detection (as open problem)
   f. Facial Recognition (with EU AI Act note)
   g. Log Analysis / SIEM
4. Real-World Products (Darktrace, CrowdStrike, Microsoft Defender, Vectra AI)
5. Datasets (approved list + why we avoid NSL-KDD and original EMBER)
6. Our Proposed Idea — Insider Threat Detection
   - Problem statement
   - Architecture
   - Datasets used
   - Open challenges
   - Future work
7. Conclusion

---

## SLIDE PLAN (10 min = 12 slides max)

| # | Slide Title                                | Key Points                                   |
|---|-------------------------------------------|----------------------------------------------|
| 1 | Title & Group                              | Topic, names, course                         |
| 2 | Why Security?                              | Scale of threat landscape, need for AI       |
| 3 | DL Techniques Overview                     | CNN, LSTM, Transformer, GNN, FL — one-liner each |
| 4 | IDS: Network Intrusion Detection           | CNN+LSTM architecture, UNSW-NB15, FPR caveat |
| 5 | Malware & Phishing Detection               | Binary image CNN, BERT NLP, concept drift    |
| 6 | Fraud & Vulnerability Detection            | GNN on transactions, LLM+GNN for code        |
| 7 | Deepfake Detection (Honest Take)           | 96% lab → 50-65% real world. Open problem.   |
| 8 | Real Products in Market                    | Darktrace, CrowdStrike, Defender, Vectra     |
| 9 | Datasets We Selected (and Why)             | UNSW-NB15, EMBER2024, CERT, Balabit          |
|10 | Our Idea: Insider Threat Detection         | Problem + architecture diagram               |
|11 | Challenges & Honest Assessment             | Class imbalance, GDPR, explainability, FL    |
|12 | Conclusion & Q&A                           | Summary, future directions                   |

---

## FILES IN THIS FOLDER

- 00_master_summary.md     → This file. Overall decisions and structure.
- 01_use_cases_final.md    → Per-use-case analysis with links
- 02_datasets_final.md     → Dataset decisions with links
- 03_proposed_idea_final.md → Insider threat idea, full technical detail
- 04_products_and_techniques_final.md → Products and DL techniques
- 05_all_references.md     → All 29 verified references with links
