import torch
import numpy as np
import pyaudio
from transformers import pipeline
import os
from torch import Tensor
import gc
import multiprocessing
from collections import deque

SAMPLE_RATE = 16000
CHUNK = 1600
RECORD_SECONDS = 3000
RATE = 16000
WINDOW_SECONDS = 5  # Change this to control the size of your "recent past"
WINDOW_SIZE = int(WINDOW_SECONDS * SAMPLE_RATE / CHUNK)

device = torch.device("cpu")

def prep_audio(waveform) -> Tensor:
    return waveform

def listener(q):
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=RATE, input=True, frames_per_buffer=CHUNK)
    print("listening")
    for _ in range(0, int(SAMPLE_RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        waveform = ((np.frombuffer(data, np.int16)/32768).astype(np.float32)*3)
        q.put(waveform)
    print("done listening")

def initialize_pipeline(target_lang="lug", device=device, model_id="Sunbird/sunbird-mms"):
    pipe = pipeline(model=model_id, device=device)
    pipe.tokenizer.set_target_lang("lug")
    pipe.model.load_adapter("lug")
    return pipe

def transcribe_stream(pipe, input_file):
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
    transcript = []
    total = deque(maxlen=WINDOW_SIZE)
    for i in range(0, int(SAMPLE_RATE / CHUNK * RECORD_SECONDS)):
        while not q.empty():
            waveform = q.get()
            total.append(waveform)
        if len(total)>0:
            log_spec = prep_audio(np.concatenate(total, axis=0))
            encoded_audio = transcribe_stream(pipe, log_spec)
            print(encoded_audio["text"])
        gc.collect()
