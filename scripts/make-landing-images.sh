#!/usr/bin/env bash
# Rebuild the landing page's pictures in public/landing. Needs ffmpeg.
#
#   bash scripts/make-landing-images.sh [folder with the key art, default ../../Images]
#
# From the key art folder:  k0.png / k1.png  the chip, unlit and lit (the hero)
#                           l1.png, p1.png, m1.png  one picture per project
# From each film's frames:  two stills per project
#
# The six demo-*.webp files are not made here. They are screenshots of the three demos,
# taken once in each language at twice the tile's size; retake them if a demo's look changes.
set -euo pipefail
cd "$(dirname "$0")/.."
art="${1:-../../Images}"
out=public/landing
mkdir -p "$out"

enc() { ffmpeg -v error -y -i "$1" -vf "$2" -c:v libwebp -quality "$3" -compression_level 6 -frames:v 1 "$4"; }

# The two chips are scaled to exactly the same size, so one fades in over the other in register.
for pair in off:k0 on:k1; do
  name=${pair%%:*}; file=${pair##*:}
  enc "$art/$file.png" "scale=1672:941:flags=lanczos" 82 "$out/chip-$name.webp"
  enc "$art/$file.png" "scale=960:540:flags=lanczos" 78 "$out/chip-$name-960.webp"
done

for pair in korean:l1 pic2plate:p1 tool-wear:m1; do
  name=${pair%%:*}; file=${pair##*:}
  enc "$art/$file.png" "scale=1280:-2:flags=lanczos" 80 "$out/art-$name.webp"
  enc "$art/$file.png" "scale=720:-2:flags=lanczos" 76 "$out/art-$name-720.webp"
done

still() { enc "public/$1/frames/frame_$(printf %04d "$2").webp" "scale=800:-2:flags=lanczos" 76 "$out/still-$3.webp"; }
still korean-shadowing 100 korean-a
still korean-shadowing 229 korean-b
still pic2plate 112 pic2plate-a
still pic2plate 215 pic2plate-b
still tool-wear 140 tool-wear-a
still tool-wear 200 tool-wear-b

du -sh "$out"
