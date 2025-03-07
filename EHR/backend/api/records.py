"""
Medical Records API for the Healthcare EHR Backend
"""

import json
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from models.db import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor
from models.medical_record import MedicalRecord
from models.blockchain_record import BlockchainRecord
from models.notification import Notification

# Import token_required decorator
from api.patients import token_required

records_bp = Blueprint('records', __name__)

@records_bp.route('/', methods=['GET'])
@token_required
def get_records(current_user):
    """Get medical records based on user type and permissions"""
    if current_user.user_type == 'doctor':
        # Doctors can see records they created
        doctor_id = current_user.doctor.id
        records = MedicalRecord.query.filter_by(doctor_id=doctor_id).all()
    elif current_user.user_type == 'patient':
        # Patients can see their own records
        patient_id = current_user.patient.id
        records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type'
        }), 400
    
    # Convert to dictionary
    records_data = [record.to_dict() for record in records]
    
    return jsonify({
        'success': True,
        'records': records_data
    })

@records_bp.route('/<int:record_id>', methods=['GET'])
@token_required
def get_record(current_user, record_id):
    """Get a specific medical record"""
    record = MedicalRecord.query.get(record_id)
    
    if not record:
        return jsonify({
            'success': False,
            'message': 'Record not found'
        }), 404
    
    # Check permissions
    if current_user.user_type == 'doctor' and record.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only access records you created'
        }), 403
    
    if current_user.user_type == 'patient' and record.patient_id != current_user.patient.id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own records'
        }), 403
    
    return jsonify({
        'success': True,
        'record': record.to_dict()
    })

@records_bp.route('/', methods=['POST'])
@token_required
def create_record(current_user):
    """Create a new medical record"""
    # Only doctors can create records
    if current_user.user_type != 'doctor':
        return jsonify({
            'success': False,
            'message': 'Only doctors can create medical records'
        }), 403
    
    data = request.json
    
    if not data or not data.get('patient_id') or not data.get('title') or not data.get('type') or not data.get('description'):
        return jsonify({
            'success': False,
            'message': 'Patient ID, title, type, and description are required'
        }), 400
    
    # Check if patient exists
    patient = Patient.query.get(data.get('patient_id'))
    if not patient:
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    # Create record
    record = MedicalRecord(
        patient_id=data.get('patient_id'),
        doctor_id=current_user.doctor.id,
        title=data.get('title'),
        type=data.get('type'),
        description=data.get('description'),
        date=datetime.utcnow(),
        notes=data.get('notes'),
        attachments=json.dumps(data.get('attachments', [])),
        record_metadata=json.dumps(data.get('metadata', {}))
    )
    
    db.session.add(record)
    db.session.commit()
    
    # Create notification for patient
    Notification.create_notification(
        user_id=patient.user_id,
        title='New Medical Record',
        message=f'Dr. {current_user.name} has created a new medical record: {record.title}',
        type='record',
        reference_id=record.id,
        reference_type='medical_record'
    )
    
    # Store on blockchain if requested
    if data.get('store_on_blockchain', False):
        try:
            # Get blockchain type from request or default to ethereum
            blockchain_type = data.get('blockchain_type', 'ethereum')
            
            # Get record hash
            record_hash = record.get_hash()
            
            if blockchain_type == 'ethereum':
                from blockchain.ethereum.client import store_record
                tx_hash = store_record(record_hash)
            elif blockchain_type == 'hyperledger':
                from blockchain.hyperledger.client import store_record
                tx_hash = store_record(record_hash)
            else:
                raise ValueError(f"Unsupported blockchain type: {blockchain_type}")
            
            # Create blockchain record
            blockchain_record = BlockchainRecord.create_from_transaction(
                record_hash=record_hash,
                blockchain_type=blockchain_type,
                transaction_hash=tx_hash
            )
            
            # Update medical record
            record.is_on_blockchain = True
            record.blockchain_tx_hash = tx_hash
            record.blockchain_record_id = blockchain_record.id
            db.session.commit()
            
        except Exception as e:
            # Log error but don't fail the request
            current_app.logger.error(f"Error storing record on blockchain: {str(e)}")
    
    return jsonify({
        'success': True,
        'message': 'Medical record created successfully',
        'record': record.to_dict()
    }), 201

@records_bp.route('/<int:record_id>', methods=['PUT'])
@token_required
def update_record(current_user, record_id):
    """Update a medical record"""
    # Only doctors can update records
    if current_user.user_type != 'doctor':
        return jsonify({
            'success': False,
            'message': 'Only doctors can update medical records'
        }), 403
    
    record = MedicalRecord.query.get(record_id)
    
    if not record:
        return jsonify({
            'success': False,
            'message': 'Record not found'
        }), 404
    
    # Check if doctor created this record
    if record.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only update records you created'
        }), 403
    
    # Records on blockchain cannot be updated
    if record.is_on_blockchain:
        return jsonify({
            'success': False,
            'message': 'Records stored on blockchain cannot be updated'
        }), 400
    
    data = request.json
    
    # Update record fields
    if data.get('title'):
        record.title = data.get('title')
    
    if data.get('type'):
        record.type = data.get('type')
    
    if data.get('description'):
        record.description = data.get('description')
    
    if data.get('notes'):
        record.notes = data.get('notes')
    
    if data.get('attachments'):
        record.attachments = json.dumps(data.get('attachments'))
    
    if data.get('metadata'):
        record.record_metadata = json.dumps(data.get('metadata'))
    
    db.session.commit()
    
    # Create notification for patient
    Notification.create_notification(
        user_id=record.patient.user_id,
        title='Medical Record Updated',
        message=f'Dr. {current_user.name} has updated your medical record: {record.title}',
        type='record',
        reference_id=record.id,
        reference_type='medical_record'
    )
    
    return jsonify({
        'success': True,
        'message': 'Medical record updated successfully',
        'record': record.to_dict()
    })

@records_bp.route('/<int:record_id>/blockchain', methods=['POST'])
@token_required
def store_record_on_blockchain(current_user, record_id):
    """Store a medical record on blockchain"""
    # Only doctors can store records on blockchain
    if current_user.user_type != 'doctor':
        return jsonify({
            'success': False,
            'message': 'Only doctors can store medical records on blockchain'
        }), 403
    
    record = MedicalRecord.query.get(record_id)
    
    if not record:
        return jsonify({
            'success': False,
            'message': 'Record not found'
        }), 404
    
    # Check if doctor created this record
    if record.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only store records you created on blockchain'
        }), 403
    
    # Check if record is already on blockchain
    if record.is_on_blockchain:
        return jsonify({
            'success': False,
            'message': 'Record is already stored on blockchain'
        }), 400
    
    data = request.json
    
    try:
        # Get blockchain type from request or default to ethereum
        blockchain_type = data.get('blockchain_type', 'ethereum')
        
        # Get record hash
        record_hash = record.get_hash()
        
        if blockchain_type == 'ethereum':
            from blockchain.ethereum.client import store_record
            tx_hash = store_record(record_hash)
        elif blockchain_type == 'hyperledger':
            from blockchain.hyperledger.client import store_record
            tx_hash = store_record(record_hash)
        else:
            return jsonify({
                'success': False,
                'message': f'Unsupported blockchain type: {blockchain_type}'
            }), 400
        
        # Create blockchain record
        blockchain_record = BlockchainRecord.create_from_transaction(
            record_hash=record_hash,
            blockchain_type=blockchain_type,
            transaction_hash=tx_hash
        )
        
        # Update medical record
        record.is_on_blockchain = True
        record.blockchain_tx_hash = tx_hash
        record.blockchain_record_id = blockchain_record.id
        db.session.commit()
        
        # Create notification for patient
        Notification.create_notification(
            user_id=record.patient.user_id,
            title='Record Stored on Blockchain',
            message=f'Your medical record "{record.title}" has been securely stored on blockchain',
            type='record',
            reference_id=record.id,
            reference_type='medical_record'
        )
        
        return jsonify({
            'success': True,
            'message': 'Medical record stored on blockchain successfully',
            'blockchain_record': blockchain_record.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error storing record on blockchain: {str(e)}'
        }), 500

@records_bp.route('/<int:record_id>/verify', methods=['GET'])
@token_required
def verify_record_on_blockchain(current_user, record_id):
    """Verify a medical record on blockchain"""
    record = MedicalRecord.query.get(record_id)
    
    if not record:
        return jsonify({
            'success': False,
            'message': 'Record not found'
        }), 404
    
    # Check permissions
    if current_user.user_type == 'doctor' and record.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only verify records you created'
        }), 403
    
    if current_user.user_type == 'patient' and record.patient_id != current_user.patient.id:
        return jsonify({
            'success': False,
            'message': 'You can only verify your own records'
        }), 403
    
    # Check if record is on blockchain
    if not record.is_on_blockchain or not record.blockchain_record:
        return jsonify({
            'success': False,
            'message': 'Record is not stored on blockchain'
        }), 400
    
    try:
        # Get blockchain record
        blockchain_record = record.blockchain_record
        
        # Verify record on blockchain
        is_verified = BlockchainRecord.verify_on_blockchain(
            record_hash=record.get_hash(),
            blockchain_type=blockchain_record.blockchain_type,
            transaction_hash=blockchain_record.transaction_hash
        )
        
        return jsonify({
            'success': True,
            'verified': is_verified,
            'blockchain_record': blockchain_record.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error verifying record on blockchain: {str(e)}'
        }), 500 