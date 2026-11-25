# Design DNA learned from Raw/XCarousel (11 cricket data cards, 960x1200, 2026-11-25)

A cricket-ratings account posting match-day cards on X. We learn the system, not their artwork, logo, rating mark or photos.

## What the references do
- **Canvas:** 4:5, warm grey paper with fine grain. A brand wordmark top-left ("w" mark + name + small spaced subtitle); the series label top-right in spaced teal caps ("IPL 2027 · RCB WATCH"). Footer: a hairline, then handle left and website right.
- **Context chips** under the header: a blue chip for competition + date, a grey chip for the fixture ("SMAT · 24 NOV" | "DELHI V TAMIL NADU"). So every card stands alone when it's reposted out of the thread.
- **Team-colour hero panel** (KKR purple, RCB red, CSK maroon) with a white bold name, the player photo cut out on the right, and "Photo: IPL" credit.
- **Frosted stat card** over the panel:
  - avatar, short name, "team · match rating"
  - a big rating with the brand mark, coloured by tier (blue 9+, teal or green 7-8, orange 5-6, red < 4)
  - ▲ highlight bullets ("16 dots in 24 balls", "5.25 an over in a match scored at 11.3": a number *with context*)
  - a stat row (W R O ECON DOTS / R B 4s 6s SR) with big numerals and tiny caps labels
  - **ball-by-ball chips** per over (· dot, numbers, 4 in blue, W black, wd yellow)
  - **phase boxes** (Powerplay 1-1 1 ov / Middle 2-20 3 ov / Death)
  - a **form strip** ("His SMAT so far": rating per match, TODAY boxed in red, average in N)
  - a result line with team badges and scores, then an "EXPLAIN THIS RATING ›" button (it drives replies and clicks)
- **Team cover = leaderboard:** "RCB watch: 8 retained men played today", rows with avatar, name, fixture, figures and rating, plus "• LIVE" tags.
- **Story card:** giant figures ("1-13") behind the player, a caption box, a mini comparison of teammates' ratings, and one red sentence of context.
- **Over-by-over bars:** "His 2 overs: 13 runs", with his overs in team colour and everyone else grey; the subtitle gives the comparison ("everyone else 127 off 9 overs, 14 an over") and the method note ("byes and leg byes left out").
- **End card:** a huge brand mark + "10 / PERFECT SCORE 10/10", "Follow the duel", 3 square-bullet value props ("18,000+ players"), the URL and a Follow button.

## Why it works on X
- A dense card **rewards a tap-to-expand**. X crops multi-image previews, so the headline and the key number sit high and large.
- Every number carries a comparator: vs match rate, vs teammates, vs his last 5.
- The rating system is the IP: one consistent scale and colour code across thousands of posts = brand recognition.
- Posts are grouped by **series** (team watch, duel, over-by-over), so followers know what they'll get.

## Our original system (templates/x-carousel)
| Element | Ours |
|---|---|
| Paper | cool grey #ECEEF2 + SVG grain (or `theme: dark` navy #0B1220) |
| Header | logo tile (brand/logos/logo.png) + **MiteshJourney** + spaced "DATA DESK"; series top-right in #0369A1 |
| Mark | original 3-bar "data" glyph in front of every badge value |
| Tones | good #16A34A / mid #D97706 / bad #DC2626, set by per-card thresholds (`tone`) |
| Fonts | Sora 800 numerals/headlines, Inter body (embedded) |
| Team colours | `teams{}` in the json, never copied from a club's trademark artwork; we only use colours |
| No photos by default | initials avatars + a giant translucent stat ("52", "3-20") as the hero; user-owned photos via `photo` |
| Upgrades | numbers computed from raw inputs (economy, SR, boundary %, required rate, run-rate splits), `checks` that fail the build if totals don't reconcile, a ledger layout that recalculates the chase after every phase, honest method/source lines, a thread package with the X limits enforced |
