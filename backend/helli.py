from flask import Flask, request, jsonify
import joblib
import numpy as np
import xgboost as xgb
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model and scaler
model = xgb.Booster()
model.load_model("exoplanet_xgboost_model.json")
scaler = joblib.load("exoplanet.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()  # Parse JSON request

        # Expected features
        required_features = ["feature1", "feature2", "feature3"]
        if not all(feature in data for feature in required_features):
            return jsonify({"error": "Missing feature in request"}), 400

        # Prepare features
        features = np.array([[data["feature1"], data["feature2"], data["feature3"]]])

        # Scale features
        features_scaled = scaler.transform(features)

        # Convert to DMatrix for XGBoost
        dmatrix = xgb.DMatrix(features_scaled)

        # Make prediction
        prediction = model.predict(dmatrix)

        return jsonify({"prediction": prediction.tolist()})

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
