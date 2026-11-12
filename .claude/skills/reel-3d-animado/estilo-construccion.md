# Estilo B — "Construyes X… pero" (referencia: video de alberca, 21 M de vistas en Instagram)

Análisis del video de referencia (103,6 s, 716×1274, 30 fps):
- **Formato narrativo:** segunda persona ("Cavas un hueco en tu patio…"). Cada 5–8 s aparece un PROBLEMA ("Pero…") y su SOLUCIÓN técnica: excavar → el agua se filtra → las paredes se derrumban → varilla + concreto lanzado → el agua subterránea empuja la alberca → válvula hidrostática → agua verde estancada → bomba + filtro de arena → desnatador → dren de fondo → boquillas de retorno → cloro → olor a cloro (cloraminas) → azulejo, escalera y trampolín → "Felicidades, tienes una alberca".
- **Visual:** 3D low-poly brillante de día (casas de techo naranja, árboles poligonales, nubes, cerca blanca, flores). **Vista en corte** del terreno (capas de tierra, piedras, agua subterránea azul). Sin personajes; los protagonistas son la obra y las piezas. Partículas (gotas, grava), flechas blancas de presión, líneas punteadas de flujo.
- **Cámara:** ~12 cortes; casi todo con movimientos suaves (acercamiento a la pieza, giro alrededor, plano detalle en corte).
- **Subtítulos:** UNA palabra a la vez, centrada (~y 45 %), blanca, negrita, con sombra; los términos técnicos en amarillo, y aparece además una **etiqueta amarilla curva flotando en 3D** con el nombre de la pieza (CONCRETO LANZADO, VÁLVULA HIDROSTÁTICA, FILTRO DE ARENA, DESNATADOR, DREN DE FONDO).
- **Audio:** voz en off; hay silencios reales (piso de −78 dB), así que no hay música continua, o está muy baja. Los efectos son sutiles.
- **Motor viral:** la satisfacción de ver construir algo + "pero" constante (micro-gancho cada pocos segundos) + aprender nombres técnicos + un final con recompensa.

## Marca de la cuenta (obligatorio en todos los videos)
- Marca de agua todo el video: píldora semitransparente arriba a la derecha (y≈128) con la mascota (`marca/perfil_mascota_azul.png`) y el texto **"Así Funciona Rai"**.
- Cierre de ~2,5 s después de la última palabra: fondo oscurecido, mascota en círculo amarillo, "¡SÍGUEME!" (amarillo con contorno), "Así Funciona Rai", botón "+ SEGUIR" y "Más videos de cómo funcionan las cosas". Alargar END y el audio (whole_dur/atrim) para que quepa.
- Versión YouTube: mismo video con cierre **¡SUSCRÍBETE!** y botón rojo "SUSCRIBIRSE" (`?cta=yt` / `CTA=yt`).
- Implementación: funciones `watermark()` y `followCTA()` en `plantilla-construccion/main.js`; `build.sh` genera las dos versiones.
