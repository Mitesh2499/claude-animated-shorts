# One source of truth: shot starts + voice line starts (seconds) -> src/timeline.json (frames at 30 fps) used by Remotion and mix.py
import json
info=json.load(open('voice_info.json')); FPS=30
SHOTS=[("court",5.4),("sky",3.0),("dig",2.0),("seed",2.0),("stranger",4.5),("smile",6.1),("hero",9.8),("tears",6.4),("sprout",5.3),("black",2.4)]
VOICE=[("k1",0.30,"k"),("k2",5.65,"k"),("s1",12.65,"s"),("k3",16.05,"k"),("s2",17.15,"s"),("k4",20.05,"k"),
       ("g1",23.65,"g"),("g2",27.85,"g"),("g3",30.80,"g"),("g4",33.15,"g"),("g5",39.55,"g")]
t=0; shots=[]
for n,d in SHOTS: shots.append(dict(id=n,from_=round(t*FPS),dur=round(d*FPS),t0=round(t,2),t1=round(t+d,2))); t+=d
voice=[dict(id=i,t0=s,t1=round(s+info[i],2),who=w) for i,s,w in VOICE]
for v in voice: assert v['t1']<=t, v
# sanity: voice lines must not overlap
for a,b in zip(voice,voice[1:]): assert a['t1']<=b['t0']+1e-6,(a,b)
json.dump(dict(fps=FPS,total=round(t*FPS),shots=shots,voice=voice),open('../src/timeline.json','w'),indent=1)
print('total s',t, 'frames',round(t*FPS)); [print(s) for s in shots]
