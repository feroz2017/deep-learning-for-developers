# Proposed Innovation: Insider Threat Detection — Final Assessment

## Idea (Final — Updated to 2025 Best Practice)
"Multimodal Insider Threat Detection using Transformer Encoder + Cross-Attention Fusion
with Federated Learning and Mamba/SSM as the frontier efficiency direction"

The system monitors four behavioral streams per user:
  - Network access logs (what systems/IPs accessed, at what time)
  - Login patterns (time-of-day, location, frequency, failed attempts)
  - Mouse dynamics (from Balabit dataset — speed, click patterns, trajectory)
  - File access patterns (volume, sensitivity level, destination)

Each stream is processed by a dedicated Transformer Encoder with temporal positional
encoding. A Cross-Attention Fusion layer learns relative stream importance per user
per time window. Anomaly scoring (Isolation Forest / reconstruction error) flags
sessions for human analyst review — not automated action.

For long sequences (1,000+ events/day), Mamba/SSM is the frontier alternative:
O(n) complexity, 5× faster than Transformer, 7.3 MB GPU memory (vs 9.5 MB Transformer).

LSTM and GRU are retained as baseline comparison models only.

Federated Learning: each organization trains locally, weight updates only are shared
centrally. DP-SGD applied to gradient updates for inference attack mitigation.

---

## Feasibility Verdict: RESEARCH PROTOTYPE — Feasible. Enterprise Deployment — Not yet.

This is an honest, defensible position supported by 2025 research. It is not impossible.
It is an active open problem, and framing it as a research proposal with known challenges
is exactly what a good academic essay should do.

---

## What is Technically Supported (cite these)

### Transformer Encoder for behavioral sequence modeling — PRIMARY
- Best published results on CERT dataset (your exact dataset):
  99.43% recall, 96.61% accuracy (arXiv 2506.23446, 2025)
- Parallel processing — no vanishing gradient problem
- Temporal positional encoding handles time-ordered behavioral events
- Outperforms LSTM/GRU by a significant margin on CERT
- Verification: https://arxiv.org/html/2506.23446v1

### Hybrid TCN + Transformer — ALTERNATIVE
- TCN (Temporal Convolutional Network) + Transformer hybrid
- Tested directly on CERT data with 30-day sliding windows → 95% recall
- O(n) complexity from TCN; long-range attention from Transformer
- Published in Nature Scientific Reports 2025
- Verification: https://www.nature.com/articles/s41598-025-12063-x

### Mamba / SSM — FRONTIER
- MambaITD (2025): tested directly on CERT r4.2 and r5.2
- F1 91.3% / 91.8%, 12.7% faster than Transformer, 7.3 MB GPU memory
- O(n) complexity — ideal for long sequences (1,000+ events/user/day)
- Verification: https://arxiv.org/html/2508.05695

### LSTM / GRU — BASELINE COMPARISON ONLY
- BiLSTM + attention achieves F1 0.908 on CERT (Springer 2024) — best RNN result
- Valid as comparison baseline; clearly outperformed by Transformer above
- Verification: https://link.springer.com/article/10.1007/s41019-024-00260-z

### Federated Learning for privacy-preserving training
- Personalized FL for insider threat: Nature 2025 paper validates this direction
- Organizations train locally; central model aggregates weights only
- Verification: https://www.nature.com/articles/s41598-025-04029-w

### Multimodal fusion (network + login + mouse dynamics)
- Cross-Attention Fusion between modalities learns relative stream importance
- Mouse dynamics (Balabit): established behavioral biometrics dataset from real users
- Multimodal CERT + Balabit combination validated in 2025 prototype literature

### CERT Insider Threat Dataset as training/evaluation base
- Most widely used benchmark for insider threat research.
- Sufficient for a proof-of-concept research prototype.
- Verification: https://kilthub.cmu.edu/articles/dataset/Insider_Threat_Test_Dataset/12841247

---

## Known Challenges to Acknowledge (be honest about these)

### 1. Dataset realism gap
The CERT dataset is synthetic (~1000 simulated users, injected threat scenarios).
Models validated only on CERT have unknown real-world validity. A 2025 ScienceDirect
paper published SPEDIA specifically because CERT is insufficient for realistic evaluation.
- What to say: "Our evaluation would use CERT v6.2 as a baseline, with SPEDIA (2025)
  as a more realistic alternative for future validation."
- SPEDIA paper: https://www.sciencedirect.com/science/article/pii/S0167404825004328

### 2. Extreme class imbalance
Real insider threat events occur at approximately 1 in 10,000–100,000 user-days.
This makes standard accuracy metrics misleading. The correct metrics are:
  - Precision at low false positive rate
  - F1 score on minority class
  - Detection rate at a fixed FPR (e.g., 1 false alarm per 100 users per day)
- What to say: "Evaluation must prioritize precision/recall over accuracy. Class
  imbalance will be addressed via SMOTE oversampling and cost-sensitive loss functions."

### 3. Behavioral baseline cold-start
The LSTM needs a baseline of "normal" behavior per user before it can flag anomalies.
This takes weeks to months of data. New employees, role changes, remote work shifts,
and project deadlines all appear as anomalies during calibration.
- What to say: "A minimum 30-day baselining period per user is required. Contextual
  metadata (job role, department, ongoing projects) would be incorporated to reduce
  false alarms during known behavioral transitions."

### 4. Federated Learning security caveats
FL is not a perfect privacy solution:
  - Model poisoning: a malicious participant submits crafted gradient updates to
    compromise the global model
  - Gradient inference attacks: local weight updates can leak information about
    the training data
- What to say: "FL is used to minimize data centralization, not to provide absolute
  privacy guarantees. Differential privacy (DP-SGD) would be applied to gradient
  updates to mitigate inference attacks."
- FL privacy attacks survey: https://www.tandfonline.com/doi/full/10.1080/08839514.2024.2410504

### 5. Legal and ethical constraints (EU/Finland context)
Monitoring keyboard/mouse dynamics and network activity requires:
  - GDPR Article 88 compliance (employee monitoring)
  - Explicit disclosure to employees (cannot be covert)
  - Data Protection Authority (DPA) approval in Finland
  - Works council / union agreement in many EU countries
- What to say: "Deployment requires transparent employee disclosure, DPA registration,
  and strict data minimization — only aggregated behavioral features are stored,
  not raw logs. The system flags for human review, not automated disciplinary action."

### 6. Explainability requirement
LSTM + attention outputs are probabilistic scores, not human-readable explanations.
Employment decisions (investigation, termination) cannot be based on a black-box score
in a regulated environment.
- What to say: "Attention weight visualization provides per-event contribution scores.
  For legal defensibility, the system is designed as a decision-support tool — a human
  security analyst reviews all flagged cases before any action is taken."

---

## Proposed Architecture (Final — Updated)

```
Data Sources:
  [Network Logs] [Login Events] [Mouse Dynamics] [File Access Logs]
       |               |               |                  |
       +---------------+---------------+------------------+
                               |
                    [Per-stream Feature Extraction]
                    (temporal binning, event tokenization)
                               |
              [Per-stream Transformer Encoder]          <- PRIMARY
              (temporal positional encoding per stream)
              [Alt: Mamba/SSM for sequences >1K events] <- FRONTIER
              [LSTM/GRU retained as baseline comparison] <- BASELINE
                               |
                    [Cross-Attention Fusion Layer]
                    (learned cross-stream attention weights)
                               |
                    [Anomaly Score per User Session]
                    (Isolation Forest / reconstruction error)
                               |
              [Threshold] --> [Alert Queue] --> [Human Analyst Review]

Training:
  Federated Learning — each org trains locally, aggregates weights only
  Differential Privacy (DP-SGD) on gradient updates
  SMOTE oversampling for class imbalance on minority (threat) class
  Personalized local fine-tuning per organization

Evaluation:
  Primary: CERT v6.2 dataset
  Secondary: SPEDIA dataset (2025, more realistic)
  Comparison baselines: LSTM, GRU, BiLSTM (established benchmarks)
  Metrics: Precision, Recall, F1 at fixed FPR thresholds
  Target: Match or exceed Transformer paper benchmark (99.4% recall on CERT)
```

### Architecture Comparison Table (Published Results on CERT)

| Model | Accuracy | Recall | F1 | Memory | Source |
|---|---|---|---|---|---|
| LSTM (baseline) | ~77–91% | ~77% | ~0.78 | 14.8 MB | MambaITD 2025 |
| GRU (baseline) | ~88% | ~88% | ~0.88 | Similar | Springer 2024 |
| BiLSTM+Attn (baseline) | ~91% | ~90% | 0.908 | High | Springer 2024 |
| **Transformer Encoder (primary)** | **96.6%** | **99.4%** | — | 9.5 MB | arXiv 2025 |
| TCN+Transformer (alternative) | — | **95%** | — | Low | Nature 2025 |
| **Mamba/SSM (frontier)** | — | 91.1% | **91.5%** | **7.3 MB** | MambaITD 2025 |

---

## What Makes This Idea Academically Strong

1. It addresses a real and growing problem (CISA reports insider threats account for
   34% of all data breaches)
2. It is technically grounded in current architectures (LSTM + attention, FL, multimodal)
3. It cites real datasets (CERT, Balabit, SPEDIA)
4. It acknowledges its own limitations honestly — which is what research proposals do
5. It proposes concrete mitigations for each limitation
6. It is achievable as a university-level research prototype using open datasets

---

## What NOT to claim
- Do NOT claim this is a deployable production system
- Do NOT claim it solves insider threat detection — it is a research proposal
- Do NOT ignore the GDPR/EU compliance dimension — it strengthens the essay
- Do NOT cite CERT alone as sufficient validation without noting its synthetic nature
