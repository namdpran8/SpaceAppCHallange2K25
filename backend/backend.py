from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- 1. IMPORT CORS
import numpy as np
import pandas as pd
import tensorflow as tf
import xgboost as xgb
import joblib

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app)  # <-- 2. ENABLE CORS FOR YOUR APP


# --- MODEL LOADING ---
# NOTE: You must replace these file paths with the actual paths to the
# model files you downloaded from your Kaggle notebook.
# For the CNN, this will likely be a .h5 or .keras file.
# For XGBoost, it might be a .json or .pkl file.
# The scaler would be a .pkl file.

try:
    # Load the pre-trained CNN model for flux data analysis
    # Example: cnn_model = tf.keras.models.load_model('exoplanet_cnn_model.h5')
    cnn_model = 'C:\\NASA SPacechhhalnge\\backend\\model\\best_model.keras' # <<< REPLACE WITH YOUR ACTUAL CNN MODEL LOADING
    print("CNN model loaded successfully.")
except Exception as e:
    cnn_model = None
    print(f"Warning: Could not load CNN model. Endpoint /predict/flux will not work. Error: {e}")

try:
    # Load the pre-trained XGBoost model and the scaler for feature data analysis
    # Example: xgb_model = joblib.load('exoplanet_xgboost_model.pkl')
    # Example: xgb_scaler = joblib.load('exoplanet_final_scaler.pkl')
    xgb_model = 'C:\\NASA SPacechhhalnge\\backend\\model\\exoplanet_xgboost_model.json'
    xgb_scaler = 'C:\\NASA SPacechhhalnge\\backend\\model\\exoplanet.pkl'
    # The order of features the XGBoost model was trained on.
    # It's crucial that the input data matches this order.
    XGB_FEATURE_ORDER = [
        'koi_period', 'koi_duration', 'koi_depth', 'koi_prad', 'koi_teq', 
        'koi_insol', 'koi_steff', 'koi_srad', 'koi_model_snr' 
        # Add all other feature names your model was trained on, in the exact same order.
    ]
    print("XGBoost model and scaler loaded successfully.")
except Exception as e:
    xgb_model = None
    xgb_scaler = None
    print(f"Warning: Could not load XGBoost model. Endpoint /predict/features will not work. Error: {e}")


# --- API ENDPOINTS ---

@app.route("/")
def home():
    """Home page to confirm the server is running."""
    return "<h1>Exoplanet Detection API</h1><p>Use the /predict/flux or /predict/features endpoints to get a prediction.</p>"

@app.route('/predict/flux', methods=['POST'])
def predict_flux():
    """
    Endpoint for the CNN model.
    Accepts a JSON payload with a 'flux_data' key.
    The value should be a list/array of 3197 flux readings.
    """
    if cnn_model is None:
        return jsonify({'error': 'CNN model is not loaded.'}), 500

    data = request.get_json()
    if 'flux_data' not in data:
        return jsonify({'error': "Request must contain 'flux_data' key."}), 400

    flux_array = np.array(data['flux_data'])

    # --- Preprocessing for CNN ---
    # 1. Check if the input has the correct number of features
    if flux_array.ndim != 1 or len(flux_array) != 3197:
        return jsonify({'error': f"Expected a 1D array of 3197 flux values, but got shape {flux_array.shape}"}), 400

    # 2. Reshape the data for the model (add batch dimension)
    # The CNN expects an input shape like (batch_size, num_features)
    flux_data_reshaped = flux_array.reshape(1, -1)

    # --- Prediction ---
    try:
        probability = cnn_model.predict(flux_data_reshaped)[0][0]
        
        # Using a threshold of 0.5 as a default
        prediction = "Exoplanet" if probability > 0.5 else "Not Exoplanet"

        # --- Return Response ---
        return jsonify({
            'prediction': prediction,
            'probability': float(probability),
            'model_used': 'CNN (Flux Data)'
        })
    except Exception as e:
        return jsonify({'error': f'Error during prediction: {str(e)}'}), 500


@app.route('/predict/features', methods=['POST'])
def predict_features():
    """
    Endpoint for the XGBoost model.
    Accepts a JSON payload with key-value pairs for the tabular features.
    """
    if xgb_model is None or xgb_scaler is None:
        return jsonify({'error': 'XGBoost model or scaler is not loaded.'}), 500

    data = request.get_json()
    
    # --- Preprocessing for XGBoost ---
    try:
        # 1. Create a pandas DataFrame from the input, ensuring correct feature order
        input_df = pd.DataFrame([data])[XGB_FEATURE_ORDER]
        
        # 2. Scale the data using the loaded scaler
        scaled_data = xgb_scaler.transform(input_df)
    except KeyError as e:
        return jsonify({'error': f'Missing feature in request: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Error during preprocessing: {str(e)}'}), 500

    # --- Prediction ---
    try:
        # Predict returns 0 or 1
        prediction_code = xgb_model.predict(scaled_data)[0]
        prediction = "Exoplanet" if prediction_code == 1 else "Not Exoplanet"

        # --- Return Response ---
        return jsonify({
            'prediction': prediction,
            'model_used': 'XGBoost (Tabular Features)'
        })
    except Exception as e:
        return jsonify({'error': f'Error during prediction: {str(e)}'}), 500

# --- Run the App ---
if __name__ == '__main__':
    # You can change the port number if needed
    app.run(host='0.0.0.0', port=5000, debug=True)
