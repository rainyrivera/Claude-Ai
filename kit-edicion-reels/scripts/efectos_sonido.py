# Genera una pista de efectos (whoosh, pop, golpe, clics de tecleo, campanita) sincronizada.
# Uso: python3 -I efectos_sonido.py <salida.wav>
# Editar DUR (duración total) y la lista de add(...) con los tiempos de cada gráfico del nuevo video.
import sys, numpy as np, wave
SR=48000; DUR=17.80; out=np.zeros(int(SR*DUR))
rng=np.random.default_rng(7)
def add(sig,t,g):
    i=int(t*SR); n=min(len(sig),len(out)-i); out[i:i+n]+=sig[:n]*g
def env(n,a,d):
    e=np.ones(n); ia=int(a*SR); e[:ia]=np.linspace(0,1,ia) if ia else 1
    e[ia:]=np.exp(-np.arange(n-ia)/(d*SR)); return e
def pop(f0=900,f1=300,d=0.09):
    n=int(d*SR); tt=np.arange(n)/SR; f=np.geomspace(f0,f1,n); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*env(n,0.002,d/4)
def whoosh(d=0.45,lo=300,hi=4000,rev=False):
    n=int(d*SR); x=rng.standard_normal(n); y=np.zeros(n); c=np.geomspace(lo,hi,n)
    if rev: c=c[::-1]
    a=0.0
    for k in range(n):
        al=1-np.exp(-2*np.pi*c[k]/SR); a+=al*(x[k]-a); y[k]=a
    w=np.sin(np.linspace(0,np.pi,n))**2; return y*w/np.max(np.abs(y))
def click(d=0.025):
    n=int(d*SR); x=rng.standard_normal(n); x=np.diff(np.concatenate([[0],x])); return x*env(n,0.0005,0.004)
def thud(d=0.25):
    n=int(d*SR); tt=np.arange(n)/SR; f=np.geomspace(160,55,n); s=np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.06)
    return s+0.4*click(d)[:n] if False else s
def ding():
    n=int(0.9*SR); tt=np.arange(n)/SR
    a=(np.sin(2*np.pi*1318.5*tt)+0.4*np.sin(2*np.pi*2637*tt))*env(n,0.003,0.18)
    b=np.zeros(n); m=int(0.11*SR); b[m:]=(np.sin(2*np.pi*1760*tt[:n-m])+0.4*np.sin(2*np.pi*3520*tt[:n-m]))*env(n-m,0.003,0.25)
    return (a+b)/2.4

add(whoosh(0.4,200,3000),0.0,0.35)
add(thud(),1.10,0.6)
for k in range(10): add(click(),1.10+k*0.05,0.16)
add(pop(1500,900,0.06),1.60,0.35)
add(whoosh(0.35,400,5000),1.80,0.28)
for i,t in enumerate([5.26,5.40,5.54]): add(pop(900+i*150,400+i*80),t,0.36)
add(pop(1200,600,0.07),5.96,0.25)
add(whoosh(0.3,500,4000,rev=True),6.62,0.22)
add(pop(800,350),8.26,0.38)
for t in [8.62,8.92,9.22,9.48]: add(click(0.03),t,0.4)
add(whoosh(0.25,500,4000,rev=True),9.42,0.18)
add(pop(1000,500),9.54,0.35); add(pop(1150,600),11.18,0.35)
add(whoosh(0.25,500,4000,rev=True),11.84,0.18)
add(pop(1100,500),12.00,0.35)
add(whoosh(0.35,400,5000),12.52,0.28); add(thud(),12.84,0.7)
for k in range(8): add(click(),12.88+k*0.052,0.18)
add(pop(1500,900,0.06),13.30,0.3)
add(pop(800,350),13.70,0.4); add(pop(1300,700,0.07),14.36,0.3)
add(thud(),15.06,0.75); add(click(0.04),15.06,0.35)
add(whoosh(0.3,500,4000,rev=True),15.56,0.22)
add(pop(1000,450),15.70,0.38); add(ding(),16.06,0.4)
add(whoosh(0.5,200,3000),16.50,0.3); add(thud(),16.72,0.5)
for k in range(8): add(click(),16.90+k*0.05,0.16)
add(pop(1500,900,0.06),17.36,0.3)
out=np.clip(out,-1,1)
w=wave.open(sys.argv[1],'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
print('ok')
