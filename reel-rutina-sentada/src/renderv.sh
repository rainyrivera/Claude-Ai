#!/bin/bash
# usage: renderv.sh dir dur outpath
D=$1; DUR=$2; OUT=$3
python3 build.py $D $DUR || exit 1
cd $D
N=$(python3 -c "import math;print(math.ceil($DUR*30))"); Q=$(( (N+3)/4 ))
for i in 0 1 2 3; do s=$((i*Q)); e=$(( (i+1)*Q )); [ $e -gt $N ] && e=$N; node ../../sit/render.js $s $e seg$i.mp4 & done; wait
printf "file seg0.mp4\nfile seg1.mp4\nfile seg2.mp4\nfile seg3.mp4\n" > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -i voice.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
