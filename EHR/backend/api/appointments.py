"""
Appointments API for the Healthcare EHR Backend
"""

from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from models.db import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor
from models.appointment import Appointment
from models.notification import Notification

# Import token_required decorator
from api.patients import token_required

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/', methods=['GET'])
@token_required
def get_appointments(current_user):
    """Get appointments based on user type and permissions"""
    if current_user.user_type == 'doctor':
        # Doctors can see their appointments
        doctor_id = current_user.doctor.id
        appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
        appointments_data = [appointment.to_dict(include_patient=True) for appointment in appointments]
    elif current_user.user_type == 'patient':
        # Patients can see their appointments
        patient_id = current_user.patient.id
        appointments = Appointment.query.filter_by(patient_id=patient_id).all()
        appointments_data = [appointment.to_dict(include_doctor=True) for appointment in appointments]
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type'
        }), 400
    
    return jsonify({
        'success': True,
        'appointments': appointments_data
    })

@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
@token_required
def get_appointment(current_user, appointment_id):
    """Get a specific appointment"""
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({
            'success': False,
            'message': 'Appointment not found'
        }), 404
    
    # Check permissions
    if current_user.user_type == 'doctor' and appointment.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own appointments'
        }), 403
    
    if current_user.user_type == 'patient' and appointment.patient_id != current_user.patient.id:
        return jsonify({
            'success': False,
            'message': 'You can only access your own appointments'
        }), 403
    
    # Include both doctor and patient data
    appointment_data = appointment.to_dict(include_doctor=True, include_patient=True)
    
    return jsonify({
        'success': True,
        'appointment': appointment_data
    })

@appointments_bp.route('/', methods=['POST'])
@token_required
def create_appointment(current_user):
    """Create a new appointment"""
    data = request.json
    
    if not data or not data.get('title') or not data.get('date'):
        return jsonify({
            'success': False,
            'message': 'Title and date are required'
        }), 400
    
    # Parse date
    try:
        appointment_date = datetime.fromisoformat(data.get('date'))
    except ValueError:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
        }), 400
    
    # Set doctor and patient based on user type
    if current_user.user_type == 'doctor':
        doctor_id = current_user.doctor.id
        
        # Patient ID is required when doctor creates appointment
        if not data.get('patient_id'):
            return jsonify({
                'success': False,
                'message': 'Patient ID is required'
            }), 400
        
        patient_id = data.get('patient_id')
        
        # Check if patient exists
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'message': 'Patient not found'
            }), 404
            
    elif current_user.user_type == 'patient':
        patient_id = current_user.patient.id
        
        # Doctor ID is required when patient creates appointment
        if not data.get('doctor_id'):
            return jsonify({
                'success': False,
                'message': 'Doctor ID is required'
            }), 400
        
        doctor_id = data.get('doctor_id')
        
        # Check if doctor exists
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({
                'success': False,
                'message': 'Doctor not found'
            }), 404
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type'
        }), 400
    
    # Create appointment
    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        title=data.get('title'),
        description=data.get('description'),
        date=appointment_date,
        duration=data.get('duration', 30),
        status='scheduled',
        location=data.get('location'),
        is_virtual=data.get('is_virtual', False),
        meeting_link=data.get('meeting_link')
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    # Create notifications for both doctor and patient
    if current_user.user_type == 'doctor':
        # Notify patient
        Notification.create_notification(
            user_id=patient.user_id,
            title='New Appointment',
            message=f'Dr. {current_user.name} has scheduled an appointment with you on {appointment_date.strftime("%Y-%m-%d %H:%M")}',
            type='appointment',
            reference_id=appointment.id,
            reference_type='appointment'
        )
    else:
        # Notify doctor
        Notification.create_notification(
            user_id=doctor.user_id,
            title='New Appointment Request',
            message=f'{current_user.name} has requested an appointment with you on {appointment_date.strftime("%Y-%m-%d %H:%M")}',
            type='appointment',
            reference_id=appointment.id,
            reference_type='appointment'
        )
    
    return jsonify({
        'success': True,
        'message': 'Appointment created successfully',
        'appointment': appointment.to_dict(include_doctor=True, include_patient=True)
    }), 201

@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@token_required
def update_appointment(current_user, appointment_id):
    """Update an appointment"""
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({
            'success': False,
            'message': 'Appointment not found'
        }), 404
    
    # Check permissions
    if current_user.user_type == 'doctor' and appointment.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only update your own appointments'
        }), 403
    
    if current_user.user_type == 'patient' and appointment.patient_id != current_user.patient.id:
        return jsonify({
            'success': False,
            'message': 'You can only update your own appointments'
        }), 403
    
    data = request.json
    
    # Update appointment fields
    if data.get('title'):
        appointment.title = data.get('title')
    
    if data.get('description'):
        appointment.description = data.get('description')
    
    if data.get('date'):
        try:
            appointment.date = datetime.fromisoformat(data.get('date'))
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
            }), 400
    
    if data.get('duration'):
        appointment.duration = data.get('duration')
    
    if data.get('status'):
        appointment.status = data.get('status')
    
    if data.get('location'):
        appointment.location = data.get('location')
    
    if 'is_virtual' in data:
        appointment.is_virtual = data.get('is_virtual')
    
    if data.get('meeting_link'):
        appointment.meeting_link = data.get('meeting_link')
    
    appointment.updated_at = datetime.utcnow()
    db.session.commit()
    
    # Create notification for the other party
    if current_user.user_type == 'doctor':
        # Notify patient
        Notification.create_notification(
            user_id=appointment.patient.user_id,
            title='Appointment Updated',
            message=f'Dr. {current_user.name} has updated your appointment on {appointment.date.strftime("%Y-%m-%d %H:%M")}',
            type='appointment',
            reference_id=appointment.id,
            reference_type='appointment'
        )
    else:
        # Notify doctor
        Notification.create_notification(
            user_id=appointment.doctor.user_id,
            title='Appointment Updated',
            message=f'{current_user.name} has updated their appointment with you on {appointment.date.strftime("%Y-%m-%d %H:%M")}',
            type='appointment',
            reference_id=appointment.id,
            reference_type='appointment'
        )
    
    return jsonify({
        'success': True,
        'message': 'Appointment updated successfully',
        'appointment': appointment.to_dict(include_doctor=True, include_patient=True)
    })

@appointments_bp.route('/<int:appointment_id>/cancel', methods=['POST'])
@token_required
def cancel_appointment(current_user, appointment_id):
    """Cancel an appointment"""
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({
            'success': False,
            'message': 'Appointment not found'
        }), 404
    
    # Check permissions
    if current_user.user_type == 'doctor' and appointment.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only cancel your own appointments'
        }), 403
    
    if current_user.user_type == 'patient' and appointment.patient_id != current_user.patient.id:
        return jsonify({
            'success': False,
            'message': 'You can only cancel your own appointments'
        }), 403
    
    # Check if appointment is already cancelled or completed
    if appointment.status != 'scheduled':
        return jsonify({
            'success': False,
            'message': f'Appointment is already {appointment.status}'
        }), 400
    
    # Cancel appointment
    appointment.cancel()
    
    # Create notification for the other party
    if current_user.user_type == 'doctor':
        # Notify patient
        Notification.create_notification(
            user_id=appointment.patient.user_id,
            title='Appointment Cancelled',
            message=f'Dr. {current_user.name} has cancelled your appointment on {appointment.date.strftime("%Y-%m-%d %H:%M")}',
            type='appointment',
            reference_id=appointment.id,
            reference_type='appointment'
        )
    else:
        # Notify doctor
        Notification.create_notification(
            user_id=appointment.doctor.user_id,
            title='Appointment Cancelled',
            message=f'{current_user.name} has cancelled their appointment with you on {appointment.date.strftime("%Y-%m-%d %H:%M")}',
            type='appointment',
            reference_id=appointment.id,
            reference_type='appointment'
        )
    
    return jsonify({
        'success': True,
        'message': 'Appointment cancelled successfully',
        'appointment': appointment.to_dict(include_doctor=True, include_patient=True)
    })

@appointments_bp.route('/<int:appointment_id>/complete', methods=['POST'])
@token_required
def complete_appointment(current_user, appointment_id):
    """Mark an appointment as completed (doctors only)"""
    # Only doctors can mark appointments as completed
    if current_user.user_type != 'doctor':
        return jsonify({
            'success': False,
            'message': 'Only doctors can mark appointments as completed'
        }), 403
    
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({
            'success': False,
            'message': 'Appointment not found'
        }), 404
    
    # Check if this is the doctor's appointment
    if appointment.doctor_id != current_user.doctor.id:
        return jsonify({
            'success': False,
            'message': 'You can only complete your own appointments'
        }), 403
    
    # Check if appointment is already cancelled or completed
    if appointment.status != 'scheduled':
        return jsonify({
            'success': False,
            'message': f'Appointment is already {appointment.status}'
        }), 400
    
    # Complete appointment
    appointment.complete()
    
    # Create notification for patient
    Notification.create_notification(
        user_id=appointment.patient.user_id,
        title='Appointment Completed',
        message=f'Dr. {current_user.name} has marked your appointment on {appointment.date.strftime("%Y-%m-%d %H:%M")} as completed',
        type='appointment',
        reference_id=appointment.id,
        reference_type='appointment'
    )
    
    return jsonify({
        'success': True,
        'message': 'Appointment marked as completed',
        'appointment': appointment.to_dict(include_doctor=True, include_patient=True)
    }) 