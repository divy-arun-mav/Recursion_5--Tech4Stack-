from flask import Flask, jsonify
import cosmpy
from cosmpy.aerial.client import LedgerClient, NetworkConfig

app = Flask(__name__)

@app.route('/balance/<address>', methods=['GET'])
def get_balance(address):
    ledger_client = LedgerClient(NetworkConfig.latest_stable_testnet())
    balances = ledger_client.query_bank_all_balances(address)
    return jsonify(balances)

if __name__ == '__main__':
    app.run(debug=True)