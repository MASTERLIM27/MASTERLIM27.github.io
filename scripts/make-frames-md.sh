#!/usr/bin/env bash
# Rebuild each film's mid-size frame set (public/<route>/frames-md, 1296 px wide) from its
# full-size frames (public/<route>/frames, 1728 px wide). Needs ffmpeg.
#
# src/lib/filmFrames.ts serves this set when the picture is drawn roughly 950–1425 device
# pixels wide, which is most laptops; it is about two thirds of the bytes of the full-size set.
# Run it again whenever a film's frames change:  bash scripts/make-frames-md.sh
set -euo pipefail
cd "$(dirname "$0")/../public"

for route in korean-shadowing pic2plate tool-wear; do
  rm -rf "$route/frames-md"
  mkdir -p "$route/frames-md"
  ffmpeg -v error -y -start_number 1 -i "$route/frames/frame_%04d.webp" \
    -vf "scale=1296:-2:flags=lanczos" -c:v libwebp -quality 76 -compression_level 6 \
    -start_number 1 "$route/frames-md/frame_%04d.webp"
  echo "$route: $(ls "$route/frames-md" | wc -l) frames, $(du -sh "$route/frames-md" | cut -f1)"
done
