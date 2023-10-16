import torch
import numpy as np
import pyaudio
from transformers import pipeline
import os
from torch import Tensor
import gc
import multiprocessing


SAMPLE_RATE = 16000  # Sample rate of 16kHz
CHUNK = 16000
RATE = 16000

device = torch.device("cpu")

def prep_audio(waveform) -> Tensor:
  return waveform

def listener(q):
  p = pyaudio.PyAudio()
  stream = p.open(format=pyaudio.paInt16, channels=1, rate=RATE, input=True, frames_per_buffer=CHUNK)
  print("listening")
  
  while True:  # Infinite loop to keep recording
      data = stream.read(CHUNK)
      waveform = ((np.frombuffer(data, np.int16)/32768).astype(np.float32)*3)
      q.put(waveform)

def initialize_pipeline(target_lang="lug", device=device, model_id="Sunbird/sunbird-mms"):
    """Initialize the pipeline and return it for later use."""
    pipe = pipeline(model=model_id, device=device)
    pipe.tokenizer.set_target_lang("lug")
    pipe.model.load_adapter("lug")
    return pipe

def transcribe_stream(pipe, input_file):
    """Use the provided pipeline to transcribe the audio."""
    output = pipe(input_file)
    return output


if __name__ == "__main__":
    target_language = "lug"
    device = torch.device("cpu")
    pipe = initialize_pipeline(target_lang="lug", device=device)

    q = multiprocessing.Queue()
    p = multiprocessing.Process(target=listener, args=(q,))
    p.daemon = True
    p.start()
    
    total = None
    transcriptions = []

    while True:  # Infinite loop to keep transcribing
        if not q.empty():
            waveform = q.get()
            if total is None:
                total = waveform
            else:
                total = np.concatenate([total, waveform])
            
            log_spec = prep_audio(total)
            encoded_audio = transcribe_stream(pipe, log_spec)
            total = None  # Clear the total waveform after transcription to start fresh
            # print(encoded_audio["text"])
            transcriptions.append(encoded_audio["text"])
            print(transcriptions)
            gc.collect()
        # print("final:", encoded_audio["text"])