import os
import time
import requests
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
if PRIVATE_KEY and PRIVATE_KEY.startswith('0x'):
    PRIVATE_KEY = PRIVATE_KEY[2:]  # Remove '0x' prefix if present

CONTRACT_ADDRESS = '0x90adf186527F9C6b2085E1AcBfd166Dc406d0D5c'  # Your deployed contract
RPC_URL = 'https://testnet.api.communeai.net'
ALPHA_VANTAGE_API_KEY = os.getenv('ALPHA_VANTAGE_API_KEY')

# Debug prints
print("Checking configuration...")
print(f"Contract Address: {CONTRACT_ADDRESS}")
print(f"Private Key Length: {len(PRIVATE_KEY) if PRIVATE_KEY else 'Not found'}")
print(f"Alpha Vantage API Key: {'Present' if ALPHA_VANTAGE_API_KEY else 'Not found'}")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    raise Exception("Failed to connect to Commune network")

print(f"Connected to network: {w3.is_connected()}")

# Create account from private key
try:
    account = w3.eth.account.from_key(PRIVATE_KEY)
    print(f"Account address: {account.address}")
except Exception as e:
    print(f"Error creating account: {e}")
    raise

# Contract ABI
ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "newPrice", "type": "uint256"}],
        "name": "updatePrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

def get_nvidia_price():
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NVDA&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    data = response.json()
    
    print("API Response:", data)  # Debug print
    
    if 'Global Quote' in data:
        price = float(data['Global Quote']['05. price'])
        return int(price * 100)  # Convert to cents
    return None

def update_contract_price(price):
    nonce = w3.eth.get_transaction_count(account.address)
    
    transaction = contract.functions.updatePrice(price).build_transaction({
        'from': account.address,
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
    })
    
    signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    print(f'Transaction sent: {tx_hash.hex()}')
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f'Transaction confirmed in block {receipt["blockNumber"]}')

def main():
    print("Starting price updater...")
    while True:
        try:
            price = get_nvidia_price()
            if price:
                print(f'Current NVIDIA price: ${price/100}')
                update_contract_price(price)
            else:
                print('Failed to get price')
                
        except Exception as e:
            print(f'Error: {e}')
            
        print("Waiting 5 minutes before next update...")
        time.sleep(300)

if __name__ == '__main__':
    main()