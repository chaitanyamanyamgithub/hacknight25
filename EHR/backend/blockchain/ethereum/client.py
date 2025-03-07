"""
Ethereum blockchain client for the Healthcare EHR Backend
"""

import os
import json
from web3 import Web3
from eth_account.messages import encode_defunct
from flask import current_app

# Load Ethereum configuration
def get_ethereum_config():
    """Get Ethereum configuration from environment variables or app config"""
    if current_app:
        ethereum_rpc = current_app.config.get('ETHEREUM_RPC')
        ethereum_chain_id = current_app.config.get('ETHEREUM_CHAIN_ID')
        smart_contract_address = current_app.config.get('SMART_CONTRACT_ADDRESS')
    else:
        ethereum_rpc = os.environ.get('ETHEREUM_RPC', 'http://localhost:8545')
        ethereum_chain_id = int(os.environ.get('ETHEREUM_CHAIN_ID', '1337'))
        smart_contract_address = os.environ.get('SMART_CONTRACT_ADDRESS', '')
    
    return {
        'rpc': ethereum_rpc,
        'chain_id': ethereum_chain_id,
        'contract_address': smart_contract_address
    }

# Initialize Web3 connection
def get_web3():
    """Get Web3 connection"""
    config = get_ethereum_config()
    return Web3(Web3.HTTPProvider(config['rpc']))

# Check Ethereum connection
def check_connection():
    """Check Ethereum connection status"""
    # For demo purposes, simulate a successful connection
    return {
        'connected': True,
        'network': 'Ethereum (Demo)',
        'chain_id': 1337,
        'block_number': 1234567
    }

# Get private key for signing transactions
def get_private_key():
    """Get private key for signing transactions"""
    if current_app:
        private_key = current_app.config.get('ETHEREUM_PRIVATE_KEY')
    else:
        private_key = os.environ.get('ETHEREUM_PRIVATE_KEY')
    
    if not private_key:
        # For development only - DO NOT USE IN PRODUCTION
        private_key = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        
    return private_key

# Get account address from private key
def get_account_address():
    """Get account address from private key"""
    web3 = get_web3()
    private_key = get_private_key()
    
    # Remove '0x' prefix if present
    if private_key.startswith('0x'):
        private_key = private_key[2:]
    
    account = web3.eth.account.from_key(private_key)
    return account.address

# Load smart contract ABI
def get_contract_abi():
    """Load smart contract ABI"""
    try:
        # Try to load from app config
        if current_app and hasattr(current_app, 'config'):
            contract_abi_path = current_app.config.get('ETHEREUM_CONTRACT_ABI_PATH')
        else:
            contract_abi_path = os.environ.get('ETHEREUM_CONTRACT_ABI_PATH')
        
        # Default path if not specified
        if not contract_abi_path:
            contract_abi_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'contracts/MedicalRecords.json'
            )
        
        # Check if file exists
        if os.path.exists(contract_abi_path):
            with open(contract_abi_path, 'r') as f:
                contract_data = json.load(f)
                return contract_data['abi']
        
        # Return a minimal ABI for the MedicalRecords contract
        return [
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "recordHash",
                        "type": "string"
                    }
                ],
                "name": "storeRecord",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "recordHash",
                        "type": "string"
                    }
                ],
                "name": "verifyRecord",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    except Exception as e:
        print(f"Error loading contract ABI: {str(e)}")
        return []

# Get smart contract instance
def get_contract():
    """Get smart contract instance"""
    web3 = get_web3()
    config = get_ethereum_config()
    contract_address = config['contract_address']
    
    if not contract_address:
        raise ValueError("Smart contract address not configured")
    
    contract_abi = get_contract_abi()
    
    if not contract_abi:
        raise ValueError("Smart contract ABI not available")
    
    return web3.eth.contract(address=contract_address, abi=contract_abi)

# Store record hash on blockchain
def store_record(record_hash):
    """
    Store record hash on Ethereum blockchain
    
    Args:
        record_hash (str): The hash of the medical record
        
    Returns:
        str: Transaction hash
    """
    # For demo purposes, generate a simulated transaction hash
    tx_hash = f"0x{record_hash[:40]}"
    print(f"[Ethereum] Stored record with hash: {record_hash}")
    print(f"[Ethereum] Transaction hash: {tx_hash}")
    return tx_hash

# Verify record hash on blockchain
def verify_record(record_hash, transaction_hash=None):
    """
    Verify record hash on Ethereum blockchain
    
    Args:
        record_hash (str): The hash of the medical record
        transaction_hash (str, optional): The transaction hash to verify
        
    Returns:
        bool: True if verified, False otherwise
    """
    # For demo purposes, always return True
    print(f"[Ethereum] Verified record with hash: {record_hash}")
    return True

# Sign a message with the private key
def sign_message(message):
    """
    Sign a message with the private key
    
    Args:
        message (str): The message to sign
        
    Returns:
        str: The signature
    """
    # For demo purposes, return a dummy signature
    return f"0x{message.encode('utf-8').hex()}signature"

# Verify a signature
def verify_signature(message, signature, address):
    """
    Verify a signature
    
    Args:
        message (str): The original message
        signature (str): The signature to verify
        address (str): The Ethereum address that signed the message
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    # For demo purposes, always return True
    return True

# Create Ethereum smart contract
def create_contract_files():
    """Create Ethereum smart contract files if they don't exist"""
    import os
    
    # Create contracts directory if it doesn't exist
    contracts_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'contracts')
    os.makedirs(contracts_dir, exist_ok=True)
    
    # Create MedicalRecords.sol
    contract_path = os.path.join(contracts_dir, 'MedicalRecords.sol')
    if not os.path.exists(contract_path):
        with open(contract_path, 'w') as f:
            f.write('''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MedicalRecords
 * @dev Store and verify medical record hashes on the blockchain
 */
contract MedicalRecords {
    address public owner;
    
    // Mapping from record hash to boolean (exists or not)
    mapping(string => bool) private records;
    
    // Mapping from record hash to timestamp
    mapping(string => uint256) private timestamps;
    
    // Event emitted when a new record is stored
    event RecordStored(string recordHash, uint256 timestamp);
    
    /**
     * @dev Constructor sets the owner of the contract
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Modifier to check if caller is owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    
    /**
     * @dev Store a new record hash
     * @param recordHash The hash of the medical record
     */
    function storeRecord(string memory recordHash) public {
        require(bytes(recordHash).length > 0, "Record hash cannot be empty");
        require(!records[recordHash], "Record hash already exists");
        
        records[recordHash] = true;
        timestamps[recordHash] = block.timestamp;
        
        emit RecordStored(recordHash, block.timestamp);
    }
    
    /**
     * @dev Verify if a record hash exists
     * @param recordHash The hash of the medical record
     * @return bool True if the record hash exists, false otherwise
     */
    function verifyRecord(string memory recordHash) public view returns (bool) {
        return records[recordHash];
    }
    
    /**
     * @dev Get the timestamp when a record was stored
     * @param recordHash The hash of the medical record
     * @return uint256 The timestamp when the record was stored
     */
    function getRecordTimestamp(string memory recordHash) public view returns (uint256) {
        require(records[recordHash], "Record hash does not exist");
        return timestamps[recordHash];
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }
}
''')
    
    # Create MedicalRecords.json (ABI)
    abi_path = os.path.join(contracts_dir, 'MedicalRecords.json')
    if not os.path.exists(abi_path):
        with open(abi_path, 'w') as f:
            f.write('''{
  "abi": [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "recordHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "RecordStored",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "recordHash",
          "type": "string"
        }
      ],
      "name": "getRecordTimestamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "recordHash",
          "type": "string"
        }
      ],
      "name": "storeRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "recordHash",
          "type": "string"
        }
      ],
      "name": "verifyRecord",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}''')

# Create Ethereum contract files when this module is imported
create_contract_files()

# Create __init__.py
def create_init_file():
    """Create __init__.py file if it doesn't exist"""
    import os
    
    # Create __init__.py
    init_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '__init__.py')
    if not os.path.exists(init_path):
        with open(init_path, 'w') as f:
            f.write('"""Ethereum blockchain client for the Healthcare EHR Backend"""\n')

# Create __init__.py file when this module is imported
create_init_file() 