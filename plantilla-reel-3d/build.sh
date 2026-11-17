#!/bin/bash
# Uso: VENV=/ruta/venv ./build.sh salida.mp4   (requiere ffmpeg, node con playwright, numpy)
set -e; cd "$(dirname "$0")"; OUT=${1:-../reel_eyaculacion_precoz_3d_9x16.mp4}; PY=${VENV:+$VENV/bin/}python3
$PY align.py >/dev/null; $PY audio.py
node render.js full /tmp/_reel3d_noaudio.mp4
ffmpeg -v error -y -i /tmp/_reel3d_noaudio.mp4 -i voz.mp3 -i music.wav -i sfx.wav -filter_complex "[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-2:LRA=7,apad=whole_dur=56[v];[v]asplit[v1][vk];[2:a]volume=-17dB[m];[m][vk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[3:a]volume=-11dB[fx];[v1][md][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:56[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
echo "listo: $OUT"
