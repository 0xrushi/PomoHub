import os

def get_name(name_without_extension):
    # Split based on '_' or '-'
    if '_' in name_without_extension:
        return name_without_extension.split('_')[0], name_without_extension.split('_')[1]
    elif '-' in name_without_extension:
        return name_without_extension.split('-')[0], name_without_extension.split('-')[1]
    else:
        return name_without_extension

def create_emoji_dict(file_path):
    # Split the path to get the name of the file
    file_name = os.path.basename(file_path)
    # Remove the file extension
    name_without_extension = os.path.splitext(file_name)[0]
    # Extract the ID and the name part
    id, name = get_name(name_without_extension)
    # Create the dictionary
    emoji_dict = {
        'names': [name],
        'imgUrl': file_path,
        'id': id
    }
    return emoji_dict

def print_file_paths(directory):
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            print(create_emoji_dict(os.path.join(dirpath, filename)))


directory_path = 'src/custom_emojis'
print_file_paths(directory_path)
