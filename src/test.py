from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import threading
import cv2
import supervision as sv
import numpy as np
from ultralytics import YOLO
import sqlite3

# app = Flask(__name__, template_folder='../templates')
app = Flask(__name__)
socketio = SocketIO(app)

# Area in whitch the detection is allowed
ZOME_POLYGON = np.array([
    [0, 0],         # Top left
    [1280, 0],      # Top right
    [1280, 720],    # Bottom right
    [0, 720]        # Bottom left
])


@app.route('/')
def index():
    return render_template('index.html')


def object_detection(webcam_resolution=[1280, 720]):

    frame_width, frame_height = webcam_resolution
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, frame_width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, frame_height)

    model = YOLO("model/modelV2.pt")

    box_annotations = sv.BoxAnnotator(
        thickness=2,
        text_color=sv.Color.white(),
        text_thickness=1,
        text_scale=1
    )

    zone = sv.PolygonZone(polygon=ZOME_POLYGON,
                          frame_resolution_wh=tuple(webcam_resolution))
    zone_annotator = sv.PolygonZoneAnnotator(zone=zone, color=sv.Color.red())

    while True:
        ret, frame = cap.read()
        results = model(frame)[0]

        detections = sv.Detections.from_yolov8(results)
        labels = [
            f"{model.names[confidence]} {class_id: 0.2f}"
            for _, _, class_id, confidence, _
            in detections
        ]

        frame = box_annotations.annotate(
            scene=frame,
            detections=detections,
            labels=labels
        )

        zone.trigger(detections=detections)
        frame = zone_annotator.annotate(scene=frame)

        cv2.imshow("YOLOv8", frame)
        if (cv2.waitKey(300) == 27):
            break

        # Emit a message with detected objects to the client.
        detections_list = []

        for i in range(len(detections.class_id)):

            # get infos from detections and save them in a list
            detection_info = {
                "class_id": int(detections.class_id[i]),
                "box_coordinates": [float(coord) for coord in detections.xyxy[i]],
                "name": "Nährstoffe"
            }
            detections_list.append(detection_info)

            # database access for the information of the detected object
            conn = sqlite3.connect('food_data.sqlite')
            conn.row_factory = sqlite3.Row

            c = conn.cursor()
            c.execute('SELECT * FROM food_nutrients WHERE Food_ID=?',
                      (int(detections.class_id[i]),))
            result = c.fetchone()

            c.execute("PRAGMA table_info(meineTabelle);")

            if result is not None:
                detection_info["data"] = dict(result)
            conn.close()

        socketio.emit('new detections', detections_list)

# @ socketio.on('connect')
# def test_connect():
#     print("Client connected")


# @ socketio.on('disconnect')
# def test_disconnect():
#     print("Client disconnected")

if __name__ == '__main__':
    object_detection_thread = threading.Thread(target=object_detection)
    object_detection_thread.start()
    socketio.run(app)


# Detections(
#     xyxy=array(
#         [
#             [656.02,      159.37,      903.36,      377.04],
#             [275.31,      78.847,      498.65,      298.82],
#             [511.22,       318.1,      612.15,      508.27]
#         ], dtype=float32),
#     mask=None,
#     confidence=array([0.91539,     0.90639,      0.8381], dtype=float32),
#     class_id=array([3, 2, 7]),
#     tracker_id=None)
