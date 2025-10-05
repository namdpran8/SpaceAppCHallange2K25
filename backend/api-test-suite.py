"""
Complete API Test Suite for Exoplanet Detection API
Tests all endpoints with various scenarios
"""

import requests
import json
import time

# Configuration
BASE_URL = "https://70569e262172.ngrok-free.app"
API_URL = f"{BASE_URL}/api"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(test_name):
    print(f"\n{Colors.BLUE}{'='*70}")
    print(f"TEST: {test_name}")
    print(f"{'='*70}{Colors.END}")

def print_pass(message):
    print(f"{Colors.GREEN}✓ PASS:{Colors.END} {message}")

def print_fail(message):
    print(f"{Colors.RED}✗ FAIL:{Colors.END} {message}")

def print_info(message):
    print(f"{Colors.YELLOW}ℹ INFO:{Colors.END} {message}")

# ============================================================================
# TEST 1: Health Check
# ============================================================================

def test_health_check():
    print_test("Health Check Endpoint")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            data = response.json()
            
            print_info(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('status') == 'healthy':
                print_pass("API is healthy")
            else:
                print_fail("API status is not healthy")
            
            if data.get('xgb_loaded'):
                print_pass("XGBoost model loaded")
            else:
                print_fail("XGBoost model NOT loaded")
            
            if data.get('cnn_loaded'):
                print_pass("CNN model loaded")
            else:
                print_fail("CNN model NOT loaded")
        else:
            print_fail(f"Unexpected status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 2: Model Info
# ============================================================================

def test_model_info():
    print_test("Model Info Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/models/info")
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            data = response.json()
            
            print_info(f"Available models:")
            for model_name, model_info in data.get('models', {}).items():
                print(f"  - {model_name}: {model_info.get('type')}")
                print(f"    Accuracy: {model_info.get('accuracy')}")
            
            print_info(f"Features: {len(data.get('features', []))} available")
            print_info(f"Classes: {data.get('classes', [])}")
            print_pass("Model info retrieved successfully")
        else:
            print_fail(f"Status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 3: Single Prediction - Confirmed Exoplanet (Kepler-22b)
# ============================================================================

def test_prediction_confirmed():
    print_test("Single Prediction - Confirmed Exoplanet")
    
    # Kepler-22b data
    data = {
        "model": "xgboost",
        "features": {
            "koi_period": 289.9,
            "koi_duration": 5.4,
            "koi_depth": 492.0,
            "koi_prad": 2.4,
            "koi_teq": 262.0,
            "koi_insol": 1.42,
            "koi_steff": 5518.0,
            "koi_srad": 0.98
        }
    }
    
    try:
        response = requests.post(f"{API_URL}/predict", json=data)
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            result = response.json()
            
            print_info(f"Input: Kepler-22b (known confirmed exoplanet)")
            print_info(f"Classification: {result.get('classification')}")
            print_info(f"Confidence: {result.get('confidence')}%")
            print_info(f"Probabilities: {json.dumps(result.get('probabilities', {}), indent=2)}")
            
            if result.get('classification') in ['CONFIRMED', 'CANDIDATE']:
                print_pass("Correctly identified as exoplanet")
            else:
                print_fail(f"Misclassified as {result.get('classification')}")
        else:
            print_fail(f"Status code: {response.status_code}")
            print_fail(f"Response: {response.text}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 4: Single Prediction - False Positive
# ============================================================================

def test_prediction_false_positive():
    print_test("Single Prediction - False Positive")
    
    # Stellar variability data
    data = {
        "model": "xgboost",
        "features": {
            "koi_period": 1.2,
            "koi_duration": 0.8,
            "koi_depth": 50.0,
            "koi_prad": 0.5,
            "koi_teq": 1500.0,
            "koi_insol": 250.0,
            "koi_steff": 6200.0,
            "koi_srad": 1.5
        }
    }
    
    try:
        response = requests.post(f"{API_URL}/predict", json=data)
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            result = response.json()
            
            print_info(f"Input: Stellar variability (should be false positive)")
            print_info(f"Classification: {result.get('classification')}")
            print_info(f"Confidence: {result.get('confidence')}%")
            
            if result.get('classification') == 'FALSE POSITIVE':
                print_pass("Correctly identified as false positive")
            else:
                print_fail(f"Misclassified as {result.get('classification')}")
        else:
            print_fail(f"Status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 5: Single Prediction - Candidate
# ============================================================================

def test_prediction_candidate():
    print_test("Single Prediction - Candidate")
    
    # Borderline case
    data = {
        "model": "xgboost",
        "features": {
            "koi_period": 42.0,
            "koi_duration": 3.0,
            "koi_depth": 300.0,
            "koi_prad": 1.8,
            "koi_teq": 450.0,
            "koi_insol": 5.2,
            "koi_steff": 5800.0,
            "koi_srad": 1.1
        }
    }
    
    try:
        response = requests.post(f"{API_URL}/predict", json=data)
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            result = response.json()
            
            print_info(f"Input: Borderline case")
            print_info(f"Classification: {result.get('classification')}")
            print_info(f"Confidence: {result.get('confidence')}%")
            print_pass("Prediction completed")
        else:
            print_fail(f"Status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 6: Error Handling - Missing Features
# ============================================================================

def test_error_missing_features():
    print_test("Error Handling - Missing Features")
    
    data = {
        "model": "xgboost",
        "features": {
            "koi_period": 10.5,
            "koi_duration": 3.2
            # Missing other required features
        }
    }
    
    try:
        response = requests.post(f"{API_URL}/predict", json=data)
        
        if response.status_code == 400:
            print_pass(f"Correctly returned error status: {response.status_code}")
            error = response.json()
            print_info(f"Error message: {error.get('error')}")
            if 'missing' in error:
                print_info(f"Missing features: {error.get('missing')}")
            print_pass("Error handling works correctly")
        else:
            print_fail(f"Unexpected status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 7: Error Handling - Invalid Model
# ============================================================================

def test_error_invalid_model():
    print_test("Error Handling - Invalid Model")
    
    data = {
        "model": "invalid_model",
        "features": {
            "koi_period": 10.5,
            "koi_duration": 3.2,
            "koi_depth": 500.0,
            "koi_prad": 5.4,
            "koi_teq": 500.0,
            "koi_insol": 1.5,
            "koi_steff": 5500.0,
            "koi_srad": 1.2
        }
    }
    
    try:
        response = requests.post(f"{API_URL}/predict", json=data)
        
        if response.status_code == 400:
            print_pass(f"Correctly returned error status: {response.status_code}")
            error = response.json()
            print_info(f"Error message: {error.get('error')}")
            print_pass("Error handling works correctly")
        else:
            print_fail(f"Unexpected status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 8: Get Statistics
# ============================================================================

def test_statistics():
    print_test("Statistics Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/stats")
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            stats = response.json()
            
            print_info("XGBoost Stats:")
            for key, value in stats.get('xgboost', {}).items():
                print(f"  {key}: {value}")
            
            print_info("\nCNN Stats:")
            for key, value in stats.get('cnn', {}).items():
                print(f"  {key}: {value}")
            
            print_pass("Statistics retrieved successfully")
        else:
            print_fail(f"Status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 9: Feature Importance
# ============================================================================

def test_feature_importance():
    print_test("Feature Importance Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/features/importance")
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            data = response.json()
            
            print_info("Top 5 Important Features:")
            for feature, importance in data.get('top_5', {}).items():
                print(f"  {feature}: {importance:.4f}")
            
            print_pass("Feature importance retrieved successfully")
        else:
            print_fail(f"Status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 10: Example Data
# ============================================================================

def test_examples():
    print_test("Example Data Endpoint")
    
    try:
        response = requests.get(f"{API_URL}/examples")
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            examples = response.json()
            
            print_info(f"Available examples: {list(examples.keys())}")
            for name, data in examples.items():
                print(f"\n  {name}:")
                print(f"    {data.get('description')}")
            
            print_pass("Examples retrieved successfully")
        else:
            print_fail(f"Status code: {response.status_code}")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 11: Response Time Test
# ============================================================================

def test_response_time():
    print_test("Response Time Test")
    
    data = {
        "model": "xgboost",
        "features": {
            "koi_period": 10.5,
            "koi_duration": 3.2,
            "koi_depth": 500.0,
            "koi_prad": 5.4,
            "koi_teq": 500.0,
            "koi_insol": 1.5,
            "koi_steff": 5500.0,
            "koi_srad": 1.2
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{API_URL}/predict", json=data)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to ms
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response_time < 1000:  # Less than 1 second
            print_pass("Response time is acceptable (< 1s)")
        else:
            print_fail(f"Response time is slow (> 1s)")
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")

# ============================================================================
# TEST 12: Batch Predictions (if implemented)
# ============================================================================

def test_batch_predictions():
    print_test("Batch Predictions")
    
    data = {
        "model": "xgboost",
        "data": [
            {
                "koi_period": 289.9,
                "koi_duration": 5.4,
                "koi_depth": 492.0,
                "koi_prad": 2.4,
                "koi_teq": 262.0,
                "koi_insol": 1.42,
                "koi_steff": 5518.0,
                "koi_srad": 0.98
            },
            {
                "koi_period": 1.2,
                "koi_duration": 0.8,
                "koi_depth": 50.0,
                "koi_prad": 0.5,
                "koi_teq": 1500.0,
                "koi_insol": 250.0,
                "koi_steff": 6200.0,
                "koi_srad": 1.5
            }
        ]
    }
    
    try:
        response = requests.post(f"{API_URL}/predict/batch", json=data)
        
        if response.status_code == 200:
            print_pass(f"Status code: {response.status_code}")
            result = response.json()
            print_info(f"Processed {result.get('total')} predictions")
            print_pass("Batch prediction successful")
        else:
            print_info(f"Batch endpoint may not be fully implemented: {response.status_code}")
    
    except Exception as e:
        print_info(f"Batch endpoint not available or not implemented")

# ============================================================================
# RUN ALL TESTS
# ============================================================================

def run_all_tests():
    print(f"\n{Colors.BLUE}{'='*70}")
    print("EXOPLANET DETECTION API - TEST SUITE")
    print(f"{'='*70}{Colors.END}")
    print(f"Testing API at: {BASE_URL}")
    print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Run tests
    test_health_check()
    test_model_info()
    test_prediction_confirmed()
    test_prediction_false_positive()
    test_prediction_candidate()
    test_error_missing_features()
    test_error_invalid_model()
    test_statistics()
    test_feature_importance()
    test_examples()
    test_response_time()
    test_batch_predictions()
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*70}")
    print("TEST SUITE COMPLETED")
    print(f"{'='*70}{Colors.END}\n")

if __name__ == "__main__":
    print("\nMake sure your Flask API is running on http://localhost:5000")
    print("Start it with: python app.py\n")
    
    input("Press Enter to start tests...")
    
    run_all_tests()