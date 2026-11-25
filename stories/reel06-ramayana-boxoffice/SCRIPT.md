# Reel 06 — रामायण विदेश में आगे, फिर भी वर्ल्डवाइड रेस में पीछे क्यों?

Skill: `kinetic-listicle-short` (scene sections) · 1080x1920 · 67.8 s · voice hi-IN-MadhurNeural +25 % · Devanagari captions (Noto Sans Devanagari) · @MiteshJourney · CTA: prediction poll + follow
Data: Sacnilk tracking as supplied, cutoff 22 Nov 2026 (18 days). Estimates, not audited. Source tag on every chart.

| # | Scene | Voice-over (spoken) | Visual |
|---|---|---|---|
| 1 | raceHook | रामायण विदेशों में बाहुबली टू और धुरंधर टू से आगे है, फिर भी वर्ल्डवाइड रेस में पीछे क्यों? | Ramayana poster centre, rivals either side; "विदेश में #1" badge; then #1/#2/#3 worldwide ranks + STILL BEHIND? stamp |
| 2 | worldBoard | वर्ल्डवाइड: धुरंधर टू अठारह सौ तेरह करोड़, बाहुबली टू सत्रह सौ अट्ठासी, रामायण सोलह सौ तिरानवे करोड़। | Leaderboard bars (zero-based) with posters, numbers count up on their words |
| 3 | gapZoom | बाहुबली टू से पचानवे करोड़ पीछे, धुरंधर टू से एक सौ बीस करोड़। | Zoomed ruler 1,650–1,850 (labelled), red gap brackets count to −94.56 / −119.89 |
| 4 | indiaNet | असली फर्क भारत में है: रामायण नौ सौ तैंतालीस करोड़ नेट, बाहुबली टू एक हज़ार तीस, धुरंधर टू ग्यारह सौ उनचास। | India-net vertical bars, "भारत में सबसे पीछे" |
| 5 | overseasFlip | लेकिन विदेश में कहानी उलटी: रामायण पांच सौ सड़सठ करोड़, धुरंधर टू चार सौ अड़तीस, बाहुबली टू तीन सौ इकहत्तर। | Spinning globe, overseas bars, Ramayana #1 with trophy |
| 6 | weekTrend | ट्रेंड देखिए: पहला हफ्ता पांच सौ पैंसठ करोड़, दूसरा दो सौ निन्यानवे, यानी सैंतालीस प्रतिशत गिरावट। | Week 1 (8 days) / Week 2 / Week 3 (only 3 days, dashed) bars, red −47% arc |
| 7 | weekendLine | पर तीसरे वीकेंड में शुक्रवार पंद्रह पॉइंट सात पांच से रविवार पैंतीस पॉइंट छह करोड़ तक उछाल, हालांकि पिछला रविवार पचहत्तर करोड़ था। | Fri→Sat→Sun rising line; last Sunday ₹75 Cr as a red dashed ghost line |
| 8 | scenarioBars | हमारे मॉडल के तीन सीनेरियो: सत्रह सौ नब्बे, अठारह सौ सत्तर, और स्ट्रॉन्ग होल्ड में उन्नीस सौ चौहत्तर करोड़। | Zoomed bars from today's 1,693.5 crossing the Baahubali 2 / Dhurandhar 2 lines toward the 2,000 line; "our estimates, not trade predictions" |
| 9 | twoKGauge | यानी दो हज़ार करोड़ पहुंच में है, लेकिन सिर्फ मज़बूत होल्ड के साथ। | ₹2,000 gauge fills to 1,693.5, "₹306.5 करोड़ और चाहिए", strong-hold arc to ≈1,974 |
| 10 | predictPoll | आपका प्रेडिक्शन? अठारह सौ, उन्नीस सौ, या दो हज़ार पार? कमेंट कीजिए! | Poll card (no fake results): ₹1,800 / ₹1,900 / ₹2,000+, cursor hover, "कमेंट करें 👇" |
| 11 | follow | फॉलो कीजिए मितेश जर्नी। | Follow card |

## Data checks (all from the supplied Sacnilk table)
- Gaps: 1,788.06 − 1,693.50 = 94.56; 1,813.39 − 1,693.50 = 119.89; India net 1,149.30 − 942.75 = 206.55.
- Weeks: 564.60 + 299.15 + 79 = 942.75 ✓ (Week 1 is 8 days, Week 3 only 3 days; both labelled). Drop 1 − 299.15/564.60 = 47 %.
- Saturday D17 ≈ 27.65 is derived (79 − 15.75 − 35.60), shown with "≈" and noted in the source line.
- Scenarios (user's model, India net × 1.195 + overseas): 1,790.2 / 1,869.95 / 1,973.6 → 1,790 / 1,870 / 1,974 (brief's "1,975" rounded to 1,974 to match its own table).
- Conservative 1,790 passes Baahubali 2 (1,788) by ~2 but stays under Dhurandhar 2 (1,813).

## Posters
Drawn title cards are used until the user drops `ramayana.jpg`, `baahubali2.jpg`, `dhurandhar2.jpg` into `brand/cards/`; build.py then lists them in `src/posters.json` and the scenes draw them automatically (re-run build + render).
