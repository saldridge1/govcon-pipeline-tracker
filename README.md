# GovCon Pipeline Tracker

**Visualize bid opportunities · Pwin · ROI · Pipeline value**

> A data visualization tool for government contracting pipeline management — built in React, grounded in proposal discipline.

---

## What This Is

Government contracting success is built on math, not instinct. This tracker translates the core financial logic of GovCon pipeline management into an interactive data visualization — so every bid decision is grounded in Expected Value, ROI, and honest Pwin assessment rather than gut feeling.

Built as a data visualization learning project and portfolio credential by **Susan E. Aldridge**, Founder & Principal of Team Design Studios / Eternal Graphx LLC (Est. 1999).

---

## Features

- **Pipeline Dashboard** — Live stat cards showing active pipeline value, total Expected Value, top ROI opportunity, and won contracts
- **Stage Visualization** — Horizontal bar chart mapping total contract value across every pipeline stage (Evaluating → Capture → RFP Review → Writing → Submitted → Won)
- **Bid Cards** — Each opportunity displays a Pwin dial, E[V] and ROI mini-bars, status badge, and due date with overdue flagging
- **Add / Edit Modal** — Full opportunity intake with live ROI preview as you type
- **Sort Controls** — Sort by ROI Index, E[V], Contract Value, Pwin, or Due Date
- **Filter Controls** — Filter by any pipeline stage
- **Math Legend** — Plain-language explanation of every formula in the tool

---

## The Math

Every bid is evaluated across four variables:

| Variable | Definition |
|---|---|
| **Pwin** | Probability of winning — assessed honestly, never inflated |
| **E[V] — Expected Value** | `Pwin × Contract Value × 15% margin` |
| **Strategic Multiplier** | 1.0 = standard. Apply 1.1–1.5 for bids that open new agencies or build past performance |
| **Difficulty Scalar** | 1.0 = typical effort. Reduce for easy re-competes. Increase for new agencies or complex volumes |
| **ROI Index** | `E[V] × Strategic Multiplier ÷ Difficulty Scalar` |

> The opportunity with the highest ROI Index gets your resources first — even when the answer surprises you.

---

## Pipeline Stages

```
Evaluating → Capture → RFP Review → Writing → Submitted → Won
                                                         ↘ No-Bid
```

| Stage | What It Means |
|---|---|
| **Evaluating** | Running Three V's check — Valid, Viable, Value |
| **Capture** | Active intelligence gathering before RFP drops |
| **RFP Review** | Shredding stated and implied requirements |
| **Writing** | Proposal in active development |
| **Submitted** | Awaiting decision |
| **Won** | Contract awarded |
| **No-Bid** | Passed — resources protected for better opportunities |

---

## Tech Stack

- **React** — Component architecture
- **Recharts / SVG** — Custom data visualization (Pwin dials, pipeline bars, mini-bars)
- **DM Sans + Playfair Display + DM Mono** — Typography system
- **Vite** — Build tooling

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/saldridge1/govcon-pipeline-tracker.git
cd govcon-pipeline-tracker

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

---

## Live Demo

[**Launch GovCon Pipeline Tracker →**](https://saldridge1.github.io/govcon-pipeline-tracker)

---

## Project Context

This project is part of an active data visualization learning practice — building skill at the intersection of design, data, and React development.

Related work:
- [Accessibility Design Checklist — WCAG 2.1 AA](https://www.figma.com/community/file/1622719524143767993) — Free Figma Community resource
- [Accountability by Design](https://github.com/saldridge1/benchline-framework) — Proposal-grade work breakdown framework
- [Portfolio](https://docsend.com/view/s/9bzhycnqab7k92nq) — Full practice documentation
- [LinkedIn](https://www.linkedin.com/in/susanealdridge/) — Professional profile

---

## About

**Susan E. Aldridge**
Founder & Principal, Team Design Studios / Eternal Graphx LLC (Est. 1999)
Staff UX Research & Design | AI Leadership | Enterprise Product Design & AI Integration

*Bentonville, AR · Open to relocation*

---

*Built in collaboration with AI. Directed entirely by human judgment.*
