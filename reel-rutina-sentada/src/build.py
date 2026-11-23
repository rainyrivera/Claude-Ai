import sys,json
d=sys.argv[1];dur=sys.argv[2]
h=open('base_head.html').read().replace('__DUR__',dur)
page=h+'\n'+open('base_defs.js').read()+'\n'+open('engine.js').read()+'\n'+open(d+'/video.js').read()+'\n'+open('base_cap.html').read()
page=page.replace('__WORDS__',open(d+'/words.json').read().replace('\n',''))
open(d+'/page.html','w').write(page)
