---
name: reel-3d-animado
description: Crear reels/TikToks verticales 9:16 animados en 3D con personajes estilo arcilla, subtítulos karaoke y titulares tipo máquina de escribir, a partir de un guion y una voz del usuario. Usar SIEMPRE que el usuario pida un video, reel, TikTok, guion para video o "otro video como el último".
---

# Reel 3D animado — estilo aprobado por el usuario

Plantilla: `plantilla-reel-3d/` (ver su README). Video de referencia: `reel-eyaculacion-precoz/reel_eyaculacion_precoz_3d_9x16.mp4`.
Para un video nuevo: copiar `plantilla-reel-3d/` a `<tema>/src3d/` y seguir su README.

## 1. Guion (antes del video)
- ~40 s hablados (≈120–135 palabras). La voz ElevenLabs "Relaxed" del usuario va más lenta (137 palabras → 55 s): avisar.
- Segundo 0: gancho fuerte (pregunta directa del espectador o situación en la que se mete) + giro inmediato ("Espera… quizás ni la tienes").
- Bucle abierto (PENDIENTE) que se resuelve a mitad del video.
- Escenas cotidianas, segunda persona, frases cortas, cero tono académico.
- Estructura: gancho → dato/experimento real → definición/explicación → causas (3) → solución (3 pasos) → frase-giro memorable → pregunta de encuesta para comentarios.
- Exactitud: verificar datos con búsqueda; atribuir estudios a sus autores reales; interpretaciones con "quizás/una explicación es"; en pantalla poner el dato exacto (p. ej. "MEDIANA 5,4 MIN") aunque la voz simplifique.
- Guardar guion + fuentes en `<tema>/guion.md`. Si el usuario dice que es "básico/genérico", proponer uno totalmente distinto, no retocar.

## 2. Estilo visual (lo que el usuario aprobó)
- 1080×1920, 30 fps, MP4 H.264 + AAC, sin marcas de agua.
- **3D (three.js 0.169)**: personajes procedurales estilo arcilla (`makeChar`) con cara expresiva: emociones `neutral | worried | sad | happy | surprised | determined`, parpadeo, mirada, respiración. Variantes: bata (`coat`), lentes, portapapeles, pelo largo, modo rayos X (`xray`, órganos que brillan).
- Un escenario por bloque (dormitorio nocturno con lámpara cálida y ventana con luna, laboratorio con multitud instanciada, consulta con pizarra, escenarios "vacíos" con disco de luz de color, etc.) y movimiento de cámara continuo (grúa, órbita, push-in). Corte = destello oscuro 0,2 s + whoosh.
- Props expresivos: cronómetro 3D con textura dinámica, celular con pantalla, batería que se descarga, nube con relámpagos, anillo que acelera, pausa 3D, etiquetas sprite tipo píldora.
- Paleta: fondo azul marino casi negro; ámbar #f6b445 (énfasis), rojo #ff4d61, morado #a98bff, azul #6cc4ff, verde #35d39a. Bloom suave, tono ACES, sombras suaves, viñeta y grano.
- **Capa 2D encima** (sistema de 3 textos del video de referencia as.pasa1):
  1. Etiqueta de sección "• SECCIÓN" (JetBrains Mono 24, gris, punto ámbar) y=210.
  2. Titular máquina de escribir (JetBrains Mono 46) y=282, borra y reescribe en cada sección.
  3. Subtítulos karaoke abajo (Montserrat 900, 66 px, caja oscura redondeada, máx. 2 líneas, ≤4 palabras/22 caracteres por bloque, palabra actual ámbar con brillo, dichas blancas, próximas grises) y=1430.
  - Píldora PENDIENTE/RESUELTO y=1600; título grande del gancho con palabra clave en rojo; palabras tachadas → reemplazadas (p. ej. HOMBRÍA → ES SALUD); encuesta final A/B.
- Zonas seguras: nada importante sobre y>1650 ni en el borde derecho 900–1080 entre y=900–1500 (botones de TikTok).

## 3. Audio
- Voz del usuario sin tocar la velocidad. Música: cama sintetizada (acordes Am–F–C–G, bajo pulsado, hi-hat suave) con ducking por la voz; si el usuario da una pista con licencia, usarla.
- SFX sincronizados a palabras: golpe inicial, tics de reloj que aceleran, tape-stop al congelar, whooshes en cortes, pops al aparecer elementos, campanitas al marcar ✓, sello/golpe en "FICCIÓN".
- Mezcla final −14 LUFS (TikTok), voz −15 LUFS antes de mezclar; verificar con `ebur128` y que la voz no se desfase (silencedetect antes/después, ≤0,03 s).

## 4. Proceso técnico
1. `ffprobe` del audio; `silencedetect -40dB d=0.25` → tramos de voz. Deben coincidir 1:1 con las frases del guion (si no, la voz no lee el guion: preguntar).
2. Intentar transcripción con faster-whisper; **en este entorno Hugging Face/OpenAI/Vosk están bloqueados**, así que usar `align.py` (frases por silencios + reparto silábico + micro-pausas). Avisar al usuario de la limitación.
3. Escenas en `main.js`: `CUTS` (tiempo → escenario), `HEAD` (titulares), funciones `animX(t)`; usar `T('palabra', n)` para sincronizar con la voz (ojo con palabras repetidas: contar ocurrencias).
4. Previews: `node render.js preview t1,t2,... outdir` y hoja de contacto (`tile`, no `xstack`: crashea en ffmpeg 6.1). Revisar: elementos cortados en bordes, etiquetas tapando titulares/subtítulos, huecos vacíos en transiciones, legibilidad.
5. Render completo en segundo plano: `VENV=<venv con numpy> ./build.sh` (~1 s/cuadro con SwiftShader, ~30 min para 56 s).
6. QA final: hoja 1 fps de todo el video, duración, LUFS. Luego commit + push y enviar con SendUserFile (`display: render`).

## 5. Trampas conocidas
- No instalar `playwright` local: usar el preinstalado (`/opt/node-tools`).
- `ffmpeg -v error` oculta `showinfo`; para cortes usar `scdet` sin `-v error`.
- Lanzar Chromium con `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- Escalar sprites con `tw/400`; cámara con `fov*1.32` para que quepan los personajes y no tapen los textos.
- TikTok puede limitar temas sexuales/salud: avisar y mantener imágenes no explícitas; sugerir revisión por un profesional en temas de salud.
