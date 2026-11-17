# Plantilla — Reel 3D animado (9:16)

Copia de la base del video aprobado (`reel-eyaculacion-precoz/`). Para un video nuevo:

1. Copia esta carpeta a `<tema>/src3d/` y ejecuta `npm install`.
2. Pon la voz como `voz.mp3`.
3. `align.py`: reemplaza la lista `PH` con las frases del nuevo guion (una por pausa de la voz) → genera `timing.json`.
4. `main.js`: ajusta `CUTS` (escenarios por tiempo), `HEAD` (etiqueta + titular), las funciones `animX(t)` de cada escena, el título del gancho y la encuesta en `overlays()`. Sincroniza con `T('palabra', n)`.
5. `audio.py`: ajusta los efectos a las palabras/cortes nuevos.
6. Previews: `node render.js preview 1,5,10 carpeta`. Final: `VENV=<venv con numpy> ./build.sh salida.mp4`.

Piezas reutilizables en `main.js`: `makeChar` (personajes con emociones), `pose`, `makeWatch`, `label`, `floorDisc`, escenarios (dormitorio, laboratorio, consulta, escenario de color, rayos X), capa 2D (`header`, `captions`, `pending`, `overlays`).
Guía completa de estilo y proceso: `.claude/skills/reel-3d-animado/SKILL.md`.
