# Une las piezas en main.js
head=open('lib_head.js').read(); chars=open('scenes_chars.js').read(); txt=open('lib_txt.js').read(); sc=open('scenes_list.js').read(); comp=open('lib_comp.js').read()
NAME="const NAME = { 'tomás': '#47c6ff', 'valdivieso': '#ffb52e', 'seis': '#ff4a3d', 'diecisiete': '#ff4a3d', 'él': '#ff4a3d' };\n"
HEAD="""const HEAD = [
  [0.09, 5.2, '4 REGLAS', '#111', -2, 0],
  [5.24, 10.4, 'REGLA 3', '#b3161b', 2, 0],
  [10.42, 14.7, 'LA ROMPE', '#b3161b', -2, 0],
  [25.10, 27.7, 'CLÍNICA VALDIVIESO', '#111', 2, 0],
  [31.35, 38.1, 'EL ENCARGADO', '#111', -2, 0],
  [43.65, 51.2, 'LA CASETA', '#111', 2, 0],
  [72.33, 76.2, '¿UNA BROMA?', '#111', -2, 0],
  [86.63, 89.7, 'SUBE SOLO', '#b3161b', 2, 0],
  [95.08, 96.6, 'NO LO LLAMA', '#111', -2, 0],
  [98.88, 102.8, 'NO SALE NADIE', '#111', 2, 0],
  [102.88, 105.9, 'ALGUIEN BAJA', '#b3161b', -2, 0],
  [113.61, 115.3, 'LA CURIOSIDAD', '#111', 2, 0],
  [119.48, 125.0, 'CÁMARA 6', '#111', -2, 0],
  [125.13, 128.6, 'HAY ALGUIEN', '#b3161b', 2, 0],
  [134.96, 143.1, 'NO SE MUEVE', '#111', -2, 0],
  [145.43, 150.2, 'LO ESTÁ MIRANDO', '#b3161b', 2, 0],
  [150.32, 153.9, 'FRÍO', '#1d3f85', -2, 0],
  [153.96, 155.3, 'ALGO CRUJE', '#b3161b', 2, 0],
  [157.98, 161.7, 'NADIE TIENE ESE NÚMERO', '#111', -2, 0],
  [163.93, 166.4, 'SU PROPIA VOZ', '#b3161b', 2, 0],
];
"""
NOTES="""const NOTES = [
  [8.17, 10.3, '¡NUNCA!', 830, 1250, 780, 1205, 720, 1095, 6],
  [125.6, 128.6, '¿QUIÉN ES?', 760, 1270, 700, 1225, 580, 1060, -6],
  [153.96, 155.3, '¿QUÉ FUE ESO?', 820, 760, 820, 810, 840, 900, 5],
];
"""
txt=txt.replace("/*NAME*/",NAME).replace("/*HEAD*/",HEAD).replace("/*NOTES*/",NOTES)
comp=comp.replace("window.renderAt = t => {","window.renderAt = t => { window.__t = t;")
sc=sc.replace("g.fillText('🤫'.length ? '!' : '!', 0, 6);","g.fillText('!', 0, 6);")
sc=sc.replace("g.drawImage(cv, 0,","g.drawImage(g.canvas, 0,")
sc=sc.replace("  g.save(); g.translate(W / 2, 1500); g.scale(2.6, 2.6); TOMAS.torsoDeco && 0; g.restore();\n","")
chars=chars.replace("  g.save(); g.scale(w / 1080, h / 1920 * (1920 / 1080) * (1080 / 1920) * (1920 / 1080) * .5625 * 1.0); g.restore();\n","")
open('main.js','w').write(head+chars+txt+sc+comp)
