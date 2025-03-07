"""
Doctors API for the Healthcare EHR Backend
"""

from flask import Blueprint, request, jsonify, current_app
from models.db import db
from models.user import User
from models.doctor import Doctor
from models.appointment import Appointment

# Import token_required decorator
from api.patients import token_required

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/', methods=['GET'])
@token_required
def get_doctors(current_user):
    """Get all doctors"""
    # Get query parameters for filtering
    name_filter = request.args.get('name', '')
    specialization_filter = request.args.get('specialization', '')
    
    # Query doctors with optional filters
    query = Doctor.query
    
    if name_filter:
        query = query.join(User).filter(User.name.ilike(f'%{name_filter}%'))
    
    if specialization_filter:
        query = query.filter(Doctor.specialization.ilike(f'%{specialization_filter}%'))
    
    doctors = query.all()
    
    # Convert to dictionary
    doctors_data = [doctor.to_dict() for doctor in doctors]
    
    return jsonify({
        'success': True,
        'doctors': doctors_data
    })

@doctors_bp.route('/<int:doctor_id>', methods=['GET'])
@token_required
def get_doctor(current_user, doctor_id):
    """Get a specific doctor"""
    doctor = Doctor.query.get(doctor_id)
    
    if not doctor:
        return jsonify({
            'success': False,
            'message': 'Doctor not found'
        }), 404
    
    return jsonify({
        'success': True,
        'doctor': doctor.to_dict()
    })

@doctors_bp.route('/<int:doctor_id>/appointments', methods=['GET'])
@token_required
def get_doctor_appointments(current_user, doctor_id):
    """Get appointments for a specific doctor"""
    # Check permissions
    if current_user.user_type == 'doctor' and current_user.doctor.id != doctor_id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own appointments'
        }), 403
    
    # Get doctor
    doctor = Doctor.query.get(doctor_id)
    
    if not doctor:
        return jsonify({
            'success': False,
            'message': 'Doctor not found'
        }), 404
    
    # Get appointments
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    
    # Convert to dictionary
    appointments_data = [appointment.to_dict(include_patient=True) for appointment in appointments]
    
    return jsonify({
        'success': True,
        'appointments': appointments_data
    })

@doctors_bp.route('/<int:doctor_id>/upcoming-appointments', methods=['GET'])
@token_required
def get_doctor_upcoming_appointments(current_user, doctor_id):
    """Get upcoming appointments for a specific doctor"""
    # Check permissions
    if current_user.user_type == 'doctor' and current_user.doctor.id != doctor_id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own appointments'
        }), 403
    
    # Get doctor
    doctor = Doctor.query.get(doctor_id)
    
    if not doctor:
        return jsonify({
            'success': False,
            'message': 'Doctor not found'
        }), 404
    
    # Get upcoming appointments
    appointments = Appointment.get_upcoming_appointments(doctor_id, 'doctor')
    
    # Convert to dictionary
    appointments_data = [appointment.to_dict(include_patient=True) for appointment in appointments]
    
    return jsonify({
        'success': True,
        'appointments': appointments_data
    })

@doctors_bp.route('/<int:doctor_id>/availability', methods=['GET'])
@token_required
def get_doctor_availability(current_user, doctor_id):
    """Get availability for a specific doctor"""
    # Get doctor
    doctor = Doctor.query.get(doctor_id)
    
    if not doctor:
        return jsonify({
            'success': False,
            'message': 'Doctor not found'
        }), 404
    
    # In a real application, this would query the doctor's availability
    # For this demo, we'll return a mock availability
    
    from datetime import datetime, timedelta
    
    # Generate availability for the next 7 days
    availability = []
    start_date = datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0)
    
    for day in range(7):
        current_date = start_date + timedelta(days=day)
        
        # Skip weekends
        if current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            continue
        
        # Add slots from 9 AM to 5 PM
        for hour in range(9, 17):
            slot = {
                'date': current_date.replace(hour=hour).isoformat(),
                'duration': 30,  # 30 minutes
                'available': True
            }
            availability.append(slot)
    
    return jsonify({
        'success': True,
        'availability': availability
    }) 