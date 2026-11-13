# Une las piezas en main.js (La grulla de papel – Capítulo 3)
r=lambda f: open(f).read()
head,c1,c3,dc,dc2,dc3,txt,sc,comp=[r(f) for f in ['lib_head.js','scenes_chars.js','scenes_chars3.js','det_chars.js','det_chars2.js','det_chars3.js','lib_txt.js','scenes_list.js','lib_comp.js']]
head=head.replace('// "El turno de las 3:17" – Parte 1 – animación 2D estilo recorte','// "La grulla de papel" – Capítulo 3 – animación 2D estilo recorte')
exec(open('texts.py').read())
txt=txt.replace("/*NAME*/",NAME).replace("/*HEAD*/",HEAD).replace("/*NOTES*/",NOTES)
comp=comp.replace("window.renderAt = t => {","window.renderAt = t => { window.__t = t;")
c1=c1.replace("  g.save(); g.scale(w / 1080, h / 1920 * (1920 / 1080) * (1080 / 1920) * (1920 / 1080) * .5625 * 1.0); g.restore();\n","")
open('main.js','w').write(head+c1+c3+dc+dc2+dc3+txt+sc+comp)
