from flask import Flask, render_template
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import numpy as np

app = Flask(__name__)

# Load your data files
Monero = pd.read_csv("coin_Monero.csv")
Ethereum = pd.read_csv("coin_Ethereum.csv")
WrappedBitcoin = pd.read_csv("coin_WrappedBitcoin.csv")
Bitcoin = pd.read_csv("coin_Bitcoin.csv")

# Function to perform linear regression and return predictions
def perform_linear_regression(X, y, projection):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15)
    linReg = LinearRegression()
    linReg.fit(X_train, y_train)
    confidence = linReg.score(X_test, y_test)

    x_projection = X[-projection:]
    predictions = linReg.predict(x_projection)

    return confidence, predictions

@app.route('/')
def index():
    # Perform linear regression for each coin
    projection_Monero = 5
    confidence_Monero, predictions_Monero = perform_linear_regression(
        np.array(Monero[['Close']])[:-projection_Monero], Monero['Prediction'].values[:-projection_Monero], projection_Monero
    )

    projection_Ethereum = 5
    confidence_Ethereum, predictions_Ethereum = perform_linear_regression(
        np.array(Ethereum[['Close']])[:-projection_Ethereum], Ethereum['Prediction'].values[:-projection_Ethereum], projection_Ethereum
    )

    projection_WrappedBitcoin = 5
    confidence_WrappedBitcoin, predictions_WrappedBitcoin = perform_linear_regression(
        np.array(WrappedBitcoin[['Close']])[:-projection_WrappedBitcoin], WrappedBitcoin['Prediction'].values[:-projection_WrappedBitcoin], projection_WrappedBitcoin
    )

    projection_Bitcoin = 5
    confidence_Bitcoin, predictions_Bitcoin = perform_linear_regression(
        np.array(Bitcoin[['Close']])[:-projection_Bitcoin], Bitcoin['Prediction'].values[:-projection_Bitcoin], projection_Bitcoin
    )

    # Render the template with data
    return render_template(
        'index.html',
        confidence_Monero=confidence_Monero,
        predictions_Monero=predictions_Monero,
        confidence_Ethereum=confidence_Ethereum,
        predictions_Ethereum=predictions_Ethereum,
        confidence_WrappedBitcoin=confidence_WrappedBitcoin,
        predictions_WrappedBitcoin=predictions_WrappedBitcoin,
        confidence_Bitcoin=confidence_Bitcoin,
        predictions_Bitcoin=predictions_Bitcoin
    )

if __name__ == '__main__':
    app.run(debug=True)
