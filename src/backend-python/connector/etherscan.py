import requests
import os

# Load Etherscan API Key from environment variable
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")

BASE_URL = "https://api.etherscan.io/v2/api"
HEADERS = {"Accept": "application/json"}


def fetch_wallet_activity(wallet_address: str, chain_id: int = 1, tx_limit: int = 10):
    """Fetch on-chain transactions and token activity for a given wallet."""
    data = {"wallet": wallet_address, "chain": chain_id}

    # Fetch ETH Balance
    balance_url = f"{BASE_URL}?chainid={chain_id}&module=account&action=balance&address={wallet_address}&tag=latest&apikey={ETHERSCAN_API_KEY}"
    balance_response = requests.get(balance_url, headers=HEADERS)

    if balance_response.status_code != 200:
        return f"Error fetching balance: {balance_response.status_code}"

    balance_data = balance_response.json()
    data["balance_wei"] = balance_data.get("result", "0")
    data["balance_eth"] = int(data["balance_wei"]) / 10**18  # Convert to ETH

    # Fetch Transactions
    tx_url = f"{BASE_URL}?chainid={chain_id}&module=account&action=txlist&address={wallet_address}&startblock=0&endblock=99999999&sort=desc&apikey={ETHERSCAN_API_KEY}"
    tx_response = requests.get(tx_url, headers=HEADERS)

    if tx_response.status_code == 200:
        transactions = tx_response.json().get("result", [])[:tx_limit]
        total_value = sum(int(tx["value"]) for tx in transactions)
        data["transactions"] = [
            {
                "hash": tx["hash"],
                "from": tx["from"],
                "to": tx["to"],
                "value_eth": int(tx["value"]) / 10**18,
                "gas_fee": int(tx["gasUsed"]) * int(tx["gasPrice"]) / 10**18,
                "time": tx["timeStamp"],
                "url": f"https://etherscan.io/tx/{tx['hash']}"
            }
            for tx in transactions
        ]
        data["total_value_eth"] = total_value / 10**18
    else:
        data["transactions"] = "Error fetching transactions"

    # Fetch Token Transfers
    token_url = f"{BASE_URL}?chainid={chain_id}&module=account&action=tokentx&address={wallet_address}&startblock=0&endblock=99999999&sort=desc&apikey={ETHERSCAN_API_KEY}"
    token_response = requests.get(token_url, headers=HEADERS)

    if token_response.status_code == 200:
        tokens = token_response.json().get("result", [])[:tx_limit]
        data["tokens"] = [
            {
                "hash": tx["hash"],
                "from": tx["from"],
                "to": tx["to"],
                "token": tx["tokenSymbol"],
                "amount": int(tx["value"]) / 10**int(tx["tokenDecimal"]),
                "contract": tx["contractAddress"],
                "url": f"https://etherscan.io/tx/{tx['hash']}"
            }
            for tx in tokens
        ]
    else:
        data["tokens"] = "Error fetching token transfers"

    return data
