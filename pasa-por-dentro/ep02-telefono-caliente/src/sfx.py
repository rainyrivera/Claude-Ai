import numpy as np, wave, sys, json
ev=json.load(open('events.json')); DUR=ev['scenes'][-1]
SR=48000; N=int(SR*(DUR+0.5)); out=np.zeros(N); rng=np.random.default_rng(3)
def add(t,sig,g):
    i=int(t*SR); j=min(N,i+len(sig)); 
    if i<N: out[i:j]+=sig[:j-i]*g
def lp(x,a):
    from scipy.signal import lfilter
    return lfilter([a],[1,-(1-a)],x)
def whoosh(d):
    n=int(d*SR); x=rng.standard_normal(n); tt=np.linspace(0,1,n)
    y=lp(lp(x,.03),.03); y-=lp(y,.003); env=np.sin(np.pi*tt)**2.5
    return y*env/np.max(np.abs(y)+1e-9)
def tone(f,d,dec):
    n=int(d*SR); tt=np.arange(n)/SR; return np.sin(2*np.pi*f*tt)*np.exp(-tt*dec)*np.minimum(1,tt*400)
def pop(): return tone(880,.18,22)*.6+tone(1320,.18,28)*.4
for s in ev['scenes'][1:-1]: add(max(0,s-.35),whoosh(.7),.05)
for k in ev['kw']: add(k+.05,pop(),.035)
# soft ambient pad (A major-ish), quiet under voice
tt=np.arange(N)/SR
pad=sum(np.sin(2*np.pi*f*tt+p) for f,p in [(110,0),(164.8,1),(220,2),(277.2,.5),(329.6,1.3)])
pad*=(0.65+0.35*np.sin(2*np.pi*tt/6))*np.minimum(1,tt/1.5)*np.minimum(1,np.maximum(0,(DUR-tt))/2)
out+=lp(pad,.04)*.012
out=np.clip(out,-1,1); st=np.stack([out,out],1)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
