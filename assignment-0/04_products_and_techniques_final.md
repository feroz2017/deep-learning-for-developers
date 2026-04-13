# Commercial Products & DL Techniques — Final Decisions

---

## Commercial Products to Cite

### Darktrace
- **What it does:** Network anomaly detection using unsupervised ML. Builds behavioral
  baselines for every network entity (device, user, subnet) and flags deviations.
- **What is real:** The self-learning baseline approach is genuine. Used in real enterprise
  deployments across healthcare, finance, and critical infrastructure.
- **What to note honestly:** High false positive rates and alert fatigue are documented
  in real user reviews. Requires a two-week baselining period before generating reliable
  detections. "Autonomous AI" marketing overstates the degree of human-independent
  operation — human analysts still drive investigation.
- **Verdict:** INCLUDE. Good example of unsupervised DL in production security.
- **Website:** https://darktrace.com

### CrowdStrike Falcon
- **What it does:** Endpoint Detection and Response (EDR). Combines static ML (PE file
  classification), behavioral sensor analysis, and cloud-based threat intelligence.
- **What is real:** Ranked #1 in independent EDR evaluations (MITRE ATT&CK). AI
  components are genuine and mature. Co-produced EMBER2024 dataset.
- **What to note honestly:** "AI-driven" marketing is more accurate here than most
  competitors — the ML components are genuinely integrated into detection logic.
- **Verdict:** INCLUDE. Best example of production-grade ML in endpoint security.
- **Website:** https://www.crowdstrike.com

### Microsoft Defender (with AI)
- **What it does:** Endpoint + cloud workload protection. Uses static ML for file
  classification, behavioral ML for process anomaly detection, and cloud-based
  reputation scoring.
- **What is real:** A mature, large-scale ML deployment. Powers protection for billions
  of endpoints. Microsoft publishes regular transparency reports on detection rates.
- **Verdict:** INCLUDE. Good example of AI security at massive scale.
- **Website:** https://www.microsoft.com/en-us/security/business/microsoft-defender

### Vectra AI
- **What it does:** Network Detection and Response (NDR). AI-based anomaly scoring on
  network metadata (not packet content). Specializes in detecting lateral movement
  and C2 communication.
- **What is real:** Meaningful anomaly scoring on network flow data. Reduces analyst
  workload compared to raw SIEM alerts.
- **What to note honestly:** Marketing claims of "91% win rate over Darktrace" are
  self-reported. The AI components do real work but "AI-driven threat hunting" conflates
  statistical alerting with autonomous investigation.
- **Verdict:** INCLUDE. Good NDR example, but cite conservatively.
- **Website:** https://vectra.ai

### VirusTotal (Google)
- **CORRECTION from original plan:** VirusTotal is NOT an AI/DL product. It is a
  multi-engine file scanner aggregator and community threat intelligence platform.
- **What it actually is:** Submits files to 70+ antivirus engines and aggregates results.
  Useful as a data source and for label generation (with known noise).
- **Verdict:** Include as a DATA SOURCE for malware research, not as an AI product.
  Remove from "AI products" list.
- **Website:** https://www.virustotal.com

---

## DL Techniques — Final Approved List (Updated to 2025)

### For the Essay & Slides

#### CNN (Convolutional Neural Network)
- Use cases: Malware binary image classification, network traffic feature extraction
- Strength: Captures spatial patterns in structured data; fast inference
- Limitation: Static analysis only; does not model temporal sequences
- Include: YES

#### LSTM / GRU (Recurrent Models) — BASELINE COMPARISON ONLY
- Use cases: Sequential data modeling — valid baselines for comparison
- LSTM strength: Long-range temporal dependencies with gating
- GRU strength: Fewer parameters, slightly faster, comparable accuracy to LSTM
- Critical limitation: Sequential processing (not parallelizable), vanishes on
  sequences >500 events, highest memory footprint (14.8 MB on CERT benchmark)
- Best published result on CERT: BiLSTM F1 0.908 (Springer 2024)
- Decision: Include as BASELINE COMPARISON — NOT as primary architecture
- Reference: https://link.springer.com/article/10.1007/s41019-024-00260-z

#### Transformer Encoder (with Temporal Positional Encoding) — PRIMARY FOR SEQUENCES
- Use cases: PRIMARY architecture for insider threat behavioral modeling,
  phishing email NLP (BERT), log parsing (LogBERT), code vulnerability detection (CodeBERT)
- Strength: Parallel processing, no vanishing gradient, captures full sequence context
  via self-attention, outperforms all recurrent models on CERT benchmark
- Best result: 99.43% recall, 96.61% accuracy on CERT r4.2/r5.2/r6.2 (arXiv 2506.23446)
- Limitation: O(n²) attention becomes expensive above ~4,000 events/session;
  512-token limit in NLP-specific variants (CodeBERT, BERT)
- Include: YES — primary architecture for proposed idea
- Reference: https://arxiv.org/html/2506.23446v1

#### TCN (Temporal Convolutional Network) + Transformer Hybrid — ALTERNATIVE
- Use cases: Long behavioral sequence modeling, log anomaly detection
- Strength: O(n) complexity (fully parallelizable), TCN handles local patterns,
  Transformer handles long-range dependencies; best efficiency-accuracy balance
- Best result: 95% recall on CERT with daily sliding windows (Nature 2025)
- Decision: Include as alternative architecture to Transformer — more efficient
- Reference: https://www.nature.com/articles/s41598-025-12063-x

#### Mamba / State Space Models (SSM) — CUTTING-EDGE FRONTIER
- Use cases: Long behavioral sequences (1,000+ events/user/day) where Transformer
  quadratic complexity becomes a bottleneck
- Strength: O(n) complexity, 5× throughput over Transformer, lowest memory (7.3 MB),
  selective state space mechanism handles long sequences natively
- Best result: F1 91.3%/91.8% on CERT r4.2/r5.2 (MambaITD arXiv 2508.05695, 2025)
- Status: Most efficient published architecture on CERT; frontier direction for 2025+
- Include: YES — frontier/future direction in proposed idea
- References:
  - MambaITD: https://arxiv.org/html/2508.05695
  - Original Mamba paper: https://arxiv.org/abs/2312.00752

#### GNN (Graph Neural Network)
- Use cases: Fraud detection (transaction networks), malware call graph analysis,
  code vulnerability detection via Code Property Graphs (CPGs/PDGs)
- Strength: Captures relational patterns between entities invisible to sequential models
- Limitation: Graph construction computationally expensive; not trivially real-time
- Include: YES

#### Autoencoder / Variational Autoencoder (VAE)
- Use cases: Unsupervised anomaly detection in network traffic, fraud, log analysis
- Strength: No labeled threat data required; detects novel anomalies out of distribution
- Limitation: Requires careful threshold calibration; reconstruction error ≠ threat
- Include: YES

#### Federated Learning (FL) + Differential Privacy
- Use cases: Privacy-preserving insider threat detection; distributed IDS
- Strength: Raw data never leaves local environment; enables cross-org collaboration
- Limitation: Model poisoning and gradient inference attacks are real vulnerabilities;
  DP-SGD mitigates but introduces privacy-utility tradeoff
- Include: YES — core privacy architecture for proposed idea
- Reference: https://www.nature.com/articles/s41598-025-04029-w

---

## Architecture Priority for Proposed Idea

1. Transformer Encoder — PRIMARY (best results, directly validated on CERT)
2. TCN + Transformer Hybrid — ALTERNATIVE (most efficient strong option)
3. Mamba/SSM — FRONTIER (best efficiency-accuracy, newest, MambaITD on CERT)
4. LSTM / GRU — BASELINE (comparison only, not primary recommendation)

---

## Techniques to NOT Misrepresent

- Do NOT claim LSTM is the best or recommended architecture for behavioral sequences
- Do NOT claim CNNs alone solve malware detection end-to-end
- Do NOT present deepfake detection as a reliable, solved problem
- Do NOT present FL as absolute privacy without noting its attack surfaces
- Do NOT present LLM-based vulnerability detection as production-ready at file/repo scale
