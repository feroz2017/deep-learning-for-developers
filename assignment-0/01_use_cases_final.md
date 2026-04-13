# AI & Deep Learning in Security — Use Cases: Detailed Reference
# Written for team members to read and understand each area in depth.
# Based on 2022–2025 peer-reviewed research.

---

## Use Case 1: Network Intrusion Detection (IDS)

### Background — What Is the Problem?

Every organisation that connects to the internet generates enormous volumes of network
traffic — millions of packets and flows per day. Hidden inside this traffic are attacks:
port scans probing for weaknesses, brute-force login attempts, data exfiltration, malware
communicating with command-and-control servers, and lateral movement by attackers who
have already breached the perimeter. The job of an Intrusion Detection System (IDS) is
to find these malicious flows among the vast sea of legitimate ones.

Traditional IDS solutions — Snort, Suricata, and similar tools — work by matching
network traffic against a library of known attack signatures. This works well for attacks
that have been seen before and catalogued, but fails completely against zero-day exploits,
novel malware, and attackers who deliberately vary their techniques to avoid matching
known patterns. Every time a new attack variant appears, a human analyst must write a
new signature rule. This is a losing battle at scale.

### How Deep Learning Addresses It

DL-based IDS systems take a fundamentally different approach: instead of matching rules,
they learn what normal network traffic looks like, and flag anything that deviates from
that learned baseline.

The dominant architecture is a **CNN + LSTM hybrid**:
- The **CNN** (Convolutional Neural Network) processes individual network flows or packet
  windows, extracting spatial features — packet size distributions, port usage patterns,
  protocol flag combinations. It treats each flow like an image of its features.
- The **LSTM** (Long Short-Term Memory) then processes sequences of these flows over time,
  capturing session-level behaviour — for example, that a particular host has been sending
  progressively larger packets to an unusual external IP over the last ten minutes.

Together, CNN handles the "what does this individual packet/flow look like?" question,
while LSTM handles the "how has this connection been behaving over time?" question.
This combination captures both the structure of individual events and the temporal
pattern of sequences of events.

More recent work (2024–2025) has begun replacing the LSTM component with Transformer
Encoders, which process full sequences in parallel without the vanishing gradient
problem that degrades LSTM on long sequences.

### Real-World Products Using This Approach

- **Darktrace**: Uses unsupervised ML to build behavioural baselines for every device,
  user, and subnet on a network. Flags deviations from these baselines. Deployed in
  healthcare, finance, and critical infrastructure sectors globally.
- **Vectra AI**: Network Detection and Response (NDR) platform. Uses AI anomaly scoring
  on network flow metadata to detect lateral movement, C2 communication, and data
  exfiltration. Does not inspect packet content — works from metadata alone.
- **Cisco Secure Network Analytics (Stealthwatch)**: Uses ML on NetFlow data for
  anomaly-based detection at enterprise scale.

### Performance on Benchmarks

Hybrid CNN-LSTM and Transformer-based models consistently outperform classical ML
(SVM, Random Forest) on IDS benchmarks, achieving 95–99%+ accuracy on controlled
datasets. However, these numbers must be interpreted carefully — see limitations below.

### Key Limitations

**The false positive problem is the central unsolved challenge.**
Even a 0.1% false positive rate — which sounds excellent — produces 10,000 false
alarms per day on a network generating 10 million events per day. Security teams
quickly develop "alert fatigue" and begin ignoring or dismissing alerts, including
real ones. No published DL-IDS model has demonstrated controlled false positive rates
at this scale in a real enterprise deployment.

**Benchmark datasets are deeply flawed.**
The two most commonly cited datasets — NSL-KDD and CICIDS 2017/2018 — both have
serious problems. NSL-KDD is based on 1998 DARPA synthetic captures and contains no
modern attack types. CICIDS 2017/2018 was found by a 2022 IEEE study to contain
widespread labelling errors, packet duplication, and class imbalance ratios up to
10,000:1. Models trained on these datasets cannot be trusted to generalise.
The recommended dataset for current research is **UNSW-NB15**.

**Adversarial evasion is a real threat.**
Attackers who know a DL-based IDS is deployed can deliberately craft their traffic to
mimic benign statistical patterns, effectively making the attack invisible to the
detector. This is not a theoretical concern — it is an active area of adversarial ML
research.

**Inference speed matters for inline deployment.**
A model inserted into the network path to inspect traffic in real time must make
decisions faster than packets arrive. CNN+LSTM combined is slower than simpler models,
requiring hardware acceleration for high-bandwidth networks.

### Recommended Dataset
- **UNSW-NB15** — 9 attack categories, more modern than NSL-KDD
- Avoid: NSL-KDD (obsolete), CICIDS 2017/2018 (labelling errors)
- Source: https://research.unsw.edu.au/projects/unsw-nb15-dataset

---

## Use Case 2: Malware Detection

### Background — What Is the Problem?

Malware — malicious software — is one of the oldest and most persistent threats in
cybersecurity. Ransomware encrypts files and demands payment. Trojans open backdoors.
Spyware exfiltrates sensitive data. Botnets turn infected machines into weapons for
distributed attacks. The volume of new malware variants is staggering: antivirus
companies report detecting hundreds of thousands of new samples every day.

Traditional antivirus tools work by comparing files against a database of known malware
signatures — cryptographic hashes of known-bad files or byte sequences. This is fast
and accurate for known malware, but completely blind to new variants. Malware authors
routinely "repack" their code — adding junk instructions, changing variable names,
encrypting payloads — to produce variants that have never been seen before and therefore
don't match any signature. This is called evasion, and it is trivially easy.

### How Deep Learning Addresses It

DL approaches try to detect malware based on its structure or behaviour rather than
its exact byte content. The most visually striking and well-known technique converts
PE (Portable Executable) binary files into images and trains a CNN on these images.

**How binary-to-image malware detection works:**
1. Take the raw bytes of an executable file
2. Map each byte to a pixel value (0–255 grayscale, or group bytes for RGB)
3. Arrange pixels into a 2D image (width chosen based on file size)
4. Train a CNN to classify these images as malware or benign, and to identify
   which malware family they belong to

This works because different malware families have characteristic visual textures —
packed malware looks like random noise, code sections look like structured patterns,
and different compilers and packers produce recognisable visual signatures. CNNs are
excellent at learning these visual patterns.

Extensions of this approach include:
- **Transformer-based classifiers** that process bytecode sequences directly (2024)
- **Graph Neural Networks** on function call graphs — how functions in the binary
  call each other — which captures structural behaviour rather than visual appearance
- **Dynamic analysis** feeding behavioural telemetry from sandboxed execution
  (what files does the malware create? what registry keys does it modify? what
  network connections does it make?) into ML classifiers

Production systems like CrowdStrike Falcon and Microsoft Defender combine multiple
approaches: static analysis (including binary image classification) for fast initial
screening, followed by behavioural monitoring of running processes.

### Real-World Products Using This Approach

- **CrowdStrike Falcon**: Combines static ML for PE classification with on-device
  behavioural sensors that monitor running processes for malicious patterns. Ranked
  #1 in MITRE ATT&CK endpoint protection evaluations. Co-produced the EMBER2024
  benchmark dataset.
- **Microsoft Defender**: Large-scale ML deployment protecting billions of Windows
  devices. Uses a combination of static file ML, cloud-based reputation lookup, and
  behavioural monitoring.
- **Cylance (now BlackBerry)**: One of the first commercial products to market
  "AI-based" malware detection using ML on static file features.

### Key Limitations

**Static analysis is fundamentally weak against evasion.**
Binary image CNNs detect structure, not behaviour. An attacker who knows that image-
based detection is in use can apply obfuscation — adding junk code, using different
packers, encrypting the payload — to produce a visually different binary that functions
identically. This is the core limitation of any static analysis approach.

**Zero-day families are invisible.**
If a malware family has never been seen before, it produces images that don't resemble
anything in the training data. The classifier either outputs a low-confidence "unknown"
result or misclassifies it as benign. The families that matter most are precisely the
ones the model has never seen.

**Label noise in research datasets.**
When building malware datasets, researchers often use multi-scanner consensus from
VirusTotal (submitting each sample to 70+ AV engines and taking the majority vote as
the label). Different engines disagree frequently, especially for new or unusual samples.
This introduces label noise that degrades model training.

### Recommended Datasets
- **EMBER2024** — Released 2024 by Elastic and CrowdStrike; includes evasive samples;
  replaces the original EMBER which was too easy (ROC-AUC 0.9991 with baseline model)
  Source: https://arxiv.org/abs/2506.05074
- **VirusShare** — Large collection of real malware samples (invitation-only access)
  Source: https://virusshare.com

---

## Use Case 3: Phishing and Spam Detection

### Background — What Is the Problem?

Phishing is the practice of deceiving users into revealing credentials, clicking
malicious links, or downloading malware by impersonating a trusted entity — a bank,
an employer, a government agency, or a known service like Google or Microsoft.
It remains the most common initial attack vector in data breaches. According to the
2024 Verizon DBIR, over 36% of breaches involved phishing at some stage.

Phishing attacks range from mass spam campaigns (millions of identical emails sent to
harvested addresses) to highly targeted spear-phishing (a crafted email that appears
to come from the victim's direct manager, referencing real project names). The targeted
variants are particularly dangerous because they are difficult to detect automatically
— they look completely legitimate to most rule-based filters.

### How Deep Learning Addresses It

**Email-based detection** uses transformer models (BERT, RoBERTa, DistilBERT) trained
to classify email content as phishing or legitimate. These models understand language
context — "Your account has been compromised, click here immediately" triggers different
representations than "Please review the attached project plan." They outperform earlier
approaches (SVM on TF-IDF features, Naive Bayes) by 10–15% on standard benchmarks,
reaching 88–93% accuracy on held-out test sets.

**URL-based detection** classifies URLs as malicious before a user clicks them. Features
include lexical properties of the URL (unusual length, random-looking domain names,
typosquatting like "paypa1.com"), domain age, WHOIS information, and SSL certificate
details. This is faster and more privacy-preserving than email content analysis since
it doesn't require reading the email body.

**Content-based detection** fetches and renders the web page pointed to by a URL and
classifies the visual appearance and HTML structure. This is the most accurate approach
but introduces significant latency and complexity — the system must act as a browser
to render pages, which is resource-intensive.

### Real-World Products and Deployments

- **Google Safe Browsing**: Maintains a database of known phishing and malware URLs.
  Browsers query this database before loading URLs. ML classifies newly seen URLs.
- **Microsoft Defender for Office 365**: Scans email links and attachments using ML.
  "Safe Links" rewrites URLs and checks them at click time.
- **Proofpoint**: Enterprise email security platform using NLP and ML for phishing
  detection, with specific models for business email compromise (BEC) attacks.

### Key Limitation: Concept Drift

This is the central unsolved problem for phishing detection. Phishing tactics evolve
continuously — new brand impersonation targets, new social engineering narratives,
new evasion techniques like HTML smuggling and QR codes. A model trained on 2021
phishing campaigns degrades measurably when evaluated on 2023 campaigns.

A 2023 Nature Scientific Reports paper addressed this directly with "life-long phishing
detection" using continual learning — the model continues updating as new phishing
samples arrive, without forgetting what it previously learned. But this requires a
continuous stream of labelled data, which means humans must still be in the loop
identifying and labelling new phishing samples.

Additionally, **adversarial text manipulation** — substituting characters with
visually identical Unicode equivalents (homoglyph attacks), inserting invisible
whitespace, or paraphrasing phishing text to avoid classifier triggers — can defeat
NLP-based detectors.

### Recommended Datasets
- **PhishTank** — Crowd-sourced phishing URL database. Well-known and widely used.
  Important caveat: phishing sites are short-lived (hours to days), meaning URLs in
  the dataset decay and are no longer active by the time models are trained on them.
  Requires fresh collection pipelines for meaningful research.
  Source: https://phishtank.org

---

## Use Case 4: Fraud Detection

### Background — What Is the Problem?

Financial fraud covers a wide spectrum: unauthorised credit card transactions, account
takeover, identity theft, insurance fraud, and complex money laundering schemes
involving networks of accounts. The financial industry loses hundreds of billions of
dollars annually to fraud. Detection is fundamentally difficult because:

1. Fraudulent transactions look very similar to legitimate ones — a fraudster using a
   stolen card will make purchases that are plausible for the account
2. Fraud is rare — typically 0.1% to 1% of all transactions — creating extreme class
   imbalance that makes standard ML evaluation misleading
3. Fraud patterns change constantly — fraud rings adapt their behaviour specifically
   to evade whatever detection system is currently deployed

### How Deep Learning Addresses It

**Graph Neural Networks (GNN)** are the most powerful current approach for transaction
fraud. Rather than looking at individual transactions in isolation, a GNN models the
entire transaction network: nodes represent accounts, merchants, and card holders;
edges represent transactions between them. Fraud rings are not visible in individual
transactions but become visible in the network structure — a cluster of accounts all
transacting with the same unusual merchant, a money mule network where funds flow
through a specific graph topology.

GNNs can detect these structural anomalies that are completely invisible to feature-based
ML classifiers that treat each transaction independently. Companies like Visa, Mastercard,
and PayPal have deployed GNN-based fraud detection in production.

**Autoencoders** provide an unsupervised alternative. Trained exclusively on normal
(non-fraudulent) transactions, the autoencoder learns to reconstruct normal patterns
efficiently. When a fraudulent transaction arrives, the autoencoder struggles to
reconstruct it (because it looks different from the normal patterns it was trained on),
producing a high reconstruction error that triggers a fraud flag. The advantage is that
no labelled fraud examples are needed for training.

### Key Limitations

**Adversarial concept drift is the core problem.**
Fraud detection is unique in that the "adversary" — the fraud ring — is actively
observing the system's behaviour and adapting to evade it. When the detector improves,
the attacker changes tactics. This creates a persistent cat-and-mouse dynamic that makes
long-lived static models ineffective.

**The label delay problem.**
Fraud labels often arrive weeks or months after the fact — a customer disputes a charge,
a bank investigates, and eventually a transaction is confirmed as fraudulent. During this
lag period, the deployed model is operating without feedback on whether its recent
predictions were correct. A model can be silently failing for months before the data
catches up enough to reveal the problem.

**Class imbalance makes standard evaluation meaningless.**
If only 0.1% of transactions are fraudulent, a model that predicts "not fraud" for
every single transaction achieves 99.9% accuracy — while catching zero fraud. The
correct evaluation metrics are precision (of all flagged transactions, what fraction
were actually fraudulent?), recall (of all fraudulent transactions, what fraction did
we catch?), and F1 at an acceptable false positive rate.

### Recommended Datasets
- **Credit Card Fraud Detection Dataset (Kaggle/ULB)** — 284,807 transactions, 492
  fraudulent (0.17%). Real credit card data with PCA-transformed features.
  Source: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
- **IEEE-CIS Fraud Detection Dataset (Kaggle)** — 590,000+ transactions with rich
  features including device info, email domains, and transaction metadata.

---

## Use Case 5: Vulnerability Detection in Code

### Background — What Is the Problem?

Software vulnerabilities are flaws in code that can be exploited to compromise a system.
Buffer overflows allow attackers to overwrite memory and execute arbitrary code. SQL
injection enables database manipulation. Cross-site scripting (XSS) allows attackers
to inject malicious scripts into web pages viewed by other users. Cryptographic misuse
— using weak algorithms, hardcoded keys, or incorrect implementations — exposes
encrypted data.

Finding these vulnerabilities before attackers do is the goal of security code review.
Traditionally this was done by human security experts manually reading code — slow,
expensive, and does not scale to the size of modern codebases (millions of lines of
code). Rule-based static analysis tools (Semgrep, CodeQL, Checkmarx) automate some
of this, but produce 30–80% false positive rates, overwhelming developers with spurious
alerts and creating alert fatigue.

### How Deep Learning Addresses It

**LLM + GNN hybrid systems** are the current research frontier for DL-based
vulnerability detection:

- **LLMs (CodeBERT, GraphCodeBERT)** parse code at the token level, capturing syntax,
  variable names, function signatures, and code semantics. They are pre-trained on
  massive code corpora (GitHub, CodeSearchNet) and fine-tuned on vulnerability datasets.
  LLMs excel at understanding the "language" of code — they can recognise patterns like
  "memory is allocated but the error path does not free it" (a memory leak) from syntax.

- **GNNs (on Code Property Graphs)** represent code as a graph where nodes are
  statements and edges represent data flow (which variable values flow from which
  statements) and control flow (which statement executes after which). Vulnerabilities
  that span multiple functions — like a buffer that is allocated in function A and
  overflowed in function B — require understanding these connections. GNNs model
  these relationships directly.

- Tools like **ReDetect** combine both: LLM captures local code semantics, GNN captures
  global code structure. The combination outperforms either alone and shows genuine
  false positive reduction compared to rule-based tools for specific vulnerability classes
  (particularly smart contract reentrancy and memory safety issues).

### Real-World Products and Research

- **GitHub Copilot Autofix**: Uses LLMs to identify and suggest fixes for security
  issues in code during development.
- **Google Project Zero**: Uses automated analysis tools (including ML-assisted fuzzing)
  to find zero-day vulnerabilities in widely-used software.
- **Semgrep**: Primarily rule-based but incorporating ML for prioritisation.
- **Snyk Code**: Uses a hybrid approach combining pattern matching with ML-based
  prioritisation of likely-exploitable vulnerabilities.

### Key Limitations

**The 512-token context window is a hard architectural constraint.**
CodeBERT and similar transformer models process at most 512 tokens (roughly 400 words
of code). Real-world functions, classes, and modules routinely exceed this. When code
is split into windows to fit the context limit, cross-function relationships —
precisely the ones that matter for the most serious vulnerability classes — are lost.
Newer models (GPT-4, Code Llama) have larger context windows (4K–128K tokens) but
are not designed specifically for vulnerability detection and produce high false
positive rates on real codebases.

**Control flow and data flow require graph representations.**
The semantics of a vulnerability like "use-after-free" (using a memory pointer after
the memory it points to has been freed) depend on understanding the execution order
of statements and the flow of pointer values through the program. Transformers model
sequential token relationships, not these semantic properties. Graph representations
(CPGs, PDGs) capture them, but constructing these graphs for large codebases is
computationally expensive.

**Training data contamination inflates benchmarks.**
LLMs pre-trained on GitHub may have memorised examples of vulnerable code (and their
CVE-labelled fixes) from the training data. When evaluated on benchmarks drawn from
the same sources, they may be "recognising" memorised examples rather than genuinely
detecting vulnerabilities. This is an underexamined confound in the published literature.

### Recommended Datasets
- **BigVul** — 188,000+ C/C++ vulnerable functions with CVE labels
  Source: https://github.com/ZeoVan/MSR_20_Code_vulnerability_CSV_Dataset
- **Devign** — 27,318 C functions, 45% vulnerable, from open-source projects
- **CVEfixes** — Automatically collected code changes fixing CVEs

---

## Use Case 6: Facial Recognition for Physical Access Control

### Background — What Is the Problem?

Physical access control — who is allowed to enter a building, server room, or
restricted area — has traditionally relied on keycards, PINs, and physical keys.
These are vulnerable to theft, sharing, and social engineering. Facial recognition
offers a biometric alternative: the person's face itself is the credential, making
it impossible to share (at least in theory) and eliminating the "I forgot my card"
problem.

Beyond access control, facial recognition is used in surveillance systems to identify
persons of interest in camera feeds, in border control for passport verification, and
in law enforcement for suspect identification in crime footage.

### How Deep Learning Addresses It

Modern facial recognition is built on deep CNNs trained on millions of face images.
The system learns to produce an embedding — a numerical vector — for each face such
that:
- Two images of the same person produce embeddings that are close together (small
  cosine distance)
- Two images of different people produce embeddings that are far apart

Popular architectures include:
- **ArcFace**: Uses angular margin loss to improve the separability of embeddings.
  Achieves >99.5% accuracy on the LFW (Labeled Faces in the Wild) benchmark.
- **FaceNet**: Google's system using triplet loss. Trained on 200 million face images.

At access control deployment, the system:
1. Captures an image of the person seeking entry
2. Runs it through the CNN to produce an embedding
3. Compares the embedding to stored embeddings for authorised personnel
4. Grants or denies access based on similarity threshold

**Anti-spoofing / liveness detection** is a mandatory companion system. Without it,
a printed photo or a short video played on a phone can fool the system into thinking
the attacker's face is the authorised person. Liveness detection uses challenges
(blink, turn your head), thermal cameras, or 3D depth sensors to ensure a real
face is present.

### Key Limitations

**Regulatory constraint in the EU — EU AI Act (August 2024).**
The EU AI Act, which entered into force in August 2024, classifies the use of real-time
biometric identification systems in publicly accessible spaces as "unacceptable risk"
— the highest risk category, which means effectively banned. This applies to all EU
member states including Finland. Any deployment in a European context must be limited
to controlled, non-public environments (inside a private building, for example) with
explicit individual consent. Organisations deploying facial recognition without this
face significant regulatory and legal risk.

**Adversarial physical attacks are practical.**
Researchers have demonstrated that printed photographs under adversarial lighting, or
small adversarial patches attached to eyeglasses, can achieve >88% success rates at
fooling real deployed facial recognition systems. These are not lab-only attacks —
they work in real physical environments.

**Environmental degradation in real deployments.**
Lab benchmarks (like LFW, >99.5% accuracy) are run on clean, frontal, well-lit face
images. Real access control cameras capture people approaching at different angles, in
varying lighting conditions, wearing hats, glasses, or masks. Real-world accuracy in
unconstrained conditions is significantly lower than benchmark numbers suggest.

---

## Use Case 7: Deepfake Detection

### Background — What Is the Problem?

Deepfakes are synthetic media — images, videos, or audio — generated by AI systems
to depict people saying or doing things they never said or did. Early deepfakes (2017–2019)
required significant technical skill and compute. By 2022–2024, diffusion models and
consumer-grade tools could produce photorealistic synthetic video in minutes, accessible
to anyone.

The consequences are serious: deepfake pornography targeting non-consenting individuals,
political disinformation (fabricated video of leaders declaring war or making statements
they never made), financial fraud (fake video calls impersonating executives to authorise
wire transfers — "CEO fraud"), and evidence fabrication in legal proceedings.

### How Deep Learning Addresses It

Detection systems try to identify telltale signs that a piece of media was generated
rather than captured:

- **CNN + frequency domain analysis**: CNNs detect visual inconsistencies (unnatural
  eye blinking, skin texture anomalies, hair boundary artifacts). Frequency domain
  analysis looks for characteristic high-frequency patterns that GAN generation leaves
  in images but that are absent in real photographs.

- **Transformer-based detectors**: Process face sequences across video frames, looking
  for temporal inconsistencies in facial motion, expression, and identity that are
  subtle but characteristic of synthetic generation.

- **Physiological signal analysis**: Real faces exhibit blood flow patterns (micro-colour
  changes in skin) and subtle heart-rate-driven movements that synthetic faces do not.
  Some detection approaches exploit these biosignals.

### The Arms Race — Why This Is an Open Problem

**Lab accuracy vs. real-world accuracy is the key issue.**
Systems achieving 96% accuracy in controlled lab conditions — where training and test
deepfakes come from the same generation tools — drop to 50–65% accuracy when evaluated
on real-world deepfakes from different generation systems. This has been documented
across multiple independent studies (ScienceDirect 2025, Brightside AI analysis 2024).

The reason is that current detectors learn artefacts specific to particular generation
tools — the fingerprint of one GAN or diffusion model — rather than learning a general
concept of "this is synthetic." When a new generation method appears, the detector
fails because it has never seen that tool's fingerprint.

**Diffusion-model deepfakes broke most existing detectors.**
The transition from GAN-based (2018–2021) to diffusion-model-based (2022–present)
deepfake generation produced visuals with fundamentally different statistical properties.
Most detection models trained before 2022 were not evaluated on diffusion-model outputs
and fail on them.

**US Government Assessment.**
The US Government Accountability Office (GAO) published an assessment in 2024
concluding that no deepfake detection system is currently reliable enough for
high-confidence forensic determination. This means deepfake detection cannot yet
be used as evidence in legal proceedings with confidence.

**Our position:** This use case should be presented as an active and important research
area, but honestly framed as an unsolved open problem — not a success story.

---

## Use Case 8: Log Analysis and SIEM Anomaly Detection

### Background — What Is the Problem?

Every system in a modern organisation generates logs — records of events like user
logins, file accesses, network connections, application errors, and system changes.
A medium-sized enterprise might generate billions of log entries per day across servers,
endpoints, network devices, cloud services, and applications.

Security Information and Event Management (SIEM) systems collect, aggregate, and
analyse these logs to detect security events. Traditionally, SIEM rules are written
by human analysts — "alert if more than 5 failed logins from the same IP in 1 minute"
or "alert if a privileged account accesses a sensitive file outside business hours."
These rules are precise but brittle — they catch exactly what they are written to catch
and nothing else. Writing comprehensive rule sets for all possible attack patterns is
an impossible task.

### How Deep Learning Addresses It

**Log parsing** is the first challenge. Logs come in hundreds of different formats across
different systems. Before any ML can be applied, the free-text log entries must be parsed
into structured event templates ("User [X] logged in from [IP] at [time]"). Traditional
parsing used regular expressions — brittle, require manual maintenance for each new
log format. BERT-based log parsers (like **Drain** with semantic embedding, or
**LogParse**) learn to cluster log entries into templates automatically, handling new
formats without manual rule updates.

**Sequence anomaly detection** then models the temporal sequence of parsed log events.
Two established tools:
- **DeepLog** (2017): Uses LSTM to model normal sequences of system log events as
  an n-gram language model. Flags events that are statistically unlikely given the
  preceding event sequence.
- **LogBERT** (2021): Applies BERT's masked language model pre-training to log
  sequences. Learns which log event types commonly follow each other and flags
  unusual sequences.

More recent work (2023–2025) applies Transformer Encoders and Mamba/SSM architectures
to log anomaly detection, achieving better performance on long log sequences.

### Key Limitations

**Log parsing quality is the underappreciated bottleneck.**
A 2024 Springer study found that the choice of log parsing technique has a significant,
underappreciated impact on downstream anomaly detection accuracy. Most published results
assume clean, pre-parsed logs — a condition that rarely holds in production environments
with heterogeneous log sources, version changes, and configuration variations.

**No universal model exists.**
Log formats, field semantics, event vocabularies, and baseline "normal" behaviour differ
dramatically across organisations and even across services within one organisation.
A model trained on Linux auth logs from Company A cannot be directly applied to Windows
event logs from Company B. Models must be retrained (or at minimum fine-tuned) for each
new deployment — a significant operational overhead.

**Real-time processing at SIEM scale is expensive.**
Modern SIEMs process millions to billions of log events per day. Running transformer
inference on this volume in real-time requires dedicated, purpose-built hardware
infrastructure. This is not necessarily prohibitive for large enterprises, but it is
a significant cost and infrastructure consideration.

**Cold-start problem.**
A new model deployment has no concept of "normal" for that specific environment. It
takes weeks of ingesting logs before the baseline is calibrated, during which both
false positives (legitimate events flagged as anomalous) and false negatives (real
attacks missed because the model has no baseline to compare against) are elevated.

### Recommended Datasets
- **HDFS (Hadoop Distributed File System logs)** — widely used log anomaly benchmark
- **BGL (Blue Gene/L supercomputer logs)** — system failure detection benchmark
- Both available via the LogHub repository: https://github.com/logpai/loghub
