import torch
import numpy as np
import pyaudio
from transformers import pipeline
from torch import Tensor
import gc
import multiprocessing
from collections import deque

SAMPLE_RATE = 16000
CHUNK = 12000 # 4200 works best so far
RECORD_SECONDS = 3000
RATE = 16000
WINDOW_SECONDS = 10  # 10 work best so far Change this to control the size of your "recent past"
WINDOW_SIZE = int(WINDOW_SECONDS * SAMPLE_RATE / CHUNK)

MIN_OUTPUT_LENGTH = 5  # Adjust as needed. This is the minimum character length for the transcription to be printed.


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
    
    total = deque(maxlen=WINDOW_SIZE)


    while True:
        # 1. Buffer until WINDOW_SIZE chunks
        while len(total) < WINDOW_SIZE:
            if not q.empty():
                waveform = q.get()
                total.append(waveform)
            else:
                break  # If the queue is empty, we break to avoid infinite loop

        if len(total) < WINDOW_SIZE:  # Ensure the deque has enough chunks before processing
            continue


        # 2. Transcribe them
        log_spec = prep_audio(np.concatenate(total, axis=0))
        encoded_audio = transcribe_stream(pipe, log_spec)
        new_transcript = encoded_audio["text"].split()  # split to get words

        # Print only the new half of the transcript, if it's long enough
        halfway_point = len(new_transcript) // 2
        output_text = ' '.join(new_transcript[halfway_point:])
        if len(output_text) >= MIN_OUTPUT_LENGTH:
            print(output_text)

        # 3. Discard half of the chunks
        for _ in range(WINDOW_SIZE // 2):
            if len(total) > 0:
                total.popleft()

        gc.collect()