import cv2
import os

target = "cheese"
image_path = f"img/rawImgs/{target}"
output_folder = f"img/croppedImgs/{target}"


def crop_center(image, target_size=640):
    height, width = image.shape[:2]
    center_x, center_y = width // 2, height // 2

    min_dim = min(height, width)
    if min_dim < target_size:
        raise ValueError(
            "The minimum dimension of the input image must be greater than or equal to the target size.")

    top = center_y - target_size // 2
    bottom = center_y + target_size // 2
    left = center_x - target_size // 2
    right = center_x + target_size // 2

    cropped_image = image[top:bottom, left:right]
    return cropped_image


def crop_center_in_folder(image_path, target_size=640):

    os.makedirs(output_folder, exist_ok=True)
    for filename in os.listdir(image_path):
        input_image_path = os.path.join(image_path, filename)
        output_image_path = os.path.join(output_folder, filename)

        image = cv2.imread(input_image_path)
        cropped_image = crop_center(image, target_size)
        cv2.imwrite(output_image_path, cropped_image)

crop_center_in_folder(image_path, 640)

# cv2.imshow("Cropped Image", cropped_image)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
