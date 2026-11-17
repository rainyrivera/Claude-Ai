# Prompt para crear un video nuevo en otro chat

Copiar y pegar en un chat nuevo de Claude Code abierto sobre este repositorio (`rainyrivera/Claude-Ai`),
adjuntando el audio. Cambiar lo que está entre [corchetes].

---

Te paso el audio de mi próximo video para la cuenta "Así funciona con Rai": [nombre_del_audio.mp3].
Tema: [tema, p. ej. "por qué se cae el agua de la cisterna"]. Guion: [pegar el guion, o "ya está en reel-<tema>/guion.md"].

Créame el video completo siguiendo estas reglas:

1. **Antes de empezar**, lee `CLAUDE.md`, la skill `.claude/skills/reel-3d-animado/SKILL.md`,
   `plantilla-construccion/README.md` y `estilo-construccion.md`. Úsalos como manual.
2. **Estilo:** Estilo B "construcción en corte" en 3D (three.js), 1080×1920, 30 fps, ~1:45.
   - Mismos personajes: el dueño de casa (camisa naranja) y el ingeniero (camisa azul, casco amarillo, portapapeles).
   - Escenario y situaciones nuevos, hechos para este guion. Nada de animación 2D plana.
   - Toma como base el código más reciente: `reel-comprar-casa/src3d/` (o `reel-fuga-luz/src3d/`, `reel-fuga-agua/src3d/`). Copia la plantilla a `reel-[tema]/src3d/`.
3. **Sincronía:**
   - Alinea la voz con `align.py`: frases por silencios.
   - Etiquetas y animaciones con `T('palabra', n)`. Cuenta bien las palabras repetidas.
   - Subtítulos karaoke abajo, títulos con arco arriba.
   - Nada importante en la zona de botones de TikTok.
4. **Marca:**
   - Marca de agua "Así funciona con Rai" arriba a la derecha durante todo el video.
   - Cierre de 3,7 s.
   - Dos versiones:
     - `reel_[tema]_9x16.mp4` con ¡SÍGUEME!, para Instagram, Facebook y TikTok.
     - `reel_[tema]_youtube_9x16.mp4` con ¡SUSCRÍBETE!, para YouTube.
5. **Audio:**
   - Mi voz sin cambiar la velocidad, más música con ducking y SFX en las palabras clave.
   - Mezcla final −14 LUFS.
6. **Revisión antes del render:**
   - Haz previews (`node render.js preview ...`) y hojas de contacto, y míralas.
   - Corrige personajes que tapen lo importante, cámaras dentro de paredes, textos encimados y elementos cortados.
7. **Render (importante):**
   - Usa `./partes.sh`, no `build.sh`. Las tareas en segundo plano se cortan a las 2 horas y con `build.sh` se pierde todo.
   - Lanza 4 copias en segundo plano, cada una con timeout máximo y un PORT distinto: `PORT=8781 VENV=<venv con numpy> ./partes.sh reel_[tema]`, luego 8782, 8783 y 8784.
   - Cuando una copia termine, revisa `seg/` y vuelve a lanzarla hasta que diga "listo".
8. **Revisión final:**
   - Duración igual a END.
   - Volumen de unos −14 LUFS.
   - Hoja de contacto que incluya los dos cierres.
   - Luego haz commit y push a tu rama, y mándame los dos videos para verlos aquí.
9. **Descripciones:**
   - Escríbelas en `reel-[tema]/descripcion.md` y pégalas en el chat.
   - Para Instagram, Facebook y TikTok: gancho, emojis, pregunta para comentarios, "Sígueme 👉 Así funciona con Rai" y hashtags.
   - Para YouTube: título con #Shorts, descripción, fuentes y etiquetas.
10. **Exactitud:**
    - Verifica los datos con búsqueda y cita las fuentes en `guion.md`.
    - Si el tema es de electricidad, gas o estructura, agrega en pantalla o en la descripción que lo revise un profesional.
    - Dime con honestidad lo que no se pudo hacer.

Responde en español, breve y claro. No me hagas preguntas si puedes decidir tú; avísame en cuanto tengas los videos.

---

## Variante: si todavía no tienes guion

> Dame 3 ideas fuertes para un video de "Así funciona con Rai" (construcción, reparación, casa, energía) que ahorren dinero o tiempo,
> con una prueba que la gente pueda hacer en su casa, como la de los paneles solares que tuvo 1,1 M de vistas.
> Nada genérico: gancho fuerte en el segundo 0. Luego escribe el guion de la que elija, de ~1:45,
> con palabras fáciles, como hablándole a un amigo, en el español que se usa en toda Latinoamérica, y con fuentes verificadas.
