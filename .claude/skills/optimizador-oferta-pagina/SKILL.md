---
name: optimizador-oferta-pagina
description: Skill 6 del flujo de anuncios. Diagnostica y mejora lo que pasa DESPUÉS del clic: página de venta (landing, tienda, Skool, Hotmart, Shopify, WhatsApp, formulario), oferta, precio, ticket medio y coherencia anuncio-página, y entrega cambios priorizados para testear. Úsala cuando el usuario diga "mi página no convierte", "la gente hace clic pero no compra", "revisa mi página de venta", "mejora mi oferta", "cómo subo el ticket medio", "order bump/upsell", "mi landing", o cuando vigilante-rentabilidad detecte CTR bueno pero baja conversión. Sirve para cualquier negocio físico o digital.
---

# Optimizador de oferta y página

Regla base: si el anuncio consigue clics pero no ventas, **no se arregla con más anuncios**. Se arregla en la página, la oferta o el precio. Esta skill encuentra **dónde** se pierde la venta y propone cambios **testeables**.

## Paso 0 — Entradas

- **Página**: URL, o capturas completas en móvil (de arriba abajo) si no se puede abrir.
- **Anuncios que llevan a esa página**: gancho y promesa de cada uno (para revisar la coherencia).
- **Métricas** de `vigilante-rentabilidad`: CTR de enlace, clic → visita, visita → pago iniciado, pago → compra, CPA.
- **Modelo de cobro**: pago único, suscripción mensual/anual, prueba gratis, contraentrega, cita/lead.
- Para **suscripciones**: retención media (meses que paga un cliente) o, si no la saben, la tasa de bajas mensual.

Si no puedes abrir la URL (bloqueo de red, página solo con JavaScript o detrás de un inicio de sesión), **dilo** y pide capturas. No describas una página que no viste.

## Paso 1 — Localizar la fuga (con datos)

| Dónde cae | Señal | Primera hipótesis |
|---|---|---|
| Clic → visita < ~70 % | Muchos clics no cargan la página | Velocidad en móvil, redirecciones, app interna de Instagram/Facebook |
| Visita → pago iniciado bajo | Ven la página y se van | Incoherencia con el anuncio, titular, prueba, precio poco claro |
| Pago iniciado → compra bajo | Empiezan y abandonan | Checkout largo, pocos métodos de pago, sorpresa en el precio o el envío |
| Sin datos intermedios | Columnas vacías | **Primero arreglar la medición** (eventos del píxel / API de conversiones) |

Si faltan datos intermedios, la primera recomendación siempre es medirlos: sin eso cualquier cambio es a ciegas.

## Paso 2 — Auditoría de la página (checklist, en móvil)

Puntúa cada punto como OK / Mejorable / Falta, citando lo que ves:

1. **Coherencia anuncio → página**: el titular repite la promesa del gancho que trajo el clic.
2. **Titular**: resultado concreto + para quién es, entendible en 5 segundos.
3. **Por encima del primer scroll**: qué es, para quién, precio o "desde", botón visible.
4. **Prueba**: testimonios reales, número de clientes o miembros, casos, reseñas con nombre.
5. **Qué incluye**: entregables concretos (módulos, sesiones, unidades, envío) en vez de adjetivos.
6. **Objeciones**: "¿es para mí?", tiempo necesario, garantía/devolución, cancelación, envío.
7. **Precio y anclaje**: valor comparado, pago anual vs mensual, qué pasa después del pago.
8. **CTA**: un solo objetivo, verbo de acción, repetido a lo largo de la página.
9. **Técnico**: carga en móvil, el botón funciona dentro de la app de Instagram/Facebook, el píxel dispara en la página y en la compra.
10. **Plataforma**: limitaciones de la plataforma (Skool, Hotmart, Shopify…). Si la plataforma no permite cambiar algo, propón una alternativa (ej. una landing propia antes del checkout). No inventes funciones de la plataforma: si no sabes si existen, dilo y sugiere verificarlo.

## Paso 3 — Economía de la oferta

- **Pago único**: CPA de equilibrio = precio − coste variable.
- **Suscripción**: valor de vida (LTV) ≈ precio mensual × meses medios de permanencia − comisiones de la plataforma y del pago. Usa una versión **conservadora** para decidir el CPA (ej. lo cobrado en los primeros 2–3 meses), no el LTV optimista.
- **Mensaje clave**: si el valor de la primera compra no cubre el CPA, hay 3 palancas, y calcula cuánto necesita cada una para llegar al equilibrio:
  1. **Subir el ticket**: plan anual con descuento, packs, *order bump*, *upsell*, nivel premium.
  2. **Subir la conversión** de la página (Paso 2).
  3. **Aprovechar la recompra o la retención** (solo si hay datos reales que la respalden).

## Paso 4 — Entregable

1. **Diagnóstico en 3 líneas**: dónde se pierde la venta y cuánto cuesta.
2. **Auditoría** (tabla de 10 puntos con evidencia).
3. **Cálculo económico**: CPA de equilibrio actual y qué tendría que cambiar (ticket, conversión o retención) para ser rentable, con números.
4. **Top 5 cambios priorizados** por impacto/esfuerzo. Cada uno con: qué cambiar, texto propuesto si aplica, métrica que debería moverse y cómo testearlo.
5. Cierra conectando: los cambios van al **`plan-testeo-semanal`**; si el ángulo ganador cambia la promesa de la página, avisa a **`guionista-anuncios`** para alinear los anuncios.

## Reglas

- Una prueba a la vez por página (o test A/B real) para saber qué funcionó.
- No inventes testimonios, cifras de miembros ni garantías: usa marcadores `[DATO REAL]`.
- Distingue lo que **viste** en la página de lo que **supones**.
