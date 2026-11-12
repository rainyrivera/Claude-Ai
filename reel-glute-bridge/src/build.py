import json
h=open('scene.html').read().replace('__WORDS__',open('words.json').read().replace('\n',''))
open('page.html','w').write(h)
