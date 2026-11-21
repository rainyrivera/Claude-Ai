# Estilo C "Escalada 3D" — formato por defecto desde 2026-11-21

Referencia: `referencias/estilo-escalada-balcon.mp4` (balcón → palomas → tanque antiaéreo; 720×1280, 30 fps, 1:39, −14 LUFS).
Hojas de contacto (1 fps): `referencias/estilo-escalada-hoja1..5.png`.

## 1. Idea del formato
- Un solo mundo 3D que **crece** durante todo el video: se empieza con algo cotidiano y cada problema se "resuelve" con algo más exagerado.
- Cadena narrativa: "Si haces X… ya tienes Y." → "Pero…" (problema) → "Así que…" (solución más loca) → repetir 6–10 veces.
- Humor absurdo + **dato real** en medio (en la referencia: los pesos reales, 200 kg/m² vs 47.500 kg; las palomas descienden de aves que anidaban en acantilados).
- Gag recurrente: un mismo elemento vuelve una y otra vez (las palomas).
- Final: "Enhorabuena. Acabas de construir/hacer [algo] completamente normal." + "Y tú, dime en los comentarios qué le añadirías" con tarjeta de encuesta.
- **Sin personajes presentadores** (ni dueño ni ingeniero): los protagonistas son los objetos.

## 2. Mundo 3D
- Low-poly limpio, materiales mate, luz de día cálida, sombras suaves largas, cielo celeste con nubes de algodón, césped verde plano, calle de asfalto con rayas.
- Fachada beige con ventanas azul marino y marco blanco; vidrio translúcido; acero gris; madera.
- Cada elemento nuevo **aparece con "pop"** (escala 0→1 con rebote) o baja/encaja en su sitio; un destello/chispa donde se fija (tornillo).
- Partículas ambientales constantes (en la referencia, plumas que flotan) ligadas al tema.
- Cámara siempre en movimiento suave: deriva lateral, push-in, órbita, grúa hacia atrás para los "reveals" de escala (el edificio, la ciudad, la pista en el tejado).
- Transiciones: casi sin cortes duros (≈6 en 1:39). Se cambia de plano con **desenfoque/rack focus** (todo se difumina y se enfoca el nuevo plano) o moviendo la cámara.
- Vibración de cámara en momentos de impacto (disparo, aterrizaje).

## 3. Textos en pantalla
1. **Subtítulos ARRIBA** (y≈16 % de la altura): una línea, Inter/SF Bold ~42 px a 1080 de ancho, sin caja, sombra suave.
   - Palabra actual con **caja de selección azul con tiradores** (como al seleccionar texto en un editor).
   - Palabras dichas en blanco; palabras clave en negrita; palabras que vienen en gris translúcido.
2. **Píldoras-etiqueta** junto al objeto: caja oscura redondeada, borde de color fino, emoji/ícono + MAYÚSCULAS bold.
   Colores: ámbar (info), verde ✓ (logro), rojo ⚠/✕ (problema), azul (dato técnico), con flecha/línea al objeto si hace falta.
3. **Palabras golpe** grandes en 3D/2D: "PALOMAS" (rojo), "ES SUYO" (blanco+azul), sello inclinado "VENDIDO" (verde), "¡ENHORA BUENA!" (blanco+ámbar). Entran con escala y rebote.
4. **Tarjetas de dato**: medidores lado a lado ("TU BALCÓN AGUANTA 200 kg/m²" vs "EL GEPARD PESA 47.500 kg") con barra verde→rojo; documento tipo papel ("CONTRATO DE ALQUILER", cláusulas, "PROHIBIDOS" en rojo).
5. **Panel explicativo oscuro** semitransparente sobre el 3D: diagramas simples (acantilado vs balcón, mapa con arco punteado "CIENTOS DE km").
6. Letreros dentro del mundo ("TODO MÍO"), cotas ("20 m").
7. Pie pequeño gris abajo a la izquierda: "Recreación ilustrativa · no está a escala" y, en los datos, la fuente en texto diminuto.
8. Cierre: tarjeta blanca "💬 ¿Qué le añadirías tú?" con 3 opciones en chips oscuros.

## 4. Audio
- Voz continua, música de fondo sin silencios, SFX: pop al aparecer, whoosh en cambios, golpe en palabras golpe, chispa en tornillos, disparos/aleteo según tema. Mezcla −14 LUFS.

## 5. Reglas de la cuenta que se mantienen
- Marca de agua "Así funciona con Rai" arriba a la derecha (no tapar los subtítulos de arriba: subtítulos centrados en x≈0–860) y cierre de 3,7 s; dos versiones ¡SÍGUEME! / ¡SUSCRÍBETE!.
- 1080×1920, 30 fps. Datos verificados con fuente en `guion.md`; aviso de profesional en electricidad/gas/estructura.
- Guion: hook en el segundo 0, "suscríbete" a mitad, pregunta final que provoque comentarios.
