"use strict";

const pptxgen = require("pptxgenjs");

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg:         "0D1117",
  cyan:       "00D4FF",
  darkBlue:   "1E3A5F",
  white:      "FFFFFF",
  textSec:    "A0B4C8",
  danger:     "FF6B6B",
  success:    "00C896",
  orange:     "FF9F43",
  panelBlue:  "0D5F8F",
  black:      "0D1117",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function addAccentRect(slide) {
  slide.addShape("rect", {
    x: 0.4, y: 0.3, w: 0.06, h: 0.3,
    fill: { color: C.cyan },
    line: { color: C.cyan, width: 0 },
  });
}

function addTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.55, y: 0.25, w: 12.2, h: 0.55,
    fontSize: opts.fontSize || 32,
    fontFace: "Calibri",
    bold: true,
    color: C.white,
    margin: 0,
    ...opts,
  });
}

// ─── Presentation setup ──────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" × 7.5"
pres.title = "AI & Deep Learning in Cybersecurity";
pres.author = "Group Work — Deep Learning for Developers";


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title Slide
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Large circle outline top-right (decorative)
  s.addShape("ellipse", {
    x: 9.5, y: -1.0, w: 3.0, h: 3.0,
    line: { color: C.cyan, width: 1.5 },
    fill: { type: "none" },
  });

  // Secondary decorative circle (smaller, behind title)
  s.addShape("ellipse", {
    x: 10.5, y: 0.3, w: 2.0, h: 2.0,
    line: { color: C.cyan, width: 0.75 },
    fill: { type: "none" },
  });

  // Title
  s.addText("Artificial Intelligence & Deep Learning\nin Cybersecurity", {
    x: 1.0, y: 1.8, w: 11.33, h: 1.5,
    fontSize: 38,
    fontFace: "Calibri",
    bold: true,
    color: C.white,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  // Subtitle
  s.addText("Applicability, Use Cases, and a Proposed Innovation", {
    x: 1.0, y: 3.4, w: 11.33, h: 0.5,
    fontSize: 18,
    fontFace: "Calibri",
    color: C.textSec,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  // Divider line
  s.addShape("rect", {
    x: 0.5, y: 4.05, w: 12.33, h: 0.02,
    fill: { color: C.cyan },
    line: { color: C.cyan, width: 0 },
  });

  // Bottom text
  s.addText("Group Work — Task 0-2  |  Deep Learning for Developers  |  University of Jyväskylä  |  2025", {
    x: 0.5, y: 4.2, w: 12.33, h: 0.4,
    fontSize: 12,
    fontFace: "Calibri",
    color: C.textSec,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  // 4 small cyan dots (2×2 grid) bottom-left
  const dotPositions = [
    { x: 0.3, y: 6.5 }, { x: 0.5, y: 6.5 },
    { x: 0.3, y: 6.75 }, { x: 0.5, y: 6.75 },
  ];
  for (const dp of dotPositions) {
    s.addShape("ellipse", {
      x: dp.x, y: dp.y, w: 0.1, h: 0.1,
      fill: { color: C.cyan },
      line: { color: C.cyan, width: 0 },
    });
  }
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Why Cybersecurity Needs AI
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Why Cybersecurity Needs AI");

  // ── Left column: stat callout boxes ─────────────────────────────────────
  const stats = [
    { value: "$10.5 Trillion", desc: "projected annual cybercrime cost by 2025 (Cybersecurity Ventures)" },
    { value: "2,200+ Attacks/Day", desc: "One cyberattack every 39 seconds globally" },
    { value: "34% of Breaches", desc: "involve insider threats (CISA)" },
  ];

  let boxY = 1.1;
  for (const st of stats) {
    s.addShape("roundRect", {
      x: 0.4, y: boxY, w: 5.7, h: 0.88,
      fill: { color: C.darkBlue },
      line: { color: C.darkBlue, width: 0 },
      rectRadius: 0.08,
    });
    s.addText(st.value, {
      x: 0.55, y: boxY + 0.05, w: 2.1, h: 0.78,
      fontSize: 20,
      fontFace: "Calibri",
      bold: true,
      color: C.cyan,
      valign: "middle",
      margin: 0,
    });
    s.addText(st.desc, {
      x: 2.75, y: boxY + 0.05, w: 3.2, h: 0.78,
      fontSize: 10,
      fontFace: "Calibri",
      color: C.white,
      valign: "middle",
      margin: 0,
      wrap: true,
    });
    boxY += 1.03;
  }

  // ── Left column: bullets below stat boxes ────────────────────────────────
  s.addText([
    { text: "Traditional rule-based systems cannot adapt to novel threats", options: { bullet: true, breakLine: true, fontSize: 12, color: C.white } },
    { text: "Attack volumes exceed human analyst capacity", options: { bullet: true, breakLine: true, fontSize: 12, color: C.white } },
    { text: "AI/DL: pattern learning at scale, generalization to unseen attacks", options: { bullet: true, fontSize: 12, color: C.white } },
  ], {
    x: 0.4, y: 4.05, w: 5.7, h: 1.0,
    fontFace: "Calibri",
  });

  // ── Right column: icon cards ─────────────────────────────────────────────
  const cards = [
    { circleColor: C.danger,  title: "Attack Volume",   titlePfx: "↑ ", desc: "Scale no human team can match" },
    { circleColor: C.orange,  title: "Rule-Based Limits", titlePfx: "⚠ ", desc: "Static rules miss unknown threats" },
    { circleColor: C.cyan,    title: "AI/DL Solution",  titlePfx: "◉ ", desc: "Learns, adapts, scales automatically" },
  ];

  let cardY = 1.1;
  for (const card of cards) {
    s.addShape("roundRect", {
      x: 6.5, y: cardY, w: 6.4, h: 1.4,
      fill: { color: C.darkBlue },
      line: { color: C.darkBlue, width: 0 },
      rectRadius: 0.08,
    });
    // Circle icon left side
    s.addShape("ellipse", {
      x: 6.75, y: cardY + 0.45, w: 0.5, h: 0.5,
      fill: { color: card.circleColor },
      line: { color: card.circleColor, width: 0 },
    });
    // Card title
    s.addText(card.titlePfx + card.title, {
      x: 7.45, y: cardY + 0.2, w: 5.2, h: 0.45,
      fontSize: 14,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      valign: "middle",
      margin: 0,
    });
    // Card description
    s.addText(card.desc, {
      x: 7.45, y: cardY + 0.65, w: 5.2, h: 0.4,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.textSec,
      valign: "middle",
      margin: 0,
    });
    cardY += 1.55;
  }
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — AI Evolution: Rules → ML → DL
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "AI in Security: Evolution of Approaches");

  // Subtitle
  s.addText("Each generation improves on the previous — but none is a silver bullet", {
    x: 0.55, y: 0.82, w: 12.2, h: 0.35,
    fontSize: 11,
    fontFace: "Calibri",
    italic: true,
    color: C.textSec,
    margin: 0,
  });

  // ── Three columns ─────────────────────────────────────────────────────────
  const cols = [
    {
      x: 0.35,
      bg: "2A1515",
      headerBg: "8B2020",
      iconColor: C.danger,
      icon: "⚙",
      title: "Rule-Based Systems",
      bullets: [
        "Fixed signatures & thresholds",
        "Cannot detect unknown threats",
        "Still used: firewalls, AV patterns",
      ],
      labelColor: C.danger,
      labelText: "LIMITATION",
      footnote: "Blind to anything not in the rulebook",
    },
    {
      x: 4.6,
      bg: "1A2415",
      headerBg: "4A6B20",
      iconColor: "F9CA24",
      icon: "◈",
      title: "Classical ML",
      bullets: [
        "Learns from labeled data",
        "Reduces manual rule writing",
        "SVM, Random Forest, Naive Bayes",
        "Works for tabular/structured data",
      ],
      labelColor: "F9CA24",
      labelText: "LIMITATION",
      footnote: "Cannot model raw sequences or unstructured inputs",
    },
    {
      x: 8.85,
      bg: "0D1F2D",
      headerBg: "0D5F8F",
      iconColor: C.cyan,
      icon: "⬡",
      title: "Deep Learning",
      bullets: [
        "Learns features from raw data",
        "Handles sequences, images, graphs",
        "Scales to massive data volumes",
        "CNN, LSTM, GNN, Transformers",
      ],
      labelColor: C.cyan,
      labelText: "TRADEOFF",
      footnote: "More data, higher compute, less interpretable",
    },
  ];

  const colW = 4.0;
  const colH = 5.9;
  const colBodyY = 1.15;

  for (const col of cols) {
    // Column body background
    s.addShape("roundRect", {
      x: col.x, y: colBodyY, w: colW, h: colH,
      fill: { color: col.bg },
      line: { color: col.bg, width: 0 },
      rectRadius: 0.1,
    });

    // Header bar (use rectangle for clean alignment)
    s.addShape("rect", {
      x: col.x, y: colBodyY, w: colW, h: 0.55,
      fill: { color: col.headerBg },
      line: { color: col.headerBg, width: 0 },
    });
    s.addText(col.title, {
      x: col.x, y: colBodyY, w: colW, h: 0.55,
      fontSize: 14,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      valign: "middle",
      margin: 0,
    });

    // Icon
    s.addText(col.icon, {
      x: col.x, y: colBodyY + 0.6, w: colW, h: 0.65,
      fontSize: 28,
      fontFace: "Calibri",
      color: col.iconColor,
      align: "center",
      valign: "middle",
      margin: 0,
    });

    // Bullets
    const bulletItems = col.bullets.map((b, i) => ({
      text: b,
      options: {
        bullet: true,
        breakLine: i < col.bullets.length - 1,
        fontSize: 11,
        color: C.white,
        paraSpaceAfter: 3,
      },
    }));
    s.addText(bulletItems, {
      x: col.x + 0.18, y: colBodyY + 1.35, w: colW - 0.3, h: 2.3,
      fontFace: "Calibri",
      valign: "top",
    });

    // Limitation label
    s.addText(col.labelText, {
      x: col.x + 0.18, y: colBodyY + 3.7, w: colW - 0.3, h: 0.35,
      fontSize: 9,
      fontFace: "Calibri",
      bold: true,
      color: col.labelColor,
      margin: 0,
    });

    // Footnote
    s.addText(col.footnote, {
      x: col.x + 0.18, y: colBodyY + 4.05, w: colW - 0.3, h: 0.8,
      fontSize: 10,
      fontFace: "Calibri",
      color: C.textSec,
      margin: 0,
      wrap: true,
    });
  }
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — DL Techniques Overview
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Key Deep Learning Architectures in Security", { fontSize: 30 });

  const cardW = 4.1;
  const cardH = 2.9;
  const gapX = 0.22;
  const startX = 0.35;
  const startY = 0.92;
  const rowGap = 0.2;

  const cards = [
    // Row 1
    {
      x: startX, y: startY,
      headerBg: "005F8F",
      title: "CNN",
      subtitle: "Convolutional Neural Network",
      body: "Spatial pattern extraction — malware image classification, network feature extraction.",
    },
    {
      x: startX + cardW + gapX, y: startY,
      headerBg: "005F5F",
      title: "LSTM / GRU",
      subtitle: "Recurrent sequence models",
      body: "Recurrent models — LSTM and GRU for sequential data. Competitive baselines. GRU: fewer params, slightly faster. Used as comparison benchmarks.",
    },
    {
      x: startX + (cardW + gapX) * 2, y: startY,
      headerBg: "1A0060",
      title: "Transformer Encoder",
      subtitle: "BEST for behavioral sequences",
      body: "Parallel processing, no vanishing gradient. 99.4% recall on CERT dataset (arXiv 2025). Primary choice for insider threat detection.",
    },
    // Row 2
    {
      x: startX, y: startY + cardH + rowGap,
      headerBg: "004F6F",
      title: "TCN",
      subtitle: "Temporal Convolutional Network",
      body: "Dilated causal convolutions — O(n) complexity. Fully parallelizable. Hybrid TCN+Transformer achieves 95% recall on CERT (Nature 2025). Best efficiency-accuracy tradeoff.",
    },
    {
      x: startX + cardW + gapX, y: startY + cardH + rowGap,
      headerBg: "005000",
      title: "GNN",
      subtitle: "Graph Neural Network",
      body: "Relational patterns — fraud transaction networks, malware call graphs.",
    },
    {
      x: startX + (cardW + gapX) * 2, y: startY + cardH + rowGap,
      headerBg: "5F3000",
      title: "Mamba / SSM",
      subtitle: "State Space Models — frontier",
      body: "O(n) complexity, 5\u00d7 faster than Transformer, lowest memory (7\u20138MB). MambaITD (2025): F1 91.5% on CERT. Cutting-edge frontier architecture.",
    },
  ];

  for (const card of cards) {
    // Card background
    s.addShape("roundRect", {
      x: card.x, y: card.y, w: cardW, h: cardH,
      fill: { color: C.darkBlue },
      line: { color: C.darkBlue, width: 0 },
      rectRadius: 0.08,
    });

    // Header bar
    s.addShape("rect", {
      x: card.x, y: card.y, w: cardW, h: 0.48,
      fill: { color: card.headerBg },
      line: { color: card.headerBg, width: 0 },
    });
    s.addText(card.title, {
      x: card.x, y: card.y, w: cardW, h: 0.48,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      valign: "middle",
      margin: 0,
    });

    // Subtitle (cyan)
    s.addText(card.subtitle, {
      x: card.x + 0.1, y: card.y + 0.5, w: cardW - 0.2, h: 0.38,
      fontSize: 10,
      fontFace: "Calibri",
      bold: true,
      color: C.cyan,
      valign: "top",
      margin: 0,
    });

    // Body text
    s.addText(card.body, {
      x: card.x + 0.1, y: card.y + 0.9, w: cardW - 0.2, h: 1.9,
      fontSize: 10,
      fontFace: "Calibri",
      color: C.white,
      valign: "top",
      wrap: true,
      margin: 0,
    });
  }
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Use Case 1: IDS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Use Case 1 — Network Intrusion Detection (IDS)", { fontSize: 28 });

  const panelY = 1.0;
  const panelH = 6.0;

  // ── Left panel ───────────────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: panelY, w: 6.1, h: panelH,
    fill: { color: C.darkBlue },
    line: { color: C.darkBlue, width: 0 },
    rectRadius: 0.1,
  });

  s.addText("How It Works", {
    x: 0.55, y: panelY + 0.15, w: 5.8, h: 0.38,
    fontSize: 13,
    fontFace: "Calibri",
    bold: true,
    color: C.cyan,
    margin: 0,
  });

  // Architecture flow boxes
  const flowItems = ["Network Traffic", "CNN: per-flow features", "LSTM: session sequences", "Anomaly Flag"];
  let flowY = panelY + 0.65;
  for (let i = 0; i < flowItems.length; i++) {
    s.addShape("roundRect", {
      x: 0.6, y: flowY, w: 5.6, h: 0.48,
      fill: { color: C.panelBlue },
      line: { color: C.panelBlue, width: 0 },
      rectRadius: 0.06,
    });
    s.addText(flowItems[i], {
      x: 0.6, y: flowY, w: 5.6, h: 0.48,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.white,
      align: "center",
      valign: "middle",
      margin: 0,
    });
    flowY += 0.48;
    if (i < flowItems.length - 1) {
      s.addText("↓", {
        x: 0.6, y: flowY, w: 5.6, h: 0.28,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.cyan,
        align: "center",
        valign: "middle",
        margin: 0,
      });
      flowY += 0.28;
    }
  }

  // Bullets below flow
  const leftBullets = [
    "Deployed in commercial NDR products",
    "Darktrace, Vectra AI use this approach",
  ];
  s.addText(leftBullets.map((b, i) => ({
    text: b,
    options: { bullet: true, breakLine: i < leftBullets.length - 1, fontSize: 11, color: C.white, paraSpaceAfter: 4 },
  })), {
    x: 0.55, y: flowY + 0.15, w: 5.7, h: 0.7,
    fontFace: "Calibri",
  });

  // Dataset box
  const dsY = panelY + 4.3;
  s.addShape("roundRect", {
    x: 0.55, y: dsY, w: 5.7, h: 1.4,
    fill: { color: "003020" },
    line: { color: "003020", width: 0 },
    rectRadius: 0.08,
  });
  s.addText([
    { text: "✓ Dataset: UNSW-NB15", options: { bold: true, color: C.success, fontSize: 12, breakLine: true } },
    { text: "✗ Avoid: NSL-KDD (1998 data — obsolete)", options: { bold: false, color: C.danger, fontSize: 11 } },
  ], {
    x: 0.7, y: dsY + 0.15, w: 5.4, h: 1.1,
    fontFace: "Calibri",
    valign: "top",
  });

  // ── Right panel ──────────────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 6.6, y: panelY, w: 6.35, h: panelH,
    fill: { color: "2D1515" },
    line: { color: "2D1515", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("⚠ Real Limitations", {
    x: 6.8, y: panelY + 0.15, w: 6.0, h: 0.38,
    fontSize: 13,
    fontFace: "Calibri",
    bold: true,
    color: C.danger,
    margin: 0,
  });

  const limitations = [
    { title: "False Positive Problem", body: "0.1% FPR = 10,000 false alarms/day on large networks" },
    { title: "'99% Accuracy' Claims", body: "Measured on synthetic datasets — not real enterprise traffic" },
    { title: "Adversarial Evasion", body: "Attackers craft traffic mimicking benign patterns — defeats DL-IDS" },
    { title: "Inference Latency", body: "Real-time CNN+LSTM requires dedicated hardware" },
  ];

  let limY = panelY + 0.65;
  for (const lim of limitations) {
    s.addShape("roundRect", {
      x: 6.75, y: limY, w: 6.05, h: 1.18,
      fill: { color: "1A0808" },
      line: { color: "1A0808", width: 0 },
      rectRadius: 0.06,
    });
    s.addText(lim.title, {
      x: 6.9, y: limY + 0.1, w: 5.8, h: 0.38,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText(lim.body, {
      x: 6.9, y: limY + 0.48, w: 5.8, h: 0.55,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.textSec,
      wrap: true,
      margin: 0,
    });
    limY += 1.3;
  }
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Use Cases 2 & 3: Malware & Phishing
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Use Cases 2 & 3 — Malware and Phishing Detection", { fontSize: 28 });

  // ── Top half: Malware ─────────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: 0.9, w: 12.6, h: 3.1,
    fill: { color: "1E2A3F" },
    line: { color: "1E2A3F", width: 0 },
    rectRadius: 0.1,
  });

  // Left side
  s.addText("MALWARE DETECTION", {
    x: 0.55, y: 1.02, w: 5.5, h: 0.38,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.cyan, margin: 0,
  });

  // Flow boxes
  const malwareFlow = ["PE Binary", "Grayscale Image", "CNN Classification"];
  let mfx = 0.6;
  for (let i = 0; i < malwareFlow.length; i++) {
    s.addShape("roundRect", {
      x: mfx, y: 1.48, w: 1.55, h: 0.38,
      fill: { color: C.panelBlue },
      line: { color: C.panelBlue, width: 0 },
      rectRadius: 0.05,
    });
    s.addText(malwareFlow[i], {
      x: mfx, y: 1.48, w: 1.55, h: 0.38,
      fontSize: 9, fontFace: "Calibri", color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    if (i < malwareFlow.length - 1) {
      s.addText("→", {
        x: mfx + 1.55, y: 1.48, w: 0.28, h: 0.38,
        fontSize: 12, fontFace: "Calibri", color: C.cyan,
        align: "center", valign: "middle", margin: 0,
      });
      mfx += 1.83;
    }
  }

  s.addText([
    { text: "Detects structural patterns of malware families", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "CrowdStrike + Defender add behavioral sandboxing on top", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 0.55, y: 2.0, w: 5.5, h: 0.7, fontFace: "Calibri",
  });

  s.addText("⚠ Obfuscation/packing evades static image analysis", {
    x: 0.55, y: 2.72, w: 5.5, h: 0.3,
    fontSize: 11, fontFace: "Calibri", color: C.danger, margin: 0,
  });

  // Right side — dataset badge
  s.addShape("roundRect", {
    x: 6.0, y: 1.05, w: 6.75, h: 2.8,
    fill: { color: "003050" },
    line: { color: "003050", width: 0 },
    rectRadius: 0.1,
  });
  s.addText("EMBER2024", {
    x: 6.2, y: 1.2, w: 6.35, h: 0.8,
    fontSize: 36, fontFace: "Calibri", bold: true, color: C.cyan,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Replaces obsolete original EMBER", options: { breakLine: true, fontSize: 11, color: C.textSec } },
    { text: "Includes evasive malware samples", options: { breakLine: true, fontSize: 11, color: C.textSec } },
    { text: "Released 2024 by Elastic + CrowdStrike", options: { fontSize: 11, color: C.textSec } },
  ], {
    x: 6.2, y: 2.15, w: 6.35, h: 0.8, fontFace: "Calibri", align: "center",
  });

  // ── Divider ───────────────────────────────────────────────────────────────
  s.addShape("rect", {
    x: 0.35, y: 4.08, w: 12.6, h: 0.025,
    fill: { color: C.cyan },
    line: { color: C.cyan, width: 0 },
  });

  // ── Bottom half: Phishing ─────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: 4.15, w: 12.6, h: 3.15,
    fill: { color: "1E2A1E" },
    line: { color: "1E2A1E", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("PHISHING & SPAM DETECTION", {
    x: 0.55, y: 4.27, w: 5.5, h: 0.38,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.success, margin: 0,
  });

  // Phishing flow
  const phishFlow = ["Email/URL", "BERT/RoBERTa", "Classification"];
  let pfx = 0.6;
  for (let i = 0; i < phishFlow.length; i++) {
    s.addShape("roundRect", {
      x: pfx, y: 4.72, w: 1.5, h: 0.38,
      fill: { color: "005040" },
      line: { color: "005040", width: 0 },
      rectRadius: 0.05,
    });
    s.addText(phishFlow[i], {
      x: pfx, y: 4.72, w: 1.5, h: 0.38,
      fontSize: 9, fontFace: "Calibri", color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    if (i < phishFlow.length - 1) {
      s.addText("→", {
        x: pfx + 1.5, y: 4.72, w: 0.28, h: 0.38,
        fontSize: 12, fontFace: "Calibri", color: C.success,
        align: "center", valign: "middle", margin: 0,
      });
      pfx += 1.78;
    }
  }

  s.addText([
    { text: "88–93% accuracy vs. SVM/Naive Bayes on benchmarks", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "URL-based: fast, privacy-preserving", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 0.55, y: 5.18, w: 5.5, h: 0.65, fontFace: "Calibri",
  });

  s.addText("⚠ Concept drift — tactics shift weekly, model degrades", {
    x: 0.55, y: 5.88, w: 5.5, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: C.danger, margin: 0,
  });

  // Right side phishing dataset
  s.addShape("roundRect", {
    x: 6.0, y: 4.27, w: 6.75, h: 2.88,
    fill: { color: "003020" },
    line: { color: "003020", width: 0 },
    rectRadius: 0.1,
  });
  s.addText("PhishTank", {
    x: 6.2, y: 4.42, w: 6.35, h: 0.7,
    fontSize: 34, fontFace: "Calibri", bold: true, color: C.success,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Crowd-sourced phishing URL database", options: { breakLine: true, fontSize: 11, color: C.textSec } },
    { text: "⚠ URLs decay within hours — freshness is critical", options: { fontSize: 11, color: C.orange } },
  ], {
    x: 6.2, y: 5.2, w: 6.35, h: 0.8, fontFace: "Calibri", align: "center",
  });
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Use Cases 4 & 5: Fraud & Vulnerability Detection
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Use Cases 4 & 5 — Fraud Detection & Code Vulnerability Detection", { fontSize: 24, w: 12.7 });

  // ── Top panel: Fraud ──────────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: 0.9, w: 12.6, h: 2.75,
    fill: { color: "1E2A3F" },
    line: { color: "1E2A3F", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("FRAUD DETECTION — Graph Neural Networks (GNN)", {
    x: 0.55, y: 1.02, w: 12.2, h: 0.38,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.cyan, margin: 0,
  });

  // Left bullets
  s.addText([
    { text: "Transaction graph: nodes = accounts/merchants, edges = transactions", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "GNN detects fraud rings invisible to feature-based models", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "Deployed: Visa, Mastercard, PayPal", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 0.55, y: 1.48, w: 6.0, h: 1.8, fontFace: "Calibri",
  });

  // Warning box right
  s.addShape("roundRect", {
    x: 7.0, y: 1.15, w: 5.75, h: 2.35,
    fill: { color: "2D1515" },
    line: { color: "2D1515", width: 0 },
    rectRadius: 0.08,
  });
  s.addText("⚠ Adversarial Concept Drift", {
    x: 7.15, y: 1.25, w: 5.45, h: 0.38,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.danger, margin: 0,
  });
  s.addText([
    { text: "Fraud rings adapt to evade deployed detectors", options: { breakLine: true, fontSize: 11, color: C.white } },
    { text: "Labels arrive 1–6 months late — silent model failure", options: { fontSize: 11, color: C.white } },
  ], {
    x: 7.15, y: 1.72, w: 5.45, h: 0.9, fontFace: "Calibri",
  });

  // Divider
  s.addShape("rect", {
    x: 0.35, y: 3.72, w: 12.6, h: 0.025,
    fill: { color: C.cyan },
    line: { color: C.cyan, width: 0 },
  });

  // ── Bottom panel: Vulnerability ───────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: 3.78, w: 12.6, h: 3.42,
    fill: { color: "1E1E2D" },
    line: { color: "1E1E2D", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("VULNERABILITY DETECTION IN CODE — LLM + GNN Hybrid", {
    x: 0.55, y: 3.9, w: 12.2, h: 0.38,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.cyan, margin: 0,
  });

  s.addText([
    { text: "CodeBERT parses code syntax and semantics", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "GNN models Code Property Graph (data flow + control flow)", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "Outperforms Semgrep, CodeQL for specific vulnerability classes", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "GitHub Copilot security, Google Project Zero investing here", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 0.55, y: 4.35, w: 6.0, h: 2.5, fontFace: "Calibri",
  });

  // Warning box right
  s.addShape("roundRect", {
    x: 7.0, y: 3.95, w: 5.75, h: 3.1,
    fill: { color: "2D1515" },
    line: { color: "2D1515", width: 0 },
    rectRadius: 0.08,
  });
  s.addText("⚠ Hard Limits", {
    x: 7.15, y: 4.08, w: 5.45, h: 0.38,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.danger, margin: 0,
  });
  s.addText([
    { text: "512 token max — cannot analyze whole files", options: { breakLine: true, fontSize: 11, color: C.white } },
    { text: "Cross-function bugs (use-after-free) not reliably caught", options: { breakLine: true, fontSize: 11, color: C.white } },
    { text: "Still research-stage — not production-ready at scale", options: { fontSize: 11, color: C.white } },
  ], {
    x: 7.15, y: 4.55, w: 5.45, h: 1.6, fontFace: "Calibri",
  });
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Use Cases 6 & 7: Deepfake & Facial Recognition
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Use Cases 6 & 7 — Deepfake Detection & Facial Recognition", { fontSize: 26 });

  const colW = 6.4;

  // ── Left column: Deepfake ─────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: 1.0, w: colW, h: 6.2,
    fill: { color: "1A0A0A" },
    line: { color: "1A0A0A", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("Deepfake Detection", {
    x: 0.55, y: 1.12, w: colW - 0.25, h: 0.38,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.danger, margin: 0,
  });

  // Big stat callout
  s.addShape("roundRect", {
    x: 0.6, y: 1.58, w: colW - 0.55, h: 1.7,
    fill: { color: "2D0000" },
    line: { color: "2D0000", width: 0 },
    rectRadius: 0.08,
  });
  s.addText([
    { text: "96%", options: { bold: true, fontSize: 36, color: C.danger, breakLine: true } },
    { text: "lab accuracy  →  50–65%", options: { bold: true, fontSize: 18, color: C.orange, breakLine: true } },
    { text: "real-world accuracy", options: { fontSize: 12, color: C.textSec } },
  ], {
    x: 0.6, y: 1.62, w: colW - 0.55, h: 1.6,
    fontFace: "Calibri", align: "center", valign: "middle",
  });

  s.addText([
    { text: "Detectors learn tool signatures, not biometric truth", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "Diffusion-model deepfakes (post-2022) not in training sets", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "Adversarial optimization → near-100% evasion", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 0.55, y: 3.4, w: colW - 0.25, h: 1.05, fontFace: "Calibri",
  });

  // Warning badge
  s.addShape("roundRect", {
    x: 0.6, y: 4.55, w: colW - 0.55, h: 0.45,
    fill: { color: C.danger },
    line: { color: C.danger, width: 0 },
    rectRadius: 0.07,
  });
  s.addText("⚠ ACTIVE OPEN PROBLEM", {
    x: 0.6, y: 4.55, w: colW - 0.55, h: 0.45,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });

  s.addText("US GAO (2024): No system reliable enough for forensic use", {
    x: 0.55, y: 5.1, w: colW - 0.25, h: 0.4,
    fontSize: 10, fontFace: "Calibri", color: C.textSec, margin: 0, wrap: true,
  });

  // ── Right column: Facial Recognition ─────────────────────────────────────
  s.addShape("roundRect", {
    x: 6.9, y: 1.0, w: colW, h: 6.2,
    fill: { color: "0A1A0A" },
    line: { color: "0A1A0A", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("Facial Recognition — Access Control", {
    x: 7.1, y: 1.12, w: colW - 0.25, h: 0.38,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.success, margin: 0,
  });

  // Stat callout
  s.addShape("roundRect", {
    x: 6.95, y: 1.58, w: colW - 0.2, h: 1.5,
    fill: { color: "003020" },
    line: { color: "003020", width: 0 },
    rectRadius: 0.08,
  });
  s.addText([
    { text: ">99.5%", options: { bold: true, fontSize: 36, color: C.success, breakLine: true } },
    { text: "controlled accuracy (NIST 2024)", options: { fontSize: 12, color: C.textSec } },
  ], {
    x: 6.95, y: 1.62, w: colW - 0.2, h: 1.38,
    fontFace: "Calibri", align: "center", valign: "middle",
  });

  s.addText([
    { text: "ArcFace / FaceNet — deep CNN models", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "Anti-spoofing / liveness detection mandatory", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: ">88% adversarial bypass rate (printed photos)", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 7.1, y: 3.2, w: colW - 0.25, h: 1.05, fontFace: "Calibri",
  });

  // EU AI Act badge
  s.addShape("roundRect", {
    x: 6.95, y: 4.35, w: colW - 0.2, h: 0.48,
    fill: { color: "003366" },
    line: { color: "003366", width: 0 },
    rectRadius: 0.07,
  });
  s.addText("EU AI Act — August 2024", {
    x: 6.95, y: 4.35, w: colW - 0.2, h: 0.48,
    fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });

  s.addText([
    { text: "Live biometric ID in public spaces = UNACCEPTABLE RISK", options: { breakLine: true, fontSize: 11, color: C.orange } },
    { text: "Effectively banned in EU & Finland", options: { fontSize: 11, color: C.danger } },
  ], {
    x: 7.1, y: 4.92, w: colW - 0.25, h: 0.8, fontFace: "Calibri",
  });
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — Log Analysis + Commercial Products
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Use Case 8: Log Analysis / SIEM + Commercial Products", { fontSize: 26 });

  // ── Top strip ─────────────────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: 0.88, w: 12.6, h: 1.82,
    fill: { color: "1E2A3F" },
    line: { color: "1E2A3F", width: 0 },
    rectRadius: 0.08,
  });

  s.addText("LOG ANALYSIS & SIEM", {
    x: 0.55, y: 0.98, w: 5.8, h: 0.35,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.cyan, margin: 0,
  });

  s.addText([
    { text: "BERT-based log parsing + LSTM sequence anomaly detection", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "Tools: LogBERT, DeepLog", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 0.5, y: 1.35, w: 5.8, h: 0.85, fontFace: "Calibri",
  });

  s.addText([
    { text: "Log formats differ per org — no universal model", options: { bullet: true, breakLine: true, fontSize: 11, color: C.danger } },
    { text: "Transformer inference too slow for real-time at SIEM scale without dedicated HW", options: { bullet: true, fontSize: 11, color: C.orange } },
  ], {
    x: 6.5, y: 1.08, w: 6.2, h: 1.5, fontFace: "Calibri",
  });

  // Divider
  s.addShape("rect", {
    x: 0.35, y: 2.78, w: 12.6, h: 0.025,
    fill: { color: C.cyan },
    line: { color: C.cyan, width: 0 },
  });

  // Section header
  s.addText("COMMERCIAL PRODUCTS IN MARKET", {
    x: 0.5, y: 2.85, w: 12.0, h: 0.35,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.cyan, margin: 0,
  });

  // ── 4 Product cards ───────────────────────────────────────────────────────
  const products = [
    {
      title: "CrowdStrike Falcon",
      sub: "EDR — Static ML + Behavioral sensors",
      bullets: ["MITRE ATT&CK #1 ranked", "Co-produced EMBER2024 dataset"],
      badge: "★ BEST IN CLASS",
      badgeColor: C.success,
      warnings: [],
    },
    {
      title: "Darktrace",
      sub: "Unsupervised behavioral baselines",
      bullets: ["2-week baselining before reliable use"],
      badge: null,
      warnings: ["Documented alert fatigue in practice"],
    },
    {
      title: "Microsoft Defender",
      sub: "Static ML + behavioral + cloud reputation",
      bullets: ["Billions of endpoints protected", "Publishes transparency reports"],
      badge: null,
      warnings: [],
    },
    {
      title: "Vectra AI",
      sub: "NDR — network flow anomaly scoring",
      bullets: ["Lateral movement + C2 detection"],
      badge: null,
      warnings: ["Self-reported benchmark claims"],
    },
  ];

  const cardW2 = 3.03;
  let pcX = 0.35;
  const pcY = 3.28;

  for (const prod of products) {
    s.addShape("roundRect", {
      x: pcX, y: pcY, w: cardW2, h: 3.85,
      fill: { color: "0D1A2D" },
      line: { color: "0D1A2D", width: 0 },
      rectRadius: 0.08,
    });

    // Header bar
    s.addShape("rect", {
      x: pcX, y: pcY, w: cardW2, h: 0.45,
      fill: { color: C.darkBlue },
      line: { color: C.darkBlue, width: 0 },
    });
    s.addText(prod.title, {
      x: pcX, y: pcY, w: cardW2, h: 0.45,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    s.addText(prod.sub, {
      x: pcX + 0.1, y: pcY + 0.48, w: cardW2 - 0.2, h: 0.38,
      fontSize: 10, fontFace: "Calibri", color: C.cyan, margin: 0, wrap: true,
    });

    const bulletY = pcY + 0.92;
    const bulletItems = prod.bullets.map((b, i) => ({
      text: b,
      options: { bullet: true, breakLine: i < prod.bullets.length - 1, fontSize: 10, color: C.white, paraSpaceAfter: 3 },
    }));
    if (bulletItems.length > 0) {
      s.addText(bulletItems, {
        x: pcX + 0.1, y: bulletY, w: cardW2 - 0.2, h: 0.95, fontFace: "Calibri",
      });
    }

    if (prod.warnings.length > 0) {
      const warnItems = prod.warnings.map((w, i) => ({
        text: "⚠ " + w,
        options: { breakLine: i < prod.warnings.length - 1, fontSize: 10, color: C.orange },
      }));
      s.addText(warnItems, {
        x: pcX + 0.1, y: pcY + 2.0, w: cardW2 - 0.2, h: 0.65, fontFace: "Calibri",
      });
    }

    if (prod.badge) {
      s.addShape("roundRect", {
        x: pcX + 0.1, y: pcY + 2.85, w: cardW2 - 0.2, h: 0.38,
        fill: { color: C.success },
        line: { color: C.success, width: 0 },
        rectRadius: 0.06,
      });
      s.addText(prod.badge, {
        x: pcX + 0.1, y: pcY + 2.85, w: cardW2 - 0.2, h: 0.38,
        fontSize: 10, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
    }

    pcX += cardW2 + 0.14;
  }

  // Note below cards
  s.addText("VirusTotal = multi-engine aggregator only — NOT an AI product. Use as data source.", {
    x: 0.35, y: 7.1, w: 12.6, h: 0.3,
    fontSize: 10, fontFace: "Calibri", italic: true, color: C.textSec, margin: 0,
  });
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — Our Innovation: Insider Threat Detection
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Our Proposed Idea: Multimodal Insider Threat Detection", { fontSize: 25, w: 12.5 });

  s.addText("Transformer Encoder + Multimodal Fusion + Federated Learning", {
    x: 0.55, y: 0.82, w: 12.0, h: 0.32,
    fontSize: 13, fontFace: "Calibri", color: C.cyan, margin: 0,
  });

  // ── Left column ───────────────────────────────────────────────────────────
  s.addText("THE PROBLEM", {
    x: 0.35, y: 1.18, w: 4.8, h: 0.32,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.danger, margin: 0,
  });

  s.addShape("roundRect", {
    x: 0.35, y: 1.55, w: 4.85, h: 1.95,
    fill: { color: "2D1515" },
    line: { color: "2D1515", width: 0 },
    rectRadius: 0.08,
  });
  s.addText([
    { text: "Insiders have authorized access — rules cannot distinguish normal vs. malicious use", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "~34% of data breaches involve insiders (CISA)", options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } },
    { text: "Behavior patterns across multiple streams carry the signal that rules miss", options: { bullet: true, fontSize: 11, color: C.white } },
  ], {
    x: 0.5, y: 1.62, w: 4.55, h: 1.75, fontFace: "Calibri",
  });

  s.addText("OUR DATASETS", {
    x: 0.35, y: 3.6, w: 4.8, h: 0.32,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.cyan, margin: 0,
  });

  const datasets = [
    { name: "CERT v6.2", desc: "behavioral logs with injected scenarios" },
    { name: "Balabit Mouse Dynamics", desc: "real user mouse data" },
    { name: "SPEDIA (2025)", desc: "more realistic insider threat dataset" },
  ];
  let dsY2 = 4.0;
  for (const ds of datasets) {
    s.addShape("roundRect", {
      x: 0.35, y: dsY2, w: 4.85, h: 0.65,
      fill: { color: C.darkBlue },
      line: { color: C.darkBlue, width: 0 },
      rectRadius: 0.06,
    });
    s.addText([
      { text: ds.name + " — ", options: { bold: true, fontSize: 11, color: C.white } },
      { text: ds.desc, options: { fontSize: 11, color: C.textSec } },
    ], {
      x: 0.5, y: dsY2 + 0.05, w: 4.55, h: 0.55, fontFace: "Calibri", valign: "middle",
    });
    dsY2 += 0.78;
  }

  // ── Right column: Architecture diagram ───────────────────────────────────
  const archX = 5.45;
  const inputBoxW = 1.65;
  const inputBoxH = 0.5;
  const inputLabels = ["Network Logs", "Login Events", "Mouse Dynamics", "File Access"];
  const totalW = inputLabels.length * inputBoxW + (inputLabels.length - 1) * 0.1;
  const archStartX = archX + (7.6 - totalW) / 2;

  // Row 1: Input boxes
  let r1x = archStartX;
  for (const label of inputLabels) {
    s.addShape("roundRect", {
      x: r1x, y: 1.2, w: inputBoxW, h: inputBoxH,
      fill: { color: C.panelBlue },
      line: { color: C.panelBlue, width: 0 },
      rectRadius: 0.06,
    });
    s.addText(label, {
      x: r1x, y: 1.2, w: inputBoxW, h: inputBoxH,
      fontSize: 9, fontFace: "Calibri", color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    r1x += inputBoxW + 0.1;
  }

  // Arrow row 1 → row 2
  let ar1x = archStartX;
  for (let i = 0; i < 4; i++) {
    s.addText("↓", {
      x: ar1x, y: 1.7, w: inputBoxW, h: 0.38,
      fontSize: 14, fontFace: "Calibri", color: C.cyan,
      align: "center", valign: "middle", margin: 0,
    });
    ar1x += inputBoxW + 0.1;
  }

  // Row 2: Transformer Encoder boxes
  let r2x = archStartX;
  for (let i = 0; i < 4; i++) {
    s.addShape("roundRect", {
      x: r2x, y: 2.08, w: inputBoxW, h: 0.62,
      fill: { color: "1A0060" },
      line: { color: "1A0060", width: 0 },
      rectRadius: 0.06,
    });
    s.addText([
      { text: "Transformer Encoder", options: { bold: true, fontSize: 8, color: C.white, breakLine: true } },
      { text: "Temporal Positional Enc.", options: { fontSize: 7, color: C.textSec } },
    ], {
      x: r2x, y: 2.08, w: inputBoxW, h: 0.62,
      fontFace: "Calibri", align: "center", valign: "middle",
    });
    r2x += inputBoxW + 0.1;
  }

  // Converging arrows → fusion
  const fusionX = archStartX + (totalW - 3.8) / 2;
  const fusionY = 3.18;

  // Diagonal lines converging
  s.addText("↙  ↓  ↓  ↘", {
    x: archStartX, y: 2.72, w: totalW, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: C.cyan,
    align: "center", valign: "middle", margin: 0,
  });

  // Row 3: Fusion box (wide cyan)
  s.addShape("roundRect", {
    x: fusionX, y: fusionY, w: 3.8, h: 0.6,
    fill: { color: C.cyan },
    line: { color: C.cyan, width: 0 },
    rectRadius: 0.08,
  });
  s.addText("Multimodal Cross-Attention Fusion", {
    x: fusionX, y: fusionY, w: 3.8, h: 0.6,
    fontSize: 10, fontFace: "Calibri", bold: true, color: C.black,
    align: "center", valign: "middle", margin: 0,
  });

  // Arrow
  s.addText("↓", {
    x: fusionX, y: fusionY + 0.6, w: 3.8, h: 0.32,
    fontSize: 14, fontFace: "Calibri", color: C.cyan,
    align: "center", valign: "middle", margin: 0,
  });

  // Row 4: Anomaly Score box
  const scoreX = fusionX + 0.15;
  s.addShape("roundRect", {
    x: scoreX, y: fusionY + 0.95, w: 3.5, h: 0.52,
    fill: { color: C.darkBlue },
    line: { color: C.darkBlue, width: 0 },
    rectRadius: 0.06,
  });
  s.addText("Anomaly Score per User Session", {
    x: scoreX, y: fusionY + 0.95, w: 3.5, h: 0.32,
    fontSize: 9, fontFace: "Calibri", bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("Isolation Forest / reconstruction error", {
    x: scoreX, y: fusionY + 1.25, w: 3.5, h: 0.2,
    fontSize: 7, fontFace: "Calibri", color: C.textSec,
    align: "center", valign: "middle", margin: 0,
  });

  // Arrow
  s.addText("↓", {
    x: scoreX, y: fusionY + 1.5, w: 3.5, h: 0.3,
    fontSize: 14, fontFace: "Calibri", color: C.cyan,
    align: "center", valign: "middle", margin: 0,
  });

  // Row 5: Human Analyst box (green)
  const outputX = fusionX + 0.1;
  s.addShape("roundRect", {
    x: outputX, y: fusionY + 1.82, w: 3.6, h: 0.48,
    fill: { color: "003020" },
    line: { color: "003020", width: 0 },
    rectRadius: 0.06,
  });
  s.addText("Human Analyst Review Queue", {
    x: outputX, y: fusionY + 1.82, w: 3.6, h: 0.48,
    fontSize: 10, fontFace: "Calibri", bold: true, color: C.success,
    align: "center", valign: "middle", margin: 0,
  });

  // Two architecture badges below the diagram
  const badgeY = fusionY + 2.42;
  const badgeW = 3.5;
  const badgeLX = archStartX - 0.1;
  const badgeRX = archStartX + totalW - badgeW + 0.1;

  // Left badge — Primary Transformer
  s.addShape("roundRect", {
    x: badgeLX, y: badgeY, w: badgeW, h: 0.72,
    fill: { color: "003050" },
    line: { color: "003050", width: 0 },
    rectRadius: 0.07,
  });
  s.addText([
    { text: "Primary: Transformer Encoder", options: { bold: true, fontSize: 9, color: C.cyan, breakLine: true } },
    { text: "99.4% recall on CERT (arXiv 2506.23446)", options: { fontSize: 8, color: C.white } },
  ], {
    x: badgeLX + 0.08, y: badgeY + 0.05, w: badgeW - 0.16, h: 0.62,
    fontFace: "Calibri", align: "center", valign: "middle",
  });

  // Right badge — Frontier Mamba
  s.addShape("roundRect", {
    x: badgeRX, y: badgeY, w: badgeW, h: 0.72,
    fill: { color: "002030" },
    line: { color: "002030", width: 0 },
    rectRadius: 0.07,
  });
  s.addText([
    { text: "Frontier: Mamba / SSM", options: { bold: true, fontSize: 9, color: C.orange, breakLine: true } },
    { text: "5\u00d7 faster, lowest memory (MambaITD 2025)", options: { fontSize: 8, color: C.white } },
  ], {
    x: badgeRX + 0.08, y: badgeY + 0.05, w: badgeW - 0.16, h: 0.62,
    fontFace: "Calibri", align: "center", valign: "middle",
  });

  // Small baseline note centered below badges
  s.addText("LSTM/GRU retained as baseline comparison models", {
    x: archX, y: badgeY + 0.76, w: 7.5, h: 0.25,
    fontSize: 8, fontFace: "Calibri", italic: true, color: C.textSec,
    align: "center", margin: 0,
  });

  // FL privacy bar — full width at bottom
  s.addShape("roundRect", {
    x: 5.45, y: 6.88, w: 7.5, h: 0.52,
    fill: { color: "1E2A3F" },
    line: { color: "1E2A3F", width: 0 },
    rectRadius: 0.06,
  });
  s.addText("Federated Learning: raw logs never leave org  |  DP-SGD on gradient updates", {
    x: 5.55, y: 6.9, w: 7.3, h: 0.48,
    fontSize: 10, fontFace: "Calibri", color: C.cyan,
    align: "center", valign: "middle", margin: 0,
  });
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — Challenges & Honest Assessment
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Known Challenges — Why Honesty Strengthens This Proposal", { fontSize: 24, w: 12.7 });

  const challenges = [
    {
      x: 0.35, y: 1.0,
      borderColor: C.orange,
      title: "Dataset Realism",
      body: "CERT is synthetic (~1,000 simulated users). Real-world validity unknown. SPEDIA (2025) is a more realistic alternative.",
    },
    {
      x: 4.6, y: 1.0,
      borderColor: C.orange,
      title: "Class Imbalance",
      body: "~1 threat per 10,000–100,000 user-days. Accuracy is a useless metric. Use: Precision, Recall, F1 at fixed FPR.",
    },
    {
      x: 8.85, y: 1.0,
      borderColor: C.orange,
      title: "Cold-Start Problem",
      body: "LSTM needs 30+ days per user to baseline. New hires, role changes, remote work all appear anomalous during calibration.",
    },
    {
      x: 0.35, y: 3.45,
      borderColor: C.cyan,
      title: "Legal & GDPR (EU/Finland)",
      body: "GDPR Art. 88 compliance required. Explicit employee disclosure. DPA registration. System cannot be covert.",
    },
    {
      x: 4.6, y: 3.45,
      borderColor: C.cyan,
      title: "Explainability",
      body: "Transformer attention weights provide token-level contribution scores — more interpretable than raw LSTM outputs. Still requires human-in-the-loop for employment decisions.",
    },
    {
      x: 8.85, y: 3.45,
      borderColor: C.cyan,
      title: "FL Security Limits",
      body: "Federated Learning does not equal absolute privacy. Model poisoning + gradient inference attacks are real. DP-SGD mitigates, not eliminates.",
    },
  ];

  const cW = 4.1;
  const cH = 2.3;

  for (const ch of challenges) {
    // Card
    s.addShape("roundRect", {
      x: ch.x, y: ch.y, w: cW, h: cH,
      fill: { color: "1E2A3F" },
      line: { color: "1E2A3F", width: 0 },
      rectRadius: 0.08,
    });
    // Top border accent
    s.addShape("rect", {
      x: ch.x, y: ch.y, w: cW, h: 0.06,
      fill: { color: ch.borderColor },
      line: { color: ch.borderColor, width: 0 },
    });
    // Title
    s.addText(ch.title, {
      x: ch.x + 0.15, y: ch.y + 0.15, w: cW - 0.3, h: 0.4,
      fontSize: 13, fontFace: "Calibri", bold: true, color: C.white, margin: 0,
    });
    // Body
    s.addText(ch.body, {
      x: ch.x + 0.15, y: ch.y + 0.6, w: cW - 0.3, h: 1.55,
      fontSize: 11, fontFace: "Calibri", color: C.textSec, wrap: true, margin: 0,
    });
  }

  // Bottom banner
  s.addShape("rect", {
    x: 0.0, y: 5.9, w: 13.33, h: 0.65,
    fill: { color: "003050" },
    line: { color: "003050", width: 0 },
  });
  s.addText("These are not blockers — they are active research problems. Acknowledging them is what makes this a credible research proposal.", {
    x: 0.3, y: 5.9, w: 12.73, h: 0.65,
    fontSize: 12, fontFace: "Calibri", italic: true, color: C.cyan,
    align: "center", valign: "middle", margin: 0,
  });
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — Datasets Summary
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addAccentRect(s);
  addTitle(s, "Datasets: What We Use and What We Avoid", { fontSize: 30 });

  s.addText("Choosing the right dataset is as important as choosing the right model.", {
    x: 0.55, y: 0.82, w: 12.2, h: 0.32,
    fontSize: 12, fontFace: "Calibri", italic: true, color: C.textSec, margin: 0,
  });

  // ── Left panel (USE) ──────────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 0.35, y: 1.18, w: 6.1, h: 6.1,
    fill: { color: "0D1E0D" },
    line: { color: "0D1E0D", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("✓ USE THESE", {
    x: 0.55, y: 1.3, w: 5.8, h: 0.38,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.success, margin: 0,
  });

  const goodDS = [
    { name: "UNSW-NB15", type: "Network IDS", note: "Modern, 9 attack types" },
    { name: "EMBER2024", type: "PE Malware", note: "Includes evasive samples (Elastic/CrowdStrike 2024)" },
    { name: "PhishTank", type: "Phishing", note: "⚠ Note URL decay (hours-level freshness)" },
    { name: "CERT v6.2", type: "Insider Threat", note: "Widely used; entirely synthetic" },
    { name: "Balabit Mouse", type: "Behavioral", note: "Real user mouse dynamics data" },
    { name: "SPEDIA 2025", type: "Insider Threat", note: "More realistic than CERT — new 2025" },
  ];

  let gy = 1.78;
  for (const ds of goodDS) {
    s.addShape("roundRect", {
      x: 0.5, y: gy, w: 5.8, h: 0.72,
      fill: { color: "1A2D1A" },
      line: { color: "1A2D1A", width: 0 },
      rectRadius: 0.06,
    });
    s.addText([
      { text: ds.name + "  ", options: { bold: true, fontSize: 12, color: C.white } },
      { text: ds.type + "  |  ", options: { fontSize: 11, color: C.textSec } },
      { text: ds.note, options: { fontSize: 10, color: C.textSec } },
    ], {
      x: 0.65, y: gy + 0.08, w: 5.5, h: 0.56,
      fontFace: "Calibri", valign: "middle",
    });
    gy += 0.84;
  }

  // ── Right panel (AVOID) ───────────────────────────────────────────────────
  s.addShape("roundRect", {
    x: 6.6, y: 1.18, w: 6.55, h: 6.1,
    fill: { color: "1E0D0D" },
    line: { color: "1E0D0D", width: 0 },
    rectRadius: 0.1,
  });

  s.addText("✗ AVOID THESE", {
    x: 6.8, y: 1.3, w: 6.2, h: 0.38,
    fontSize: 14, fontFace: "Calibri", bold: true, color: C.danger, margin: 0,
  });

  const badDS = [
    {
      name: "NSL-KDD",
      nameColor: C.danger,
      lines: [
        { text: "Based on 1998 DARPA synthetic captures", color: C.white },
        { text: "No ransomware, C2, or modern attacks", color: C.textSec },
        { text: "Research community: do not use as primary benchmark", color: C.textSec },
      ],
    },
    {
      name: "CICIDS 2017/2018",
      nameColor: C.danger,
      lines: [
        { text: "IEEE 2022: widespread labeling errors", color: C.white },
        { text: "Class imbalance up to 10,000:1", color: C.textSec },
        { text: "Models trained here fail on real networks", color: C.textSec },
      ],
    },
    {
      name: "EMBER (original)",
      nameColor: C.orange,
      lines: [
        { text: "Baseline ROC-AUC: 0.9991 — too easy", color: C.white },
        { text: "No improvement possible to demonstrate", color: C.textSec },
        { text: "Superseded by EMBER2024", color: C.textSec },
      ],
    },
  ];

  let by = 1.8;
  for (const ds of badDS) {
    s.addShape("roundRect", {
      x: 6.75, y: by, w: 6.2, h: 1.6,
      fill: { color: "2D1515" },
      line: { color: "2D1515", width: 0 },
      rectRadius: 0.06,
    });
    s.addText(ds.name, {
      x: 6.9, y: by + 0.1, w: 5.9, h: 0.38,
      fontSize: 14, fontFace: "Calibri", bold: true, color: ds.nameColor, margin: 0,
    });
    const lineItems = ds.lines.map((l, i) => ({
      text: l.text,
      options: { breakLine: i < ds.lines.length - 1, fontSize: 11, color: l.color },
    }));
    s.addText(lineItems, {
      x: 6.9, y: by + 0.52, w: 5.9, h: 1.0, fontFace: "Calibri",
    });
    by += 1.75;
  }
}


// ════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — Conclusion & Q&A
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Decorative large circles right side
  const decCircles = [
    { x: 9.5, y: 0.5, r: 2.8 },
    { x: 10.5, y: 2.2, r: 2.0 },
    { x: 11.0, y: 4.0, r: 1.6 },
  ];
  for (const dc of decCircles) {
    s.addShape("ellipse", {
      x: dc.x, y: dc.y, w: dc.r * 2, h: dc.r * 2,
      line: { color: C.cyan, width: 1 },
      fill: { type: "none" },
    });
  }

  // Title
  s.addText("Conclusion", {
    x: 0.5, y: 0.45, w: 12.33, h: 0.6,
    fontSize: 36, fontFace: "Calibri", bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });

  // Divider
  s.addShape("rect", {
    x: 0.5, y: 1.12, w: 12.33, h: 0.025,
    fill: { color: C.cyan },
    line: { color: C.cyan, width: 0 },
  });

  // Three takeaway blocks
  const takeaways = [
    {
      y: 1.3,
      bg: "0D2A1A",
      circleColor: C.success,
      num: "1",
      numColor: C.white,
      titleColor: C.success,
      title: "DL IS GENUINELY USEFUL IN SECURITY",
      body: "IDS, malware detection, phishing, fraud, log analysis — DL outperforms classical ML with real commercial deployments.",
    },
    {
      y: 2.9,
      bg: "2A1A0D",
      circleColor: C.orange,
      num: "2",
      numColor: C.white,
      titleColor: C.orange,
      title: "BUT HONEST LIMITATIONS MATTER",
      body: "Datasets are often synthetic. Deepfake detection lags generation. FPR at scale unsolved. EU AI Act constrains facial recognition.",
    },
    {
      y: 4.5,
      bg: "0D1A2D",
      circleColor: C.cyan,
      num: "3",
      numColor: C.black,
      titleColor: C.cyan,
      title: "OUR INNOVATION DIRECTION IS SOUND",
      body: "Multimodal Transformer Encoder + Cross-Attention Fusion + Federated Learning for insider threats — technically grounded, honest about limitations, active research area.",
    },
  ];

  for (const tk of takeaways) {
    s.addShape("roundRect", {
      x: 1.5, y: tk.y, w: 10.3, h: 1.45,
      fill: { color: tk.bg },
      line: { color: tk.bg, width: 0 },
      rectRadius: 0.1,
    });
    // Number circle
    s.addShape("ellipse", {
      x: 1.65, y: tk.y + 0.35, w: 0.65, h: 0.65,
      fill: { color: tk.circleColor },
      line: { color: tk.circleColor, width: 0 },
    });
    s.addText(tk.num, {
      x: 1.65, y: tk.y + 0.35, w: 0.65, h: 0.65,
      fontSize: 16, fontFace: "Calibri", bold: true, color: tk.numColor,
      align: "center", valign: "middle", margin: 0,
    });
    // Title
    s.addText(tk.title, {
      x: 2.5, y: tk.y + 0.12, w: 9.1, h: 0.42,
      fontSize: 14, fontFace: "Calibri", bold: true, color: tk.titleColor, margin: 0,
    });
    // Body
    s.addText(tk.body, {
      x: 2.5, y: tk.y + 0.58, w: 9.1, h: 0.75,
      fontSize: 12, fontFace: "Calibri", color: C.white, wrap: true, margin: 0,
    });
  }

  // Final quote
  s.addText([
    { text: "\"The best AI security systems are not the ones that claim perfect accuracy —\n", options: { italic: true, fontSize: 14, color: C.textSec } },
    { text: "they are the ones that know where they fail.\"", options: { italic: true, fontSize: 14, color: C.textSec } },
  ], {
    x: 0.5, y: 6.1, w: 12.33, h: 0.85,
    fontFace: "Calibri", align: "center", valign: "middle",
  });
}


// ─── Write file ───────────────────────────────────────────────────────────────
const outPath = "/Users/feroz/Desktop/JYU_Content/deep-learning-for-developers/assignment-0/AI_DL_Security_Presentation.pptx";
pres.writeFile({ fileName: outPath })
  .then(() => console.log("✅ Saved:", outPath))
  .catch(err => { console.error("❌ Error:", err); process.exit(1); });
