import numpy as np,re,json
x=np.fromfile('voz.raw',dtype=np.int16).astype(float)/32768;SR=16000
hop=160;n=len(x)//hop;db=20*np.log10(np.sqrt((x[:n*hop].reshape(n,hop)**2).mean(1))+1e-9)
sp=db>-40
# gaps >=0.17s
segs=[];i=0
while i<n:
    if sp[i]:
        j=i
        while True:
            while j<n and sp[j]: j+=1
            k=j
            while k<n and not sp[k]: k+=1
            if k<n and (k-j)*0.01<0.17: j=k; continue
            break
        segs.append((i*0.01,j*0.01)); i=j
    else: i+=1
segs=[s for s in segs if s[1]-s[0]>0.08]
print(len(segs),'segs'); 
txt=open('../parte1.txt').read().split()
def syl(w):
    w=w.lower(); g=re.findall(r"[aeiouáéíóúü]+",w); c=0
    for v in g: c+=1 if len(v)==1 or re.fullmatch(r"[iuü]?[aeoáéó][iu]?|[iu][iu]|i?[aeo]u?",v) else len(v)
    return max(1,c)
W=[syl(t)+0.35 for t in txt]; N=len(txt); M=len(segs)
P=[0]+list(np.cumsum(W))
punct=[bool(re.search(r"[.,:?…]$",t)) for t in txt]
tot=sum(e-s for s,e in segs); rate=tot/P[-1]
INF=1e18; D=np.full((M+1,N+1),INF); B=np.zeros((M+1,N+1),int); D[0][0]=0
for j in range(1,M+1):
    d=segs[j-1][1]-segs[j-1][0]
    for k in range(1,N+1):
        best=INF;bi=0
        for i in range(max(0,k-25),k):
            if D[j-1][i]>=INF: continue
            pred=(P[k]-P[i])*rate
            c=D[j-1][i]+(d-pred)**2/(0.3+0.15*d)+(0 if (k==N or punct[k-1]) else 0.9)
            if c<best: best=c;bi=i
        D[j][k]=best;B[j][k]=bi
k=N;asg=[]
for j in range(M,0,-1):
    i=B[j][k];asg.append((i,k));k=i
asg.reverse()
words=[]
for (s,e),(i,k) in zip(segs,asg):
    ww=W[i:k];T=sum(ww);c=s
    for t,wt in zip(txt[i:k],ww):
        d=(e-s)*wt/T;words.append({"w":t,"s":round(c,3),"e":round(c+d,3)});c+=d
    print(f"{s:6.2f}-{e:6.2f} ({(e-s):4.2f} pred {(P[k]-P[i])*rate:4.2f}) "+" ".join(txt[i:k]))
json.dump({"words":words,"dur":len(x)/SR},open('timing_p1.json','w'),ensure_ascii=False)
