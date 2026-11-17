# Cama musical sintetizada + efectos sincronizados con timing.json. Salida: music.wav, sfx.wav (48 kHz estéreo)
import json, re, numpy as np, wave
SR=48000; DUR=float(open("main.js").read().split("END = ")[1].split(";")[0]); N=int(SR*DUR); rng=np.random.default_rng(3)
TIM=json.load(open('timing.json')); WORDS=TIM['words']
norm=lambda s: re.sub(r'[¿?¡!.,:…]','',s.lower())
def T(w,n=1):
    k=0
    for x in WORDS:
        if norm(x['w'])==norm(w):
            k+=1
            if k==n: return x['s']
    raise KeyError(w)
def env(n,a,r): e=np.ones(n); a=min(int(a*SR),n//2); r=min(int(r*SR),n//2); e[:a]=np.linspace(0,1,a) if a else 1; e[-r:]*=np.linspace(1,0,r) if r else 1; return e
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
def clunk(): tt=np.arange(int(.25*SR))/SR; return (np.sin(2*np.pi*180*tt)*np.exp(-tt*25)+.5*lp(rng.standard_normal(len(tt)),2500)*np.exp(-tt*40))
def zap(d=.5): n=int(d*SR); x=rng.standard_normal(n)*(rng.random(n)>.6); return (x-lp(x,2000))*np.exp(-np.arange(n)/SR*5)*.9
def crunch(): n=int(.18*SR); x=rng.standard_normal(n); return lp(x,1800)*np.exp(-np.arange(n)/SR*22)*1.4
def rumble(d=1.4): n=int(d*SR); x=lp(rng.standard_normal(n),300); return x*np.sin(np.linspace(0,np.pi,n))*3
def splash(d=1.2): n=int(d*SR); x=rng.standard_normal(n); y=x-lp(x,1500); return y*np.minimum(1,np.arange(n)/SR/.05)*np.minimum(1,(d-np.arange(n)/SR)/.3)*.5
def hum(d=1.2,f=60): tt=np.arange(int(d*SR))/SR; return (np.sin(2*np.pi*f*tt)+.4*np.sin(2*np.pi*f*2*tt))*np.minimum(1,tt/.15)*np.exp(-tt*1.0)*.6
def rise(d=1.2,f0=300,f1=900): n=int(d*SR); f=np.linspace(f0,f1,n); return np.sin(np.cumsum(2*np.pi*f/SR))*np.sin(np.linspace(0,np.pi,n))*.5
def bubbles(d=1.5):
    out=np.zeros(int(d*SR))
    for i in range(14):
        s=int(rng.random()*(len(out)-3000)); tt=np.arange(2400)/SR; f=500+rng.random()*700; out[s:s+2400]+=np.sin(2*np.pi*f*(1+tt*8)*tt)*np.exp(-tt*40)*.5
    return out
def buzz(d=.6,f=120): tt=np.arange(int(d*SR))/SR; return np.sign(np.sin(2*np.pi*f*tt))*.25*np.exp(-tt*2)
def clickb(): tt=np.arange(int(.05*SR))/SR; return (np.sin(2*np.pi*1800*tt)+rng.standard_normal(len(tt))*.6)*np.exp(-tt*120)
PS=lambda i: TIM['phrases'][i]['s']
for i in [3,5,8,11,15,16,18,23,24,26,28,31,33,37,40]: add(whoosh(.45),PS(i)-.3,.3)
add(boom()*.5,0.05,.35); add(pop_(600),T('aguantar')-.1,.4)
for k in range(6): add(clunk(),PS(3)+.05+k*.1,.3)
add(crunch(),T('grietas'),.45); add(crunch(),T('grietas')+.3,.4); add(crunch(),T('grietas')+.6,.4)
add(rumble(1.8),T('peso'),.3); add(boom()*.6,PS(7)+.05,.45); add(rumble(1.2),PS(7)+.1,.3)
add(tapestop(),PS(8)-.1,.3); add(pop_(500),T('ingeniero'),.4); add(chime(784),T('refuerza'),.35); add(rise(.9,300,900),T('refuerza'),.2)
add(tone(220,1.0,3),T('oxidadas'),.25); add(zap(.8)*.5,T('come'),.2); add(clickb(),PS(16),.4)
for k in range(6): add(tick(),T('refuerzan')+k*.12,.4)
add(chime(880),T('refuerzan')+.3,.3)
for k in range(8): add(clunk(),PS(18)+k*.13,.25)
add(rumble(3.0),T('temblor')-.1,.6); add(crunch(),T('abren'),.6); add(crunch(),T('galleta'),.6); add(boom()*.4,T('galleta'),.35)
add(tapestop(),PS(20)-.1,.3)
for k in range(6): add(clunk(),T('castillos',2)+k*.1,.35)
add(pop_(700),T('dala'),.4); add(chime(784),PS(22),.35)
add(crunch(),PS(23)+.2,.35); add(pop_(800),T('alrededor'),.45); add(chime(1046),T('cuarteen'),.3)
add(whoosh(.6,False),PS(24)+.2,.35); [add(tick(),T('varilla')+k*.07,.3) for k in range(8)]
add(pop_(500),T('agua',1),.4); add(pop_(650),T('luz'),.4); add(pop_(400),T('drenaje'),.4)
add(boom()*.5,T('romper'),.45); add(crunch(),T('romper')+.05,.6); add(crunch(),T('romper')+.25,.5)
add(splash(1.0)*.5,T('romper')+.4,.3)
add(pop_(600),PS(28),.4); add(tone(180,.8,4),T('empinada'),.3); add(chime(880),T('subirla')+.5,.35)
add(pop_(450),PS(31),.4); add(rise(1.2,250,800),PS(32),.3); add(splash(2.0)*.5,PS(32)+1.0,.25)
add(whoosh(.5),PS(33),.35); add(clickb(),T('licencia')+.3,.5); add(buzz(.5,90),PS(35),.3); add(clickb(),T('multar'),.5); add(boom()*.4,PS(36),.4)
add(chime(1046),T('felicidades'),.45); add(chime(1318),T('felicidades')+.25,.35); add(clickb(),T('felicidades')+.1,.4)
for k in range(6): add(pop_(500+k*60),PS(40)+k*.12,.3)
CS=DUR-3.7; add(whoosh(.5),CS-.3,.4); add(chime(1046),CS+.15,.45); add(chime(1318),CS+.4,.4); add(pop_(900),CS+.5,.4)
def save(name,x):
    x=x/ max(1e-9,np.abs(x).max())*0.89
    w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
save('music.wav',mus); save('sfx.wav',sfx); print('ok')
