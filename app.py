import torch
import numpy as np
import pyaudio
from transformers import pipeline
from torch import Tensor
import gc
import multiprocessing
from collections import deque
from flask import Flask, render_template, jsonify

app = Flask(__name__)
transcription_queue = multiprocessing.Queue()

SAMPLE_RATE = 16000
CHUNK = 12000
RECORD_SECONDS = 3000
RATE = 16000
WINDOW_SECONDS = 10
WINDOW_SIZE = int(WINDOW_SECONDS * SAMPLE_RATE / CHUNK)
MIN_OUTPUT_LENGTH = 5

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

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/get_transcription')
def get_transcription():
    messages = []
    while not transcription_queue.empty():
        messages.append(transcription_queue.get())
    return jsonify(messages=messages)

if __name__ == "__main__":
    target_language = "lug"
    device = torch.device("cpu")
    pipe = initialize_pipeline(target_lang="lug", device=device)

    q = multiprocessing.Queue()
    p = multiprocessing.Process(target=listener, args=(q,))
    p.daemon = True
    p.start()

    total = deque(maxlen=WINDOW_SIZE)

    # Transcription process loop
    def run_transcription():
        while True:
            while len(total) < WINDOW_SIZE:
                if not q.empty():
                    waveform = q.get()
                    total.append(waveform)
                else:
                    break

            if len(total) < WINDOW_SIZE:
                continue

            log_spec = prep_audio(np.concatenate(total, axis=0))
            encoded_audio = transcribe_stream(pipe, log_spec)
            new_transcript = encoded_audio["text"].split()

            halfway_point = len(new_transcript) // 2
            output_text = ' '.join(new_transcript[halfway_point:])
            if len(output_text) >= MIN_OUTPUT_LENGTH:
                transcription_queue.put(output_text)

            for _ in range(WINDOW_SIZE // 2):
                if len(total) > 0:
                    total.popleft()

            gc.collect()

    # Start the transcription loop in a separate thread
    from threading import Thread
    thread = Thread(target=run_transcription)
    thread.start()

    # Run Flask app
    app.run(debug=True, threaded=True, use_reloader=False)
