import cv2
import os

cap = cv2.VideoCapture('C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos/panorama_outubro_2026_reels.mp4')
out_dir = 'C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos/frames'
os.makedirs(out_dir, exist_ok=True)
frames_to_save = [50, 220, 420, 620, 760, 880]
curr = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    if curr in frames_to_save:
        cv2.imwrite(f"{out_dir}/frame_{curr}.png", frame)
        print(f"Saved frame_{curr}.png")
    curr += 1

cap.release()
print("Done extracting keyframes!")
