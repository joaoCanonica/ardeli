#!/usr/bin/env bash
# Gera as fontes do site a partir dos originais (media-originais/fontes, subset latino do Fontsource).
# Precisa de fontTools + brotli (pip install fonttools brotli; não é dependência do projeto).
# - glifos: só o português (Latin básico, Latin-1, aspas, travessões, reticências, setas, €);
# - eixo de peso limitado ao que o site usa (Crimson 400–600; Atkinson 400–700);
# - itálico da Crimson só para a classe gramatical (minúsculas e pontuação).
set -euo pipefail
cd "$(dirname "$0")/.."
O=media-originais/fontes
D=src/assets/fontes
PT='U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2212'
FEAT='kern,liga,ccmp,mark,mkmk,tnum,pnum,lnum,frac,numr,dnom,calt'

limitar() { # origem destino eixo
  python3 -m fontTools.varLib.instancer "$1" "wght=$3" -o /tmp/ardeli-inst.ttf >/dev/null
  python3 -m fontTools.subset /tmp/ardeli-inst.ttf --unicodes="$4" --layout-features="$FEAT" --flavor=woff2 --output-file="$2"
}
limitar $O/crimson-pro-latin-wght-normal.woff2 $D/crimson-pro-pt-normal.woff2 400:600 "$PT"
limitar $O/atkinson-hyperlegible-next-latin-wght-normal.woff2 $D/atkinson-hyperlegible-next-pt-normal.woff2 400:700 "$PT"
limitar $O/atkinson-hyperlegible-next-latin-wght-italic.woff2 $D/atkinson-hyperlegible-next-pt-italic.woff2 400:700 "$PT"
limitar $O/crimson-pro-latin-wght-italic.woff2 $D/crimson-pro-italico-classes.woff2 400:600 'U+0020,U+0028-0029,U+002C-002E,U+0061-007A,U+00E0-00E3,U+00E7,U+00E9-00EA,U+00ED,U+00F3-00F5,U+00FA'
ls -la $D/*.woff2
