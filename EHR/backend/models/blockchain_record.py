"""
Blockchain Record model for the Healthcare EHR Backend
"""

from datetime import datetime
from models.db import db

class BlockchainRecord(db.Model):
    """
    Blockchain Record model for storing details of records that 
    have been stored on blockchain (Hyperledger Fabric or Ethereum)
    """
    
    __tablename__ = 'blockchain_records'
    
    id = db.Column(db.Integer, primary_key=True)
    record_hash = db.Column(db.String(255), nullable=False, unique=True)
    blockchain_type = db.Column(db.String(20), nullable=False)  # 'ethereum' or 'hyperledger'
    transaction_hash = db.Column(db.String(255), nullable=False)
    block_number = db.Column(db.Integer, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='confirmed')  # 'pending', 'confirmed', 'failed'
    record_metadata = db.Column(db.Text, nullable=True)  # Additional metadata in JSON format - renamed from 'metadata'
    
    def __repr__(self):
        return f'<BlockchainRecord {self.id} - {self.blockchain_type} - {self.status}>'
    
    def to_dict(self):
        """Convert blockchain record to dictionary for API responses"""
        return {
            'id': self.id,
            'record_hash': self.record_hash,
            'blockchain_type': self.blockchain_type,
            'transaction_hash': self.transaction_hash,
            'block_number': self.block_number,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'status': self.status,
            'record_metadata': self.record_metadata
        }
    
    @staticmethod
    def verify_on_blockchain(record_hash, blockchain_type, transaction_hash):
        """
        Verify if a record hash exists on the blockchain
        
        Args:
            record_hash (str): The hash of the medical record
            blockchain_type (str): The type of blockchain ('ethereum' or 'hyperledger')
            transaction_hash (str): The transaction hash to verify
            
        Returns:
            bool: True if verified, False otherwise
        """
        if blockchain_type == 'ethereum':
            from blockchain.ethereum.client import verify_record
            return verify_record(record_hash, transaction_hash)
        elif blockchain_type == 'hyperledger':
            from blockchain.hyperledger.client import verify_record
            return verify_record(record_hash, transaction_hash)
        else:
            raise ValueError(f"Unsupported blockchain type: {blockchain_type}")
            
    @classmethod
    def create_from_transaction(cls, record_hash, blockchain_type, transaction_hash, block_number=None):
        """
        Create a new blockchain record from a transaction
        
        Args:
            record_hash (str): The hash of the medical record
            blockchain_type (str): The type of blockchain ('ethereum' or 'hyperledger')
            transaction_hash (str): The transaction hash
            block_number (int, optional): The block number if available
            
        Returns:
            BlockchainRecord: The created blockchain record
        """
        record = cls(
            record_hash=record_hash,
            blockchain_type=blockchain_type,
            transaction_hash=transaction_hash,
            block_number=block_number,
            status='confirmed' if block_number else 'pending'
        )
        
        db.session.add(record)
        db.session.commit()
        
        return record 