"""
Blockchain API for the Healthcare EHR Backend
"""

from flask import Blueprint, request, jsonify, current_app
from models.db import db
from models.user import User
from models.blockchain_record import BlockchainRecord

# Import token_required decorator
from api.patients import token_required

blockchain_bp = Blueprint('blockchain', __name__)

@blockchain_bp.route('/status', methods=['GET'])
@token_required
def get_blockchain_status(current_user):
    """Get blockchain connection status"""
    try:
        # Check Ethereum connection
        from blockchain.ethereum.client import check_connection as check_eth
        eth_status = check_eth()
        
        # Check Hyperledger connection
        from blockchain.hyperledger.client import check_connection as check_hl
        hl_status = check_hl()
        
        return jsonify({
            'success': True,
            'ethereum': {
                'connected': eth_status['connected'],
                'network': eth_status['network'],
                'block_number': eth_status['block_number']
            },
            'hyperledger': {
                'connected': hl_status['connected'],
                'network': hl_status['network'],
                'channel': hl_status['channel']
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error checking blockchain status: {str(e)}'
        }), 500

@blockchain_bp.route('/records', methods=['GET'])
@token_required
def get_blockchain_records(current_user):
    """Get blockchain records"""
    # Get query parameters
    blockchain_type = request.args.get('type')
    
    # Build query
    query = BlockchainRecord.query
    
    if blockchain_type:
        query = query.filter_by(blockchain_type=blockchain_type)
    
    # Get records
    records = query.order_by(BlockchainRecord.timestamp.desc()).all()
    
    # Convert to dictionary
    records_data = [record.to_dict() for record in records]
    
    return jsonify({
        'success': True,
        'records': records_data
    })

@blockchain_bp.route('/records/<int:record_id>', methods=['GET'])
@token_required
def get_blockchain_record(current_user, record_id):
    """Get a specific blockchain record"""
    record = BlockchainRecord.query.get(record_id)
    
    if not record:
        return jsonify({
            'success': False,
            'message': 'Blockchain record not found'
        }), 404
    
    return jsonify({
        'success': True,
        'record': record.to_dict()
    })

@blockchain_bp.route('/verify', methods=['POST'])
@token_required
def verify_hash(current_user):
    """Verify a hash on the blockchain"""
    data = request.json
    
    if not data or not data.get('record_hash') or not data.get('blockchain_type') or not data.get('transaction_hash'):
        return jsonify({
            'success': False,
            'message': 'Record hash, blockchain type, and transaction hash are required'
        }), 400
    
    record_hash = data.get('record_hash')
    blockchain_type = data.get('blockchain_type')
    transaction_hash = data.get('transaction_hash')
    
    try:
        # Verify hash on blockchain
        is_verified = BlockchainRecord.verify_on_blockchain(
            record_hash=record_hash,
            blockchain_type=blockchain_type,
            transaction_hash=transaction_hash
        )
        
        return jsonify({
            'success': True,
            'verified': is_verified
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error verifying hash on blockchain: {str(e)}'
        }), 500

@blockchain_bp.route('/ethereum/address', methods=['PUT'])
@token_required
def update_ethereum_address(current_user):
    """Update user's Ethereum address"""
    data = request.json
    
    if not data or not data.get('ethereum_address'):
        return jsonify({
            'success': False,
            'message': 'Ethereum address is required'
        }), 400
    
    ethereum_address = data.get('ethereum_address')
    
    # Validate Ethereum address format
    if not ethereum_address.startswith('0x') or len(ethereum_address) != 42:
        return jsonify({
            'success': False,
            'message': 'Invalid Ethereum address format'
        }), 400
    
    # Update user's Ethereum address
    current_user.ethereum_address = ethereum_address
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Ethereum address updated successfully',
        'ethereum_address': ethereum_address
    })

@blockchain_bp.route('/ethereum/sign', methods=['POST'])
@token_required
def sign_message(current_user):
    """Sign a message with the server's Ethereum private key"""
    data = request.json
    
    if not data or not data.get('message'):
        return jsonify({
            'success': False,
            'message': 'Message is required'
        }), 400
    
    message = data.get('message')
    
    try:
        from blockchain.ethereum.client import sign_message
        signature = sign_message(message)
        
        return jsonify({
            'success': True,
            'message': message,
            'signature': signature
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error signing message: {str(e)}'
        }), 500

@blockchain_bp.route('/ethereum/verify', methods=['POST'])
@token_required
def verify_signature(current_user):
    """Verify a signature with an Ethereum address"""
    data = request.json
    
    if not data or not data.get('message') or not data.get('signature') or not data.get('address'):
        return jsonify({
            'success': False,
            'message': 'Message, signature, and address are required'
        }), 400
    
    message = data.get('message')
    signature = data.get('signature')
    address = data.get('address')
    
    try:
        from blockchain.ethereum.client import verify_signature
        is_valid = verify_signature(message, signature, address)
        
        return jsonify({
            'success': True,
            'valid': is_valid
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error verifying signature: {str(e)}'
        }), 500 