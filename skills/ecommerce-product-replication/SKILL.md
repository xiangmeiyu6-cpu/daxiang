---
name: ecommerce-product-replication
description: Analyze Taobao, Tmall, JD, Douyin, Pinduoduo, or other ecommerce product links and turn the evidence into a complete competitor teardown and a new-product operating strategy. Use when the user provides a product link, screenshots, reviews, product files, or brand information and asks for 商品分析、竞品拆解、复刻运营思路、产品定位、目标人群、组品定价、标题、主图、详情页、促销、投放素材、短视频或种草方向。
---

# Ecommerce Product Replication

Turn a reference product into an evidence-backed analysis and an original operating system for the user's product. Reuse strategy patterns, not protected brand assets, logos, or unverifiable claims.

## Required inputs

Collect what is available:

- Reference product URL, screenshots, page export, or product name.
- User product: brand, category, formula/material, specification, cost, price, stock, and packshot.
- Target platforms and commercial goal.
- Planned SKU bundle, gifts, promotion, and target audience.
- Rights to use any supplied visual assets or reference style.

Ask only for facts that block the next irreversible step. Record missing facts and assumptions instead of repeatedly questioning the user.

## Workflow

### 1. Initialize the delivery

Run `scripts/new_delivery.ps1` when filesystem output is useful. Keep analysis, strategy, evidence, main images, and detail images separate.

### 2. Acquire source evidence

- For a product page already open in Codex, use the in-app browser control skill first.
- For login-gated Taobao, Tmall, JD, or Douyin pages, inspect the user's visible authenticated page. Never read cookies, passwords, local storage, or unrelated tabs.
- If browser control is unavailable, try the provided URL with available web tools. Ask for screenshots or exported text only after access attempts fail.
- Capture title, price/SKU, sales cues, promotions, main images, detail-page order, shop identity, reviews, Q&A, and visible trust evidence.
- Browse current official sources for laws, platform policies, ingredient eligibility, or claims that may have changed.

Do not infer inaccessible review sentiment, sales volume, conversion, advertising performance, or certification.

### 3. Build the evidence ledger

Tag every important claim as:

- `Page fact`: directly visible on the reference page.
- `User fact`: supplied by the user.
- `External fact`: supported by a cited source.
- `Inference`: reasoned conclusion, with rationale.
- `Unknown`: missing or inaccessible.

Include source URL or screenshot/file name and confidence. Resolve contradictions before final recommendations.

### 4. Produce the competitor teardown

Read `references/analysis-framework.md`. Cover positioning, audience, needs, scenarios, price band, page strategy, review language, competitiveness, advertising value, conversion barriers, and reusable patterns. Distinguish what to reuse, adapt, test, or avoid.

### 5. Produce the user's operating strategy

Read `references/strategy-framework.md`. Translate the analysis into:

- Product identity and one-sentence positioning.
- Target audience and scenario priorities.
- SKU ladder, pricing logic, gifts, and promotion mechanics.
- Search title and keyword hierarchy.
- Five main-image scripts.
- A 10-14 screen detail-page structure.
- Douyin ad, short-video, livestream, and seeding-content angles.
- Launch experiments, metrics, and decision rules.

Make the strategy original. Do not copy the reference brand name, packaging, proprietary text, certificates, endorsements, or distinctive trade dress unless the user owns those rights.

### 6. Run compliance review

Read `references/compliance-checklist.md`. Verify current rules from authoritative sources for regulated, health-adjacent, food, supplement, cosmetic, medical, infant, or financial categories.

Separate:

- Internal consumer insight language.
- Public product-page language.
- Paid-ad language.

Never turn a consumer pain point into an unsupported product efficacy claim.

### 7. Generate visual deliverables

When the user requests visual production and has supplied usable product imagery or approved concept rendering:

1. Create one stable product master image first.
2. Generate five square main images from that master.
3. Generate the approved detail-page sequence in vertical format.
4. Use exact Chinese copy from the strategy; keep text short and mobile-readable.
5. Check product count, price, specification, ingredient identity, Chinese text, and forbidden claims in every image.
6. Mark AI output as concept artwork until replaced by final packshots, labels, certificates, and real product photography.

If identity, packaging, offer, or legal claims are unconfirmed, generate layout concepts with explicit placeholders rather than inventing facts.

### 8. Validate the package

Before delivery:

- Confirm all requested sections exist.
- Confirm facts and inferences are visibly separated.
- Confirm SKU quantities and arithmetic.
- Confirm title, main images, detail page, and ad angles tell the same positioning story.
- Confirm image files decode and use platform-appropriate dimensions.
- List unresolved evidence gaps and pre-launch replacement items.

## Default output

Use `assets/report-template.md` as the analysis document structure. Deliver:

1. One complete Markdown analysis and strategy document.
2. One evidence ledger with citations or source references.
3. Main-image and detail-page copy tables.
4. Generated images when requested and sufficiently grounded.
5. A short executive summary with the three highest-impact actions and three largest risks.

Do not stop at generic advice. Tie each recommendation to evidence, a consumer mechanism, a page placement, and a measurable test.
