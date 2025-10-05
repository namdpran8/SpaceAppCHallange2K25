from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
import xgboost as xgb
import joblib
import io  
import os


app = Flask(__name__)
CORS(app)


XGB_FEATURE_ORDER = [
    'koi_period', 'koi_duration', 'koi_depth', 'koi_prad', 'koi_teq',
    'koi_insol', 'koi_steff', 'koi_srad', 'koi_model_snr'
]


# Initialize models as None
cnn_model = None
xgb_model = None
xgb_scaler = None

# --- CNN Model ---
try:
    cnn_path = 'best_model.keras'  # Same folder now
    if os.path.exists(cnn_path):
        cnn_model = tf.keras.models.load_model(cnn_path)
        print("✅ CNN model loaded successfully.")
    else:
        print(f"⚠️ CNN model file not found at {cnn_path}")
except Exception as e:
    print(f"⚠️ Could not load CNN model. Error: {e}")

# --- XGBoost Model and Scaler ---
try:
    xgb_model_path = 'exoplanet_xgboost_model.json'
    xgb_scaler_path = 'exoplanet.pkl'

    if os.path.exists(xgb_model_path):
        xgb_model = xgb.XGBClassifier()
        xgb_model.load_model(xgb_model_path)
    if os.path.exists(xgb_scaler_path):
        xgb_scaler = joblib.load(xgb_scaler_path)

    if xgb_model and xgb_scaler:
        print("✅ XGBoost model and scaler loaded successfully.")
    else:
        print("⚠️ Missing XGBoost model or scaler file.")
except Exception as e:
    print(f"⚠️ Could not load XGBoost model. Error: {e}")



print(f"CNN Model: {type(cnn_model)}")
print(f"XGB Model: {type(xgb_model)}")
print(f"Scaler: {type(xgb_scaler)}")



@app.route("/")
def home():
    return "<h1>Exoplanet Detection API</h1><p>API is running. Use the endpoints to get predictions.</p>"


@app.route('/predict/flux', methods=['POST'])
def predict_flux():
    if not cnn_model:
        return jsonify({'error': 'CNN model is not loaded.'}), 500
    try:
        data = request.get_json()
        flux_data = data['flux_data']

        if len(flux_data) != 3197:
            return jsonify({'error': f'Invalid input: Expected 3197 flux values, got {len(flux_data)}.'}), 400

        prediction_input = np.array(flux_data).reshape(1, -1)
        probability = cnn_model.predict(prediction_input)[0][0]
        prediction = 1 if probability > 0.5 else 0

        return jsonify({
            'model_used': 'CNN Flux Model',
            'prediction': 'Exoplanet' if prediction == 1 else 'Not an Exoplanet',
            'probability': float(probability)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/flux/csv', methods=['POST'])
def predict_flux_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and file.filename.endswith('.csv'):
        try:
            csv_content = file.read().decode('utf-8')
        
            df = pd.read_csv(io.StringIO(csv_content), header=None)

            probabilities = cnn_model.predict(df.values)
            predictions = (probabilities > 0.5).astype(int).flatten().tolist()

            return jsonify({
                'model_used': 'CNN Flux Model',
                'number_of_samples': len(df),
                'predictions': ['Exoplanet' if p == 1 else 'Not an Exoplanet' for p in predictions]
            })
        except Exception as e:
            return jsonify({'error': f'Error processing CSV file: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Please upload a CSV.'}), 400


@app.route('/predict/features', methods=['POST'])
def predict_features():
    if not xgb_model or not xgb_scaler:
        return jsonify({'error': 'XGBoost model or scaler is not loaded.'}), 500
    try:
        data = request.get_json()
        input_df = pd.DataFrame([data])[XGB_FEATURE_ORDER]
    
        features_scaled = xgb_scaler.transform(input_df.values) 
        prediction = xgb_model.predict(features_scaled)[0]

        return jsonify({
            'model_used': 'XGBoost Feature Model',
            'prediction': 'Exoplanet' if int(prediction) == 1 else 'Not an Exoplanet'
        })
    except KeyError as e:
        return jsonify({'error': f'Missing feature in request: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/features/csv', methods=['POST'])
def predict_features_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and file.filename.endswith('.csv'):
        try:
            csv_content = file.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_content))
            
            df_ordered = df[XGB_FEATURE_ORDER]
        
            features_scaled = xgb_scaler.transform(df_ordered.values) 
            predictions = xgb_model.predict(features_scaled).tolist()
            
            return jsonify({
                'model_used': 'XGBoost Feature Model',
                'number_of_samples': len(df),
                'predictions': ['Exoplanet' if p == 1 else 'Not an Exoplanet' for p in predictions]
            })
        except Exception as e:
            print(e)
            return jsonify({'error': f'Error processing CSV file: {str(e)}'}), 500
            
    return jsonify({'error': 'Invalid file type. Please upload a CSV.'}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

