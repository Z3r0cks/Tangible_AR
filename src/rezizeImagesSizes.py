import os
from PIL import Image

def resize_image(input_image_path, output_image_path, new_width, new_height):
    # Bild öffnen
    image = Image.open(input_image_path)

    # Bildgröße ändern
    resized_image = image.resize((new_width, new_height), Image.LANCZOS)

    # Geändertes Bild speichern
    resized_image.save(output_image_path)

def resize_images_in_folder(input_folder, output_folder, new_width, new_height):
    # Ordner erstellen, falls nicht vorhanden
    os.makedirs(output_folder, exist_ok=True)

    # Alle Dateien im Eingabeordner durchlaufen
    for filename in os.listdir(input_folder):
        # Dateipfad für Eingabe- und Ausgabebild
        input_image_path = os.path.join(input_folder, filename)
        output_image_path = os.path.join(output_folder, filename)

        # Größe ändern und geändertes Bild speichern
        resize_image(input_image_path, output_image_path, new_width, new_height)

# Beispiel: Ändern der Größe aller Bilder in einem Ordner auf 640x480 Pixel
input_folder = './img/rawImgs'
output_folder = './resize/multiple'
new_width = 640
new_height = 640

resize_images_in_folder(input_folder, output_folder, new_width, new_height)
