import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import VGG19
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from scipy.spatial.distance import cosine
from werkzeug.utils import secure_filename
from PIL import Image
import io
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Paths from .env
DB_PATH = os.getenv("DB_PATH")
UPLOAD_DIR = os.getenv("UPLOAD_DIR")
MODEL_DIR = os.getenv("MODEL_DIR")

# Model filenames (without full path for security)
MODEL_FILES = [
    "densenet169_fold1.keras",
    "inceptionv3_fold1.keras",
    "xception_fold1.keras",
    "inceptionresnetv2_fold1.keras",
    "vgg19_fold1.keras",
    "mobilenetv2_fold1.keras",
    "resnet50v2_fold1.keras"
]
MODEL_PATHS = [os.path.join(MODEL_DIR, fname) for fname in MODEL_FILES]

# Class labels
CLASS_LABELS = [
    "im_Dyskeratotic",
    "im_Koilocytotic",
    "im_Metaplastic",
    "im_Parabasal",
    "im_Superficial-Intermediate"
]

# Create upload directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Flask
app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"] = UPLOAD_DIR

# Load VGG19 for feature extraction
vgg_model = VGG19(weights="imagenet", include_top=False, pooling="avg")

# Load 7 pre-trained models
try:
    models = [tf.keras.models.load_model(path) for path in MODEL_PATHS]
except Exception as e:
    print(f"Error loading models: {e}. Please check MODEL_DIR in .env.")
    models = []

# Check database existence
if not os.path.exists(DB_PATH):
    raise FileNotFoundError(
        f"Database {DB_PATH} not found. Run setup.py first to create it."
    )

# Function to extract VGG19 features
def extract_features(img_path=None, img_data=None):
    if img_path:
        img = load_img(img_path, target_size=(224, 224))
    elif img_data:
        img = Image.open(io.BytesIO(img_data)).resize((224, 224))
    else:
        raise ValueError("Either img_path or img_data must be provided")
    
    img = img_to_array(img)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    features = vgg_model.predict(img, verbose=0)
    return features.flatten()

# Preprocess image for classification models
def preprocess_image_for_models(img_data):
    img = Image.open(io.BytesIO(img_data)).resize((224, 224))
    img = img_to_array(img)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    return img

# Fuzzy ensemble logic
def expo_equ(probs):
    return 1 - np.exp(-((probs - 1) ** 2) / 2)

def tanh_equ(probs):
    return 1 - np.tanh(((probs - 1) ** 2) / 2)

def norm_equ(probs):
    return 1 / (1 + np.exp(-probs))

def compute_final_score(probs):
    return expo_equ(probs) * tanh_equ(probs) * norm_equ(probs)

def fuzzy_rank_ensemble(predictions):
    model_scores = [compute_final_score(pred) for pred in predictions]
    ensemble_class_scores = np.sum(model_scores, axis=0)
    predicted_class_idx = np.argmin(ensemble_class_scores, axis=1)[0]
    return predicted_class_idx

# Retrieve top 5 similar images with base64 data
def retrieve_similar_images(predicted_class, query_features):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, feature_vector FROM images WHERE class_label = ? AND file_path IS NOT NULL",
        (predicted_class,)
    )
    results = cursor.fetchall()
    
    similar_images = []
    for img_id, feature_blob in results:
        db_features = np.frombuffer(feature_blob, dtype=np.float32)
        similarity = 1 - cosine(query_features, db_features)
        similar_images.append((img_id, similarity))
    
    similar_images.sort(key=lambda x: x[2], reverse=True)
    top_5 = similar_images[:5]
    
    # Load and encode images as base64
    top_5_with_data = []
    for img_id, _ in top_5:
        cursor.execute(
            "SELECT file_path, image_data FROM images WHERE id = ?",
            (img_id,)
        )
        row = cursor.fetchone()
        try:
            if row[1]:  # image_data (BLOB)
                img_data = row[1]
            else:  # file_path
                with open(row[0], "rb") as f:
                    img_data = f.read()
            img_base64 = base64.b64encode(img_data).decode("utf-8")
            top_5_with_data.append((img_id, img_base64))
        except Exception as e:
            print(f"Error encoding image ID {img_id}: {e}")
            continue
    
    conn.close()
    return top_5_with_data

# Flask route for prediction and retrieval
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    if "models" not in request.form:
        return jsonify({"error": "No models selected"}), 400
    
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No image selected"}), 400
    
    try:
        model_indices = [int(i) for i in request.form["models"].split(",")]
        if not all(0 <= i < len(MODEL_PATHS) for i in model_indices):
            return jsonify({"error": "Invalid model indices"}), 400
        if not model_indices:
            return jsonify({"error": "At least one model must be selected"}), 400
    except ValueError:
        return jsonify({"error": "Model indices must be comma-separated integers"}), 400
    
    img_data = file.read()
    filename = secure_filename(file.filename)
    temp_img_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    with open(temp_img_path, "wb") as f:
        f.write(img_data)
    
    try:
        img = preprocess_image_for_models(img_data)
        selected_models = [models[i] for i in model_indices]
        predictions = [model.predict(img, verbose=0) for model in selected_models]
        predicted_class_idx = fuzzy_rank_ensemble(predictions)
        predicted_class = CLASS_LABELS[predicted_class_idx]
        
        query_features = extract_features(img_data=img_data)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO images (file_path, class_label, feature_vector, image_data) VALUES (?, ?, ?, ?)",
            (None, predicted_class, query_features.tobytes(), img_data)
        )
        conn.commit()
        conn.close()
        
        similar_images = retrieve_similar_images(predicted_class, query_features)
        
        response = {
            "predicted_class": predicted_class,
            "similar_images": [
                {
                    "id": img_id,
                    "image_base64": img_base64
                }
                for img_id, img_base64 in similar_images
            ]
        }
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)