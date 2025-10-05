"""
Complete Flask Backend API for Exoplanet Detection
Supports XGBoost and CNN models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf
from tensorflow import keras
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables for models
xgb_model = None
cnn_model = None
scaler = None
label_encoder = None
feature_names = None

# Model paths
MODEL_DIR = 'models'
XGB_MODEL_PATH = os.path.join(MODEL_DIR, 'exoplanet_xgboost_model.json')
CNN_MODEL_PATH_H5 = os.path.join(MODEL_DIR, 'exoplanet_cnn_model.h5')
CNN_MODEL_PATH_KERAS = os.path.join(MODEL_DIR, 'best_model.h5')
SCALER_PATH = os.path.join(MODEL_DIR, 'exoplanet_final_scaler.pkl')
ENCODER_PATH = os.path.join(MODEL_DIR, 'exoplanet_final_label_encoder.pkl')
FEATURES_PATH = os.path.join(MODEL_DIR, 'exoplanet_final_features.pkl')


print("Loading models...")
print(XGB_MODEL_PATH)
print(CNN_MODEL_PATH_H5)
print(CNN_MODEL_PATH_KERAS)
print(SCALER_PATH)
print(ENCODER_PATH)
print(FEATURES_PATH)


# Load models on startup
def load_models():
    global xgb_model, cnn_model, scaler, label_encoder, feature_names
    
    try:
        # Load XGBoost model
        if os.path.exists(XGB_MODEL_PATH):
            import xgboost as xgb
            xgb_model = xgb.XGBClassifier()
            xgb_model.load_model(XGB_MODEL_PATH)
            print("✓ XGBoost model loaded")
        
        # Load CNN model (supports both .h5 and .keras formats)
        if os.path.exists(CNN_MODEL_PATH_KERAS ):
            cnn_model = keras.models.load_model(CNN_MODEL_PATH_KERAS , compile=False)
            print("✓ CNN model loaded (.keras format)")
        elif os.path.exists(CNN_MODEL_PATH_H5):
            cnn_model = keras.models.load_model(CNN_MODEL_PATH_H5)
            print("✓ CNN model loaded (.h5 format)")
        else:
            print("⚠ No CNN model found")
        
        # Load preprocessing components
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
            print("✓ Scaler loaded")
        
        if os.path.exists(ENCODER_PATH):
            label_encoder = joblib.load(ENCODER_PATH)
            print("✓ Label encoder loaded")
        
        if os.path.exists(FEATURES_PATH):
            feature_names = joblib.load(FEATURES_PATH)
            print("✓ Feature names loaded")
        
        print("All models loaded successfully!")
        
    except Exception as e:
        print(f"Error loading models: {str(e)}")

# Initialize models
load_models()

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Check if API is running and models are loaded"""
    return jsonify({
        'status': 'healthy',
        'xgb_loaded': xgb_model is not None,
        'cnn_loaded': cnn_model is not None,
        'scaler_loaded': scaler is not None,
        'timestamp': datetime.now().isoformat()
    })

# Get model information
@app.route('/api/models/info', methods=['GET'])
def model_info():
    """Get information about available models"""
    return jsonify({
        'models': {
            'xgboost': {
                'available': xgb_model is not None,
                'type': 'Gradient Boosting',
                'accuracy': '82-88%',
                'use_case': 'Tabular features'
            },
            'cnn': {
                'available': cnn_model is not None,
                'type': 'Convolutional Neural Network',
                'accuracy': '90-99%',
                'use_case': 'Light curve time series'
            }
        },
        'features': feature_names if feature_names else [],
        'classes': label_encoder.classes_.tolist() if label_encoder else []
    })

# Single prediction endpoint
@app.route('/api/predict', methods=['POST'])
def predict_single():
    """
    Predict exoplanet classification for single observation
    
    Expected JSON format:
    {
        "model": "xgboost",  # or "cnn"
        "features": {
            "koi_period": 10.5,
            "koi_duration": 3.2,
            ...
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        model_type = data.get('model', 'xgboost').lower()
        features = data.get('features', {})
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame([features])
        
        # For tabular models (XGBoost)
        if model_type == 'xgboost':
            if xgb_model is None:
                return jsonify({'error': 'XGBoost model not loaded'}), 500
            
            # Ensure correct feature order
            if feature_names:
                missing_features = set(feature_names) - set(df.columns)
                if missing_features:
                    return jsonify({
                        'error': 'Missing required features',
                        'missing': list(missing_features)
                    }), 400
                
                df = df[feature_names]
            
            # Scale features
            if scaler:
                df_scaled = scaler.transform(df)
            else:
                df_scaled = df.values
            
            # Predict
            prediction = xgb_model.predict(df_scaled)[0]
            probabilities = xgb_model.predict_proba(df_scaled)[0]
        
        # For CNN model (time series)
        elif model_type == 'cnn':
            if cnn_model is None:
                return jsonify({'error': 'CNN model not loaded'}), 500
            
            # Expecting flux array for CNN
            if 'flux_values' not in features:
                return jsonify({
                    'error': 'CNN requires flux_values array (time series data)'
                }), 400
            
            flux = np.array(features['flux_values'])
            
            # Reshape for CNN input
            flux = flux.reshape(1, -1, 1)
            
            # Predict
            probabilities = cnn_model.predict(flux, verbose=0)[0]
            prediction = np.argmax(probabilities)
        
        else:
            return jsonify({'error': f'Invalid model type: {model_type}'}), 400
        
        # Get label
        if label_encoder:
            predicted_label = label_encoder.inverse_transform([prediction])[0]
        else:
            predicted_label = str(prediction)
        
        confidence = float(probabilities[prediction]) * 100
        
        # Prepare response
        response = {
            'classification': predicted_label,
            'confidence': round(confidence, 2),
            'probabilities': {
                label_encoder.classes_[i] if label_encoder else str(i): round(float(prob) * 100, 2)
                for i, prob in enumerate(probabilities)
            },
            'model_used': model_type,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Batch prediction endpoint
@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict multiple observations at once
    
    Expected JSON format:
    {
        "model": "xgboost",
        "data": [
            {"koi_period": 10.5, "koi_duration": 3.2, ...},
            {"koi_period": 15.2, "koi_duration": 4.1, ...}
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        model_type = data.get('model', 'xgboost').lower()
        observations = data.get('data', [])
        
        if not observations:
            return jsonify({'error': 'No observations provided'}), 400
        
        results = []
        
        for obs in observations:
            # Use single prediction logic for each observation
            pred_response = predict_single.__wrapped__(obs, model_type)
            results.append(pred_response)
        
        return jsonify({
            'predictions': results,
            'total': len(results),
            'model_used': model_type,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get statistics endpoint
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get model statistics and metadata"""
    
    stats = {
        'xgboost': {
            'accuracy': '82-88%',
            'precision': '84%',
            'recall': '82%',
            'f1_score': '83%',
            'training_samples': 7651,
            'test_samples': 1913
        },
        'cnn': {
            'accuracy': '99.91%',
            'precision': '99.82%',
            'recall': '100%',
            'f1_score': '99.91%',
            'architecture': '4 Conv1D blocks + Dense layers'
        },
        'dataset': {
            'source': 'NASA Kepler Mission',
            'total_samples': 9564,
            'confirmed_planets': 2746,
            'candidates': 1979,
            'false_positives': 4839
        }
    }
    
    return jsonify(stats)

# Feature importance endpoint
@app.route('/api/features/importance', methods=['GET'])
def feature_importance():
    """Get feature importance from XGBoost model"""
    
    if xgb_model is None:
        return jsonify({'error': 'XGBoost model not loaded'}), 500
    
    try:
        importances = xgb_model.feature_importances_
        features = feature_names if feature_names else [f'feature_{i}' for i in range(len(importances))]
        
        importance_dict = {
            feat: float(imp) 
            for feat, imp in sorted(
                zip(features, importances), 
                key=lambda x: x[1], 
                reverse=True
            )
        }
        
        return jsonify({
            'importance': importance_dict,
            'top_5': dict(list(importance_dict.items())[:5])
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Example data endpoint
@app.route('/api/examples', methods=['GET'])
def get_examples():
    """Get example input data for testing"""
    
    examples = {
        'confirmed_exoplanet': {
            'koi_period': 289.9,
            'koi_duration': 5.4,
            'koi_depth': 492.0,
            'koi_prad': 2.4,
            'koi_teq': 262.0,
            'koi_insol': 1.42,
            'koi_steff': 5518.0,
            'koi_srad': 0.98,
            'description': 'Kepler-22b - First confirmed planet in habitable zone'
        },
        'false_positive': {
            'koi_period': 1.2,
            'koi_duration': 0.8,
            'koi_depth': 50.0,
            'koi_prad': 0.5,
            'koi_teq': 1500.0,
            'koi_insol': 250.0,
            'koi_steff': 6200.0,
            'koi_srad': 1.5,
            'description': 'Stellar variability misidentified as transit'
        },
        'candidate': {
            'koi_period': 42.0,
            'koi_duration': 3.0,
            'koi_depth': 300.0,
            'koi_prad': 1.8,
            'koi_teq': 450.0,
            'koi_insol': 5.2,
            'koi_steff': 5800.0,
            'koi_srad': 1.1,
            'description': 'Requires follow-up observation'
        }
    }
    
    return jsonify(examples)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Main entry point
if __name__ == '__main__':
    # Create models directory if it doesn't exist
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print("="*70)
    print("EXOPLANET DETECTION API")
    print("="*70)
    print("\nEndpoints available:")
    print("  GET  /health              - Health check")
    print("  GET  /api/models/info     - Model information")
    print("  POST /api/predict         - Single prediction")
    print("  POST /api/predict/batch   - Batch predictions")
    print("  GET  /api/stats           - Model statistics")
    print("  GET  /api/features/importance - Feature importance")
    print("  GET  /api/examples        - Example data")
    print("\n" + "="*70)
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )