import asyncio, edge_tts, sys
RATE = {"k": "+12%", "s": "+6%", "g": "-2%"}
LINES = [
 ("k1","नब्बे दिन। रोज़ पानी दिया। फिर भी कुछ नहीं उगा।","-6Hz"),
 ("k2","भगवान... बस एक जवाब दे दो।","-6Hz"),
 ("s1","बीज को अंधेरे में कौन बताता है कि वो पेड़ बनेगा?","-12Hz"),
 ("k3","...कोई नहीं।","-6Hz"),
 ("s2","फिर भी वो जड़ें फैलाता रहता है, पार्थ।","-12Hz"),
 ("k4","पार्थ? मेरा नाम तो कार्तिक है...","-4Hz"),
 ("g1","जिसे तू अंत समझ रहा है, वही तेरी जड़ों का समय है।","-14Hz"),
 ("g2","कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।","-14Hz"),
 ("g3","कर्म तेरा है, फल मेरा।","-14Hz"),
 ("g4","और सुन... हर सुबह जब तू पानी देता था, मैं इसी चौखट पर बैठा था।","-14Hz"),
 ("g5","हर अंधेरा तोड़ने नहीं आता... कभी-कभी जड़ें देने आता है।","-14Hz"),
]
async def main():
    only = sys.argv[1:]
    for id, t, p in LINES:
        if only and id not in only: continue
        for attempt in range(5):
            try:
                text = t.replace("...", "।") if attempt >= 2 else t   # edge-tts sometimes rejects a leading ellipsis
                await edge_tts.Communicate(text, "hi-IN-MadhurNeural", rate=RATE[id[0]], pitch=p if attempt < 3 else "+0Hz").save(f"voice/{id}.mp3")
                print("ok", id, attempt); break
            except Exception as e:
                print("retry", id, attempt, type(e).__name__); await asyncio.sleep(1.5)
asyncio.run(main())
