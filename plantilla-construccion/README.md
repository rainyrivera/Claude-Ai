# Plantilla "Así funciona con Rai" — Estilo B (construcción en corte), 9:16

Base: video de la regleta/luz (`reel-luz/`). Es el formato actual de la cuenta.

## Lo que ya trae (no quitar)
- Marca de agua **"Así funciona con Rai"** con la mascota, arriba a la derecha, todo el video (`watermark()`).
- Cierre de 3,7 s: **¡SÍGUEME!** + botón "+ SEGUIR" (Instagram/Facebook/TikTok) o **¡SUSCRÍBETE!** + "SUSCRIBIRSE" (YouTube) (`followCTA()`, `?cta=yt`).
- Subtítulos de una palabra (palabras clave en amarillo), etiquetas amarillas curvas en 3D, cámara con movimientos suaves, SFX sincronizados, música a −38 dB, mezcla −14 LUFS.

## Video nuevo
1. Copia esta carpeta a `reel-<tema>/src3d/` y ejecuta `npm install`.
2. Pon la voz como `voz.mp3`.
3. `align.py`: cambia `PH` por las frases del guion nuevo y genera `timing.json`.
4. `main.js`:
   - Pon `END = <última palabra + 3,7>`.
   - Construye los escenarios y piezas NUEVOS del tema. Reutiliza `makeChar`, `pose`, las etiquetas (`overlayLabels`) y la capa 2D.
   - Sincroniza con `T('palabra', n)`.
5. `audio.py`: cambia los SFX por los del tema. El cierre ya se ajusta solo a `END`.
6. Haz previews con `node render.js preview 1,5,10 carpeta` (usa `CTA=yt` para ver el cierre de YouTube).
7. Render final: `VENV=<venv con numpy> ./build.sh reel_<tema>`. Genera dos archivos:
   - `reel_<tema>_9x16.mp4`, con el cierre ¡SÍGUEME!
   - `reel_<tema>_youtube_9x16.mp4`, con el cierre ¡SUSCRÍBETE!

Guía completa: `.claude/skills/reel-3d-animado/SKILL.md` y `estilo-construccion.md`.
