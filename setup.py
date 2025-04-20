import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import VGG19
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import sqlite3
import os
import zipfile
from PIL import Image
from tqdm import tqdm
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Paths from .env
ZIP_PATH = os.getenv("ZIP_PATH")
EXTRACT_DIR = os.getenv("EXTRACT_DIR")
RESIZED_DIR = os.getenv("RESIZED_DIR")
DB_PATH = os.getenv("DB_PATH")

# Class labels
CLASS_LABELS = [
    "im_Dyskeratotic",
    "im_Koilocytotic",
    "im_Metaplastic",
    "im_Parabasal",
    "im_Superficial-Intermediate"
]

# Create directories
os.makedirs(EXTRACT_DIR, exist_ok=True)
os.makedirs(RESIZED_DIR, exist_ok=True)

# Load VGG19 for feature extraction
vgg_model = VGG19(weights="imagenet", include_top=False, pooling="avg")

# Function to resize images
def resize_images():
    if not os.path.exists(EXTRACT_DIR):
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(EXTRACT_DIR)
        print(f"Extracted {ZIP_PATH} to {EXTRACT_DIR}")
    
    for category in CLASS_LABELS:
        input_dir = os.path.join(EXTRACT_DIR, category, category, "CROPPED")
        output_dir = os.path.join(RESIZED_DIR, category)
        os.makedirs(output_dir, exist_ok=True)
        
        if not os.path.exists(input_dir):
            print(f"Warning: {input_dir} not found")
            continue
        
        for file in os.listdir(input_dir):
            if file.endswith('.bmp'):
                img_path = os.path.join(input_dir, file)
                try:
                    img = Image.open(img_path)
                    img = img.resize((224, 224))
                    output_path = os.path.join(output_dir, file)
                    img.save(output_path)
                except Exception as e:
                    print(f"Error resizing {img_path}: {e}")

# Function to extract VGG19 features
def extract_features(img_path):
    img = load_img(img_path, target_size=(224, 224))
    img = img_to_array(img)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    features = vgg_model.predict(img, verbose=0)
    return features.flatten()

# SQLite database setup
def create_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT,
            class_label TEXT NOT NULL,
            feature_vector BLOB NOT NULL,
            image_data BLOB
        )
    """)
    conn.commit()
    conn.close()

# Extract and store dataset features
def store_features():
    if not any(os.listdir(RESIZED_DIR)):
        print("Resizing images...")
        resize_images()
    
    create_database()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Extracting dataset features...")
    for class_label in CLASS_LABELS:
        class_dir = os.path.join(RESIZED_DIR, class_label)
        if not os.path.exists(class_dir):
            print(f"Warning: {class_dir} not found")
            continue
        
        image_files = [f for f in os.listdir(class_dir) if f.endswith('.bmp')]
        for img_name in tqdm(image_files, desc=f"Processing {class_label}"):
            img_path = os.path.join(class_dir, img_name)
            try:
                features = extract_features(img_path)
                features_blob = features.tobytes()
                cursor.execute(
                    "INSERT INTO images (file_path, class_label, feature_vector, image_data) VALUES (?, ?, ?, ?)",
                    (img_path, class_label, features_blob, None)
                )
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
    
    conn.commit()
    conn.close()
    print(f"Dataset features stored in {DB_PATH}")

if __name__ == "__main__":
    store_features()