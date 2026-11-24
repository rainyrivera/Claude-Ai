#!/bin/bash
# Versión 16:9 (1600x900 → 1920x1080): plantilla-escalada/mk16.sh <carpeta> "Título"
set -e; P=$(cd "$(dirname "$0")" && pwd); D=$1/src3d
END=$(python3 -c "import json;w=json.load(open('$D/timing.json'))['words'];print(round(w[-1]['e']+4.2,2))")
sed -e "s/__END__/$END/" -e "s/__TITLE__/$2/" $P/head16.js > $D/main.js; cat $D/scene.js $P/tail16.js >> $D/main.js; echo "END=$END"
