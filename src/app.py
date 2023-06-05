from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import videoStream

app = Flask(__name__)
socketio = SocketIO(app)

videoStream.main(webcam_resolution=[1280, 720])


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('connect')
def test_connect():
    emit('after connect',  {'data': 'Connected'})


if __name__ == '__main__':
    socketio.run(app)
