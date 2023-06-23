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
# ZOME_POLYGON = np.array([
#     [250, 250],         # Top left
#     [1030, 250],      # Top right
#     [1030, 470],    # Bottom right
#     [250, 470]        # Bottom left
# ])


@app.route('/')
def index():
    return render_template('index.html')


def object_detection(webcam_resolution=[1280, 720]):

    frame_width, frame_height = webcam_resolution
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, frame_width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, frame_height)

    model = YOLO("model/modelV3.pt")
    # model = YOLO("model/modelV2.pt")

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

        table = "home"

        for i in range(len(detections.class_id)):

            for id in detections.class_id:
                if (id == 0):
                    table = "allergens"
                elif (id == 6):
                    table = "home"
                elif (id == 8):
                    table = "minerals"
                elif (id == 9):
                    table = "nutrients"
                elif (id == 12):
                    table = "trace_elements"
                elif (id == 13):
                    table = "vitamins"

            if (table != "home"):
                id = detections.class_id[i]
                if (id != 0 and id != 6 and id != 8 and id != 9 and id != 12 and id != 13):
                    # get infos from detections and save them in a list
                    detection_info = {
                        "class_id": int(detections.class_id[i]),
                        "box_coordinates": [float(coord) for coord in detections.xyxy[i]],
                        "name": table
                    }
                    detections_list.append(detection_info)

                    conn = sqlite3.connect('food_data.sqlite')

                    # set the row_factory to sqlite3.Row
                    conn.row_factory = sqlite3.Row

                    c = conn.cursor()

                    c.execute('SELECT * FROM food_' + table +
                              ' WHERE Food_ID=?', (int(detections.class_id[i]),))
                    result = c.fetchone()

                    if result is not None:
                        detection_info["data"] = dict(result)

                    conn.close()

        if (table == "home"):
            socketio.emit('new detections', "home")
        else:
            socketio.emit('new detections', detections_list)


if __name__ == '__main__':
    object_detection_thread = threading.Thread(target=object_detection)
    object_detection_thread.start()
    socketio.run(app)
