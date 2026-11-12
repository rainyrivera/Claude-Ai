# Une las piezas en main.js (Parte 3)
r=lambda f: open(f).read()
head,chars,chars2,chars3,txt,sc,comp=[r(f) for f in ['lib_head.js','scenes_chars.js','scenes_chars2.js','scenes_chars3.js','lib_txt.js','scenes_list.js','lib_comp.js']]
head=head.replace('– Parte 1 –','– Parte 3 –')
exec(open('texts.py').read())
txt=txt.replace("/*NAME*/",NAME).replace("/*HEAD*/",HEAD).replace("/*NOTES*/",NOTES)
comp=comp.replace("window.renderAt = t => {","window.renderAt = t => { window.__t = t;")
chars=chars.replace("  g.save(); g.scale(w / 1080, h / 1920 * (1920 / 1080) * (1080 / 1920) * (1920 / 1080) * .5625 * 1.0); g.restore();\n","")
open('main.js','w').write(head+chars+chars2+chars3+txt+sc+comp)
