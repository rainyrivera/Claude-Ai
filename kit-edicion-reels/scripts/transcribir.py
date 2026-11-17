# Transcribe un .wav (mono 16 kHz) con faster-whisper y guarda tiempos por palabra.
# Uso: python3 -I transcribir.py <carpeta_modelo_whisper> <audio16k.wav> <salida_palabras.json>
# Crear el wav:  ffmpeg -i video.mp4 -ac 1 -ar 16000 audio16k.wav
# OJO: whisper confunde "Claude" -> "cloud", "me editó" -> "meditó", "Meta Ads" -> "meta ax". Revisar a mano.
import sys, json
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
import numpy as np, wave
wf=wave.open(sys.argv[2]); a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
segs, info = m.transcribe(a, language="es", word_timestamps=True, beam_size=5, vad_filter=False)
out=[]
for s in segs:
    print(f"[{s.start:.2f}-{s.end:.2f}] {s.text}")
    for w in s.words: out.append({"w":w.word,"s":round(w.start,3),"e":round(w.end,3),"p":round(w.probability,2)})
json.dump(out, open(sys.argv[3],"w"), ensure_ascii=False, indent=0)
for o in out: print(o)
