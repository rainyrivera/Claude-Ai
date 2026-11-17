# Recorta a la persona (fondo transparente) cuadro a cuadro con MediaPipe (modelo selfie_multiclass_256x256).
# Uso: python3 -I recortar_persona.py <selfie_multiclass_256x256.tflite> <carpeta_pngs_entrada> <carpeta_pngs_salida_rgba>
# Luego: ffmpeg -framerate 30 -i salida/%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 22 -auto-alt-ref 0 cut.webm
# Requiere: pip install mediapipe ; apt-get install -y libegl1 libgles2
import sys, os, numpy as np, mediapipe as mp
from PIL import Image, ImageFilter
from mediapipe.tasks.python import vision, BaseOptions
model, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=model), output_confidence_masks=True, output_category_mask=False))
for f in sorted(os.listdir(src)):
    im = Image.open(f"{src}/{f}").convert("RGB")
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.asarray(im)))
    bg = np.squeeze(np.asarray(r.confidence_masks[0].numpy_view()))
    m = np.clip(((1.0 - bg) - 0.35) / 0.4, 0, 1)
    mi = Image.fromarray((m*255).astype(np.uint8)).resize(im.size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(1.5))
    rgba = im.copy(); rgba.putalpha(mi); rgba.save(f"{out}/{f}")
print("ok")
