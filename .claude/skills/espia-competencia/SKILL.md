---
name: espia-competencia
description: Skill 1 del flujo de anuncios. Investiga los anuncios de la competencia en la Biblioteca de Anuncios de Meta (Facebook/Instagram), prioriza los que más tiempo llevan activos y extrae de ellos ángulos, ganchos, ofertas y formatos que funcionan. Úsala cuando el usuario diga "espía a mi competencia", "qué anuncios corren en mi nicho", "biblioteca de anuncios", "qué ángulos usan mis competidores", "investiga anuncios de X marca", o cuando vaya a crear anuncios nuevos y no tenga ángulos validados. Sirve para cualquier negocio físico (tienda, restaurante, clínica, ecommerce) o digital (cursos, software, servicios online).
---

# Espía de la competencia

Objetivo: encontrar los anuncios de la competencia que llevan **más días activos**. En Meta, un anuncio que sigue corriendo semanas o meses suele ser señal de que es rentable: nadie paga por mucho tiempo un anuncio que pierde dinero. De ellos se sacan **ángulos probados** para la skill 2 (`guionista-anuncios`).

## Paso 0 — Ficha del negocio (obligatoria)

Si no la tienes ya en la conversación, pide solo lo que falte:

- Qué vendes y si es **físico** (envío / local a la calle) o **digital**.
- Precio y, si lo saben, margen aproximado.
- País/ciudad donde venden (la biblioteca filtra por país).
- 2–5 competidores conocidos (nombres de páginas de Facebook/Instagram) y/o palabras clave del nicho.
- Para negocio local: radio de acción (ej. "Madrid centro, 10 km").

## Paso 1 — Conseguir los anuncios (sin inventar nada)

Usa la primera vía que esté disponible:

1. **Conector de Meta/Facebook** si hay herramientas `mcp__Facebook__*` u otras de la Biblioteca de Anuncios conectadas.
2. **Navegador** (Claude in Chrome o navegador integrado) en `https://www.facebook.com/ads/library/` con: país, categoría "Todos los anuncios", estado "Activos", búsqueda por palabra clave o por página.
3. **Material del usuario**: pídele capturas o enlaces de los anuncios (botón "Ver detalles del anuncio" muestra la fecha de inicio).

Si ninguna vía funciona, **dilo y detente**. Nunca inventes anuncios, fechas ni competidores.

## Paso 2 — Qué registrar de cada anuncio

Para cada anuncio activo registra:

| Campo | Dónde se ve |
|---|---|
| Anunciante | Nombre de la página |
| Fecha de inicio → **días activo** | "Empezó a circular el …" (calcula días hasta hoy) |
| Nº de versiones | "X anuncios usan este contenido" (muchas versiones = lo están testeando/escalando) |
| Formato | Video/reel, imagen, carrusel |
| Plataformas | Facebook, Instagram, Messenger, Audience Network |
| Gancho | Primeros 3 segundos del video o primera línea del texto |
| Ángulo | La idea central (dolor, deseo, miedo, ahorro, estatus, rapidez, prueba social, novedad…) |
| Oferta | Precio, descuento, garantía, envío gratis, regalo, cita gratis, prueba gratis |
| CTA | Botón y frase final |
| Destino | Web, WhatsApp, formulario, tienda, llamada, mapa |

## Paso 3 — Filtrar y priorizar

- **Prioridad alta**: activos **≥ 30 días**, sobre todo si tienen varias versiones.
- **Prioridad media**: 14–29 días.
- **Ignora** < 7 días (todavía en prueba, no prueban nada).

Advertencias que debes decir siempre:
- La antigüedad es un **indicio, no una prueba**: una marca grande puede dejar un anuncio con poco presupuesto por inercia.
- La biblioteca **no muestra gasto ni resultados** de anuncios comerciales (solo para anuncios políticos/temas sociales y algunos datos de alcance en la UE). No afirmes que un anuncio "vende mucho".

## Paso 4 — Entregable

1. **Tabla Top 10** de anuncios ordenados por días activo.
2. **Mapa de ángulos**: agrupa los anuncios por ángulo y cuenta cuántos competidores usan cada uno.
3. **Huecos**: ángulos que nadie está usando o que se usan mal (oportunidad).
4. **5–8 ángulos recomendados** para el negocio del usuario, cada uno con:
   - Nombre del ángulo
   - Evidencia (qué anuncios lo usan y cuántos días llevan)
   - Adaptación al negocio del usuario (no copiar: adaptar)
   - Ejemplo de gancho de una línea
5. Cierra ofreciendo pasar los ángulos a la skill **`guionista-anuncios`**.

## Adaptación físico vs digital

- **Físico/ecommerce**: fíjate en demostración del producto, unboxing, comparación, envío/contraentrega, garantía, UGC (clientes grabando).
- **Negocio local**: ubicación, "a X minutos de ti", promos por tiempo limitado, testimonios de vecinos, botón de WhatsApp/llamada/ruta.
- **Digital**: transformación antes/después (cuidado con las políticas), autoridad del experto, lead magnet gratis, webinar, prueba gratuita.

## Reglas

- No copies textos ni creatividades literalmente: extrae el **patrón** y adáptalo.
- Distingue siempre lo que **viste** de lo que **supones**.
