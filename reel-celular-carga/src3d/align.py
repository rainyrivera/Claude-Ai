# Alineación forzada simple: frases = tramos entre silencios; palabras repartidas por sílabas y
# ajustadas a micro-pausas detectadas dentro de cada frase.
import subprocess, json, re, numpy as np, sys
SR=16000
raw=subprocess.run(["ffmpeg","-v","error","-i","voz.mp3","-ac","1","-ar",str(SR),"-f","s16le","-"],capture_output=True).stdout
x=np.frombuffer(raw,np.int16).astype(np.float32)/32768
hop=160; n=len(x)//hop
env=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)+1e-12) for i in range(n)])
db=20*np.log10(env); T=np.arange(n)*hop/SR
def runs(mask,minlen):
    out=[];i=0
    while i<len(mask):
        if mask[i]:
            j=i
            while j<len(mask) and mask[j]: j+=1
            if (j-i)*hop/SR>=minlen: out.append((T[i],T[min(j,n-1)]))
            i=j
        else: i+=1
    return out
PH=['Tu celular carga lento, a veces carga y a veces no… y ya estás pensando en comprar otra batería.', 'Espera.', 'Muchas veces no es la batería.', 'Mira dentro del puerto.', 'Te explico.', 'Cuando metes el cable, unos contactos metálicos del cable tienen que tocar los contactos del celular.', 'Pero cada vez que lo guardas en el bolsillo o en la cartera, entra pelusa.', 'Y cada vez que conectas el cable, esa pelusa se empuja más al fondo y se aplasta como una alfombrita.', 'Con el tiempo, el cable ya no entra completo, los contactos no se tocan bien… y el celular carga lento o se desconecta solo.', 'Paso uno: apaga el celular.', 'Paso dos: alumbra dentro del puerto con una linterna.', 'Si ves algo gris o negro pegado al fondo, ahí está el problema.', 'Paso tres: toma un palillo de dientes de madera.', 'Nunca uses aguja, clip ni nada de metal, porque puedes rayar los contactos o hacer un corto.', 'Paso cuatro: raspa suavecito, pegado a las paredes del fondo, y saca la pelusa hacia afuera.', 'Sin fuerza y sin meter el palillo de golpe.', 'Paso cinco: voltea el celular, dale unos golpecitos suaves y vuelve a mirar con la linterna.', 'Paso seis: limpia también la punta del cable con un paño seco.', 'Ahora conecta.', 'Si el cable entra completo y hace clic, listo.', 'Si limpiaste y sigue igual, prueba con otro cable y otro cargador.', 'Si con eso tampoco carga, ahí sí llévalo a un técnico.', '¿Cuánta pelusa le salió al tuyo?', 'Te leo en los comentarios.']
sil=runs(db<-40,0.25)
speech=[];prev=0
for a,b in sil:
    if a-prev>0.1: speech.append((prev,a))
    prev=b
if T[-1]-prev>0.1: speech.append((prev,T[-1]))
# recortar silencio inicial/final de cada tramo
def trim(a,b):
    m=(T>=a)&(T<=b)&(db>-40); idx=np.where(m)[0]
    return (T[idx[0]],T[idx[-1]]) if len(idx) else (a,b)
speech=[trim(a,b) for a,b in speech]
def syl(w):
    w=w.lower(); g=re.findall(r"[aeiouáéíóúü]+",w); k=0
    for s in g: k+= 1 if len(s)==1 else (1 if re.fullmatch(r"[iuü]?[aeoáéó][iu]?|[iu][iu]|[iu]?[aeo]?[iu]",s) else len(s))
    return max(1,k)
if len(speech)!=len(PH):
    import re as _re
    CL=[]
    for ph in PH:
        parts=_re.findall(r'[^,.…:?!]+[,.…:?!]*\s*',ph)
        CL+= [x.strip() for x in parts if x.strip()]
    def sy(t): return sum(syl(w) for w in t.split())
    cs=[sy(c) for c in CL]; D=[b-a for a,b in speech]; rate=sum(D)/sum(cs)
    n,m=len(CL),len(speech); INF=1e18
    best=[[INF]*(m+1) for _ in range(n+1)]; bk=[[0]*(m+1) for _ in range(n+1)]; best[0][0]=0
    for i in range(1,n+1):
        for j in range(1,min(i,m)+1):
            for k in range(j-1,i):
                if best[k][j-1]>=INF: continue
                e=(sum(cs[k:i])*rate-D[j-1])**2
                if best[k][j-1]+e<best[i][j]: best[i][j]=best[k][j-1]+e; bk[i][j]=k
    assert best[n][m]<INF,(n,m); print('ERROR_TOTAL', round(best[n][m],2), 'clausulas', n, 'tramos', m)
    out=[]; i=n
    for j in range(m,0,-1): k=bk[i][j]; out.append(' '.join(CL[k:i])); i=k
    PH=out[::-1]
assert len(speech)==len(PH),(len(speech),len(PH))
words=[];phr=[]
for (a,b),tx in zip(speech,PH):
    ws=tx.split(); wt=np.array([syl(w)+0.5+(0.6 if re.search(r"[,.:?…]$",w) else 0) for w in ws]); cum=np.concatenate([[0],np.cumsum(wt)])/wt.sum()
    bounds=a+cum*(b-a)
    # micro-pausas dentro del tramo -> encajar al límite de palabra más cercano
    m=(T>a+0.05)&(T<b-0.05); mp=[(p,q) for p,q in runs(m&(db<-36),0.10)]
    anchors={0:(a,a),len(ws):(b,b)}
    for p,q in (mp if len(ws)>1 else []):
        k=int(np.argmin(np.abs(bounds[1:-1]-(p+q)/2)))+1
        if abs(bounds[k]-(p+q)/2)<0.3: anchors[k]=(p,q)
    ks=sorted(anchors); st=np.zeros(len(ws)); en=np.zeros(len(ws))
    for i0,i1 in zip(ks[:-1],ks[1:]):
        s0=anchors[i0][1]; s1=anchors[i1][0]; seg=wt[i0:i1]; c=np.concatenate([[0],np.cumsum(seg)])/seg.sum()
        for j in range(i1-i0): st[i0+j]=s0+c[j]*(s1-s0); en[i0+j]=s0+c[j+1]*(s1-s0)
    for w,s,e in zip(ws,st,en): words.append({"w":w,"s":round(float(s),3),"e":round(float(e),3)})
    phr.append({"t":tx,"s":round(float(a),3),"e":round(float(b),3),"micro":len(mp)})
json.dump({"dur":round(len(x)/SR,3),"phrases":phr,"words":words},open("timing.json","w"),ensure_ascii=False,indent=1)
for p in phr: print(f"{p['s']:6.2f}-{p['e']:6.2f} m{p['micro']} {p['t']}")
