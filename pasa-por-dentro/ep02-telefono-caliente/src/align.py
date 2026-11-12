import subprocess, re, json, sys
A='voz.mp3'
txt=open('../guion.md').read().split('## Guion para voz (texto limpio)')[1].split('## Fuentes')[0].strip()
paras=[p.strip() for p in txt.split('\n\n') if p.strip()]
out=subprocess.run(['ffmpeg','-hide_banner','-i',A,'-af','silencedetect=noise=-38dB:d=0.25','-f','null','-'],capture_output=True,text=True).stderr
ss=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]; se=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',A],capture_output=True,text=True).stdout)
segs=[];cur=0.0
for a,b in zip(ss,se):
    if a-cur>0.05: segs.append((cur,a))
    cur=b
if dur-cur>0.1: segs.append((cur,dur))
segs=[(s,e) for s,e in segs if e-s>0.12]
def syl(w):
    w=w.lower(); g=re.findall(r"[aeiouáéíóúü]+",w); n=0
    for x in g: n+= 1 if len(x)==1 else (1 if re.fullmatch(r"[iuü]?[aeoáéó][iu]?|[iu][iu]|i?[aeo]u?",x) else len(x))
    return max(1,n)
words=[];pend=[]
for pi,p in enumerate(paras):
    for w in p.split():
        words.append({'w':w,'p':pi,'syl':syl(re.sub(r'[^\wáéíóúüñ]','',w) or 'a')})
W=len(words); S=len(segs)
def brk(i): # boundary allowed after word i
    w=words[i]['w']; 
    if i==W-1 or words[i+1]['p']!=words[i]['p']: return 0
    if re.search(r'[.,:;?!…"]$',w): return 0.3
    return 1.5
cs=[0]
for w in words: cs.append(cs[-1]+w['syl'])
tot=sum(e-s for s,e in segs); r=tot/cs[-1]
import math
INF=1e18
dp=[[INF]*(W+1) for _ in range(S+1)]; bk=[[0]*(W+1) for _ in range(S+1)]
dp[0][0]=0
for k in range(1,S+1):
    d=segs[k-1][1]-segs[k-1][0]
    for j in range(1,W+1):
        best=INF;bj=0
        for i in range(max(0,j-70),j):
            if dp[k-1][i]>=INF: continue
            n=cs[j]-cs[i]; c=((d-r*n)**2)/(r*n+0.3)+brk(j-1)
            v=dp[k-1][i]+c
            if v<best: best=v;bj=i
        dp[k][j]=best;bk[k][j]=bj
# allow skipping? require all segments used
j=W;assign=[]
for k in range(S,0,-1):
    i=bk[k][j]; assign.append((k-1,i,j)); j=i
assign.reverse()
res=[]
for k,i,j in assign:
    s,e=segs[k]; n=cs[j]-cs[i]; c=s
    for t in range(i,j):
        dd=(e-s)*words[t]['syl']/n
        res.append({'w':words[t]['w'],'p':words[t]['p'],'s':round(c,3),'e':round(c+dd,3)}); c+=dd
    print(f"{s:7.2f}-{e:7.2f} rate={(e-s)/n:.3f} | "+' '.join(x['w'] for x in words[i:j]))
json.dump({'dur':dur,'words':res,'paras':[ [x['s'] for x in res if x['p']==pi][0] for pi in range(len(paras))]},open('timing.json','w'),ensure_ascii=False)
print('r',r,'segs',S,'words',W)
