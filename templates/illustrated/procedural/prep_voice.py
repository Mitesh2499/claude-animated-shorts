# trim silence, normalise, write voice_info.json (speech duration per line)
import soundfile as sf,glob,os,numpy as np,json
info={}
for f in sorted(glob.glob('wav/*.wav')):
    d,sr=sf.read(f); a=np.abs(d); idx=np.where(a>0.02)[0]; s=max(0,idx[0]-int(.03*sr)); e=min(len(d),idx[-1]+int(.12*sr))
    x=d[s:e]; x=x/np.abs(x).max()*0.9
    n=os.path.basename(f)[:-4]; sf.write(f'trim_{n}.wav',x,sr); info[n]=round(len(x)/sr,2)
json.dump(info,open('voice_info.json','w'),indent=1); print(info, 'sum',round(sum(info.values()),1))
