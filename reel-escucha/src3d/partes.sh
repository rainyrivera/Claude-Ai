#!/bin/bash
# Render por partes (para no pasar el límite de ~2 h por tarea en segundo plano).
# Uso (desde src3d/):  PORT=8781 VENV=/ruta/venv ./partes.sh nombre
#  - Renderiza partes de 400 cuadros en seg/ (se saltan las ya hechas; varias copias en paralelo
#    con PORT distinto se reparten el trabajo con candados).
#  - Se detiene sola a los ~80 min ("presupuesto agotado"): volver a lanzarla y sigue donde quedó.
#  - Cuando todas las partes existen, arma ../nombre_9x16.mp4 (¡SÍGUEME!) y ../nombre_youtube_9x16.mp4 (¡SUSCRÍBETE!).
set -e; cd "$(dirname "$0")"; NAME=${1:-reel}; PORT=${PORT:-8767}; PY=${VENV:+$VENV/bin/}python3; T0=$(date +%s)
END=$(grep -oP 'END = \K[0-9.]+' main.js | head -1); N=$(python3 -c "print(round($END*30))"); FR=$(python3 -c "print(round(($END-3.7)*30)-3)")
mkdir -p seg; [ -f music.wav ] && [ -f sfx.wav ] || { $PY align.py >/dev/null; $PY audio.py; }
Q=""; for ((a=0;a<N;a+=400)); do b=$((a+400<N?a+400:N)); Q+="m $a $b -"$'\n'; done; Q+="yt $FR $N yt"
while read -r tag a b cta; do
  out=seg/${tag}_$(printf %05d $a).mp4; [ -f $out ] && continue
  [ $(( $(date +%s) - T0 )) -gt 4800 ] && { echo "presupuesto agotado: vuelve a lanzar ./partes.sh $NAME"; exit 0; }
  mkdir $out.lock 2>/dev/null || continue; echo "$(date +%T) parte $tag $a-$b"
  [ "$cta" = "-" ] && cta=""
  if CTA=$cta START=$a STOP=$b PORT=$PORT node render.js full $out.part.mp4 >/dev/null 2>&1 && ffprobe -v error $out.part.mp4; then mv $out.part.mp4 $out; else echo "FALLÓ parte $tag $a"; fi
  rmdir $out.lock
done <<< "$Q"
for ((a=0;a<N;a+=400)); do [ -f seg/m_$(printf %05d $a).mp4 ] || { echo "faltan partes (otra copia sigue trabajando o hay que relanzar)"; exit 0; }; done
[ -f seg/yt_$(printf %05d $FR).mp4 ] || { echo "falta el cierre de YouTube"; exit 0; }
ls seg/m_*.mp4 | sort | sed "s|^|file '$PWD/|;s|$|'|" > seg/list.txt
ffmpeg -v error -y -f concat -safe 0 -i seg/list.txt -c copy seg/v.mp4
ffmpeg -v error -y -i seg/v.mp4 -i voz.mp3 -i music.wav -i sfx.wav -filter_complex "[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-2:LRA=7,apad=whole_dur=$END[v];[v]asplit[v1][vk];[2:a]volume=-38dB[m];[m][vk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[3:a]volume=-10dB[fx];[v1][md][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:$END[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "../${NAME}_9x16.mp4"
ffmpeg -v error -y -i "../${NAME}_9x16.mp4" -i seg/yt_$(printf %05d $FR).mp4 -filter_complex "[0:v]trim=end_frame=$FR,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]" -map "[v]" -map 0:a -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -c:a copy -movflags +faststart "../${NAME}_youtube_9x16.mp4"
echo "listo: ../${NAME}_9x16.mp4 y ../${NAME}_youtube_9x16.mp4"
