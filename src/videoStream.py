import cv2
import supervision as sv
import argparse
import numpy as np
from ultralytics import YOLO

# Area in whitch the detection is allowed
# ZOME_POLYGON = np.array([
#     [0, 0],
#     [1280, 0],
#     [1290, 720],
#     [0, 720]
# ])
ZOME_POLYGON = np.array([
    [0, 0],
    [0, 50],
    [50, 0],
    [59, 50]
])


# Parse arguments accept the resolution of the webcam and return a namespace
def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="YOLOv8 on video stream")
    parser.add_argument(
        "--webcam-resolution",
        default=[640, 480],
        nargs=2,
        type=int,
    )
    args = parser.parse_args()
    return args


# Main function
def main(webcam_resolution=None):
    class args:  # Dummy class to hold arguments
        pass

    if webcam_resolution is None:
        args = parse_arguments()
    else:
        args.webcam_resolution = webcam_resolution

    frame_width, frame_height = args.webcam_resolution
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, frame_width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, frame_height)

    version = "v2"
    model = YOLO(f"{version}/best_e125.pt")

    box_annotations = sv.BoxAnnotator(
        thickness=2,
        text_color=sv.Color.white(),
        text_thickness=1,
        text_scale=1
    )

    zone = sv.PolygonZone(polygon=ZOME_POLYGON,
                          frame_resolution_wh=tuple(args.webcam_resolution))
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
        if (cv2.waitKey(250) == 27):
            break

        # return detections.class_id.tolist()


# check if the file is run as a script
if __name__ == "__main__":
    main()
