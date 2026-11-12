#!/bin/bash
# Uso: VENV=/ruta/venv ./build.sh nombre      → ../nombre_9x16.mp4 (Instagram/Facebook/TikTok, cierre ¡SÍGUEME!)
#                                              → ../nombre_youtube_9x16.mp4 (YouTube Shorts, cierre ¡SUSCRÍBETE!)
# Requiere ffmpeg, node con playwright (preinstalado) y numpy. END se lee de main.js.
set -e; cd "$(dirname "$0")"; NAME=${1:-reel}; PY=${VENV:+$VENV/bin/}python3
END=$(grep -oP 'END = \K[0-9.]+' main.js | head -1); FR=$(python3 -c "print(round(($END-3.7)*30)-3)")
TMP=$(mktemp -d)
$PY align.py >/dev/null; $PY audio.py
node render.js full $TMP/v.mp4
ffmpeg -v error -y -i $TMP/v.mp4 -i voz.mp3 -i music.wav -i sfx.wav -filter_complex "[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-2:LRA=7,apad=whole_dur=$END[v];[v]asplit[v1][vk];[2:a]volume=-38dB[m];[m][vk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[3:a]volume=-10dB[fx];[v1][md][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:$END[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "../${NAME}_9x16.mp4"
# versión YouTube: solo se re-renderiza el cierre y se empalma
CTA=yt START=$FR node render.js full $TMP/yt.mp4
ffmpeg -v error -y -i "../${NAME}_9x16.mp4" -i $TMP/yt.mp4 -filter_complex "[0:v]trim=end_frame=$FR,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]" -map "[v]" -map 0:a -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -c:a copy -movflags +faststart "../${NAME}_youtube_9x16.mp4"
rm -rf $TMP; echo "listo: ../${NAME}_9x16.mp4 y ../${NAME}_youtube_9x16.mp4"
