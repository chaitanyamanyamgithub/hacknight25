"""
Patients API for the Healthcare EHR Backend
"""

from flask import Blueprint, request, jsonify, current_app
from models.db import db
from models.user import User
from models.patient import Patient
from models.medical_record import MedicalRecord
from models.appointment import Appointment

# Authentication decorator
def token_required(f):
    """Decorator to require valid token for API access"""
    from functools import wraps
    
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': 'Authorization header with Bearer token is required'
            }), 401
        
        token = auth_header.split(' ')[1]
        user = User.verify_auth_token(token)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid or expired token'
            }), 401
        
        return f(user, *args, **kwargs)
    
    return decorated

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['GET'])
@token_required
def get_patients(current_user):
    """Get all patients (for doctors only)"""
    if current_user.user_type != 'doctor':
        return jsonify({
            'success': False,
            'message': 'Only doctors can access patient list'
        }), 403
    
    # Get query parameters for filtering
    name_filter = request.args.get('name', '')
    
    # Query patients with optional name filter
    query = Patient.query
    if name_filter:
        query = query.join(User).filter(User.name.ilike(f'%{name_filter}%'))
    
    patients = query.all()
    
    # Convert to dictionary
    patients_data = [patient.to_dict() for patient in patients]
    
    return jsonify({
        'success': True,
        'patients': patients_data
    })

@patients_bp.route('/<int:patient_id>', methods=['GET'])
@token_required
def get_patient(current_user, patient_id):
    """Get a specific patient"""
    # Check permissions
    if current_user.user_type == 'patient' and current_user.patient.id != patient_id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own patient data'
        }), 403
    
    # Get patient
    patient = Patient.query.get(patient_id)
    
    if not patient:
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    return jsonify({
        'success': True,
        'patient': patient.to_dict()
    })

@patients_bp.route('/<int:patient_id>/records', methods=['GET'])
@token_required
def get_patient_records(current_user, patient_id):
    """Get medical records for a specific patient"""
    # Check permissions
    if current_user.user_type == 'patient' and current_user.patient.id != patient_id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own medical records'
        }), 403
    
    # Get patient
    patient = Patient.query.get(patient_id)
    
    if not patient:
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    # Get records
    records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
    
    # Convert to dictionary
    records_data = [record.to_dict() for record in records]
    
    return jsonify({
        'success': True,
        'records': records_data
    })

@patients_bp.route('/<int:patient_id>/appointments', methods=['GET'])
@token_required
def get_patient_appointments(current_user, patient_id):
    """Get appointments for a specific patient"""
    # Check permissions
    if current_user.user_type == 'patient' and current_user.patient.id != patient_id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own appointments'
        }), 403
    
    # Get patient
    patient = Patient.query.get(patient_id)
    
    if not patient:
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    # Get appointments
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()
    
    # Convert to dictionary
    appointments_data = [appointment.to_dict(include_doctor=True) for appointment in appointments]
    
    return jsonify({
        'success': True,
        'appointments': appointments_data
    })

@patients_bp.route('/<int:patient_id>/upcoming-appointments', methods=['GET'])
@token_required
def get_patient_upcoming_appointments(current_user, patient_id):
    """Get upcoming appointments for a specific patient"""
    # Check permissions
    if current_user.user_type == 'patient' and current_user.patient.id != patient_id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own appointments'
        }), 403
    
    # Get patient
    patient = Patient.query.get(patient_id)
    
    if not patient:
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    # Get upcoming appointments
    appointments = Appointment.get_upcoming_appointments(patient_id, 'patient')
    
    # Convert to dictionary
    appointments_data = [appointment.to_dict(include_doctor=True) for appointment in appointments]
    
    return jsonify({
        'success': True,
        'appointments': appointments_data
    }) 