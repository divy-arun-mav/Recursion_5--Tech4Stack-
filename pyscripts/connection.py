from flask import Flask, jsonify, send_file
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import pickle
import os

app = Flask(__name__)

# Constants for projection lengths
projection_Monero = 30
projection_Ethereum = 30
projection_Bitcoin = 30

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
linReg_WrappedBitcoin = load_model('WrappedBitcoin')
linReg_Bitcoin = load_model('Bitcoin')

@app.route('/visualize/<coin>')
def visualize(coin):
    return f"Visualizing {coin}"

@app.route('/train/<coin>')
def train(coin):
    if coin == 'Monero':
        df = pd.read_csv('coin_Monero.csv')
    elif coin == 'Ethereum':
        df = pd.read_csv('coin_Ethereum.csv')
    elif coin == 'Bitcoin':
        df = pd.read_csv('coin_Bitcoin.csv')
    else:
        return "Invalid coin type"

    # Creation of the independent data set (X) and dependent data set (y)
    X = np.array(df[['Close']])
    y = df['Prediction'].values

    # Remove last 'projection' elements for training
    X_train = X[:-globals()['projection_' + coin]]
    y_train = y[:-globals()['projection_' + coin]]

    x_train, x_test, y_train, y_test = train_test_split(X_train, y_train, test_size=0.15)

    # Create & train the model
    linReg = LinearRegression()
    linReg.fit(x_train, y_train)

    # Save the trained model
    with open(f'linReg_{coin}.pkl', 'wb') as file:
        pickle.dump(linReg, file)

    linReg_confidence = linReg.score(x_test, y_test)
    print("Linear Regression Confidence for " + coin + ": ", linReg_confidence)
    print(linReg_confidence * 100, '%')

    return "Model trained and saved for " + coin

@app.route('/predict/<coin>')
def predict(coin):
    if coin == 'Monero':
        df = pd.read_csv('coin_Monero.csv')
    elif coin == 'Ethereum':
        df = pd.read_csv('coin_Ethereum.csv')
    elif coin == 'Bitcoin':
        df = pd.read_csv('coin_Bitcoin.csv')
    else:
        return "Invalid coin type"

    x_projection = np.array(df[['Close']])[-globals()['projection_' + coin]:]
    linReg = load_model(coin)
    if linReg:
        linReg_prediction = linReg.predict(x_projection)
        return str(linReg_prediction[0])
    else:
        return "Model not found for " + coin

if __name__ == '__main__':
    app.run(debug=True)
