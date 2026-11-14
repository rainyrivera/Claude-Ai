# Cama musical sintetizada + efectos sincronizados con timing.json. Salida: music.wav, sfx.wav (48 kHz estéreo)
import json, re, numpy as np, wave
SR=48000; DUR=76.0; N=int(SR*DUR); rng=np.random.default_rng(3)
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
def clunk(): tt=np.arange(int(.25*SR))/SR; return (np.sin(2*np.pi*180*tt)*np.exp(-tt*25)+.5*lp(rng.standard_normal(len(tt)),2500)*np.exp(-tt*40))
def zap(d=.5): n=int(d*SR); x=rng.standard_normal(n)*(rng.random(n)>.6); return (x-lp(x,2000))*np.exp(-np.arange(n)/SR*5)*.9
def hum(d=1.2,f=60): tt=np.arange(int(d*SR))/SR; return (np.sin(2*np.pi*f*tt)+.4*np.sin(2*np.pi*f*2*tt))*np.minimum(1,tt/.15)*np.exp(-tt*1.5)*.6
def rise(d=1.2,f0=300,f1=900): n=int(d*SR); f=np.linspace(f0,f1,n); return np.sin(np.cumsum(2*np.pi*f/SR))*np.sin(np.linspace(0,np.pi,n))*.5
def crickets(d=2.5):
    n=int(d*SR); tt=np.arange(n)/SR; return np.sin(2*np.pi*4200*tt)*(np.sin(2*np.pi*28*tt)>.3)*(np.sin(2*np.pi*1.6*tt)>0)*.15
def thud(): tt=np.arange(int(.4*SR))/SR; return np.sin(2*np.pi*(90+80*np.exp(-tt*20))*tt)*np.exp(-tt*12)+.3*lp(rng.standard_normal(len(tt)),1500)*np.exp(-tt*30)
for i in range(7): add(clunk(),.25+i*.26+.3,.35,(i-3)*.12)
add(zap(.6),T('nada'),.6); add(tone(110,.6,6,(1,.5)),T('nada'),.3)
for a in [8.44,12.82,16.89,18.09,21.15,24.81,29.62,38.26,41.85,47.95,52.83,57.95,61.33,63.36,66.81,69.51]: add(whoosh(.45),a-.3,.3)
add(pop_(600),T('directa')-.2,.3); add(pop_(700),T('alterna')-.2,.3)
add(pop_(800),T('inversor'),.4); add(hum(1.4),T('prende',2)-.05,.5); add(chime(660),T('prende',2),.35)
add(tone(300,1.2,2,(1,.3))*np.linspace(1,0,int(1.2*SR)),T('noche'),.3); add(crickets(2.4),T('noche')+.4,.5)
for i in range(3): add(clunk(),T('baterías')-.3+i*.12,.35)
add(rise(1.6,250,700),21.4,.3); add(crickets(1.5),23.4,.4); add(hum(1.0),23.6,.35)
add(pop_(900),T('controlador'),.4); add(rise(1.0,500,1100),25.4,.25); add(chime(1046),25.8,.3); add(zap(.3),T('sobrecarguen'),.35)
add(sizzle(2.5) if 'sizzle' in dir() else whoosh(1.5),T('mediodía')+.3,.25)
add(rise(1.2,900,300),T('menos'),.25); add(pop_(500),T('calor'),.4)
add(whoosh(.9),T('aire')-.3,.5)
for i in range(6): add(pop_(300+i*60)*.7,T('árbol')-.2+i*.12,.25)
add(tone(140,.6,5),T('sombra'),.3); add(rise(.8,700,200),T('producción'),.25)
for i in range(3): add(tick(),T('diodos')+i*.15,.4)
add(whoosh(.8),T('mueves'),.4); add(chime(880),T('mueves')+1.3,.3)
for i in range(5): add(tick(),T('ángulo')+i*.18,.35); add(pop_(700),T('latitud'),.4)
add(chime(784),T('sobra',2),.35); add(pop_(800),T('medidor'),.4)
for i in range(10): add(tick(),T('red')+i*.2,.3,(i%2-.5))
add(chime(988),T('descuenta')+.4,.35)
for i in range(4): add(clunk()*.7,T('fusibles')+i*.12,.35)
for i in range(3): add(thud(),T('tierra')+i*.3,.6)
add(chime(1046),T('felicidades'),.45); add(chime(1318),T('felicidades')+.25,.35)
add(rise(1.2,800,200),T('cero')-.3,.25); add(chime(1568),T('cero')+.4,.4)
def save(name,x):
    x=x/ max(1e-9,np.abs(x).max())*0.89
    w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
save('music.wav',mus); save('sfx.wav',sfx); print('ok')
