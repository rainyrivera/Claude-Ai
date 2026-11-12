import numpy as np, wave, sys, json
ev=json.load(open('events.json')); DUR=ev['scenes'][-1]
SR=48000; N=int(SR*(DUR+0.5)); out=np.zeros(N); rng=np.random.default_rng(3)
def add(t,sig,g):
    i=int(t*SR); j=min(N,i+len(sig))
    if 0<=i<N: out[i:j]+=sig[:j-i]*g
def lp(x,a):
    y=np.empty_like(x); s=0.0
    for k in range(len(x)): s+=a*(x[k]-s); y[k]=s
    return y
def whoosh(d):
    n=int(d*SR); x=rng.standard_normal(n); tt=np.linspace(0,1,n)
    y=lp(lp(x,.05),.05); y-=lp(y,.004); env=np.sin(np.pi*tt)**2.2
    return y*env/np.max(np.abs(y)+1e-9)
def tone(f,d,dec):
    n=int(d*SR); tt=np.arange(n)/SR; return np.sin(2*np.pi*f*tt)*np.exp(-tt*dec)*np.minimum(1,tt*400)
def thump():
    n=int(.5*SR); tt=np.arange(n)/SR; f=110*np.exp(-tt*8)+45
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*7)
WH=whoosh(.6); POP=tone(880,.18,22)*.6+tone(1320,.18,28)*.4; TH=thump()
for c in ev['cuts']: add(c-.3,WH,.06)
for k in ev['kw']: add(k+.05,POP,.03)
for s in ev['shk']: add(s,TH,.22)
tt=np.arange(N)/SR
pad=sum(np.sin(2*np.pi*f*tt+p) for f,p in [(110,0),(164.8,1),(220,2),(277.2,.5),(329.6,1.3)])
pad*=(0.65+0.35*np.sin(2*np.pi*tt/6))*np.minimum(1,tt/1.5)*np.minimum(1,np.maximum(0,(DUR-tt))/2)
# cheap lowpass on pad via moving average
k=200; pad=np.convolve(pad,np.ones(k)/k,mode='same')
out+=pad*.012
out=np.clip(out,-1,1); st=np.stack([out,out],1)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
