---
name: plan-testeo-semanal
description: Skill 4 del flujo de anuncios. Crea el calendario semanal de testeo en Meta Ads: qué creatividades lanzar cada semana, cómo estructurar campaña/conjuntos, cuánto presupuesto y con qué reglas exactas pausar, mantener o escalar. Úsala cuando el usuario diga "qué lanzo esta semana", "plan de testeo", "cómo testeo mis anuncios", "cuánto presupuesto pongo para probar", "cuándo pauso o escalo", "calendario de anuncios", o tras generar variaciones con multiplicador-creatividades. Sirve para cualquier negocio físico o digital.
---

# Plan de testeo semanal

Objetivo: un plan **de 4 semanas** que diga, cada semana, qué lanzar, con cuánto dinero y qué reglas aplicar. Las reglas se basan en los **números del propio negocio**, no en promedios de internet.

## Paso 0 — Números base (obligatorios)

Pide o calcula:

- **Precio de venta** (o ticket medio) y **coste variable por venta** (producto + envío + comisiones + fulfillment).
- **Margen de contribución por venta** = precio − coste variable.
- **CPA de equilibrio** = margen de contribución (lo máximo que puedes pagar por venta sin perder).
- **ROAS de equilibrio** = precio ÷ margen de contribución.
- **CPA objetivo**: por defecto, el 70–80 % del CPA de equilibrio, o el que diga el usuario.
- Para **leads/mensajes/citas** (negocio local o servicios): CPA objetivo por lead = margen × tasa de cierre (ej. margen 200 × 20 % de cierre = 40 por lead).
- Para **suscripciones** (comunidades tipo Skool, membresías, software): CPA de equilibrio conservador = cuota neta (después de comisiones) × 2–3 meses, o × meses reales de permanencia si se conocen. Ten en cuenta que el dinero se recupera mes a mes: comprueba que el usuario puede financiar ese desfase.
- **Presupuesto semanal** disponible.

Si el CPA de equilibrio es muy bajo (producto barato), dilo claramente: será difícil ser rentable solo con la primera venta, y conviene subir el ticket medio (packs, order bump, upsell) o contar con la recompra (LTV).

## Estructura recomendada

- **Campaña de testeo**: 1 campaña, objetivo según el negocio (Ventas, Clientes potenciales o Mensajes). Presupuesto de campaña (Advantage+/CBO) o por conjunto (ABO) si quieres repartir igual entre conceptos. Explica cuál eliges y por qué.
- **Conjuntos**: uno por **concepto/ángulo**, con 3–6 anuncios cada uno. Público amplio (dejar que Meta busque) salvo negocio local (radio geográfico).
- **Campaña de escalado**: solo recibe anuncios **ganadores** probados.
- Fase de aprendizaje: Meta indica unos **50 eventos de optimización en 7 días por conjunto** para salir de aprendizaje. Si el presupuesto no lo permite, avisa de que los resultados serán más ruidosos, o propone optimizar por un evento más alto del embudo (ej. "Agregar al carrito") solo de forma temporal.

## Reglas de decisión (orientativas, ajustables)

Evalúa cada anuncio con al menos **3 días** y gasto suficiente. Basadas en el CPA objetivo (CPAo):

| Situación | Acción |
|---|---|
| Gasto ≥ 1,5× CPAo y **0 ventas** | **Pausar** |
| Gasto ≥ 3× CPAo y CPA > 1,5× CPAo | **Pausar** |
| CPA ≤ CPAo con ≥ 3 ventas | **Ganador → mover/duplicar a escalado** |
| CPA entre CPAo y equilibrio | **Mantener** y observar 2–3 días más |
| CTR de enlace bajo y CPM normal | Problema de **creatividad/gancho** → nueva variación |
| CTR bueno pero pocas compras | Problema de **página/oferta/precio** → no culpes al anuncio |

**Escalado**: subir el presupuesto ~20–30 % cada 2–3 días mientras el CPA se mantenga ≤ CPAo. Es una práctica común del sector, no una regla oficial de Meta. Los cambios grandes de presupuesto o de creatividad pueden reiniciar el aprendizaje.

## Entregable: calendario

```
SEMANA 1 — Lanzamiento
  Lunes: lanzar <conceptos/anuncios> | presupuesto: X/día | estructura: …
  Jueves: primera revisión → aplicar reglas
  Domingo: resumen (enviar a vigilante-rentabilidad)
SEMANA 2 — Depurar + nuevas variaciones del ganador
SEMANA 3 — Escalar ganadores + testear nuevo ángulo
SEMANA 4 — Consolidar + plan del mes siguiente
```

Incluye un **checklist previo al lanzamiento**: píxel/API de conversiones funcionando, evento correcto, página carga en < 3 s en móvil, precio y envío visibles, nombres de anuncio con la nomenclatura del multiplicador, UTM en los enlaces.

## Reglas

- Todas las cifras deben salir de los números del usuario; si un dato falta, pídelo o márcalo como supuesto.
- No prometas resultados. El plan define **qué decisión tomar con cada dato**.
- Cierra ofreciendo revisar los resultados con **`vigilante-rentabilidad`**.
