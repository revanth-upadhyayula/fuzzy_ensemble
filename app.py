import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Suppress oneDNN warnings

import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import VGG19
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3
from werkzeug.utils import secure_filename
from PIL import Image
import io
import base64
from dotenv import load_dotenv
from scipy.spatial.distance import cosine
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Paths from .env
DB_PATH = os.getenv("DB_PATH", "database.db")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MODEL_DIR = os.getenv("MODEL_DIR", "models")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# Model filenames
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

# Model mapping for frontend
MODEL_MAPPING = {
    'DenseNet169': 0,
    'InceptionV3': 1,
    'Xception': 2,
    'InceptionResNetV2': 3,
    'VGG19': 4,
    'MobileNetV2': 5,
    'ResNet50V2': 6
}

# Class labels
CLASS_LABELS = [
    "im_Dyskeratotic",
    "im_Koilocytotic",
    "im_Metaplastic",
    "im_Parabasal",
    "im_Superficial-Intermediate"
]

# Create directories
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

# Initialize Flask
app = Flask(__name__, static_url_path='/static', static_folder=STATIC_DIR)
CORS(app, resources={r"/predict": {"origins": ["http://127.0.0.1:5000"]}}, supports_credentials=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_DIR

# Load VGG19 for feature extraction
try:
    vgg_model = VGG19(weights="imagenet", include_top=False, pooling="avg")
    # logger.info("VGG19 model loaded successfully")
except Exception as e:
    # logger.error(f"Error loading VGG19: {e}")
    raise

# Load pre-trained models
try:
    models = [tf.keras.models.load_model(path) for path in MODEL_PATHS]
    # logger.info("Pre-trained models loaded successfully")
except Exception as e:
    # logger.error(f"Error loading models: {e}. Please check MODEL_DIR in .env.")
    models = []

# Check database existence
if not os.path.exists(DB_PATH):
    # logger.error(f"Database {DB_PATH} not found")
    raise FileNotFoundError(f"Database {DB_PATH} not found. Run setup.py first to create it.")

# Feature extraction
def extract_features(img_path=None, img_data=None):
    try:
        if img_path:
            img = Image.open(img_path).convert('RGB')
        elif img_data:
            img = Image.open(io.BytesIO(img_data)).convert('RGB')
        else:
            raise ValueError("Either img_path or img_data must be provided")
        
        logger.debug(f"Image mode for feature extraction: {img.mode}")
        img = img.resize((224, 224))
        img = img_to_array(img)
        logger.debug(f"Image shape for feature extraction: {img.shape}")
        
        if img.shape[-1] != 3:
            raise ValueError(f"Image has {img.shape[-1]} channels, expected 3 (RGB)")
        
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        features = vgg_model.predict(img, verbose=0)
        return features.flatten()
    except Exception as e:
        logger.error(f"Error extracting features: {e}")
        raise

# Preprocess image for classification models
def preprocess_image_for_models(img_data):
    try:
        # Open image and convert to RGB to ensure 3 channels
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
        # logger.debug(f"Image mode after conversion: {img.mode}")
        
        # Resize to target size
        img = img.resize((224, 224))
        
        # Convert to array and normalize
        img = img_to_array(img)
        # logger.debug(f"Image shape after conversion: {img.shape}")
        
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        return img
    except Exception as e:
        # logger.error(f"Error preprocessing image: {e}")
        raise
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
    try:
        model_scores = [compute_final_score(pred) for pred in predictions]
        ensemble_class_scores = np.sum(model_scores, axis=0)
        predicted_class_idx = np.argmin(ensemble_class_scores, axis=1)[0]
        return predicted_class_idx
    except Exception as e:
        # logger.error(f"Error in fuzzy ensemble: {e}")
        raise

# Retrieve top 5 similar images with base64 data
def retrieve_similar_images(predicted_class, query_features):
    try:
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
        
        similar_images.sort(key=lambda x: x[1], reverse=True)
        top_5 = similar_images[:5]
        
        top_5_with_data = []
        for img_id, _ in top_5:
            cursor.execute(
                "SELECT file_path, image_data FROM images WHERE id = ?",
                (img_id,)
            )
            row = cursor.fetchone()
            try:
                if row[1]:
                    img_data = row[1]
                else:
                    with open(row[0], "rb") as f:
                        img_data = f.read()
                img_base64 = base64.b64encode(img_data).decode("utf-8")
                top_5_with_data.append((img_id, img_base64))
            except Exception as e:
                # logger.error(f"Error encoding image ID {img_id}: {e}")
                continue
        
        conn.close()
        # logger.debug(f"Retrieved {len(top_5_with_data)} similar images for class {predicted_class}")
        return top_5_with_data
    except Exception as e:
        # logger.error(f"Error retrieving similar images: {e}")
        raise

# Routes
@app.route('/')
def index():
    return render_template('index-1-updated.html')

@app.route('/team')
def team():
    return render_template('team.html')

@app.route('/research')
def research():
    return render_template('research.html')

@app.route('/predict', methods=['POST'])
def predict():
    # logger.debug("Received /predict request")
    
    if 'image' not in request.files:
        # logger.error("No image uploaded")
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == "":
        # logger.error("No image selected")
        return jsonify({"error": "No image selected"}), 400
    
    if 'models' not in request.form:
        # logger.error("No models selected")
        return jsonify({"error": "No models selected"}), 400
    
    try:
        models_str = request.form['models']
        if not models_str:
            # logger.error("At least one model must be selected")
            return jsonify({"error": "At least one model must be selected"}), 400
        
        selected_model_names = models_str.split(",")
        model_indices = []
        for name in selected_model_names:
            if name not in MODEL_MAPPING:
                # logger.error(f"Invalid model name: {name}. Valid options: {list(MODEL_MAPPING.keys())}")
                return jsonify({"error": f"Invalid model name: {name}. Valid options: {list(MODEL_MAPPING.keys())}"}), 400
            model_indices.append(MODEL_MAPPING[name])
        # logger.debug(f"Selected model indices: {model_indices}")
    except Exception as e:
        # logger.error(f"Failed to parse models: {str(e)}")
        return jsonify({"error": f"Failed to parse models: {str(e)}"}), 400

    img_data = file.read()
    filename = secure_filename(file.filename)
    temp_img_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    try:
        with open(temp_img_path, "wb") as f:
            f.write(img_data)
        # logger.debug(f"Image saved to {temp_img_path}")
    except Exception as e:
        # logger.error(f"Error saving image: {e}")
        return jsonify({"error": f"Error saving image: {str(e)}"}), 500

    try:
        img = preprocess_image_for_models(img_data)
        selected_models = [models[i] for i in model_indices]
        predictions = [model.predict(img, verbose=0) for model in selected_models]
        # logger.debug(f"Predictions obtained from {len(selected_models)} models")
        predicted_class_idx = fuzzy_rank_ensemble(predictions)
        predicted_class = CLASS_LABELS[predicted_class_idx]
        # logger.debug(f"Predicted class: {predicted_class}")

        query_features = extract_features(img_data=img_data)
        logger.debug("Features extracted")

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO images (file_path, class_label, feature_vector, image_data) VALUES (?, ?, ?, ?)",
            (None, predicted_class, query_features.tobytes(), img_data)
        )
        conn.commit()
        # logger.debug("Image data inserted into database")
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
        # logger.debug(f"Response prepared: {response}")
        return jsonify(response)
    
    except Exception as e:
        # logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500
    
    finally:
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)