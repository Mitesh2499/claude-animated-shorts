# X01: 30 off 30, the 2024 T20 World Cup final death overs

Built with `x-data-carousel` on 2026-11-25. Cards: `out/01..08_*.png` (1080x1350). Thread: `out/thread.md` (3 posts: 4 + 4 images + a sources reply).

## Data (raw → derived)
- **Scorecard** (Wikipedia match page, matching ESPNcricinfo): India 176/7, South Africa 169/8.
  - India bowling: Bumrah 4-0-18-2, Arshdeep 4-0-20-2, Hardik 3-0-20-3, Kuldeep 4-0-45-0, Jadeja 1-0-12-0, Axar 4-0-49-1. SA extras: b 1, lb 4.
  - Klaasen 52 (27, 2×4, 5×6).
- **Fall of wickets** (SA): 151/5 (Klaasen, 16.1), 156/6 (Jansen, 17.4), 161/7 (Miller, 19.1), 168/8 (Rabada, 19.5).
- **Chase path:**
  - 30 needed off 30 → **147/4 after 15**.
  - "4 wickets for 18 runs in the last 4 overs" (Wikipedia) → **151 after 16**.
  - 161/6 after 19 and Arshdeep's 19th went for 4 → **157 after 18**.
  - Overs 17–18 = 6 combined. The split isn't published, so it's shown grouped and labelled.
- **Bowlers of specific overs** come only from dismissals: Klaasen c Pant b Pandya at 16.1 → Pandya bowled the 17th; Jansen b Bumrah at 17.4 → Bumrah the 18th; Hardik the 20th (sources).
- **Checks in xcarousel.json** (all pass): the phases sum to 169; the last 4 overs = 18; India bowlers + 5 byes/leg-byes = 169; SA bowlers = 176; after 18 = 157.

## Hooks considered
1. **"30 off 30. They got 22."** ← chosen: famous moment, a number contrast, no context needed
2. "4 wickets for 18 runs: India's last four overs"
3. "Klaasen 52 off 27. Then the run rate halved."
4. "Bumrah 4-0-18-2: the best economy on either side"
5. "How South Africa lost a won final"

## Thread
- Post 1: cover, ledger, run-rate split, economy leaderboard.
- Post 2 (reply): Klaasen, Hardik and Bumrah cards, plus the end card and a reply prompt.
- Post 3 (reply): sources and method.
