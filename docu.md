Dependencies:
- Python 3.6
- TensorFlow
- opencv   
   
1. Create Image-Files at least 100 per clssifier
2. split it into train, test and validation (75, 15, 10)
3. set bounding boxes with a program e.g. makeSense.ai


python ./yolov4/train.py --weights ./checkpoints/yolov4-416
python ./yolov4/save_model.py --weights ./yolov4.weights --output ./checkpoints/yolov4-416 --input_size 416

yolo task=detect mode=val model=runs/detect/yolov8n_v8_50e4/weights/best.pt name=yolov8m_eval data=data.yaml imgsz=640
yolo task=detect mode=predict model=runs/detect/train/weights/best.pt source=testingImg/img1.jpg show=True imgsz=640 name=yolov8n_v8_50e_infer640

yolov8
yolo task=detect mode=train model=yolov8n.pt data=data.yaml epochs=100
yolo task=detect mode=predict model=runs/detect/train/weights/best.pt source=testingImg/*.jpg show=True imgsz=640

https://roboflow.com/

forge jo

Training a YOLOv3 object detection model with a custom dataset
How to Train YOLOv4 Tiny (Darknet) on a Custom Dataset (YouTube Video)
How to Train YOLOv5-Classification on a Custom Dataset (YouTube Video)

What's New in YOLOv8
How to Train a YOLOv8 Model on a Custom Dataset
YOLOv8 Models, APIs, and Datasets


start app: flask --app app run

