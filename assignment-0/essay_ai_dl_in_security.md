# Artificial Intelligence and Deep Learning in Cybersecurity

---

## 1. Introduction

Cybersecurity is one of the most data-intensive and adversarial domains in existence.
Global cybercrime is projected to cost $10.5 trillion annually by 2025 (Cybersecurity
Ventures). Over 2,200 cyberattacks occur every single day — one every 39 seconds.
Insider threats alone account for approximately 34% of all data breaches (CISA). The
scale of the problem has fundamentally outpaced what human analysts and rule-based
systems can handle.

Traditional defences — signature-based antivirus, firewall rules, static intrusion
detection signatures — work by matching known-bad patterns. They are effective against
threats that have been seen before and catalogued, but completely blind to anything
new. Every novel attack variant, every zero-day exploit, every previously unseen malware
family bypasses these systems entirely. Worse, the volume of events that security
systems must process — billions of logs, millions of network flows, hundreds of thousands
of files per day — far exceeds any human team's capacity to review manually.

This is where Artificial Intelligence and Deep Learning become not just useful but
necessary. DL systems can learn what normal looks like from data, generalize to
previously unseen variants, process millions of events per second, and continuously
update as the threat landscape evolves — capabilities that rule-based systems
fundamentally cannot match.

This essay examines how AI and DL are applied across eight key cybersecurity problem
areas, evaluates which commercial products have deployed these techniques in production,
identifies the datasets used for research (and which ones to avoid), and proposes a
novel research direction for insider threat detection grounded in the strongest available
2025 evidence.

---

## 2. AI in Security: From Traditional Approaches to Deep Learning

Before deep learning, cybersecurity relied on two categories of AI: rule-based expert
systems and classical machine learning. Rule-based systems encoded human knowledge as
fixed signatures and thresholds — effective against known, static threats but blind to
anything not already in the rulebook. Classical ML methods — Support Vector Machines
(SVM), Random Forests, Naive Bayes, and Decision Trees — improved on this by learning
patterns from labeled data, reducing the need for hand-crafted rules. These methods
are still used today for tasks where data is tabular, feature sets are small, and
interpretability is required (e.g., simple spam filters, basic anomaly scoring).

However, classical ML has clear limits in security contexts:
- It requires extensive manual feature engineering — a human must decide which packet
  fields, log attributes, or code properties matter.
- It struggles with high-dimensional, unstructured inputs such as raw network traffic,
  binary files, free-text logs, or source code.
- It cannot model temporal sequences or relationships between entities without
  significant pre-processing.

Deep Learning addresses all three. DL models learn their own feature representations
directly from raw or minimally processed data, handle high-dimensional and sequential
inputs natively, and scale to the data volumes that security operations generate.
The tradeoff is higher computational cost, reduced interpretability, and a need for
larger labeled datasets — all of which are active research challenges in the field.

---

## 3. Deep Learning Techniques Used in Security

The following DL architectures appear across most security use cases:

**CNN (Convolutional Neural Network):** Extracts spatial patterns from structured
inputs — network flow features, binary code visualized as images, log entries. Fast
inference, effective for classification tasks.

**LSTM / GRU (Recurrent Models):** Classic sequential models for time-ordered data —
network sessions, login patterns, log streams. LSTM uses gating to retain long-range
context; GRU is a simpler, slightly faster variant with comparable accuracy. Both
remain valid comparison baselines but are no longer state-of-the-art for behavioral
sequence modeling. Key weakness: sequential processing prevents parallelism and
performance degrades on sequences of 500+ events due to vanishing gradients.

**Transformer Encoder (with Temporal Positional Encoding):** The strongest published
architecture for behavioral sequence modeling in security as of 2024–2025. Unlike
LSTM which processes tokens one at a time, a Transformer Encoder processes the entire
sequence simultaneously using self-attention — each event can directly attend to any
other event in the sequence, capturing long-range dependencies without vanishing
gradients. Temporal positional encoding is added to each event embedding to preserve
time-ordering information (since attention itself has no notion of position). A 2025
paper (arXiv 2506.23446) using a multi-layer Transformer Encoder on CERT v4.2/v5.2/v6.2
achieved 99.43% recall and 96.61% accuracy for insider threat detection — these are
different metrics: recall (99.43%) measures the fraction of real threats detected,
accuracy (96.61%) measures overall correct classifications. This is the best published
result on this dataset combination. Also applied to phishing email classification,
log parsing (LogBERT), and code vulnerability detection (CodeBERT), though those
NLP-specific variants have a 512-token context window limit.

**TCN (Temporal Convolutional Network):** Uses dilated causal convolutions to model
sequences with O(n) complexity — fully parallelizable and memory-efficient. A 2025
Nature Scientific Reports paper combining TCN with Transformer attention ("Daily insider
threat detection with hybrid TCN+Transformer architecture") achieved 95% recall on
CERT data using daily sliding windows. TCN handles local temporal patterns efficiently;
the Transformer component captures long-range dependencies. This hybrid is the most
computationally efficient strong option for behavioral sequence modeling.

**Mamba / State Space Models (SSM):** The 2023–2025 frontier architecture. Mamba
uses a selective state space mechanism — a learned, input-dependent filter over the
sequence — to model long sequences with O(n) computational complexity (linear, not
quadratic like Transformer attention). This gives Mamba 5× higher throughput than
Transformers at significantly lower memory cost (7–8 MB vs 9.5 MB for Transformer
vs 14.8 MB for LSTM). MambaITD (arXiv 2508.05695, 2025) applied Mamba directly to
insider threat detection on CERT r4.2 and r5.2, achieving F1 scores of 91.3% and
91.8% respectively — the best efficiency-to-accuracy tradeoff in published insider
threat literature. Mamba is particularly well-suited to long daily behavioral sequences
(1,000+ events per user per day) where Transformer's quadratic attention cost becomes
a practical bottleneck.

**GNN (Graph Neural Network):** Models relationships between entities — financial
transaction networks for fraud detection, function call graphs for malware analysis,
code property graphs for vulnerability detection. Captures structural patterns
invisible to feature-based or sequential models.

**Autoencoder / VAE:** Unsupervised anomaly detection trained on normal behavior only.
Flags inputs with high reconstruction error as anomalous without requiring labeled
threat examples. Used in fraud detection and network traffic anomaly detection.

**Federated Learning (FL):** Trains a shared model across multiple organizations
without centralizing raw data. Each participant trains locally; only model weight
updates are shared. Combined with Differential Privacy (DP-SGD) to mitigate gradient
inference attacks. Directly applicable to insider threat detection where employee
behavioral logs cannot leave the organizational environment.

---

## 4. Use Cases

### 4.1 Network Intrusion Detection (IDS)

Every organisation connected to the internet generates enormous volumes of network
traffic — millions of packets and flows per day. Hidden within this traffic are attacks:
port scans probing for weaknesses, data exfiltration, malware communicating with
command-and-control servers, and lateral movement by attackers who have already
breached the perimeter. Traditional IDS tools like Snort and Suricata match traffic
against libraries of known attack signatures. This works for previously catalogued
attacks but fails entirely against zero-day exploits and novel variants.

DL-based IDS systems take a fundamentally different approach. Instead of matching
signatures, they learn what normal traffic looks like and flag statistical deviations.
The dominant architecture is a **CNN + LSTM hybrid**: the CNN extracts spatial features
from individual packet/flow windows (packet size distributions, port usage, protocol
flags), while the LSTM models the temporal sequence of these flows across a session —
capturing patterns like "this host has been sending progressively larger packets to an
unusual external IP over the last ten minutes." Together, CNN answers "what does this
event look like?" and LSTM answers "how has this connection been behaving over time?"
This combination outperforms classical ML on controlled benchmarks and underpins
commercial NDR products from Darktrace and Vectra AI.

The central unsolved challenge is the false positive rate. Even 0.1% FPR — which
sounds excellent — generates 10,000 false alarms per day on a 10-million-event network,
overwhelming security teams and causing alert fatigue. No published DL-IDS has solved
this at real enterprise scale. Additionally, adversarial attackers can deliberately
craft traffic to mimic benign statistical patterns, making their attacks statistically
invisible to the detector — a fundamental limitation that applies to any approach that
relies on statistical deviation detection.

### 4.2 Malware Detection

Malware authors have long exploited the fundamental weakness of signature-based antivirus:
by slightly modifying their code — adding junk instructions, changing variable names,
encrypting the payload — they produce new variants that match no known signature, even
though the malware functions identically. DL offers a structural alternative.

The most well-known DL approach converts PE (Portable Executable) binary files into
grayscale or RGB images by mapping raw bytes to pixel values, then trains a CNN to
classify these images. Different malware families produce characteristic visual textures
(packed malware looks like random noise; code sections show structured patterns), and
CNNs learn to distinguish these with high accuracy for known families. Research in
2024 extended this to transformer-based bytecode classifiers and Graph Neural Networks
operating on function call graphs — capturing behavioral structure rather than just
visual appearance.

Critically, production-grade systems do not rely on static analysis alone. CrowdStrike
Falcon and Microsoft Defender combine static ML (including binary image classification)
with dynamic behavioral monitoring — observing what processes do when they execute
(file writes, registry modifications, network connections) and flagging malicious
behavior at runtime. Static image CNNs are one component of a multi-layer pipeline,
not a standalone solution. Code obfuscation, packing, and encryption change the binary's
visual fingerprint without changing its function, making static-only approaches
fundamentally evasible by any attacker who knows the detection mechanism.

### 4.3 Phishing and Spam Detection

Phishing remains the most common initial attack vector in data breaches, accounting
for over 36% of breaches according to the 2024 Verizon DBIR. Attacks range from mass
spam campaigns to highly targeted spear-phishing that impersonates a victim's direct
manager with credible context — far beyond what keyword-based filters can detect.

Transformer-based NLP models (BERT, RoBERTa, DistilBERT) have become the standard
approach for email and URL classification. These models understand language context
at a semantic level — they distinguish "Your account has been suspended, verify
immediately" from "Please review the attached project plan" in ways that earlier
bag-of-words or TF-IDF approaches cannot. On standard phishing benchmarks they achieve
88–93% accuracy, outperforming SVM and Naive Bayes classifiers by 10–15%. URL-based
detection — classifying URLs by their lexical properties, domain age, and certificate
details — is faster and privacy-preserving since it does not require reading email
content. Content-based detection, which renders and classifies the actual web page,
is more accurate but introduces rendering overhead.

The central unsolved problem is concept drift. Phishing tactics evolve continuously —
new brand impersonation targets, new urgency narratives, new evasion techniques including
HTML smuggling and QR code embedding. A model trained on 2021 campaigns degrades
measurably when evaluated on 2023 campaigns [9]. Addressing this requires continual
learning systems that update incrementally as new phishing samples are identified,
without catastrophically forgetting previously learned patterns — an active research
area with promising but not fully mature solutions.

### 4.4 Fraud Detection

Financial fraud — unauthorised transactions, account takeover, money laundering,
insurance fraud — costs the global economy hundreds of billions annually. The core
difficulty is that fraudulent transactions are individually indistinguishable from
legitimate ones: a stolen credit card used to buy electronics looks identical in
isolation to the legitimate owner buying electronics. The pattern only becomes visible
in the network: a cluster of compromised accounts all transacting with the same
unusual merchant, money flowing through a characteristic graph topology used by a
mule network.

This is precisely why **Graph Neural Networks** have become the dominant approach for
transaction fraud detection. GNNs model the complete transaction network — nodes
represent accounts, merchants, and cardholders; edges represent transactions between
them. By learning over the graph structure rather than individual transactions, GNNs
detect fraud ring patterns that are completely invisible to feature-based classifiers
treating each transaction independently. Visa, Mastercard, and PayPal have deployed
GNN-based fraud detection in production. **Autoencoders** provide a complementary
unsupervised approach: trained on normal spending patterns, they flag transactions
with high reconstruction error (those that don't resemble anything in the normal
distribution) without requiring labelled fraud examples.

Two structural problems make fraud detection uniquely challenging. First, the adversary
adapts: fraud rings monitor the detection system's behaviour and deliberately change
their tactics to evade whatever is currently deployed, creating an adversarial concept
drift that is worse than the natural drift in other domains. Second, labels arrive
late: a customer may not notice or report a fraudulent charge for weeks or months,
creating a blind period where the deployed model is failing without the system knowing
it — a documented problem that makes standard model monitoring unreliable [11].

### 4.5 Vulnerability Detection in Code

Software vulnerabilities — buffer overflows, SQL injection, use-after-free memory errors,
cryptographic misuse — are flaws that attackers exploit to compromise systems. Finding
them before attackers do is the goal of security code review. Human expert review does
not scale to modern codebases of millions of lines. Rule-based static analysis tools
(Semgrep, CodeQL, Checkmarx) automate some discovery but produce 30–80% false positive
rates, creating alert fatigue that causes developers to dismiss real vulnerabilities
along with the noise.

The 2023–2025 research frontier is **LLM + GNN hybrid systems**. LLMs (CodeBERT,
GraphCodeBERT) parse code at the token level, capturing syntax, variable naming
conventions, and code semantics — learning to recognise patterns like "memory is
allocated on the success path but not freed on the error path." GNNs operating on
Code Property Graphs (CPGs) model data flow and control flow relationships between
statements and functions — capturing the cross-function dependencies that matter for
vulnerability classes like use-after-free and injection path tracking. Tools like
ReDetect combine both and demonstrate genuine false positive reduction compared to
rule-based scanners for specific vulnerability classes, with real industry investment
from GitHub Copilot security features and Google Project Zero tooling.

The primary architectural constraint is the 512-token context window of transformer
models like CodeBERT. Real-world functions, let alone files or modules, routinely
exceed this, losing exactly the cross-function context that matters most for serious
vulnerabilities. Newer large-context models (GPT-4, Code Llama) partially address
this but produce high false positive rates on real codebases [13]. Vulnerability
detection remains a research-stage capability, not yet a solved production tool,
and different vulnerability classes (memory safety, injection, cryptographic misuse,
race conditions) require different detection approaches — no single model handles all
categories reliably.

### 4.6 Facial Recognition for Physical Access Control

Physical access control — who may enter a building, data center, or restricted area
— has traditionally depended on keycards and PINs, both of which can be stolen, shared,
or forgotten. Facial recognition offers a biometric alternative where the person's face
is the credential. Deep CNN models, specifically ArcFace and FaceNet, learn face
embeddings — numerical vectors that place the same person's images close together in
vector space and different people's images far apart. At deployment, a camera captures
the approaching person's face, computes an embedding, and matches it against stored
embeddings for authorised personnel. NIST 2024 benchmarks report >99.5% accuracy for
top-tier algorithms in controlled conditions. The technology is widely deployed in
corporate buildings, data centers, and airport border control.

Two critical constraints apply to any real deployment. First, anti-spoofing and liveness
detection are mandatory companion systems. Without them, a printed photograph or a short
video played on a phone can fool the system into granting access — physical adversarial
attacks using printed photos under adversarial illumination have achieved >88% bypass
rates against real deployed systems [14]. Liveness detection uses challenges (blink,
turn head), thermal cameras, or 3D depth sensors to confirm a real face is present.
Second, and critically for European deployments: the **EU AI Act (August 2024)**
classifies real-time biometric identification in publicly accessible spaces as
"unacceptable risk" — effectively prohibited across all EU member states including
Finland [15]. Any deployment in a European context is legally restricted to controlled,
non-public environments with explicit individual consent and Data Protection Authority
registration. This regulatory constraint is not a bureaucratic detail — it is a binding
legal requirement that shapes where and how this technology can be deployed.

### 4.7 Deepfake Detection

Deepfakes — AI-generated synthetic media depicting people saying or doing things they
never did — have transitioned from a research curiosity to a practical threat. By
2023–2024, diffusion-model tools available to any consumer could generate photorealistic
synthetic video in minutes. Use cases include political disinformation (fabricated video
of leaders making statements), financial fraud (fake video calls impersonating executives
to authorise wire transfers), and targeted harassment. Detection is an important and
active research area.

DL detection systems search for telltale signatures of synthetic generation: CNN-based
detectors look for visual inconsistencies (unnatural blinking, skin texture artifacts,
hair boundary anomalies); frequency-domain analysis identifies high-frequency patterns
characteristic of GAN generation that are absent in real photographs; transformer-based
approaches process sequences of video frames looking for temporal inconsistencies in
facial motion that synthetic generation fails to perfectly replicate.

However, the honest assessment of current detection capability is sobering. Systems
that achieve 96% accuracy in controlled lab settings — where training and test deepfakes
are generated by the same tools — drop to 50–65% accuracy when evaluated on real-world
deepfakes from different generation systems [17, 18]. The core reason is that these
detectors learn the specific artifacts of particular generation tools, not a generalizable
concept of "synthetic." When the generation method changes — as it does continuously —
the detector fails. The transition from GAN-based (2018–2021) to diffusion-model-based
(2022–present) deepfake generation produced visuals with fundamentally different
statistical properties; most detectors trained on GAN-era fakes fail on diffusion-model
outputs. An adversary who knows which detection model is deployed can optimize their
deepfake specifically to evade it, achieving near-100% evasion rates. The US Government
Accountability Office concluded in 2024 that no deepfake detection system is currently
reliable enough for high-confidence forensic determination. This is an arms race where
generation consistently leads detection — and must be presented as such.

### 4.8 Log Analysis and SIEM

Every system in a modern organisation generates logs — records of logins, file accesses,
network connections, process executions, application errors. A medium-sized enterprise
generates billions of log entries per day across servers, endpoints, cloud services, and
network devices. Security Information and Event Management (SIEM) systems collect and
analyse these logs, but traditional SIEM rules are brittle: they catch exactly what they
are written to catch and nothing novel. Writing comprehensive rule sets for all possible
attack patterns across all possible log sources is practically impossible.

DL-based log analysis works in two stages. First, **log parsing**: BERT-based models
automatically cluster raw free-text log entries into structured event templates without
manual regular expression writing, handling new log formats as they appear. Second,
**sequence anomaly detection**: models like DeepLog (LSTM-based log language model)
and LogBERT (BERT applied to log event sequences) learn which sequences of events are
normal — which events commonly follow each other — and flag sequences that are
statistically improbable. More recent work applies Transformer Encoders and Mamba/SSM
to this task, achieving better performance on long log sequences. These systems are
deployed in enterprise SIEM platforms to prioritise analyst attention by surfacing the
most anomalous activity from the billions of daily events.

The key limitation is that no universal log anomaly model exists. Log formats, event
vocabularies, and baseline behaviour differ so dramatically across organisations and
systems that models trained on one deployment cannot be directly transferred to another —
they must be retrained or fine-tuned for each environment. A 2024 Springer study found
that the choice of log parsing technique — the pre-processing step before any ML is
applied — has a significant, underappreciated impact on downstream detection accuracy
[19], meaning that poor parsing can undermine even a well-designed detection model.
Real-time transformer inference at SIEM scale (millions of events per hour) also requires
dedicated hardware infrastructure, a non-trivial operational cost.

---

## 5. Commercial Products

**CrowdStrike Falcon** is the strongest example of production-grade ML in endpoint
security. It operates as an Endpoint Detection and Response (EDR) platform, combining
static ML for PE binary file classification with on-device behavioural sensors that
monitor running processes in real time, and cloud-based threat intelligence that
correlates findings across millions of globally deployed endpoints. CrowdStrike is
consistently ranked first in MITRE ATT&CK endpoint protection evaluations — independent
tests that simulate real adversary techniques. Unusually for a commercial vendor,
CrowdStrike co-produced the EMBER2024 benchmark dataset with Elastic, contributing
to the research community's ability to evaluate malware detection models. Its AI
components are genuinely integrated into detection logic rather than being a marketing
overlay on traditional signature matching.

**Darktrace** uses unsupervised ML to build behavioural baselines for every network
entity — every device, user, and subnet — and flags deviations from these baselines.
The system requires a two-week "baselining" period after deployment before generating
reliable detections, during which it learns what normal looks like for that specific
network. It is deployed across healthcare, finance, and critical infrastructure sectors.
Honest assessment: real-world user reviews consistently document high false positive
rates and alert fatigue. The "Autonomous AI" marketing significantly overstates the
degree of human-independent operation — human analysts remain essential to investigate
and validate alerts. It is a genuine product with a genuine approach, but the gap
between marketing and reality is notable.

**Microsoft Defender** represents AI security at massive scale — billions of Windows
endpoints worldwide. It combines static file ML, behavioural monitoring of running
processes, and cloud-based reputation scoring that benefits from signals aggregated
across all deployed instances. When a new malware variant appears on one endpoint,
signals propagate to all endpoints within hours. Microsoft publishes regular security
intelligence reports providing transparency into detection methodologies.

**Vectra AI** specialises in Network Detection and Response (NDR), applying AI-based
anomaly scoring to network flow metadata (not packet content) to detect lateral movement,
command-and-control communication, and data exfiltration. It meaningfully reduces analyst
workload compared to raw SIEM alert volumes. Marketing claims of "91% win rate over
Darktrace" are self-reported and should be treated cautiously — independent benchmarks
are limited.

**VirusTotal (Google)** is frequently cited as an AI cybersecurity product, but this
is a misclassification. VirusTotal is a multi-engine file scanning aggregator: it
submits files to 70+ antivirus engines and aggregates the results. It is a community
threat intelligence resource and research data source, not an AI product. It is included
here as a correction — it should be cited as a dataset source for malware family
labelling (with the caveat that multi-scanner consensus introduces label noise when
engines disagree), not as an example of AI in security.

---

## 6. Datasets

### Recommended

| Dataset | Use Case | Key Notes |
|---|---|---|
| UNSW-NB15 | Network IDS | More modern than NSL-KDD; class imbalance (Worms: 174 samples) |
| EMBER2024 | PE Malware | Released 2024 (Elastic/CrowdStrike); includes evasive samples |
| PhishTank | Phishing URLs | Crowd-sourced; URLs decay within hours — note freshness issue |
| CERT v6.2 | Insider threat | Widely used; entirely synthetic — unknown real-world validity |
| Balabit Mouse | Behavioral biometrics | Real user mouse dynamics; high quality |
| SPEDIA (2025) | Insider threat | New, more realistic alternative to CERT |

### Avoid or Treat with Caution

**NSL-KDD:** Based on 1998 DARPA synthetic captures. Contains no modern attack classes.
The research community has broadly agreed it should not be used as a primary IDS benchmark.
Papers reporting high accuracy on NSL-KDD are measuring in-distribution performance on
obsolete data.

**CICIDS 2017/2018:** A 2022 IEEE peer-reviewed study [1] found widespread labeling errors,
packet duplication, and class imbalance ratios up to 10,000:1. Models trained on these
datasets fail to generalize to real enterprise networks.

**EMBER (original):** The baseline model achieves 0.9991 ROC-AUC — effectively perfect —
making it impossible to demonstrate meaningful improvement. Superseded by EMBER2024.

---

## 7. Proposed Idea: Multimodal Insider Threat Detection with Transformer Encoder and Federated Learning

Of the eight use cases surveyed, insider threat detection presents the most compelling
case for a novel DL-based research proposal. It is the only domain where: (a) the
threat actor already has authorised access — eliminating the perimeter-based detection
strategies that work elsewhere; (b) the signal is fundamentally behavioural and
temporal — exactly what Transformer Encoders are optimised to model; (c) privacy
constraints on data centralisation are severe — making Federated Learning not just
useful but necessary; and (d) the research literature has significant open gaps that
a well-constructed proposal can address. The other seven use cases have mature
commercial deployments or are dominated by architectural problems not readily solvable
at research-prototype scale.

### Problem

Insider threats — employees, contractors, or compromised accounts misusing legitimate
access — account for approximately 34% of all data breaches (CISA). They are
particularly difficult to detect because insiders already have authorized access.
Rule-based systems cannot distinguish between an employee who legitimately works late
and one who is exfiltrating data — both events look identical from a rules perspective.
Only by modelling behavior patterns across multiple data streams and over time can
the signal be separated from the noise.

### Architecture Selection: Why Transformer Encoder, Not LSTM

The choice of sequence model is a deliberate research decision based on current
benchmarks. LSTM and GRU remain valid baselines but have been clearly surpassed on
behavioral sequence modeling tasks. The selection rationale:

| Architecture | CERT Accuracy | CERT Recall | Memory | Speed | Decision |
|---|---|---|---|---|---|
| LSTM | ~77–91% | ~77% | 14.8 MB | Slowest | Baseline comparison |
| GRU | ~88%+ | ~88% | Slightly less | Slightly faster | Baseline comparison |
| **Transformer Encoder** | **96.6%** | **99.4%** | 9.5 MB | Fast | **Primary model** |
| TCN + Transformer Hybrid | — | ~95% | Low | Very fast | Alternative model |
| Mamba / SSM | — | 91.1% | **7.3 MB** | **5× faster than Transformer** | Frontier model |

Sources: arXiv 2506.23446 (Transformer on CERT), Nature 2025 Scientific Reports
(TCN+Transformer on CERT), MambaITD arXiv 2508.05695 (Mamba on CERT).

The Transformer Encoder is selected as the primary architecture. It outperforms all
recurrent alternatives on the exact dataset (CERT) used in this proposal. Mamba/SSM
is included as the cutting-edge frontier direction, as MambaITD (2025) demonstrates
superior efficiency with competitive accuracy directly on CERT.

### Proposed System

A per-user multimodal system monitors four behavioral streams simultaneously:

- **Network access logs:** which systems and IPs a user connects to, at what time
- **Login patterns:** time-of-day, device, location, failed attempts, session duration
- **Mouse dynamics:** movement speed, click patterns, trajectory (Balabit dataset)
- **File access patterns:** volume, file sensitivity level, destination type

Each stream is processed by a dedicated **Transformer Encoder** with temporal
positional encoding (which encodes event time-ordering so the model knows sequence
position), capturing the full daily sequence of behavioral events in parallel without
the vanishing gradient limitations of recurrent models.

A **Cross-Attention Fusion layer** then combines the four stream representations.
Cross-attention is an attention mechanism where one sequence (the fused query) attends
to multiple source sequences (the stream encodings). This allows the model to learn,
for each user at each time window, which behavioral streams are most informative —
for example, weighting network access logs more heavily if login patterns alone show
nothing unusual. This is more flexible than simple concatenation or averaging of
stream outputs.

The fused representation is scored by an **Isolation Forest** or reconstruction-error
threshold. Isolation Forest is an unsupervised anomaly scoring algorithm that isolates
data points by randomly partitioning feature space — anomalous points (unusual behavioral
profiles) are isolated with fewer partitions than normal ones, producing an anomaly score.
Reconstruction error is used when an autoencoder is added: the model tries to reconstruct
the behavioral profile; profiles that are difficult to reconstruct (high error) are flagged
as anomalous. Both approaches avoid requiring labelled threat examples for scoring.
Scores above the threshold enter a human analyst review queue — no automated disciplinary
action is taken.

**Frontier direction — Mamba/SSM:** For sequences exceeding 1,000 behavioral events
per user per day, Mamba's O(n) complexity provides a 5× throughput advantage over
Transformer's O(n²) attention. MambaITD (2025) is the first paper to validate this
directly on CERT, establishing it as the recommended direction for long-sequence
behavioral modeling.

**Privacy architecture:** Federated Learning ensures raw behavioral logs never leave
the organizational environment. Each organization trains locally; only model weight
updates are aggregated centrally. Differential Privacy (DP-SGD) is applied to gradient
updates to mitigate gradient inference attacks. Personalized FL (per-organization
local fine-tuning) is supported by published 2025 research [21].

### Datasets

- **CERT Insider Threat Dataset v6.2** — email, HTTP, file access, login event logs
  with injected malicious scenarios. Primary training and evaluation benchmark.
  Note: entirely synthetic (~1,000 simulated users) — real-world validity is assumed
  but unconfirmed.
- **Balabit Mouse Dynamics** — real user mouse movement sequences for the behavioral
  biometrics stream. Provides genuine (non-synthetic) behavioral data.
- **SPEDIA (2025)** — Security and Privacy Enhanced Dataset for Insider threat Analysis.
  Published in ScienceDirect Computers & Security (2025) specifically because CERT's
  synthetic nature is insufficient for realistic evaluation. SPEDIA contains more diverse
  user roles, more realistic behavioral variation, and less artificial threat injection
  than CERT. Used for secondary validation to assess whether models trained on CERT
  generalise beyond its specific synthetic scenarios.

### Known Challenges

**Dataset realism:** CERT simulates approximately 1,000 users with hand-injected
threat scenarios. The Transformer papers achieving 99.4% recall use this dataset —
performance on real organizational environments with thousands of users and organic
(non-injected) threat behavior remains an open question. SPEDIA (2025) partially
addresses this gap.

**Class imbalance:** Real insider threat events occur at approximately 1 in 10,000 to
100,000 user-days. Overall accuracy is a meaningless metric at this base rate. Correct
evaluation uses precision, recall, and F1 at fixed false positive rate thresholds.
Addressed via SMOTE oversampling and cost-sensitive loss functions.

**Cold-start:** Any per-user model requires a baselining period before it can flag
meaningful anomalies. New employees, role changes, remote work, and project deadlines
all cause legitimate behavioral shifts that appear anomalous during calibration.
Contextual metadata (role, department, project calendar) can reduce false alarms
during known transition periods.

**Explainability:** Transformer attention weights provide token-level contribution
scores — which events in the sequence most influenced the anomaly score — making
them more interpretable than raw LSTM outputs. However, attention scores alone are
not sufficient to justify employment decisions in a regulated environment.
Human-in-the-loop review is mandatory before any action is taken.

**Federated Learning security:** FL does not provide absolute privacy guarantees.
Model poisoning (a malicious participant submits crafted gradient updates to corrupt
the global model) and gradient inference attacks (extracting information about training
data from weight updates) are documented vulnerabilities. DP-SGD (Differentially
Private Stochastic Gradient Descent) mitigates inference attacks by adding calibrated
Gaussian noise to gradients, but introduces a privacy-utility tradeoff controlled by
the privacy budget parameter ε — smaller ε means stronger privacy but lower model
accuracy. In practice, the organizations participating in FL for insider threat
detection are trusted institutional parties, significantly reducing the model poisoning
risk compared to open federated networks.

**Temporal data leakage in evaluation:** Because behavioral logs are time-series data,
train/test splits must respect temporal ordering — the test set must come strictly after
the training set in time. Randomly splitting log data (as is common in non-temporal ML)
allows future information to leak into training, producing artificially inflated results.
All evaluation on CERT data must use temporal splits, and SMOTE oversampling (used for
class imbalance) must be applied only within the training fold to prevent synthetic
samples of future events from appearing in training data.

### Techniques Summary

| Component | Technique | Best Evidence |
|---|---|---|
| Primary sequence modeling | Transformer Encoder + temporal positional encoding | 99.4% recall on CERT (arXiv 2506.23446) |
| Alternative sequence modeling | Hybrid TCN + Transformer | 95% recall on CERT (Nature 2025) |
| Frontier sequence modeling | Mamba / SSM | F1 91.5%, 5× faster (MambaITD 2025) |
| Baseline comparison | LSTM / GRU | Standard benchmarks |
| Multimodal fusion | Cross-Attention Fusion layer | Per-stream learned weighting |
| Anomaly quantification | Isolation Forest / reconstruction error | Threshold-based flagging |
| Privacy-preserving training | Federated Learning + DP-SGD | Personalized FL (Nature 2025) |
| Class imbalance | SMOTE + cost-sensitive loss | Standard practice |
| Explainability | Transformer attention weight visualization | Token-level contribution scores |

This is a theoretical research proposal grounded in the strongest available 2025
evidence. Three independent papers validate components of this architecture directly
on CERT data, making it one of the most research-supported insider threat detection
proposals currently available in the literature.

---

## 8. Conclusion

Deep Learning has genuine and growing applicability across cybersecurity. Network
intrusion detection, malware classification, phishing detection, fraud analysis, and
log anomaly detection are all areas where DL demonstrably outperforms traditional
rule-based and classical ML approaches, with real commercial deployments already
in production.

The field is evolving rapidly. Transformer-based architectures have replaced recurrent
models (LSTM/GRU) as the state of the art for behavioral sequence modeling, achieving
99.4% recall on the CERT insider threat benchmark. Mamba/SSM (2023–2025) is emerging
as the next frontier, offering linear complexity and 5× throughput advantage for the
long behavioral sequences that insider threat detection requires. The selection of
architecture matters — LSTM, once the default choice, is now a baseline to beat
rather than a primary recommendation.

Important limitations remain: benchmark datasets are frequently synthetic; false
positive rates at enterprise scale are unsolved; deepfake detection lags behind
generation; and EU regulation constrains certain biometric applications. These are
not reasons to avoid AI in security — they are the open problems that define the
current research frontier.

The proposed insider threat detection system — Multimodal Transformer Encoder with
Cross-Attention Fusion and Federated Learning — is supported by three independent
2025 papers that validate its components directly on the CERT dataset. It represents
the current best research direction for this problem: theoretically grounded,
practically motivated, and honest about what remains unsolved.

---

## References

[1] Error Prevalence in NIDS Datasets (IEEE, 2022):
    https://ieeexplore.ieee.org/document/9947235/

[2] Errors in CICIDS2017 Dataset (HAL Science, 2022):
    https://hal.science/hal-03775466v1/document

[3] Current Status and Challenges of DL-based IDS (MDPI, 2023):
    https://www.mdpi.com/2313-433X/10/10/254

[4] Review of DL for IDS: Spatiotemporal and Data Imbalance (MDPI, 2025):
    https://www.mdpi.com/2076-3417/15/3/1552

[5] UNSW-NB15 Analysis Through Visualization (Wiley, 2024):
    https://onlinelibrary.wiley.com/doi/full/10.1002/spy2.331

[6] Malware Detection and Classification Using AI (Springer, 2025):
    https://link.springer.com/article/10.1007/s12083-025-02112-7

[7] EMBER2024 Dataset (arXiv, 2024):
    https://arxiv.org/abs/2506.05074

[8] IoT Malware Label Reliability (ScienceDirect, 2023):
    https://www.sciencedirect.com/science/article/pii/S1319157823004524

[9] Life-Long Phishing Detection with Continual Learning (Nature, 2023):
    https://www.nature.com/articles/s41598-023-37552-9

[10] PhishTank Hidden Data Characteristics (ScienceDirect, 2023):
     https://www.sciencedirect.com/science/article/pii/S2352340923009903

[11] Proactive Detection of Fraud Model Degradation (Springer, 2024):
     https://link.springer.com/chapter/10.1007/978-3-032-06118-8_16

[12] Concept Drift Detection in DL (MDPI, 2025):
     https://www.mdpi.com/2076-3417/15/6/3056

[13] LLMs in Software Security: Vulnerability Detection (ACM, 2024):
     https://dl.acm.org/doi/10.1145/3769082

[14] Adversarial Attacks on Face Recognition (Nature, 2025):
     https://www.nature.com/articles/s41598-025-15753-8

[15] EU AI Act and Facial Recognition (Frontiers, 2024):
     https://www.frontiersin.org/journals/big-data/articles/10.3389/fdata.2024.1337465/full

[16] Privacy and Ethics of Facial Recognition (PMC, 2024):
     https://pmc.ncbi.nlm.nih.gov/articles/PMC11256005/

[17] Why Deepfake Detection Tools Fail in Real-World Deployment (Brightside AI, 2024):
     https://www.brside.com/blog/why-deepfake-detection-tools-fail-in-real-world-deployment

[18] DeepFake Detection Generalization Systematic Review (ScienceDirect, 2025):
     https://www.sciencedirect.com/article/pii/S2543925125000075

[19] Impact of Log Parsing on Anomaly Detection (Springer, 2024):
     https://link.springer.com/article/10.1007/s10664-024-10533-w

[20] Survey on DL for Log Anomaly Detection (ScienceDirect, 2023):
     https://www.sciencedirect.com/science/article/pii/S2666827023000233

[21] Personalized Federated Learning for Insider Threat Detection (Nature, 2025):
     https://www.nature.com/articles/s41598-025-04029-w

[22] SPEDIA: Realistic Insider Threat Dataset (ScienceDirect, 2025):
     https://www.sciencedirect.com/science/article/pii/S0167404825004328

[23] CERT Insider Threat Test Dataset (CMU KiltHub):
     https://kilthub.cmu.edu/articles/dataset/Insider_Threat_Test_Dataset/12841247

[24] Privacy and Security Attacks in Federated Learning (Tandfonline, 2024):
     https://www.tandfonline.com/doi/full/10.1080/08839514.2024.2410504

[25] Balabit Mouse Dynamics Challenge Dataset:
     https://github.com/balabit/Mouse-Dynamics-Challenge

[26] Transformer Encoder for Insider Threat Detection on CERT (arXiv, 2025):
     "Enhancing Insider Threat Detection Using User-Based Sequencing and Transformer Encoders"
     99.43% recall, 96.61% accuracy on CERT r4.2/r5.2/r6.2
     https://arxiv.org/html/2506.23446v1

[27] MambaITD: Mamba for Insider Threat Detection on CERT (arXiv, 2025):
     "MambaITD: An Efficient Cross-Modal Mamba Network for Insider Threat Detection"
     F1 91.3%/91.8% on CERT r4.2/r5.2, 12.7% faster than Transformer, 7.3 MB memory
     https://arxiv.org/html/2508.05695

[28] Daily Insider Threat Detection: Hybrid TCN+Transformer on CERT (Nature, 2025):
     "Daily insider threat detection with hybrid TCN transformer architecture"
     95% recall on CERT with 30-day sliding windows
     https://www.nature.com/articles/s41598-025-12063-x

[29] Mamba: Linear-Time Sequence Modeling with Selective State Spaces (arXiv, 2023):
     Original Mamba paper — O(n) complexity, 5× throughput over Transformers
     https://arxiv.org/abs/2312.00752

[30] GRU vs LSTM for Behavioral Sequence Prediction (MDPI Applied Sciences, 2024):
     GRU slightly superior to LSTM on behavioral modeling tasks
     https://www.mdpi.com/2076-3417/14/19/8858

[31] BiLSTM for Insider Threat Detection on CERT (Springer, 2024):
     "Optimising Insider Threat Prediction: BiLSTM Networks and Sequential Features"
     F1 0.9084 — best published RNN result on CERT
     https://link.springer.com/article/10.1007/s41019-024-00260-z
