# Cantante animada – 5 minutos, sin audio

`cantante_5min_sin_audio.mp4`: 1920×1080, 30 fps, 5:00, sin pista de audio.

Versión gratuita hecha con ffmpeg a partir de `foto_original.png`:
- Zoom y paneo lentos (ciclos de 19 a 31 s) que mantienen la mano levantada dentro del cuadro.
- Las luces del escenario «respiran» con cambios suaves de brillo y saturación, más una viñeta.
- **No hay movimiento real de boca, cabeza ni manos.** Para que la cantante cante de verdad hace falta un modelo de IA de foto a video (por ejemplo, Seedance 2.5 en Higgsfield).

Comando usado:

```
ffmpeg -loop 1 -framerate 30 -i foto_original.png -filter_complex "[0:v]scale=3840:-2:flags=lanczos,zoompan=z='1.035+0.02*sin(2*PI*on/(30*24))':x='(iw-iw/zoom)*(0.9+0.08*sin(2*PI*on/(30*31)))':y='(ih-ih/zoom)*(0.5+0.4*sin(2*PI*on/(30*19)))':d=1:s=1920x1080:fps=30,eq=brightness='0.025*sin(2*PI*t/2.7)+0.012*sin(2*PI*t/0.9)':saturation='1.05+0.05*sin(2*PI*t/5)':eval=frame,vignette=PI/5,format=yuv420p" -t 300 -an -c:v libx264 -preset medium -crf 24 -movflags +faststart cantante_5min_sin_audio.mp4
```
