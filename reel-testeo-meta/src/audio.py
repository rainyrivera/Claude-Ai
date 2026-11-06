import subprocess, json, re, sys
A=sys.argv[1]; out=sys.argv[2]
segs=[(0,2.526),(2.908,4.438),(4.771,5.319),(5.883,8.817),(9.272,11.782),(12.278,14.050),(14.482,16.751),(17.302,19.188),(19.694,22.578)]
texts=["¿Lanzas un anuncio en Meta y cruzas los dedos?","Los que venden no adivinan:","prueban.","Lanzan varios anuncios a la vez, con poco presupuesto:","distintos videos, textos y públicos.","Los datos eligen al ganador.","Y solo entonces, invierten en grande.","Eso es una campaña de testeo.","Comenta TEST y te explico cómo."]
PAD=0.05; GAP=0.10; TARGET_END=19.72; TOTAL=20.0
parts=[];f=[];t=0;newsegs=[]
for i,(s,e) in enumerate(segs):
    s2=max(0,s-PAD); e2=e+PAD
    f.append(f"[0:a]atrim={s2}:{e2},asetpts=PTS-STARTPTS[a{i}]")
    newsegs.append((t+(s-s2), t+(s-s2)+(e-s)))
    t+=e2-s2
    if i<len(segs)-1:
        f.append(f"anullsrc=r=44100:cl=stereo,atrim=0:{GAP}[g{i}]"); t+=GAP
tempo=t/TARGET_END
labels="".join(f"[a{i}]"+(f"[g{i}]" if i<len(segs)-1 else "") for i in range(len(segs)))
n=len(segs)*2-1
f.append(f"{labels}concat=n={n}:v=0:a=1,atempo={tempo:.5f},apad,atrim=0:{TOTAL}[out]")
subprocess.run(["ffmpeg","-y","-v","error","-i",A,"-filter_complex",";".join(f),"-map","[out]","-ar","48000","-ac","2",out],check=True)
# word timings by syllable weight
def syl(w):
    w=w.lower(); g=re.findall(r"[aeiouáéíóúü]+",w); n=0
    for x in g: n+= 1 if len(x)==1 else (1 if re.fullmatch(r"[iuü]?[aeoáéó][iu]?|[iu][iu]|i?[aeo]u?",x) else len(x))
    return max(1,n)
words=[]
for (s,e),tx in zip(newsegs,texts):
    s/=tempo;e/=tempo; ws=tx.split(); wt=[syl(w)+0.6 for w in ws]; tot=sum(wt); c=s
    for w,k in zip(ws,wt):
        d=(e-s)*k/tot; words.append({"w":w,"s":round(c,3),"e":round(c+d,3)}); c+=d
segsout=[(round(s/tempo,3),round(e/tempo,3)) for s,e in newsegs]
json.dump({"tempo":tempo,"segs":segsout,"words":words},open(out.rsplit('/',1)[0]+"/timing.json","w"),ensure_ascii=False,indent=0)
print(tempo, segsout)
