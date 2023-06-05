import os


def rename_images(folder_path, frefix):
    files = os.listdir(folder_path)
    i = 1

    for file in files:
        file_extrension = os.path.splitext(file)[1]
        new_file_name = f"{frefix}{i}{file_extrension}"
        old_file_path = os.path.join(folder_path, file)
        new_file_path = os.path.join(folder_path, new_file_name)

        os.rename(old_file_path, new_file_path)
        i += 1


object = "cheese"

# prenotation for python


folder_path = f"./img/croppedImgs/{object}"
prefix = f"{object}_img_"
rename_images(folder_path, prefix)