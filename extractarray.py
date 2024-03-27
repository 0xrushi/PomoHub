import os
from collections import defaultdict
from PIL import Image


def parse_file_name(file_name):
    # Remove the file extension
    name_without_extension = os.path.splitext(file_name)[0]
    # Split based on '_' or '-'
    parts = name_without_extension.split('_') if '_' in name_without_extension else name_without_extension.split('-') if '-' in name_without_extension else [name_without_extension]
    # Ensure there are at least two parts (id and name); append a default if not
    if len(parts) == 1:
        parts.append('default')
    return parts[0], parts[1]

def resize_image(input_path, output_path, size=(64, 64)):
    """Resizes an image to the specified size and saves it."""
    with Image.open(input_path) as img:
        resized_img = img.resize(size, Image.ANTIALIAS)
        resized_img.save(output_path)

def create_emoji_entry(file_path, file_name, output_directory):
    # Your logic to extract id and name
    id, name = parse_file_name(file_name)

    # Define the output path for the resized image
    output_path = os.path.join(output_directory, file_name)
    
    # Resize and save the image
    resize_image(file_path, output_path)

    # Return the emoji entry with the path to the resized image
    return {
        'id': id,
        'custom': 'true',
        'name': name.capitalize(),
        'keywords': [id],
        'skins': [{'src': output_path}]
    }

def group_emojis_by_category(directory, output_directory):
    # Ensure the output directory exists
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    category_dict = defaultdict(lambda: {'id': '', 'name': '', 'emojis': []})
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            if filename not in ["emojilist.js", ".DS_Store"]:
                category, emoji_name = parse_file_name(filename)
                file_path = os.path.join(dirpath, filename)
                output_path_relative = os.path.join(output_directory, category)
                
                # Ensure the output subdirectory exists
                if not os.path.exists(output_path_relative):
                    os.makedirs(output_path_relative)
                    
                entry = create_emoji_entry(file_path, filename, output_path_relative)
                if category not in category_dict:
                    category_dict[category]['id'] = category
                    category_dict[category]['name'] = category.capitalize()
                category_dict[category]['emojis'].append(entry)
    return list(category_dict.values())

directory_path = 'custom_emojis'
output_directory = 'src/resized_emojis'  # Define where to save resized images
custom = group_emojis_by_category(directory_path, output_directory)
print(custom)