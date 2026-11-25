# Carousel 01: The AI Trust Gap (strategy + QA)

Built with the `instagram-carousel` skill on 2026-11-25. Slides: `out/01..08_*.png` (1080x1350). Publishing package: `out/post.md`.

## 1. Research (verified)
| Claim on slides | Value | Source |
|---|---|---|
| Use or plan to use AI tools | 84% | Stack Overflow Dev Survey 2025 (49K+ devs, 29 Jul 2025) |
| Distrust vs trust AI accuracy | 46% vs 33%, 3% highly trust | SO survey 2025, AI section |
| Distrust 2024 → 2025 | 31% → 46% | InfoWorld coverage of SO 2024/2025 |
| Top frustration "almost right, but not quite" | 66% | SO survey 2025 |
| Debugging AI code takes longer | 45% | SO survey 2025 |
| METR RCT: expected / felt / measured | +24% / +20% / −19% (16 devs, 246 tasks) | METR, 10 Jul 2025; arXiv 2507.09089 |

Note: some outlets quote trust as 29% (SO blog, different answer grouping). We use SO's own "46% distrust vs 33% trust" wording. METR is labelled a small early-2025 snapshot on slide 6 (credibility over virality).

## 2. Hooks considered
1. **"84% of developers are adopting AI. Only 33% trust it."** ← chosen: a real contradiction, two numbers, readable in the feed, and the 84% is a broad-reach keyword
2. "Developers felt 20% faster with AI. They were 19% slower." (stronger shock, but it rests on a 16-person study, so it is held back for slide 5)
3. "The #1 AI coding problem isn't wrong code. It's almost-right code."
4. "Trust in AI coding tools just dropped 15 points in a year."
5. "Is AI making you a slower developer?"

## 3. Strategy
- Audience: working developers and CS students (India + global) who use Copilot, Cursor or Claude.
- Format: data-driven breakdown that ends in a practical checklist.
- Objective: shares (a debate-worthy contradiction), saves (slide 7 checklist), comments (FASTER/SLOWER/SAME poll), follows (positioning: "evidence-based, no hype").
- Arc: hook → scoreboard → trend → frustration → surprise (METR) → fair caveat → payoff (habits) → question + follow.
- Business angle: "evidence-based AI breakdowns" positions @MiteshJourney for dev-tool sponsorships (AI code review, testing tools) without a hard sell.

## 4. QA (build.mjs report)
All 8 slides pass: no overflow, minimum text 24 px, ≤ 67 words per slide, every chart labelled with its source, and alt text on every slide.
