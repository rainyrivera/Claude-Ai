# Une las piezas en main.js (Parte 2)
r=lambda f: open(f).read()
head,chars,chars2,txt,sc,comp=[r(f) for f in ['lib_head.js','scenes_chars.js','scenes_chars2.js','lib_txt.js','scenes_list.js','lib_comp.js']]
head=head.replace('– Parte 1 –','– Parte 2 –')
NAME="const NAME = { 'tomás': '#47c6ff', 'ramiro': '#ffb52e', 'valdivieso': '#ffb52e', 'seis': '#ff4a3d', 'diecisiete': '#ff4a3d' };\n"
HEAD="""const HEAD = [
  [0.09, 3.4, 'ROMPIÓ UNA REGLA', '#b3161b', -2, 0],
  [3.47, 7.6, 'TIENE SU CARA', '#111', 2, 0],
  [7.67, 10.9, 'CADA VEZ MÁS TEMPRANO', '#b3161b', -2, 0],
  [14.64, 16.5, 'NO MIRA ATRÁS', '#111', 2, 0],
  [21.49, 24.1, 'CASETA VACÍA', '#111', -2, 0],
  [24.21, 26.8, 'LA SILLA SE MOVIÓ', '#b3161b', 2, 0],
  [26.87, 31.8, 'AL AMANECER', '#111', -2, 0],
  [31.84, 38.1, 'INVESTIGA', '#111', 2, 0],
  [46.10, 52.1, 'LA LETRA CAMBIA', '#b3161b', -2, 0],
  [59.86, 67.9, 'LA ÚLTIMA NOTA', '#b3161b', 2, 0],
  [77.65, 83.9, 'RELOJES DETENIDOS', '#111', -2, 0],
  [83.97, 85.1, 'Y HAY ALGO MÁS', '#b3161b', 2, 0],
  [89.72, 93.9, 'SU AUTO SIGUE AHÍ', '#111', -2, 0],
  [97.47, 101.3, 'PASOS', '#b3161b', 2, 0],
  [104.45, 113.4, 'TERCER PISO', '#111', -2, 0],
  [113.44, 114.5, 'SONRÍE', '#b3161b', 2, 0],
  [121.43, 126.8, 'LAS OTRAS CÁMARAS', '#111', -2, 0],
  [129.72, 133.7, 'NO SE DETIENE', '#111', 2, 0],
  [137.24, 139.6, '2 MESES DE RONDA', '#b3161b', -2, 0],
  [151.62, 153.9, 'YA ESTÁ ABAJO', '#b3161b', 2, 0],
  [153.97, 158.7, 'EL ASCENSOR BAJA', '#111', -2, 0],
];
"""
NOTES="""const NOTES = [
  [24.6, 26.8, '¡GIRADA!', 300, 1260, 330, 1215, 470, 1020, -6],
  [90.0, 93.9, 'EL AUTO DE RAMIRO', 330, 900, 380, 950, 470, 1130, -5],
];
"""
txt=txt.replace("/*NAME*/",NAME).replace("/*HEAD*/",HEAD).replace("/*NOTES*/",NOTES)
comp=comp.replace("window.renderAt = t => {","window.renderAt = t => { window.__t = t;")
chars=chars.replace("  g.save(); g.scale(w / 1080, h / 1920 * (1920 / 1080) * (1080 / 1920) * (1920 / 1080) * .5625 * 1.0); g.restore();\n","")
open('main.js','w').write(head+chars+chars2+txt+sc+comp)
