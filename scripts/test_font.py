import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1080
HEIGHT = 1920
FPS = 30
TOTAL_SECONDS = 31
TOTAL_FRAMES = FPS * TOTAL_SECONDS

# Fonts
FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_BLACK = "C:/Windows/Fonts/arialbd.ttf"

def get_font(bold=False, size=32):
    f_path = FONT_BOLD if bold else FONT_REGULAR
    try:
        return ImageFont.truetype(f_path, size)
    except Exception:
        return ImageFont.truetype(FONT_BLACK, size)

print("Font test ok!")
