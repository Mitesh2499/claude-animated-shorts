# Vocals: one TTS line per letter ("B, is for banana!"), saved with edge-tts WORD BOUNDARIES. song.py cuts each line
# into letter / "is for" / word and puts each piece on its own beat. Whole lines sound far more natural than
# single-syllable clips (isolated "A!" comes out as "hey", isolated "Hat!" loses its t).
# Run from the project root:  py -3.10 audio/gen_vocals.py [--force]
import asyncio, inspect, json, os, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "audio", "vocals")
SONG = json.load(open(os.path.join(ROOT, "song.json"), encoding="utf8"))
VOICE = SONG.get("voice", "en-US-AnaNeural")   # Ana = bright child voice; en-GB-MaisieNeural = British child
RATE, PITCH = SONG.get("voiceRate", "-5%"), SONG.get("voicePitch", "+10Hz")
KW = {"boundary": "WordBoundary"} if "boundary" in inspect.signature(edge_tts.Communicate).parameters else {}

async def one(i, it, force):
    mp3, js = os.path.join(OUT, f"line{i}.mp3"), os.path.join(OUT, f"line{i}.json")
    text = f"{it.get('say', it['letter'])}, is for {it['word'].lower()}!"
    if os.path.exists(mp3) and os.path.exists(js) and not force and json.load(open(js))["text"] == text:
        return
    for attempt in range(5):   # the service randomly returns NoAudioReceived: retry, then drop pitch
        try:
            c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH if attempt < 3 else "+0Hz", **KW)
            words = []
            with open(mp3, "wb") as f:
                async for ch in c.stream():
                    if ch["type"] == "audio":
                        f.write(ch["data"])
                    elif ch["type"] == "WordBoundary":
                        words.append({"w": ch["text"], "t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7})
            if len(words) < 4:
                raise RuntimeError(f"expected 4+ word boundaries, got {words}")
            json.dump({"text": text, "words": words}, open(js, "w"), indent=1)
            print("ok", i, text, [(w["w"], round(w["t"], 2)) for w in words]); return
        except Exception as e:
            print("retry", i, attempt, type(e).__name__, e); await asyncio.sleep(1.5)

async def main():
    os.makedirs(OUT, exist_ok=True)
    for i, it in enumerate(SONG["items"]):
        await one(i, it, "--force" in sys.argv)

asyncio.run(main())
