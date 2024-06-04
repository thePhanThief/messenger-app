import os

# Directories to include
include_dirs = [
    "app",
    "pages",
    "prisma",
    "public",
    "start"
]

# Function to gather files and concatenate their contents
def gather_code_files(base_dir, include_dirs):
    code_content = []
    for include_dir in include_dirs:
        dir_path = os.path.join(base_dir, include_dir)
        for root, _, files in os.walk(dir_path):
            for file in files:
                if file.endswith(('.js', '.ts', '.tsx', '.json', '.html', '.css')):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding='utf-8') as f:
                        content = f.read()
                        code_content.append(f"### {file_path}\n\n```{file.split('.')[-1]}\n{content}\n```\n")
    return code_content

# Base directory of the cloned repository
base_dir = os.path.abspath(".")

# Gather the code content
code_content = gather_code_files(base_dir, include_dirs)

# Write the code content to a single file
output_file_path = os.path.join(base_dir, "all_code.md")
with open(output_file_path, "w", encoding='utf-8') as f:
    f.writelines(code_content)

print(f"All code has been written to {output_file_path}")
