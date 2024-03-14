from flask import Flask, jsonify
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import pickle
import os

app = Flask(__name__)

# Constants for projection lengths
PROJECTION_LENGTH = 30

# Function to load models
def load_model(coin):
    model_path = f'linReg_{coin}.pkl'
    if os.path.exists(model_path):
        with open(model_path, 'rb') as file:
            return pickle.load(file)
    else:
        return None

# Load the trained models
linReg_Monero = load_model('Monero')
linReg_Ethereum = load_model('Ethereum')
linReg_Bitcoin = load_model('Bitcoin')

@app.route('/visualize/<coin>')
def visualize(coin):
    return f"Visualizing {coin}"

@app.route('/train/<coin>', methods=['POST'])
def train(coin):
    if coin not in {'Monero', 'Ethereum', 'Bitcoin'}:
        return "Invalid coin type", 400  # Return 400 Bad Request

    try:
        df = pd.read_csv(f'coin_{coin}.csv')
    except FileNotFoundError:
        return f"CSV file not found for {coin}", 404  # Return 404 Not Found

    # Creation of the independent data set (X) and dependent data set (y)
    X = np.array(df[['Close']])
    y = df['Prediction'].values

    # Remove last 'PROJECTION_LENGTH' elements for training
    X_train = X[:-PROJECTION_LENGTH]
    y_train = y[:-PROJECTION_LENGTH]

    x_train, x_test, y_train, y_test = train_test_split(X_train, y_train, test_size=0.15)

    # Create & train the model
    linReg = LinearRegression()
    linReg.fit(x_train, y_train)

    # Save the trained model
    with open(f'linReg_{coin}.pkl', 'wb') as file:
        pickle.dump(linReg, file)

    linReg_confidence = linReg.score(x_test, y_test)
    print(f"Linear Regression Confidence for {coin}: {linReg_confidence * 100}%")

    return f"Model trained and saved for {coin}", 200  # Return 200 OK

@app.route('/predict/<coin>', methods=['GET'])
def predict(coin):
    if coin not in {'Monero', 'Ethereum', 'Bitcoin'}:
        return "Invalid coin type", 400  # Return 400 Bad Request

    try:
        df = pd.read_csv(f'coin_{coin}.csv')
    except FileNotFoundError:
        return f"CSV file not found for {coin}", 404  # Return 404 Not Found

    x_projection = np.array(df[['Close']])[-PROJECTION_LENGTH:]
    linReg = load_model(coin)
    
    if linReg:
        linReg_prediction = linReg.predict(x_projection)
        return str(linReg_prediction[0]), 200  # Return 200 OK
    else:
        return f"Model not found for {coin}", 404  # Return 404 Not Found

if __name__ == '__main__':
    app.run(debug=True)
