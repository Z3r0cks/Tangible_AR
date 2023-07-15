# This file contains the backend of the application. The video stream is processed and the detections are sent to the frontend after accessing the database with the class_id of the detections. The database is created with the script "create_database.py" and contains the food data from the Open Food Facts database. The database is stored in the same folder as this file and is called "food_data.sqlite".

from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import threading
import cv2
import supervision as sv
import numpy as np
from ultralytics import YOLO
import sqlite3

app = Flask(__name__)
socketio = SocketIO(app)

# Area in whitch the detection is allowed
ZOME_POLYGON = np.array([
    [0, 0],         # Top left
    [1280, 0],      # Top right
    [1280, 720],    # Bottom right
    [0, 720]        # Bottom left
])


# Route for the index page
@app.route('/')
def index():
    return render_template('index.html')


# function for the object detection and video stream
def object_detection(webcam_resolution=[1280, 720]):

    # Webcam/Video stream setup
    frame_width, frame_height = webcam_resolution
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, frame_width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, frame_height)

    try:
        model = YOLO("model/modelV3.pt")

        box_annotations = sv.BoxAnnotator(
            thickness=2,
            text_color=sv.Color.white(),
            text_thickness=1,
            text_scale=1
        )

        zone = sv.PolygonZone(polygon=ZOME_POLYGON,
                              frame_resolution_wh=tuple(webcam_resolution))
        zone_annotator = sv.PolygonZoneAnnotator(
            zone=zone, color=sv.Color.red())

        # Object detection loop/Video stream loop
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

            detections_list = []
            table = "no table"
            table_dict = {
                0: "allergens",
                6: "home",
                8: "minerals",
                9: "nutrients",
                12: "trace_elements",
                13: "vitamins"
            }

            for i in range(len(detections.class_id)):

                # Set table name for each class_id
                table = table_dict.get(id, "no table")

                if (table != "home" and table != "no table"):
                    id = detections.class_id[i]
                    if id not in [0, 6, 8, 9, 12, 13]:

                        # Get infos from detections and save them in a list
                        detection_info = {
                            "class_id": int(detections.class_id[i]),
                            "box_coordinates": [float(coord) for coord in detections.xyxy[i]],
                            "name": table
                        }
                        detections_list.append(detection_info)

                        # Connect to the database
                        conn = sqlite3.connect('food_data.sqlite')

                        # Set the row_factory to sqlite3.Row
                        conn.row_factory = sqlite3.Row
                        c = conn.cursor()
                        c.execute('SELECT * FROM food_' + table +
                                  ' WHERE Food_ID=?', (int(detections.class_id[i]),))
                        result = c.fetchone()

                        if result is not None:
                            detection_info["data"] = dict(result)

                        conn.close()

            # Send the detections to the frontend
            if (table == "home"):
                socketio.emit('new detections', "home")
            elif (table == "no table"):
                socketio.emit('new detections', "no table")
            else:
                socketio.emit('new detections', detections_list)
    finally:
        cap.release()


if __name__ == '__main__':
    object_detection_thread = threading.Thread(target=object_detection)
    object_detection_thread.start()
    socketio.run(app)
