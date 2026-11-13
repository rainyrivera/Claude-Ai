import re,json,sys
from pocketsphinx import Decoder
d=sys.argv[1]
raw=open(d+'/script.txt').read()
disp=raw.replace('…','...').split()
norm=[]
for w in disp:
    parts=re.sub(r"[^a-z'\-]","",w.lower()).split('-')
    norm.append([p for p in parts if p])
flat=[p for ps in norm for p in ps]
dec=Decoder(samprate=16000)
dec.add_word("glute","G L UW T",True)
dec.add_word("rous","R AW S",True)
dec.add_word("glutes","G L UW T S",True)
for w in set(flat):
    if dec.lookup_word(w) is None: print("MISSING",w)
dec.set_align_text(' '.join(flat))
dec.start_utt(); dec.process_raw(open(d+'/voice.raw','rb').read(),full_utt=True); dec.end_utt()
segs=[(s.word,s.start_frame/100,(s.end_frame+1)/100) for s in dec.seg() if s.word not in('<s>','</s>','<sil>','[NOISE]')]
print(len(segs),len(flat))
i=0;out=[]
for w,ps in zip(disp,norm):
    seg=segs[i:i+len(ps)];i+=len(ps)
    out.append({'w':w,'s':seg[0][1],'e':seg[-1][2]})
json.dump(out,open(d+'/words.json','w'),indent=0)
for o in out[:12]+out[-8:]: print(o)
