from flask import Flask, request, jsonify, render_template
import numpy as np
from PIL import Image
import io
import base64
import tensorflow as tf
import json
import pickle
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model and configuration
try:
    model = tf.keras.models.load_model('garbage_classification_cnn.h5')
    print("Model loaded successfully")
    
    with open('class_mapping.json', 'r') as f:
        class_mapping = json.load(f)
    class_mapping = {int(k): v for k, v in class_mapping.items()}
    print("Class mapping loaded successfully")
    
    with open('model_config.pkl', 'rb') as f:
        config = pickle.load(f)
    print("Model configuration loaded successfully")
    
except Exception as e:
    print(f"Error loading model files: {e}")
    model = None
    class_mapping = {}
    config = {'img_size': 128}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image):
    """Preprocess the image for model prediction"""
    # Resize to model's expected input size
    image = image.resize((config['img_size'], config['img_size']))
    
    # Convert to numpy array and normalize
    img_array = np.array(image)

    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def map_to_waste_category(original_class, confidence, all_predictions):
    """
    Map the original prediction to the new waste categories
    """
    # Define mapping from original classes to waste categories
    waste_mapping = {
        'bio-degradable': ['paper', 'cardboard', 'biological'],
        'plastic': ['plastic'],
        'e-waste': ['battery'],
        'other': ['metal', 'glass', 'trash', 'clothes']
    }
    
    # Check if confidence is too low for all predictions
    if confidence < 0.24:  # Threshold for hazardous classification
        return 'hazardous', confidence
    
    # Map to waste category
    original_class_lower = original_class.lower()
    
    for waste_category, original_classes in waste_mapping.items():
        for orig_class in original_classes:
            if orig_class in original_class_lower:
                return waste_category, confidence
    
    # If no specific mapping found, return as 'other'
    return 'other', confidence

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Secure filename and save temporarily
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Open and process image
            image = Image.open(filepath).convert('RGB')
            img_array = preprocess_image(image)
            
            # Make prediction
            if model:
                predictions = model.predict(img_array)
                predicted_class_idx = np.argmax(predictions, axis=1)[0]
                confidence = float(np.max(predictions))
                original_class = class_mapping.get(predicted_class_idx, "Unknown")
                
                # Map to waste category
                waste_category, final_confidence = map_to_waste_category(original_class, confidence, predictions[0])
                
                # Clean up temporary file
                os.remove(filepath)
                
                return jsonify({
                    'success': True,
                    'original_class': original_class,
                    'waste_category': waste_category,
                    'confidence': final_confidence,
                    'all_predictions': predictions[0].tolist(),
                    'all_classes': list(class_mapping.values())
                })
            else:
                return jsonify({'error': 'Model not loaded'}), 500
                
        except Exception as e:
            # Clean up temporary file if it exists
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)