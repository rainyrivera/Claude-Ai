import numpy as np, wave, sys
SR=48000; N=SR*25; out=np.zeros(N); rng=np.random.default_rng(3)
def add(t,sig,g):
    i=int(t*SR); j=min(N,i+len(sig)); out[i:j]+=sig[:j-i]*g
def lp(x,a):  # one-pole lowpass, a in (0,1)
    y=np.empty_like(x); s=0.
    for k in range(len(x)): s+= a[k]*(x[k]-s) if hasattr(a,'__len__') else a*(x[k]-s); y[k]=s
    return y
def whoosh(d):
    n=int(d*SR); x=rng.standard_normal(n); tt=np.linspace(0,1,n)
    a=0.008+0.05*np.sin(np.pi*tt)**2
    y=lp(lp(x,a),a); y-=lp(y,0.003); env=np.sin(np.pi*tt)**2.5
    return y*env/np.max(np.abs(y)+1e-9)
def tone(f,d,dec,h=0):
    n=int(d*SR); tt=np.arange(n)/SR; s=np.sin(2*np.pi*f*tt)+h*np.sin(4*np.pi*f*tt)
    return s*np.exp(-tt*dec)*np.minimum(1,tt*400)
def click(): return tone(2200,.04,180)*.6+tone(900,.04,120)
def thump():
    n=int(.5*SR); tt=np.arange(n)/SR; f=110*np.exp(-tt*8)+45
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*7)
    nz=lp(rng.standard_normal(n),.2)*np.exp(-tt*40)*.5
    return s+nz
for t,d,g in [(0,1.4,.07),(3.8,.9,.06),(12.7,.9,.05),(21.5,.9,.06),(22.3,1.6,.05)]: add(t,whoosh(d),g)
add(3.2,thump(),.35)
for i in range(7): add(6.5+i*.48,tone(660+i*60,.18,22),.07)
add(9.55,tone(1046,.6,6)*.5+tone(1568,.6,7)*.3,.1); add(12.33,tone(1046,.6,6)*.5+tone(1568,.6,7)*.3,.1)
add(12.97,thump(),.25)
add(13.9,click(),.3); add(15.49,click(),.3); add(15.5,tone(1320,.15,25),.08)
add(17.25,tone(520,.25,14)+tone(780,.25,14),.12)
add(19.05,tone(1175,.2,18),.08); add(19.56,tone(1318,.2,18),.08)
for f,dl in [(784,0),(988,.07),(1175,.14)]: add(21.12+dl,tone(f,1.0,4),.07)
for i in range(7): add(22.4+i*.07,click(),.15)
add(23.58,tone(520,.25,14)+tone(780,.25,14),.12); add(24.2,tone(1320,.3,12),.1)
# soft ambient pad
tt=np.arange(N)/SR; pad=sum(np.sin(2*np.pi*f*tt+p) for f,p in [(110,0),(164.8,1),(220,2),(277.2,.5)])
pad*= (0.6+0.4*np.sin(2*np.pi*tt/5))*np.minimum(1,tt/1.5)*np.minimum(1,(25-tt)/1.2)
out+= lp(pad,.05)*.018
out=np.clip(out,-1,1); st=np.stack([out,out],1)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
