---
name: vigilante-rentabilidad
description: Skill 5 del flujo de anuncios. Revisa los resultados reales de Meta Ads (CSV exportado del Administrador de Anuncios, capturas o métricas pegadas) y dice anuncio por anuncio qué escalar, qué mantener, qué pausar y qué está quemando dinero, comparando contra el CPA y ROAS de equilibrio del negocio. Úsala cuando el usuario comparta un informe o métricas y diga "revisa mis anuncios", "qué pauso", "qué escalo", "estoy perdiendo dinero", "analiza este CSV", "¿es rentable?", "mi ROAS/CPA", o en la revisión semanal del plan-testeo-semanal. Sirve para cualquier negocio físico o digital.
---

# Vigilante de rentabilidad

Objetivo: decirle al usuario, con sus datos, **qué escalar, qué pausar y qué quema dinero**, y **por qué**: si el problema está en el anuncio, en la página o en la oferta.

## Paso 0 — Umbrales del negocio

Sin esto no se puede hablar de rentabilidad. Pide:
- **Precio / ticket medio** y **coste variable por venta** (producto, envío, comisiones; en digital puede ser casi 0).
- CPA de equilibrio = precio − coste variable. ROAS de equilibrio = precio ÷ (precio − coste variable).
- CPA objetivo (por defecto 80 % del de equilibrio).
- Para leads/mensajes: tasa de cierre, y CPA objetivo por lead = margen × tasa de cierre.

Si el usuario no los da, haz el análisis con el **mejor caso** (coste variable = 0) y **dilo explícitamente**.

## Paso 1 — Leer los datos

- **CSV del Administrador de Anuncios** (lo ideal, a nivel de *anuncio*): ejecuta
  `python3 scripts/analizar_meta_csv.py <archivo.csv> --precio P --coste-variable C`
  (o `--cpa-equilibrio X [--cpa-objetivo Y]`). El script reconoce encabezados en español e inglés y los espacios invisibles (`\xa0`) que Meta mete en algunos nombres de columna.
- **Conector de Meta/Facebook**, si está autorizado: trae las mismas métricas a nivel de anuncio.
- **Capturas**: transcribe los números a una tabla y confirma con el usuario antes de concluir.

Columnas recomendadas para exportar: nombre del anuncio, entrega, importe gastado, impresiones, CPM, clics en el enlace, CTR (enlace), visitas a la página de destino, pagos iniciados, resultados, coste por resultado, valor de conversión de compras, reproducciones de 3 s y ThruPlays.

## Paso 2 — Diagnóstico por embudo

Calcula y lee de arriba abajo; el primer eslabón débil es el problema:

| Métrica | Fórmula | Si está mal, el problema es… |
|---|---|---|
| CPM | gasto ÷ impresiones × 1000 | Público/competencia/temporada (o creatividad de baja calidad) |
| Gancho 3 s (solo video) | reproducciones 3 s ÷ impresiones | Primeros 3 segundos |
| CTR de enlace | clics en el enlace ÷ impresiones | Mensaje/creatividad/oferta del anuncio |
| Clic → visita | visitas a la página ÷ clics | Velocidad de carga de la web o clics accidentales |
| Visita → pago iniciado | pagos iniciados ÷ visitas | Página, precio, oferta, confianza |
| Pago iniciado → compra | compras ÷ pagos iniciados | Checkout, envío, métodos de pago |
| CPA y ROAS | vs umbrales | Rentabilidad final |

Usa **CTR de enlace**, no "CTR (todos)": este último cuenta clics en "ver más", perfil, etc.
Compara los anuncios **entre sí** y contra el promedio de la cuenta, antes que contra "promedios de la industria" (muy variables por país y nicho).

## Paso 3 — Veredicto por anuncio

Mismas reglas que `plan-testeo-semanal` (CPAo = CPA objetivo):
- **GANADOR → escalar**: CPA ≤ CPAo con ≥ 3 resultados.
- **PROMETEDOR**: CPA ≤ CPAo pero con 1–2 resultados → darle más presupuesto con cuidado y confirmar.
- **MANTENER**: CPA entre objetivo y equilibrio.
- **VIGILAR**: CPA sobre el equilibrio con poco gasto.
- **PAUSAR / QUEMA DINERO**: 0 resultados con gasto ≥ 1,5× CPAo, o CPA sobre el equilibrio con gasto ≥ 3× CPAo.
- **DATOS INSUFICIENTES**: poco gasto, aún no se puede juzgar.

## Paso 4 — Entregable

1. **Resumen en 3 líneas**: ¿la cuenta gana o pierde dinero?, ¿cuánto?, ¿dónde está el cuello de botella principal?
2. **Tabla por anuncio** con métricas y veredicto.
3. **Acciones priorizadas** (máx. 5), cada una con el dato que la justifica.
4. **Qué testear después**, y enlaza con las skills: nuevos ganchos → `multiplicador-creatividades`; nuevos ángulos → `espia-competencia`; siguiente semana → `plan-testeo-semanal`.

## Rigor (obligatorio)

- **Tamaño de muestra**: con menos de ~30 resultados en total, o menos de 3 por anuncio, avisa de que las diferencias pueden ser azar. No declares ganador a un anuncio con 1 venta.
- **Atribución**: los resultados de Meta dependen de la ventana de atribución (por defecto 7 días clic / 1 día visualización) y pueden no coincidir con la tienda o el CRM. Recomienda cruzarlos con las ventas reales.
- Columnas vacías (ej. "Pagos iniciados" sin datos) pueden significar que el **evento del píxel no está configurado**: señálalo, no lo interpretes como cero.
- Si el producto es barato y el CPA de equilibrio es bajo, di con claridad si la solución está más en **subir el ticket medio** (packs, order bump, upsell, recompra) que en el anuncio.
- Nunca inventes métricas que no estén en los datos.
