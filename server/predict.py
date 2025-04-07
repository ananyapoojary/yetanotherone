# /predict.py
import sys
import json
import pickle
import numpy as np

def load_model():
    with open('best_model.pkl', 'rb') as f:
        model = pickle.load(f)
    return model

def predict(model, temperature, humidity, ph, rainfall):
    # Convert inputs to float and create an array in the order expected by the model
    try:
        temp = float(temperature)
        hum = float(humidity)
        ph_val = float(ph)
        rain = float(rainfall)
    except ValueError:
        return {"error": "Invalid input values"}
    # Reshape data as required by your model. Adjust feature order if necessary.
    X = np.array([[temp, hum, ph_val, rain]])
    prediction = model.predict(X)
    # For demonstration, assume prediction returns a list with [n, p, k]
    return {"nitrogen": prediction[0][0], "phosphorus": prediction[0][1], "potassium": prediction[0][2]}

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(json.dumps({"error": "Four parameters required: temperature, humidity, ph, rainfall"}))
        sys.exit(1)
    temperature, humidity, ph, rainfall = sys.argv[1:5]
    model = load_model()
    result = predict(model, temperature, humidity, ph, rainfall)
    print(json.dumps(result))
