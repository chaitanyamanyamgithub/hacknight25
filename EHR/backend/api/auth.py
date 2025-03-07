"""
Authentication API for the Healthcare EHR Backend
"""

from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash

from models.db import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login route for both doctors and patients"""
    data = request.json
    
    if not data or not data.get('email') or not data.get('password') or not data.get('user_type'):
        return jsonify({
            'success': False,
            'message': 'Email, password, and user type are required'
        }), 400
    
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type')
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password) or user.user_type != user_type:
        return jsonify({
            'success': False,
            'message': 'Invalid email, password, or user type'
        }), 401
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate auth token
    token = user.generate_auth_token()
    
    # Get additional user data
    user_data = user.to_dict()
    if user_type == 'doctor' and user.doctor:
        user_data.update(user.doctor.to_dict(include_user=False))
    elif user_type == 'patient' and user.patient:
        user_data.update(user.patient.to_dict(include_user=False))
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'token': token,
        'user': user_data
    })

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register route for both doctors and patients"""
    data = request.json
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name') or not data.get('user_type'):
        return jsonify({
            'success': False,
            'message': 'Email, password, name, and user type are required'
        }), 400
    
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    user_type = data.get('user_type')
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({
            'success': False,
            'message': 'Email already in use'
        }), 409
    
    # Create new user
    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        name=name,
        user_type=user_type,
        created_at=datetime.utcnow(),
        ethereum_address=data.get('ethereum_address')
    )
    
    # Add user-specific details
    if user_type == 'doctor':
        doctor = Doctor(
            user=user,
            specialization=data.get('specialization'),
            license_number=data.get('license_number'),
            hospital=data.get('hospital'),
            bio=data.get('bio'),
            education=data.get('education'),
            years_of_experience=data.get('years_of_experience')
        )
        db.session.add(doctor)
    elif user_type == 'patient':
        # Parse date of birth if provided
        date_of_birth = None
        if data.get('date_of_birth'):
            try:
                date_of_birth = datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d')
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid date format for date of birth. Use YYYY-MM-DD'
                }), 400
        
        patient = Patient(
            user=user,
            date_of_birth=date_of_birth,
            blood_type=data.get('blood_type'),
            allergies=data.get('allergies'),
            emergency_contact=data.get('emergency_contact'),
            medical_history=data.get('medical_history'),
            insurance_provider=data.get('insurance_provider'),
            insurance_id=data.get('insurance_id')
        )
        db.session.add(patient)
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type. Must be "doctor" or "patient"'
        }), 400
    
    db.session.add(user)
    db.session.commit()
    
    # Generate auth token
    token = user.generate_auth_token()
    
    # Get user data
    user_data = user.to_dict()
    if user_type == 'doctor' and user.doctor:
        user_data.update(user.doctor.to_dict(include_user=False))
    elif user_type == 'patient' and user.patient:
        user_data.update(user.patient.to_dict(include_user=False))
    
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'token': token,
        'user': user_data
    }), 201

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify JWT token and return user data"""
    data = request.json
    
    if not data or not data.get('token'):
        return jsonify({
            'success': False,
            'message': 'Token is required'
        }), 400
    
    token = data.get('token')
    
    # Verify token
    user = User.verify_auth_token(token)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'Invalid or expired token'
        }), 401
    
    # Get user data
    user_data = user.to_dict()
    if user.user_type == 'doctor' and user.doctor:
        user_data.update(user.doctor.to_dict(include_user=False))
    elif user.user_type == 'patient' and user.patient:
        user_data.update(user.patient.to_dict(include_user=False))
    
    return jsonify({
        'success': True,
        'message': 'Token valid',
        'user': user_data
    })

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password"""
    data = request.json
    
    if not data or not data.get('email'):
        return jsonify({
            'success': False,
            'message': 'Email is required'
        }), 400
    
    # In a real application, you would send a password reset email
    # For this demo, we'll just return a success message
    
    return jsonify({
        'success': True,
        'message': 'If an account with this email exists, a password reset link has been sent'
    })

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Change user password (requires authentication)"""
    data = request.json
    
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'message': 'Authorization header with Bearer token is required'
        }), 401
    
    token = auth_header.split(' ')[1]
    
    # Verify token
    user = User.verify_auth_token(token)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'Invalid or expired token'
        }), 401
    
    if not data or not data.get('current_password') or not data.get('new_password'):
        return jsonify({
            'success': False,
            'message': 'Current password and new password are required'
        }), 400
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    # Verify current password
    if not user.check_password(current_password):
        return jsonify({
            'success': False,
            'message': 'Current password is incorrect'
        }), 401
    
    # Set new password
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Password changed successfully'
    })

@auth_bp.route('/update-profile', methods=['PUT'])
def update_profile():
    """Update user profile (requires authentication)"""
    data = request.json
    
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'message': 'Authorization header with Bearer token is required'
        }), 401
    
    token = auth_header.split(' ')[1]
    
    # Verify token
    user = User.verify_auth_token(token)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'Invalid or expired token'
        }), 401
    
    # Update user data
    if data.get('name'):
        user.name = data.get('name')
    
    if data.get('ethereum_address'):
        user.ethereum_address = data.get('ethereum_address')
    
    # Update user-specific data
    if user.user_type == 'doctor' and user.doctor:
        doctor = user.doctor
        
        if data.get('specialization'):
            doctor.specialization = data.get('specialization')
        
        if data.get('hospital'):
            doctor.hospital = data.get('hospital')
        
        if data.get('bio'):
            doctor.bio = data.get('bio')
        
        if data.get('education'):
            doctor.education = data.get('education')
        
        if data.get('years_of_experience'):
            doctor.years_of_experience = data.get('years_of_experience')
        
    elif user.user_type == 'patient' and user.patient:
        patient = user.patient
        
        if data.get('date_of_birth'):
            try:
                patient.date_of_birth = datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d')
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid date format for date of birth. Use YYYY-MM-DD'
                }), 400
        
        if data.get('blood_type'):
            patient.blood_type = data.get('blood_type')
        
        if data.get('allergies'):
            patient.allergies = data.get('allergies')
        
        if data.get('emergency_contact'):
            patient.emergency_contact = data.get('emergency_contact')
        
        if data.get('medical_history'):
            patient.medical_history = data.get('medical_history')
        
        if data.get('insurance_provider'):
            patient.insurance_provider = data.get('insurance_provider')
        
        if data.get('insurance_id'):
            patient.insurance_id = data.get('insurance_id')
    
    db.session.commit()
    
    # Get updated user data
    user_data = user.to_dict()
    if user.user_type == 'doctor' and user.doctor:
        user_data.update(user.doctor.to_dict(include_user=False))
    elif user.user_type == 'patient' and user.patient:
        user_data.update(user.patient.to_dict(include_user=False))
    
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': user_data
    }) 