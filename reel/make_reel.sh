#!/usr/bin/env bash
# Монтаж рилса в стиле референса: фон — видео букета, сверху — врезка мультика
# с растушёванными краями, внизу — белый текст с тенью, звук — из мультика.
# Использование:
#   ./make_reel.sh bouquet.mp4 cartoon.mp4 [начало_мультика_сек] [длительность_сек] ["текст"] [out.mp4]
set -euo pipefail
BG="$1"; CART="$2"; START="${3:-0}"; DUR="${4:-6}"
TEXT="${5:-+1 её незакрытый гештальт\nполучить трендовый букет}"
OUT="${6:-reel.mp4}"
FONT="$(fc-match -f '%{file}' 'DejaVu Sans:light' 2>/dev/null || echo /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf)"
TXT=$(mktemp); printf "%b" "$TEXT" > "$TXT"

# Врезка 860x484 (16:9), маска с мягкими краями (feather)
ffmpeg -y -ss "$START" -t "$DUR" -i "$CART" -stream_loop -1 -i "$BG" \
  -f lavfi -t "$DUR" -i "color=black:s=860x484,format=gray,drawbox=x=40:y=40:w=780:h=404:color=white:t=fill,gblur=sigma=22" \
  -filter_complex "
    [1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,
         eq=saturation=1.08:contrast=1.03,trim=0:${DUR},setpts=PTS-STARTPTS[bg];
    [0:v]scale=860:484:force_original_aspect_ratio=increase,crop=860:484,setsar=1,fps=30,format=rgba[c];
    [2:v]format=gray,fps=30[m];
    [c][m]alphamerge[cm];
    [bg][cm]overlay=x=(W-w)/2:y=330:shortest=1,
      drawtext=fontfile='${FONT}':textfile='${TXT}':fontcolor=white:fontsize=50:line_spacing=14:
        shadowcolor=black@0.55:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h*0.74,format=yuv420p[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -preset medium -crf 18 -profile:v high \
  -c:a aac -b:a 192k -af "afade=t=in:d=0.2,afade=t=out:st=$(echo "$DUR-0.4"|bc):d=0.4" \
  -t "$DUR" -movflags +faststart "$OUT"
rm -f "$TXT"
echo "Готово: $OUT"
