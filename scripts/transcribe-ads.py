# Transcreve vídeos específicos (faster-whisper, CPU) e grava em transcricoes_ads.json. Uso: python transcribe-ads.py videos/83_x.mp4 ...
import json, os, sys
from faster_whisper import WhisperModel
model = WhisperModel(os.environ.get("WHISPER_MODEL", "medium"), device="cpu", compute_type="int8")
out = json.load(open("dados/transcricoes_ads.json", encoding="utf-8")) if os.path.exists("dados/transcricoes_ads.json") else {}
for f in sys.argv[1:]:
    segs, info = model.transcribe(f, language="pt", beam_size=5, vad_filter=True)
    out[os.path.basename(f)] = [{"start": round(s.start, 1), "end": round(s.end, 1), "text": s.text.strip()} for s in segs]
    print(f, len(out[os.path.basename(f)]), "segmentos", flush=True)
json.dump(out, open("dados/transcricoes_ads.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
