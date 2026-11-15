#!/bin/bash
# Renders the AHA! app icons from scratch with ImageMagick.
#
# Why not just convert icon.svg? This machine's ImageMagick has no librsvg delegate, so it falls
# back to its own SVG renderer, which silently drops linearGradient fills and leaves the artwork
# black. Compositing the same shapes here keeps the gradients and needs no extra tooling.
# icon.svg stays the source of truth for the in-app logo, where the browser renders it properly.
set -euo pipefail
cd "$(dirname "$0")"
out=../public
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

S=512
SPARK="path 'M256 112 Q278 226 392 248 Q278 270 256 384 Q234 270 120 248 Q234 226 256 112 Z'"
CORE="path 'M256 170 Q268 236 334 248 Q268 260 256 326 Q244 260 178 248 Q244 236 256 170 Z'"
SPARK_SM="path 'M392 352 Q399 379 426 386 Q399 393 392 420 Q385 393 358 386 Q385 379 392 352 Z'"
SPARK_XS="path 'M116 132 Q121 152 141 157 Q121 162 116 182 Q111 162 91 157 Q111 152 116 132 Z'"

# Background: true diagonal indigo -> violet. barycentric interpolates between the two corners,
# which beats rotating a linear gradient and cropping (that leaves bare wedges at the corners).
magick -size ${S}x${S} xc: \
  -sparse-color barycentric "0,0 #8a4cf0 $((S-1)),$((S-1)) #17104d" "$tmp/bg.png"

# The gold spark, filled with its own vertical gradient through a path-shaped mask.
magick -size ${S}x${S} gradient:'#fff6c9-#ffa41b' "$tmp/goldgrad.png"
magick -size ${S}x${S} xc:black -fill white -draw "$SPARK" "$tmp/sparkmask.png"
magick "$tmp/goldgrad.png" "$tmp/sparkmask.png" \
  -alpha off -compose copyopacity -composite "$tmp/spark.png"

# Glow: drawn on its own layer and blurred, so it fades out instead of ending at a visible rim.
magick -size ${S}x${S} xc:none -fill 'rgba(255,196,64,0.5)' -stroke none \
  -draw "circle 256,248 256,368" -blur 0x60 "$tmp/glow.png"

# Orbit: a dim wide band for bloom, then a bright thin wire on top. Use rgba() rather than
# 8-digit hex — -draw treats '#rrggbbaa' as opaque, which turned the orbit into a flat grey band.
magick "$tmp/bg.png" "$tmp/glow.png" -compose over -composite \
  -fill none -stroke 'rgba(255,205,90,0.16)' -strokewidth 14 \
    -draw "translate 256,268 rotate -24 ellipse 0,0 196,74 0,360" \
  -stroke 'rgba(255,221,130,0.92)' -strokewidth 4 \
    -draw "translate 256,268 rotate -24 ellipse 0,0 196,74 0,360" \
  -stroke none "$tmp/base.png"

magick "$tmp/base.png" "$tmp/spark.png" -composite \
  -fill '#fffdf2' -draw "$CORE" \
  -fill '#ffe79a' -draw "$SPARK_SM" \
  -fill 'rgba(255,231,154,0.8)' -draw "$SPARK_XS" "$tmp/art.png"

# Rounded-square mask for the regular icon. Maskable icons stay square: the launcher crops them,
# and a pre-rounded maskable icon gets its corners clipped twice.
magick -size ${S}x${S} xc:black -fill white \
  -draw "roundrectangle 0,0,$((S-1)),$((S-1)),114,114" "$tmp/round.png"
magick "$tmp/art.png" "$tmp/round.png" -alpha off -compose copyopacity -composite "$tmp/rounded.png"

magick "$tmp/rounded.png" -resize 512x512 "$out/icon-512.png"
magick "$tmp/rounded.png" -resize 192x192 "$out/icon-192.png"
magick "$tmp/rounded.png" -resize 64x64   "$out/favicon-64.png"
# Apple touch icons are composited onto an opaque tile, so give them a solid backdrop.
magick "$tmp/art.png" -background '#17104d' -alpha remove -alpha off \
  -resize 180x180 "$out/apple-touch-icon.png"

# Maskable: same art inset to the 80% safe zone, on an opaque square.
magick "$tmp/art.png" -resize 410x410 \
  -background '#2a1a73' -gravity center -extent 512x512 -alpha off "$out/icon-maskable-512.png"

echo "wrote: $(cd "$out" && ls icon-512.png icon-192.png favicon-64.png apple-touch-icon.png icon-maskable-512.png | tr '\n' ' ')"
