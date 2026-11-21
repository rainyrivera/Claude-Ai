#!/bin/bash
# Uso (desde la raíz del repo): plantilla-escalada/mk.sh reel-<tema> "Título"
# Arma reel-<tema>/src3d/main.js = head.js + scene.js + tail.js. END = última palabra + 4,2 s.
set -e; P=$(cd "$(dirname "$0")" && pwd); D=$1/src3d
END=$(python3 -c "import json;w=json.load(open('$D/timing.json'))['words'];print(round(w[-1]['e']+4.2,2))")
sed -e "s/__END__/$END/" -e "s/__TITLE__/$2/" $P/head.js > $D/main.js; cat $D/scene.js $P/tail.js >> $D/main.js; echo "END=$END"
