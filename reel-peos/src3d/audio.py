# Cama musical sintetizada + efectos sincronizados con timing.json. Salida: music.wav, sfx.wav (48 kHz estéreo)
import json, re, numpy as np, wave
SR=48000; DUR=47.2; N=int(SR*DUR); rng=np.random.default_rng(3)
TIM=json.load(open('timing.json')); WORDS=TIM['words']
norm=lambda s: re.sub(r'[¿?¡!.,:…]','',s.lower())
def T(w,n=1):
    k=0
    for x in WORDS:
        if norm(x['w'])==norm(w):
            k+=1
            if k==n: return x['s']
    raise KeyError(w)
def env(n,a,r): e=np.ones(n); a=int(a*SR); r=int(r*SR); e[:a]=np.linspace(0,1,a) if a else 1; e[-r:]*=np.linspace(1,0,r) if r else 1; return e
def lp(x,c):  # pasabajos de un polo
    a=np.exp(-2*np.pi*c/SR); y=np.zeros_like(x); acc=0.
    for i in range(len(x)): acc=(1-a)*x[i]+a*acc; y[i]=acc
    return y
# ---------- música: pad Am–F–C–G + pulso suave ----------
t=np.arange(N)/SR; mus=np.zeros((N,2))
chords=[[57,60,64],[53,57,60],[48,55,60],[55,59,62]]; bar=4.0
f=lambda m: 440*2**((m-69)/12)
for i in range(int(DUR/bar)+1):
    s=int(i*bar*SR); e=min(N,int((i*bar+bar+1.0)*SR));
    if s>=N: break
    n=e-s; tt=np.arange(n)/SR; ch=chords[i%4]; sig=np.zeros(n)
    for m in ch+[ch[0]-12]:
        for d in (-0.08,0.08):
            ph=2*np.pi*f(m+d)*tt; sig+= (np.sin(ph)+0.25*np.sin(2*ph)+0.1*np.sin(3*ph))
    sig*=env(n,1.2,1.4)*0.05
    mus[s:e,0]+=sig*(1+0.15*np.sin(tt)); mus[s:e,1]+=sig*(1-0.15*np.sin(tt))
# bajo pulsado en negras (~100 bpm)
beat=0.6
for k in range(int(DUR/beat)):
    s=int(k*beat*SR); n=int(0.35*SR); 
    if s+n>N: break
    m=chords[int(k*beat/bar)%4][0]-24; tt=np.arange(n)/SR
    b=np.sin(2*np.pi*f(m)*tt)*np.exp(-tt*9)*0.12*(1 if k%2==0 else .6)
    mus[s:s+n]+=b[:,None]
# hi-hat suave en corcheas desde 5 s
hh=lp(rng.standard_normal(int(0.05*SR)),9000); hh=(hh-lp(hh,4000))*np.exp(-np.arange(len(hh))/SR*80)
for k in range(int(5/0.3),int(DUR/0.3)):
    s=int(k*0.3*SR)
    if s+len(hh)<N: mus[s:s+len(hh)]+=(hh*0.05*(1 if k%2 else .5))[:,None]
mus*=env(N,0.4,1.5)[:,None]
# ---------- efectos ----------
sfx=np.zeros((N,2))
def add(x,at,g=1.,pan=0.):
    s=int(at*SR); x=x[:max(0,N-s)]; sfx[s:s+len(x),0]+=x*g*(1-pan); sfx[s:s+len(x),1]+=x*g*(1+pan)
def tone(fr,d,dec=12,h=(1,.3)): tt=np.arange(int(d*SR))/SR; return sum(a*np.sin(2*np.pi*fr*(i+1)*tt) for i,a in enumerate(h))*np.exp(-tt*dec)
def whoosh(d=.55,up=True):
    n=int(d*SR); x=rng.standard_normal(n); c=np.linspace(400,4000,n) if up else np.linspace(4000,400,n)
    y=np.zeros(n); acc=0.
    for i in range(n): a=np.exp(-2*np.pi*c[i]/SR); acc=(1-a)*x[i]+a*acc; y[i]=acc
    return y*np.sin(np.linspace(0,np.pi,n))**2*0.9
def pop_(fr=700): tt=np.arange(int(.09*SR))/SR; return np.sin(2*np.pi*fr*tt*(1+ 2*np.exp(-tt*60)))*np.exp(-tt*45)
def tick(): tt=np.arange(int(.03*SR))/SR; return (np.sin(2*np.pi*2400*tt)+.5*rng.standard_normal(len(tt)))*np.exp(-tt*250)
def boom(): tt=np.arange(int(1.0*SR))/SR; return np.sin(2*np.pi*(45+60*np.exp(-tt*8))*tt)*np.exp(-tt*4)+0.3*lp(rng.standard_normal(len(tt)),800)*np.exp(-tt*10)
def chime(base): return tone(base,1.2,4,(1,.2,.1))+tone(base*1.5,1.2,4,(.6,.1))*0.8
def tapestop():
    n=int(.45*SR); fr=np.linspace(900,60,n); ph=np.cumsum(2*np.pi*fr/SR); x=np.sign(np.sin(ph))*0.3+0.3*rng.standard_normal(n); return lp(x,3000)*np.linspace(1,0,n)
def fart(d=.7,f0=95,seed=0):
    r=np.random.default_rng(seed); n=int(d*SR); tt=np.arange(n)/SR
    fm=f0*(1+.25*np.sin(2*np.pi*7*tt)+.15*r.standard_normal(n).cumsum()/np.sqrt(n)*3)
    ph=np.cumsum(2*np.pi*fm/SR); x=np.sign(np.sin(ph))*.6+np.sin(ph)*.4
    am=(np.abs(np.sin(2*np.pi*(5+3*r.random())*tt))**.5)*np.minimum(1,tt/.02)*np.minimum(1,(d-tt)/.15)
    return lp(x*am,900)*1.4
def sizzle(d=1.6):
    n=int(d*SR); x=rng.standard_normal(n); y=x-lp(x,3000); return y*(.5+.5*rng.random(n)>.7)*np.minimum(1,np.arange(n)/SR/.1)*np.minimum(1,(d-np.arange(n)/SR)/.3)*.5
def gulp(): tt=np.arange(int(.25*SR))/SR; return np.sin(2*np.pi*(300-200*tt/.25)*tt)*np.exp(-tt*14)
add(fart(.75,90,1),.45,.75)
add(pop_(500),T('luis',1)-.1,.3)
add(fart(1.0,75,2),T('sale')+.1,.8)
for i in range(4): add(whoosh(.35),T('vacía')-.3+i*.12,.3,(i%2-.5))
add(tone(220,.9,3,(1,.4))*.8,T('dañado',1),.25)
for a in [10.55,21.2,29.2,35.4,37.7,40.65,43.5]: add(whoosh(),a-.35,.45)
for i in range(6): add(gulp(),T('habichuelas')+i*.15,.18,(i-2.5)*.15)
for i in range(6): add(pop_(700+i*60),T('recogieron')-.1+i*.12,.3,(i-2.5)*.15)
add(tone(160,.5,6),T('olerlos'),.3); add(boom()*.5,T('nadie')-.1,.5); add(pop_(900),T('pusieron')+.9,.3)
for i in range(8): add(pop_(300+i*40)*.6,21.4+i*.25,.12,(i%2-.5))
add(chime(660),T('chin')-.1,.3)
for i in range(6): add(pop_(1100+i*120),T('bacterias')+.2+i*.15,.14,(i%2-.5))
add(tick(),T('anotó')+.2,.4); add(tick(),T('anotó')+.55,.4); add(tick(),T('anotó')+.9,.4)
add(boom(),T('pum'),.7); add(chime(523),T('pum')+.05,.3)
add(sizzle(1.6),T('huevos')-.1,.3); add(whoosh(.4),T('bajó'),.4)
add(chime(784),T('respirar'),.4); add(whoosh(.3),T('dañado',2)+.15,.4); add(chime(988),T('plato'),.45)
add(pop_(700),T('duele'),.35); add(chime(880),T('médico'),.3)
add(pop_(650),T('quién')-.15,.35); add(pop_(750),T('quién')+.1,.35); add(fart(.5,110,3),T('quién')+.15,.55)
def save(name,x):
    x=x/ max(1e-9,np.abs(x).max())*0.89
    w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
save('music.wav',mus); save('sfx.wav',sfx); print('ok')
