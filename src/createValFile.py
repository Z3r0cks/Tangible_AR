import os
from PIL import Image

path_part = "val"
class_part = "banana"

image_directory = f'./yolov4/dataset/{path_part}/{class_part}'
# image_directory = './yolov4/dataset/test/{class_part}'
output_file = f'./yolov4/dataset/{path_part}/{class_part}/anno/val_{path_part}.txt'
input_annotations_directory = f'./yolov4/dataset/{path_part}/{class_part}/anno'


def convert_yolo_to_val_format(image_directory, input_annotations_directory, output_file):
    with open(output_file, 'w') as file:
        for filename in os.listdir(image_directory):
            if filename.endswith('.jpg') or filename.endswith('.png'):
                image_path = os.path.join(image_directory, filename)
                img_width, img_height = get_image_size(image_path)

                annotation_filename = os.path.splitext(filename)[0] + '.txt'
                annotation_path = os.path.join(
                    input_annotations_directory, annotation_filename)

                if os.path.exists(annotation_path):
                    with open(annotation_path, 'r') as annotation_file:
                        bboxes = annotation_file.readlines()
                        bboxes_formatted = ' '.join([convert_yolo_bbox_to_val_format(
                            bbox.strip(), img_width, img_height) for bbox in bboxes])
                        file.write(f"{image_path} {bboxes_formatted}\n")


def convert_yolo_bbox_to_val_format(bbox, img_width, img_height):
    class_id, x_center, y_center, width, height = map(float, bbox.split())
    x_min = (x_center - (width / 2)) * img_width
    y_min = (y_center - (height / 2)) * img_height
    x_max = (x_center + (width / 2)) * img_width
    y_max = (y_center + (height / 2)) * img_height
    return f"{int(x_min)},{int(y_min)},{int(x_max)},{int(y_max)},{int(class_id)}"


def get_image_size(image_path):
    with Image.open(image_path) as img:
        return img.size


convert_yolo_to_val_format(
    image_directory, input_annotations_directory, output_file)
