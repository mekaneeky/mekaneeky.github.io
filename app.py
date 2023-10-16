from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory
import os
import json
import torch
from transformers import pipeline
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
JSON_FOLDER = 'json_files'
ALLOWED_EXTENSIONS = {'wav', 'mp3'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['JSON_FOLDER'] = JSON_FOLDER

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_id="Sunbird/sunbird-mms"
pipe = pipeline(model=model_id, device=device)

def transcribe_audio(input_file,
                     target_lang,
                     device,
                     chunk_length_s=10,
                     stride_length_s=(4, 2),
                     return_timestamps="word"):
    """
    Transcribes audio from the input file using sunbird asr model.

    Args:
        input_file (str): Path to the audio file for transcription.
        target_lang (str): Target language for transcription.
            'ach' - Acholi
            'lug' - Luganda
            'teo' - Ateso
            'lgg' - Lugbara
        device (str or torch.device): Device for running the model (e.g., 'cpu', 'cuda').
        chunk_length_s (int, optional): Length of audio chunks in seconds. Defaults to 5.

    Returns:
        dict: A dictionary containing the transcription result.
            Example: {'text': 'Transcribed text here.'}
    """

    # Set the tokenizer language and load the necessary adapter
    pipe.tokenizer.set_target_lang(target_lang)
    pipe.model.load_adapter(target_lang)

    output = pipe(input_file, chunk_length_s=chunk_length_s, stride_length_s=stride_length_s, return_timestamps="word")
    return output


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Transcribe the audio
            target_language = "lug"
            transcription_result = transcribe_audio(filepath, target_language, device)

            # Save the result to JSON
            json_file_path = os.path.join(app.config['JSON_FOLDER'], filename + '.json')
            with open(json_file_path, 'w') as json_file:
                json.dump(transcription_result, json_file)
            
            return redirect(url_for('view_transcriptions'))

    return render_template('upload.html')

@app.route('/transcriptions', methods=['GET'])
def view_transcriptions():
    files = os.listdir(app.config['JSON_FOLDER'])
    return render_template('transcriptions.html', files=files)

@app.route('/transcriptions/<filename>', methods=['GET'])
def transcription_detail(filename):
    filepath = os.path.join(app.config['JSON_FOLDER'], filename)
    with open(filepath, 'r') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    if not os.path.exists(JSON_FOLDER):
        os.makedirs(JSON_FOLDER)
    app.run(port=6677, debug=True)
