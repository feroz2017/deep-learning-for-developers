# AI & Deep Learning in Security — Datasets: Final Decisions

Datasets to USE, REPLACE, or AVOID based on 2022–2025 research findings.

---

## APPROVED DATASETS

### 1. UNSW-NB15
- **Use for:** Network intrusion detection (IDS)
- **Why:** More modern than NSL-KDD. Contains 9 attack categories with realistic traffic.
  Better option for network anomaly benchmarking.
- **Known issues:** Class imbalance (Worms: only 174 samples). Class overlap between
  attack categories. Still synthetic — does not fully represent real enterprise traffic.
- **Decision:** USE. Acknowledge class imbalance issue in essay.
- **Source:** https://research.unsw.edu.au/projects/unsw-nb15-dataset
- **Paper (Wiley 2024):** https://onlinelibrary.wiley.com/doi/full/10.1002/spy2.331

### 2. EMBER2024
- **Use for:** PE malware classification
- **Why:** Released 2024 by Elastic and CrowdStrike. Contains evasive malware samples
  that the original EMBER dataset lacked. Large enough to reflect real commercial AV
  training challenges.
- **Replaces:** Original EMBER (original achieves 0.9991 ROC-AUC with baseline model —
  too easy to show meaningful improvement).
- **Decision:** USE. Cite EMBER2024, not original EMBER.
- **Source/Paper:** https://arxiv.org/abs/2506.05074

### 3. PhishTank
- **Use for:** Phishing URL detection
- **Why:** Real, continuously updated crowd-sourced phishing URL database. Widely cited.
- **Known issues:** Crowd-sourced verification introduces noise. URLs decay within
  hours-to-days (phishing sites are short-lived). Verification lag means some URLs
  are dead before the dataset is published.
- **Decision:** USE. Explicitly acknowledge the URL freshness and decay problem.
- **Source:** https://phishtank.org
- **Data quality paper:** https://www.sciencedirect.com/science/article/pii/S2352340923009903

### 4. CERT Insider Threat Dataset (v6.2)
- **Use for:** Insider threat detection (for the proposed idea)
- **Why:** The most widely used benchmark for insider threat research. Contains simulated
  user behavior logs (email, HTTP, file access, login events) with injected malicious
  scenarios.
- **Known issues:** Entirely synthetic. ~1000 simulated users, not real employees.
  Models trained only on CERT have unknown real-world validity. SPEDIA (2025) was
  published specifically to address CERT's limitations.
- **Decision:** USE for the proposed idea, but explicitly call out the synthetic nature
  as a limitation. Reference SPEDIA (2025) as a newer, more realistic alternative.
- **Source:** https://kilthub.cmu.edu/articles/dataset/Insider_Threat_Test_Dataset/12841247
- **SPEDIA paper (2025):** https://www.sciencedirect.com/science/article/pii/S0167404825004328

### 5. VirusShare
- **Use for:** Malware sample collection (raw binaries)
- **Why:** Large collection of real malware samples. Useful for building image datasets
  for CNN-based malware classification.
- **Known issues:** Invitation-only access — new researchers may face delays. Labels
  are crowdsourced via VirusTotal multi-scanner consensus, which introduces label noise
  when different antivirus engines disagree on family classification.
- **Decision:** USE as a secondary source. Note access friction and label noise.
- **Source:** https://virusshare.com
- **Label noise study:** https://www.sciencedirect.com/science/article/pii/S1319157823004524

### 6. Balabit Mouse Dynamics Dataset
- **Use for:** Behavioral biometrics component of insider threat detection
- **Why:** Real mouse movement sequences from real users. Useful for the behavioral
  biometrics stream in the multimodal insider threat idea.
- **Decision:** USE for the proposed idea as the behavioral telemetry data source.
- **Source:** https://github.com/balabit/Mouse-Dynamics-Challenge

---

## DATASETS TO AVOID OR REPLACE

### NSL-KDD — DO NOT USE AS PRIMARY BENCHMARK
- **Why:** Based on DARPA 1998 synthetic captures. Does not contain any modern attack
  classes (no ransomware, no C2 beaconing, no living-off-the-land techniques). The
  research community has broadly agreed it should no longer be used as a primary IDS
  benchmark. Papers still using it inflate accuracy numbers that are meaningless for
  real-world comparison.
- **Replace with:** UNSW-NB15
- **Reference:** https://ieeexplore.ieee.org/document/9947235/

### CICIDS 2017/2018 — USE WITH EXTREME CAUTION
- **Why:** An IEEE 2022 peer-reviewed study found:
  - Widespread labeling errors in attack categories
  - Packet misordering and packet duplication artifacts
  - Class imbalance ratios up to 10,000:1 for some attack types
  - Statistical feature distributions that diverge from real enterprise traffic
  Models trained on CICIDS 2017/2018 fail to generalize to real networks.
- **Decision:** If you cite it, acknowledge these documented problems. Do not use it
  as a primary benchmark without caveats.
- **IEEE study:** https://ieeexplore.ieee.org/document/9947235/
- **HAL Science paper:** https://hal.science/hal-03775466v1/document

### EMBER (original) — SUPERSEDED
- **Why:** Baseline model achieves ROC-AUC 0.9991 — essentially perfect — making it
  impossible to demonstrate meaningful improvement from novel architectures. Contains
  no evasive malware samples.
- **Replace with:** EMBER2024
- **Reference:** https://arxiv.org/abs/2506.05074

---

## DATASET SUMMARY TABLE

| Dataset       | Use Case                    | Decision           | Key Issue                          |
|---------------|-----------------------------|--------------------|-------------------------------------|
| UNSW-NB15     | Network IDS                 | USE                | Class imbalance, synthetic          |
| NSL-KDD       | Network IDS                 | DO NOT USE         | 1998-era data, no modern attacks    |
| CICIDS 2017/18| Network IDS                 | AVOID / caveat     | Labeling errors, 10000:1 imbalance  |
| EMBER2024     | PE Malware classification   | USE                | Best current PE benchmark           |
| EMBER (orig)  | PE Malware classification   | SUPERSEDED         | Too easy (0.9991 AUC baseline)      |
| PhishTank     | Phishing URL                | USE (with caveat)  | URL decay, crowd-sourced noise      |
| VirusShare    | Malware samples             | USE (with caveat)  | Invite-only, label noise            |
| CERT v6.2     | Insider threat              | USE (with caveat)  | Synthetic, ~1000 users only         |
| Balabit Mouse | Behavioral biometrics       | USE                | Real user data, good quality        |
