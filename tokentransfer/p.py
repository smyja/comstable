import os
import asyncio
from dotenv import load_dotenv
from substrateinterface import SubstrateInterface, Keypair
from eth_account import Account
from web3 import Web3
from eth_utils import to_bytes
from scalecodec.utils.ss58 import ss58_encode
import hashlib
from communex.client import CommuneClient
 
# Load environment variables from .env file
load_dotenv()
 
# Access environment variables
ETH_PRIVATE_KEY = os.getenv('ETH_PRIVATE_KEY')
SUBSTRATE_PRIVATE_KEY = os.getenv('SUBSTRATE_PRIVATE_KEY')
RPC_URL = os.getenv('RPC_URL')
WS_URL = os.getenv('WS_URL')
def convert_h160_to_ss58(eth_address):
    # Ensure the eth_address starts with '0x'
    if not eth_address.startswith('0x'):
        eth_address = '0x' + eth_address
 
    # Convert the prefix to bytes
    prefix = b'evm:'
 
    # Convert the Ethereum address to bytes
    address_bytes = to_bytes(hexstr=eth_address)
 
    # Combine prefix and address
    combined = prefix + address_bytes
 
    # Hash the combined data using Blake2 256-bit
    blake2_hash = hashlib.blake2b(combined, digest_size=32).digest()
 
    # Convert the public key to SS58 format
    ss58_address = ss58_encode(blake2_hash, ss58_format=42)  # Using 42 as the network ID, adjust as needed
 
    return ss58_address
 
 
async def perform_transfer():
    keypair = Keypair.create_from_uri(SUBSTRATE_PRIVATE_KEY)
 
    eth_account = Account.from_key(ETH_PRIVATE_KEY)
    recipient_ethereum_address = eth_account.address
 
    ss58_address = convert_h160_to_ss58(recipient_ethereum_address)
    print(f"Mirror: {ss58_address}")
 
    amount = 10_000_000_000 # 10 tokens
 
    client = CommuneClient(WS_URL)
 
    print(client.transfer(key=keypair, dest=ss58_address, amount=amount))
    print(f"Transfer sent to {recipient_ethereum_address} (its ss58 mirror address is: {ss58_address})")
 
if __name__ == "__main__":
    asyncio.run(perform_transfer())
 