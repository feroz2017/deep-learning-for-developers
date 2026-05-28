# Deep Learning for Developers — Portfolio

> Coursework, applied projects, and research prototypes completed during the **TIES4911 — Deep Learning for Developers** course at the University of Jyväskylä (2025–2026). This repository documents hands-on work across foundational deep learning, computer vision, NLP, large language model fine-tuning, multimodal cognitive systems, and multi-agent AI.

---

## About

I am a Master's student at the University of Jyväskylä with a focus on applied deep learning, computer vision, and large language models. This repository contains ten progressively complex projects — from linear regression to multi-agent LLM systems — implemented from scratch in PyTorch and the HuggingFace ecosystem, and integrated with cloud cognitive services from Google and Azure.

I am actively seeking **Research Assistant positions** in machine learning, deep learning, computer vision, and NLP.

**Contact:** [feroz2017](https://github.com/feroz2017)

---

## Skills Demonstrated

| Domain                        | Technologies & Concepts                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Frameworks**          | TensorFlow, PyTorch, HuggingFace Transformers, PEFT, TRL, scikit-learn, FastAPI                         |
| **Computer Vision**     | CNNs, Transfer Learning (ResNet-50, MobileNetV3, EfficientNet-B0), Autoencoders, Object Detection       |
| **NLP & LLMs**          | Tokenisation, Embeddings, Sentiment Analysis, NER, Prompt Engineering, RAG, LoRA/QLoRA fine-tuning      |
| **Cloud AI**            | Google Cloud Vision, Natural Language, Translation, Gemini; Azure Computer Vision, Language Service     |
| **Agentic AI**          | CrewAI multi-agent orchestration, Tool Use, Groq inference (LLaMA 3.3 70B)                              |
| **MLOps & Engineering** | Async Python, REST APIs, Docker-ready services, model quantisation (BitsAndBytes), GPU/MPS acceleration |
| **Research Skills**     | Reading peer-reviewed literature (2022–2025), system architecture, technical writing, presentations    |

---

## Featured Project — AI Insurance Claims Processor

**[`assignment-7/insurance-processor`](./assignment-7/insurance-processor)** — A production-style FastAPI prototype that processes multimodal insurance claims (images + scanned documents + multilingual descriptions) by orchestrating **seven cloud AI services in parallel** and producing a structured analyst report.

**Architecture:**

```
User upload (images + PDFs + description)
        ↓
┌───────────────────────────────────────────────┐
│  Google Vision        — labels, objects, SafeSearch │
│  Azure Computer Vision — caption, tags, objects │
│  Google Vision OCR    — document text extraction │
│  Google Translate     — any language → English │
│  Google NLP           — entities + sentiment    │
│  Azure Language       — key phrases + PII       │
│  Risk Engine (custom) — rule-based 0–100 score  │
│  Google Gemini        — written adjuster report │
└───────────────────────────────────────────────┘
        ↓
   Structured JSON + Markdown adjuster report
```

**Highlights:**

- Async FastAPI orchestration of 7 cloud services with httpx
- Custom rule-based fraud risk scoring engine (10 weighted signals)
- PDF→image OCR pipeline using PyMuPDF (200 DPI rendering)
- Retry logic, fallback model selection, and per-service error isolation
- LLM-generated structured Markdown reports via Gemini with system prompts and bounded token output

See [`DOCS.md`](./assignment-7/insurance-processor/DOCS.md) for a complete technical walkthrough.

---

## Project Portfolio

### Assignment 0 — AI & Deep Learning in Cybersecurity

**[`/assignment-0`](./assignment-0)** · *Research & System Design*

Proposed a **multimodal insider threat detection** system using a Transformer Encoder with Cross-Attention Fusion across four behavioural streams (network logs, login patterns, mouse dynamics, file access). Incorporated Federated Learning with DP-SGD for privacy-preserving training, and benchmarked Mamba/SSM as a frontier efficiency alternative for long event sequences.

- Synthesised 2022–2025 peer-reviewed research on intrusion detection, malware analysis, phishing detection, and insider threat
- Delivered a feasibility-assessed proposal, datasets reference, and presentation deck

**Skills:** Literature review · System design · Federated Learning · Transformer architectures

---

### Assignment 1 — Linear Regression Foundations

**[`/assignment-1`](./assignment-1)** · *PyTorch / scikit-learn*

Implemented linear regression using scikit-learn — covering data preprocessing, cost functions, gradient descent intuition, and evaluation metrics (R², MSE, MAE).

---

### Assignment 2 — Neural Networks on Fashion-MNIST

**[`/assignment-2`](./assignment-2)** · *PyTorch*

Built and compared **single-layer perceptrons vs multi-layer perceptrons (MLPs)** on the Fashion-MNIST dataset. Analysed:

- Effect of network depth and width on accuracy
- Activation function trade-offs (ReLU, Sigmoid, Tanh)
- Training dynamics with different optimisers and learning rates
- Apple Silicon MPS acceleration

---

### Assignment 3 — CNNs & Autoencoders

**[`/assignment-3`](./assignment-3)** · *PyTorch*

A five-part deep-dive into convolutional architectures:

- **3-2**: CNN classifier on Fashion-MNIST
- **3-3**: CNN classifier on CIFAR-10 (multi-channel colour images)
- **3-4**: Sparse and Denoising Autoencoders for unsupervised representation learning
- **3-5**: CNN Autoencoder vs Dense Deep Autoencoder — architectural comparison

**Skills:** Convolutional architectures · Unsupervised learning · Reconstruction loss · Latent space visualisation

---

### Assignment 4 — Transfer Learning Benchmark

**[`/assignment-4`](./assignment-4)** · *PyTorch · ImageNet pretrained models*

Benchmarked three modern pretrained backbones on a custom **TV Channel Detection** dataset:

| Model                       | Variant Tested                                  |
| --------------------------- | ----------------------------------------------- |
| **ResNet-50**         | Frozen feature extractor + unfrozen fine-tuning |
| **MobileNetV3-Large** | Frozen + unfrozen                               |
| **EfficientNet-B0**   | Frozen + unfrozen                               |

Analysed accuracy, inference latency, and parameter efficiency. Built a `service_api.py` FastAPI inference endpoint to serve the trained model.

**Skills:** Transfer learning · Fine-tuning strategies · Model deployment

---

### Assignment 5 — End-to-End Computer Vision System Design

**[`/assignment-5`](./assignment-5)** · *System Design · MLOps*

Designed a complete computer vision pipeline for a **Workplace Safety Monitoring System** — covering problem framing, dataset strategy, annotation workflow, model selection, training infrastructure, deployment patterns (edge vs cloud), latency/throughput targets, and production monitoring metrics.

Includes neural style transfer experiments (content + style images) and a full implementation plan document.

**Skills:** ML system design · MLOps · Production CV pipelines · Technical writing

---

### Assignment 6 — LLM Fine-Tuning with LoRA

**[`/assignment-6`](./assignment-6)** · *HuggingFace · PEFT · TRL · BitsAndBytes*

Fine-tuned **SmolLM2-360M-Instruct** using parameter-efficient methods:

- LoRA / QLoRA adapter training via the `peft` library
- 8-bit quantisation with `BitsAndBytes` to fit larger effective models on consumer hardware
- Supervised Fine-Tuning Trainer (`SFTTrainer`) from `trl`
- Custom instruction dataset preparation

**Skills:** PEFT · QLoRA · Quantisation · Instruction tuning · HuggingFace ecosystem

---

### Assignment 7 — AI Insurance Claims Processor *(see Featured Project above)*

**[`/assignment-7/insurance-processor`](./assignment-7/insurance-processor)** · *FastAPI · 7 Cognitive Services · Custom Risk Engine*

The most substantial project in this repository. See the [Featured Project](#featured-project--ai-insurance-claims-processor) section above and the project's [`DOCS.md`](./assignment-7/insurance-processor/DOCS.md).

---

### Assignment 9 — LLM Prompting Strategies

**[`/assignment-9`](./assignment-9)** · *HuggingFace · TinyLlama-1.1B*

Compared three prompting strategies — **zero-shot**, **few-shot**, and **chain-of-thought** — using TinyLlama-1.1B-Chat across diverse reasoning tasks (cause-and-effect, supply chain failure analysis, system reasoning).

**Skills:** Prompt engineering · In-context learning · LLM inference

---

### Assignment 10 — Multi-Agent AI System

**[`/assignment-10`](./assignment-10)** · *CrewAI · Groq · LLaMA 3.3 70B*

Built a **multi-agent pipeline** using CrewAI orchestration with Groq-hosted LLaMA 3.3 70B inference:

- Specialised agents for fetching, analysing, and summarising AI research news
- Custom tools for arXiv, HuggingFace blog, and RSS feed retrieval
- Agent-to-agent task delegation via YAML configuration (`agents.yaml`, `tasks.yaml`)
- Generates structured research digests as output

**Skills:** Agentic AI · Tool use · Multi-agent orchestration · LLM-as-a-service inference

---

## Repository Structure

```
deep-learning-for-developers/
├── assignment-0/   AI in Cybersecurity (research + proposal)
├── assignment-1/   Linear regression foundations
├── assignment-2/   Neural networks on Fashion-MNIST
├── assignment-3/   CNNs and Autoencoders
├── assignment-4/   Transfer learning benchmark
├── assignment-5/   End-to-end CV system design
├── assignment-6/   LLM fine-tuning with LoRA
├── assignment-7/   AI Insurance Claims Processor (FastAPI + 7 cloud services)
├── assignment-9/   LLM prompting strategies
├── assignment-10/  Multi-agent AI system (CrewAI + LLaMA 3.3)
├── requirements.txt
└── README.md
```

---

## Running the Projects

Most notebooks run locally with:

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
jupyter lab
```

The **insurance-processor** (Assignment 7) is a standalone FastAPI service — see its [`DOCS.md`](./assignment-7/insurance-processor/DOCS.md) for full setup and API reference.

Notebooks tested on:

- **Local**: macOS with Apple Silicon (MPS acceleration)
- **Cloud**: Google Colab (CUDA where applicable)

---

## Research Interests

- Multimodal deep learning — fusion of vision, language, and structured data
- Parameter-efficient fine-tuning of large language models
- Agentic AI systems and tool-augmented LLMs
- Applied AI for security, healthcare, and risk assessment
- Privacy-preserving machine learning (Federated Learning, Differential Privacy)

---

## License

This repository contains coursework completed at the University of Jyväskylä. The code is shared for portfolio and educational purposes. Datasets used follow their original licensing terms.
