from setuptools import setup, find_packages

setup(
    name="pomodro_tui",
    version="0.1.1",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "textual",
        "python-socketio",
    ],
    entry_points={
        "console_scripts": [
            "pomodro_tui=pomodro_tui.app:main",
        ],
    },
    author="0xrushi",
    description="A Pomodoro Timer application using Textual",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/0xrushi/PomoHub",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
)