# Lessons from "The anatomy of a Boss Baby innings" (Rajasthan Royals, Raw/, 135 s)

What we learned from the best-edited stats reel in Raw/, and how to apply it in this skill. Measured on 2026-11-25:
- 1080x1920 @ 25 fps, English voice-over at 2.6 words/s, 347 words.
- Hard visual cuts at 6.0, 19.7, 45.0, 75.3, 90.5 and 124.7 s. Everything between them is continuous motion inside one "page".

## 1. Scripting: why it doesn't feel like a stats bulletin

| Device | In the reel | How to reuse it |
|---|---|---|
| **Borrowed-anxiety cold open** | "You know how people are worried about AI taking their jobs? Well, imagine being a bowler." | Open on a topic the whole feed already feels, then pivot to your subject in one line. |
| **Wordplay / assembly gag** | The name is built from tiles: V (for video game) + AI + BHAV ("a state of being" → "a state of absolute destruction"). | Turn the subject's name, a ticker or a title into a joke the viewer "builds" with you (`tiles3d` + dictionary card). |
| **Deadpan Q&A** | "Is this how Sanskrit works? **No.** Is this how cricket is supposed to work? **Also no.**" | Use 2 rhetorical questions with stamped answers (`stampQA`). The second answer escalates ("Also no."). |
| **Outcome first, then "Let's rewind"** | Wicket in the 13th over, then "needed just 5 more… he scored 204 of the 250", then the counter rewinds 204 → 0. | Show the shocking end state, then rewind and explain how it happened (`progress` → `rewind`). |
| **Understatement humour** | "On paper: not ideal. Except…", "this was him taking it easy", "apparently dissatisfied with the speed of that", "same syllabus", "the boundary rope was merely a decorative element", "talk about conserving energy". | Each big number gets one dry, deadpan line. Never use hype words ("insane", "crazy"). |
| **Translate every number** | "28 of 53 went for six" → "a delivery was more likely to go for six than not". "168 + 28 of 204" → "96 % without needing to run". | After each number, say what it MEANS in everyday terms (a probability, a share, half the time). |
| **Comparison to a record** | "Previous world record 103 balls. He needed 52. Almost half the time." | Put the old benchmark first, then the new number, then the ratio in words. |
| **Repetition run** | "Fastest 50 – Vaibhav. Fastest 100 – Vaibhav. Fastest 150 – Vaibhav. Fastest double – *also* Vaibhav. Most sixes… you know the answer by now." | Use 4-5 records with the same answer, a "?" placeholder each time, and break the pattern on the last one (`recordStack`). |
| **Meta joke** | "At least our graphic designer only needed to download one photo." | One fourth-wall line near the end resets attention before the payoff. |
| **Callback ending** | It returns to the AI opener: "AI is trained on existing data. This one makes existing data irrelevant." Then "Built different. Quite literally." (the name again). | The last beat answers the first line. No "follow for more" is needed if the loop lands (we still add our follow card). |

Rhythm:
- Lines are short: 4-9 words, 1 idea each.
- A pause (0.3-0.8 s) comes before each punchline, and the punchline gets its own visual hit (stamp, colour flip, giant number).

## 2. Editing grammar

- **One page per act, not one slide per sentence:**
  - Inside an act, text and objects *accumulate*. The new line builds under the old one, and the old line dims to grey.
  - Hard cuts happen only between acts, about every 15-30 s.
- **Kinetic headline = the voice:**
  - Words appear as they're spoken. The key word lands in the accent colour at 1.5-2× size ("bowler.", "WICKET", "taking it easy.").
  - We keep the karaoke subtitles in the 56-65 % band and put the punchline word in the headline.
- **Mono `// kicker`:**
  - A code-comment label sits on top of each act: `// SOME ASSEMBLY REQUIRED`, `// FACT CHECK`, `// THE SCORECARD SAYS`, `// THE ANATOMY OF HIS INNINGS`, `// BALLS FACED`, `// WHERE 204 RUNS CAME FROM`, `// LIST A WORLD RECORDS`, `// BACK TO THE WORDS`.
  - It's witty, small and blue. It works as chapter navigation without stealing focus. Use `"kicker"` on a section.
- **Tiny mono annotations** are jokes for re-watchers: "↑ V FOR VIDEO GAME", "SCORED BY ONE (1) BATTER", "BOUNDARY ROPE (DECORATIVE)", "VAIBHAV_FACE.PNG · DOWNLOADS: 1".
- **Palette:**
  - Warm paper (#F2EEE9) with a soft white glow and a faint grid; navy ink #141B4D.
  - ONE team colour (magenta) for "his" numbers and ONE secondary (royal blue) for context and benchmarks; grey for "everything else".
  - Use `"theme": {"bg": "#F2EEE9", "paper": "1", ...}`.
- **Transitions:** only 4 kinds, always motivated.
  1. Colour flash (2-4 frames of a full-screen accent) on a hard topic change: `"enter": "flash"`.
  2. Zoom-through: the camera pushes into an object until it fills the frame (the name tile → magenta), then the next act: `"exit": "zoom"` or `"exit": "dive"`.
  3. Rewind counter: the "time travel" between outcome and explanation (`rewind` + `"sfx": rewind`).
  4. Drop-in: the new act's objects fall in from above with a spring: `"enter": "drop"`.
- **Nothing is ever static:** every number counts up, every bar fills, and every object springs in. Holds last ≤ 1.5 s, and the camera keeps drifting.

## 3. The "sudden 3D in 2D" trick (and how we fake it)

The reel is a flat 2D infographic, but a few objects are real 3D for one moment: cricket balls, tall bars and keycap letter tiles. The contrast is what makes it feel premium. Rules:
1. **Only physical things get depth** (a ball, a bar, a tile). Text, cards and charts stay flat.
2. **Shading + contact shadow + seam** make a circle read as a ball:
   - radial gradient lit from the upper left;
   - a dark rim;
   - a white or blue seam curve rotated randomly per ball;
   - a soft floor shadow offset to the right.
3. **Perspective rows:** the grid lies on a tilted floor (camera pitch 45-55°), so back rows are smaller and higher.
4. **The camera moves:**
   - slow yaw drift (±4°);
   - bars start as flat tiles seen from above (pitch 84°) and rise while the camera swings down to a low side view (pitch 12°);
   - the act ends by diving into the balls.

   Moving the camera over still objects is what convinces the eye it's 3D.
5. **Unit visualisation:** one ball per ball faced. Count them in (with clack SFX), recolour the subset, lasso it, and show the share bar computed from n/total.

Implementation: `templates/data-story/src/scenes_depth.tsx`.
- `proj()` is a 30-line perspective camera.
- `fit()` frames the final pose once, so nothing jitters.
- `Ball`, `Box` (back-face culled, shaded faces, affine-mapped label) and `BoxShadow` are plain SVG, so there's no WebGL and renders are fast.

## 4. What we deliberately do differently
- We keep Instagram safe zones and karaoke subtitles (the user's rule). The reel's top-of-frame text would sit under the Reels UI.
- Its 135 s length is above our 45-70 s target. Use the arc, but cut to 6-8 beats.
- We never copy the team's branding, players' photos or the reel's exact jokes. Learn the device, write our own lines, and use @MiteshJourney.
