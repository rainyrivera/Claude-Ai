#!/bin/bash
# genera src3d/audio.py = audio_base.py con cues.py insertado
P=$(cd "$(dirname "$0")" && pwd); D=$1/src3d
python3 - "$P/audio_base.py" "$D/cues.py" "$D/audio.py" <<'PY'
import sys; b=open(sys.argv[1]).read(); c=open(sys.argv[2]).read(); open(sys.argv[3],'w').write(b.replace('CUES_HERE',c))
PY
