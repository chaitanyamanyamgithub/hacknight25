"""
Analytics API for the Healthcare EHR Backend
"""

from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import func, and_, extract
from models.db import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor
from models.medical_record import MedicalRecord
from models.appointment import Appointment

# Import token_required decorator
from api.patients import token_required

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_analytics(current_user):
    """Get dashboard analytics based on user type"""
    if current_user.user_type == 'doctor':
        return get_doctor_dashboard(current_user)
    elif current_user.user_type == 'patient':
        return get_patient_dashboard(current_user)
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type'
        }), 400

def get_doctor_dashboard(current_user):
    """Get analytics for doctor dashboard"""
    doctor_id = current_user.doctor.id
    
    # Get total patients
    total_patients = db.session.query(func.count(MedicalRecord.patient_id.distinct()))\
        .filter(MedicalRecord.doctor_id == doctor_id).scalar()
    
    # Get total appointments
    total_appointments = Appointment.query.filter_by(doctor_id=doctor_id).count()
    
    # Get upcoming appointments
    upcoming_appointments = Appointment.get_upcoming_appointments(doctor_id, 'doctor', limit=5)
    upcoming_appointments_data = [appointment.to_dict(include_patient=True) for appointment in upcoming_appointments]
    
    # Get recent medical records
    recent_records = MedicalRecord.query\
        .filter_by(doctor_id=doctor_id)\
        .order_by(MedicalRecord.date.desc())\
        .limit(5)\
        .all()
    recent_records_data = [record.to_dict() for record in recent_records]
    
    # Get appointments by status
    appointments_by_status = db.session.query(
        Appointment.status, func.count(Appointment.id)
    ).filter(
        Appointment.doctor_id == doctor_id
    ).group_by(
        Appointment.status
    ).all()
    
    appointments_by_status_data = {status: count for status, count in appointments_by_status}
    
    # Get records by type
    records_by_type = db.session.query(
        MedicalRecord.type, func.count(MedicalRecord.id)
    ).filter(
        MedicalRecord.doctor_id == doctor_id
    ).group_by(
        MedicalRecord.type
    ).all()
    
    records_by_type_data = {record_type: count for record_type, count in records_by_type}
    
    # Get appointments by month (last 6 months)
    now = datetime.utcnow()
    six_months_ago = now - timedelta(days=180)
    
    appointments_by_month = db.session.query(
        extract('year', Appointment.date).label('year'),
        extract('month', Appointment.date).label('month'),
        func.count(Appointment.id)
    ).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.date >= six_months_ago
    ).group_by(
        'year', 'month'
    ).order_by(
        'year', 'month'
    ).all()
    
    appointments_by_month_data = [
        {
            'year': int(year),
            'month': int(month),
            'count': count
        }
        for year, month, count in appointments_by_month
    ]
    
    return jsonify({
        'success': True,
        'total_patients': total_patients,
        'total_appointments': total_appointments,
        'upcoming_appointments': upcoming_appointments_data,
        'recent_records': recent_records_data,
        'appointments_by_status': appointments_by_status_data,
        'records_by_type': records_by_type_data,
        'appointments_by_month': appointments_by_month_data
    })

def get_patient_dashboard(current_user):
    """Get analytics for patient dashboard"""
    patient_id = current_user.patient.id
    
    # Get total medical records
    total_records = MedicalRecord.query.filter_by(patient_id=patient_id).count()
    
    # Get total appointments
    total_appointments = Appointment.query.filter_by(patient_id=patient_id).count()
    
    # Get upcoming appointments
    upcoming_appointments = Appointment.get_upcoming_appointments(patient_id, 'patient', limit=5)
    upcoming_appointments_data = [appointment.to_dict(include_doctor=True) for appointment in upcoming_appointments]
    
    # Get recent medical records
    recent_records = MedicalRecord.query\
        .filter_by(patient_id=patient_id)\
        .order_by(MedicalRecord.date.desc())\
        .limit(5)\
        .all()
    recent_records_data = [record.to_dict() for record in recent_records]
    
    # Get appointments by status
    appointments_by_status = db.session.query(
        Appointment.status, func.count(Appointment.id)
    ).filter(
        Appointment.patient_id == patient_id
    ).group_by(
        Appointment.status
    ).all()
    
    appointments_by_status_data = {status: count for status, count in appointments_by_status}
    
    # Get records by type
    records_by_type = db.session.query(
        MedicalRecord.type, func.count(MedicalRecord.id)
    ).filter(
        MedicalRecord.patient_id == patient_id
    ).group_by(
        MedicalRecord.type
    ).all()
    
    records_by_type_data = {record_type: count for record_type, count in records_by_type}
    
    # Get records by doctor
    records_by_doctor = db.session.query(
        Doctor.id, User.name, func.count(MedicalRecord.id)
    ).join(
        Doctor, Doctor.id == MedicalRecord.doctor_id
    ).join(
        User, User.id == Doctor.user_id
    ).filter(
        MedicalRecord.patient_id == patient_id
    ).group_by(
        Doctor.id, User.name
    ).all()
    
    records_by_doctor_data = [
        {
            'doctor_id': doctor_id,
            'doctor_name': doctor_name,
            'count': count
        }
        for doctor_id, doctor_name, count in records_by_doctor
    ]
    
    return jsonify({
        'success': True,
        'total_records': total_records,
        'total_appointments': total_appointments,
        'upcoming_appointments': upcoming_appointments_data,
        'recent_records': recent_records_data,
        'appointments_by_status': appointments_by_status_data,
        'records_by_type': records_by_type_data,
        'records_by_doctor': records_by_doctor_data
    })

@analytics_bp.route('/appointments', methods=['GET'])
@token_required
def get_appointment_analytics(current_user):
    """Get appointment analytics"""
    # Get query parameters
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    # Parse dates
    try:
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        else:
            start_date = datetime.utcnow() - timedelta(days=180)  # Default to last 6 months
            
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        else:
            end_date = datetime.utcnow()
    except ValueError:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
        }), 400
    
    # Build base query based on user type
    if current_user.user_type == 'doctor':
        base_query = Appointment.query.filter_by(doctor_id=current_user.doctor.id)
    elif current_user.user_type == 'patient':
        base_query = Appointment.query.filter_by(patient_id=current_user.patient.id)
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type'
        }), 400
    
    # Add date filters
    query = base_query.filter(
        Appointment.date >= start_date,
        Appointment.date <= end_date
    )
    
    # Get appointments by status
    appointments_by_status = db.session.query(
        Appointment.status, func.count(Appointment.id)
    ).filter(
        Appointment.id.in_([a.id for a in query])
    ).group_by(
        Appointment.status
    ).all()
    
    appointments_by_status_data = {status: count for status, count in appointments_by_status}
    
    # Get appointments by month
    appointments_by_month = db.session.query(
        extract('year', Appointment.date).label('year'),
        extract('month', Appointment.date).label('month'),
        func.count(Appointment.id)
    ).filter(
        Appointment.id.in_([a.id for a in query])
    ).group_by(
        'year', 'month'
    ).order_by(
        'year', 'month'
    ).all()
    
    appointments_by_month_data = [
        {
            'year': int(year),
            'month': int(month),
            'count': count
        }
        for year, month, count in appointments_by_month
    ]
    
    # Get appointments by day of week
    appointments_by_day = db.session.query(
        extract('dow', Appointment.date).label('day_of_week'),
        func.count(Appointment.id)
    ).filter(
        Appointment.id.in_([a.id for a in query])
    ).group_by(
        'day_of_week'
    ).order_by(
        'day_of_week'
    ).all()
    
    # Convert day of week (0 = Sunday, 6 = Saturday) to day name
    day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    appointments_by_day_data = {day_names[int(day)]: count for day, count in appointments_by_day}
    
    return jsonify({
        'success': True,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'appointments_by_status': appointments_by_status_data,
        'appointments_by_month': appointments_by_month_data,
        'appointments_by_day': appointments_by_day_data
    })

@analytics_bp.route('/records', methods=['GET'])
@token_required
def get_record_analytics(current_user):
    """Get medical record analytics"""
    # Get query parameters
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    # Parse dates
    try:
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        else:
            start_date = datetime.utcnow() - timedelta(days=365)  # Default to last year
            
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        else:
            end_date = datetime.utcnow()
    except ValueError:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
        }), 400
    
    # Build base query based on user type
    if current_user.user_type == 'doctor':
        base_query = MedicalRecord.query.filter_by(doctor_id=current_user.doctor.id)
    elif current_user.user_type == 'patient':
        base_query = MedicalRecord.query.filter_by(patient_id=current_user.patient.id)
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type'
        }), 400
    
    # Add date filters
    query = base_query.filter(
        MedicalRecord.date >= start_date,
        MedicalRecord.date <= end_date
    )
    
    # Get records by type
    records_by_type = db.session.query(
        MedicalRecord.type, func.count(MedicalRecord.id)
    ).filter(
        MedicalRecord.id.in_([r.id for r in query])
    ).group_by(
        MedicalRecord.type
    ).all()
    
    records_by_type_data = {record_type: count for record_type, count in records_by_type}
    
    # Get records by month
    records_by_month = db.session.query(
        extract('year', MedicalRecord.date).label('year'),
        extract('month', MedicalRecord.date).label('month'),
        func.count(MedicalRecord.id)
    ).filter(
        MedicalRecord.id.in_([r.id for r in query])
    ).group_by(
        'year', 'month'
    ).order_by(
        'year', 'month'
    ).all()
    
    records_by_month_data = [
        {
            'year': int(year),
            'month': int(month),
            'count': count
        }
        for year, month, count in records_by_month
    ]
    
    # Get blockchain usage
    blockchain_usage = db.session.query(
        MedicalRecord.is_on_blockchain, func.count(MedicalRecord.id)
    ).filter(
        MedicalRecord.id.in_([r.id for r in query])
    ).group_by(
        MedicalRecord.is_on_blockchain
    ).all()
    
    blockchain_usage_data = {
        'on_blockchain': next((count for is_on_blockchain, count in blockchain_usage if is_on_blockchain), 0),
        'not_on_blockchain': next((count for is_on_blockchain, count in blockchain_usage if not is_on_blockchain), 0)
    }
    
    return jsonify({
        'success': True,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'records_by_type': records_by_type_data,
        'records_by_month': records_by_month_data,
        'blockchain_usage': blockchain_usage_data
    }) 