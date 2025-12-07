import subprocess
import os

# --- CONFIGURATION ---
# Path to OBS executable (update this if OBS is installed somewhere else)
OBS_PATH = r"C:\Program Files\obs-studio\bin\64bit\obs64.exe"

# URL to open in Microsoft Edge
YOUTUBE_URL = "https://www.youtube.com/watch?v=JNl1_hRwpXE"


def open_obs():
    if os.path.exists(OBS_PATH):
        subprocess.Popen([OBS_PATH])
    else:
        print("ERROR: OBS not found at:", OBS_PATH)


def open_edge(url):
    # Windows command to launch Edge with a URL
    subprocess.Popen(["start", "msedge", url], shell=True)


if __name__ == "__main__":
    open_obs()
    open_edge(YOUTUBE_URL)
