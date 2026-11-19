#!/usr/bin/env bash
# Накладывает два PNG-стикера на готовый рилс: плавное появление + лёгкое покачивание.
# ./add_stickers.sh in.mp4 sticker1.png x1 y1 sticker2.png x2 y2 out.mp4
set -euo pipefail
IN="$1"; S1="$2"; X1="$3"; Y1="$4"; S2="$5"; X2="$6"; Y2="$7"; OUT="$8"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
ffmpeg -y -i "$IN" -loop 1 -t "$DUR" -i "$S1" -loop 1 -t "$DUR" -i "$S2" -filter_complex "
  [1:v]format=rgba,fade=in:st=0.3:d=0.5:alpha=1[s1];
  [2:v]format=rgba,fade=in:st=0.7:d=0.5:alpha=1[s2];
  [0:v][s1]overlay=x=${X1}:y='${Y1}+9*sin(2*PI*t/2.6)':shortest=1[v1];
  [v1][s2]overlay=x=${X2}:y='${Y2}+9*sin(2*PI*t/2.6+1.6)':shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -preset medium -crf 17 -profile:v high -c:a copy -movflags +faststart "$OUT"
echo "Готово: $OUT"
