import cosmpy
from cosmpy.aerial.client import LedgerClient, NetworkConfig
 
ledger_client = LedgerClient(NetworkConfig.fetch_mainnet())
 
address: str = 'fetch12q5gw9l9d0yyq2th77x6pjsesczpsly8h5089x'
balances = ledger_client.query_bank_all_balances(address)
print(balances)