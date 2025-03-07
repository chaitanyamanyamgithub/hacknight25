"""
Medical Record model for the Healthcare EHR Backend
"""

from datetime import datetime
from models.db import db

class MedicalRecord(db.Model):
    """Medical Record model for storing patient health data with blockchain integration"""
    
    __tablename__ = 'medical_records'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Examination, Lab Results, Diagnosis, Procedure
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)
    attachments = db.Column(db.Text, nullable=True)  # JSON string containing file URLs
    record_metadata = db.Column(db.Text, nullable=True)  # Additional metadata in JSON format - renamed from 'metadata'
    
    # Blockchain related fields
    is_on_blockchain = db.Column(db.Boolean, default=False)
    blockchain_tx_hash = db.Column(db.String(255), nullable=True)
    blockchain_record_id = db.Column(db.Integer, db.ForeignKey('blockchain_records.id'), nullable=True)
    
    # Relationships
    blockchain_record = db.relationship('BlockchainRecord', backref='medical_records', lazy=True)
    
    def __repr__(self):
        return f'<MedicalRecord {self.title} - Patient:{self.patient_id} Doctor:{self.doctor_id}>'
    
    def to_dict(self, include_blockchain=True):
        """Convert medical record to dictionary for API responses"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'title': self.title,
            'type': self.type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
            'attachments': self.attachments,
            'record_metadata': self.record_metadata,
        }
        
        if include_blockchain:
            data.update({
                'is_on_blockchain': self.is_on_blockchain,
                'blockchain_tx_hash': self.blockchain_tx_hash
            })
            
        if include_blockchain and self.blockchain_record:
            data['blockchain_record'] = self.blockchain_record.to_dict()
            
        return data
    
    @staticmethod
    def get_record_hash(record_data):
        """Generate a deterministic hash for this medical record to be stored on blockchain
        
        This is a critical security feature for ensuring data integrity.
        """
        import hashlib
        import json
        
        # Create a deterministic representation of the record
        # Sort keys to ensure the same JSON string is always produced
        record_json = json.dumps(record_data, sort_keys=True)
        
        # Create SHA-256 hash
        return hashlib.sha256(record_json.encode('utf-8')).hexdigest()
    
    def get_hash(self):
        """Get the hash of this record for blockchain storage"""
        record_data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'title': self.title,
            'type': self.type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None
        }
        
        return self.get_record_hash(record_data) 