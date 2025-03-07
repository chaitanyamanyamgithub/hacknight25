"""
AI API for the Healthcare EHR Backend
"""

import json
import numpy as np
import sys
import os
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from models.db import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor
from models.medical_record import MedicalRecord

# Import token_required decorator
from api.patients import token_required

# Add parent directory to path for proper imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import AI modules using absolute imports
from ai.anomaly_detection import detect_anomalies
from ai.health_prediction import predict_health_risks

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/anomaly-detection', methods=['POST'])
@token_required
def run_anomaly_detection(current_user):
    """Run anomaly detection on patient data"""
    # Only doctors can run anomaly detection
    if current_user.user_type != 'doctor':
        return jsonify({
            'success': False,
            'message': 'Only doctors can run anomaly detection'
        }), 403
    
    data = request.json
    
    if not data or not data.get('patient_id'):
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
    
    try:
        # Get patient medical records
        records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
        
        if not records:
            return jsonify({
                'success': False,
                'message': 'No medical records found for this patient'
            }), 404
        
        # Prepare data for anomaly detection
        record_data = []
        for record in records:
            # Extract metadata if available
            metadata = {}
            if record.record_metadata:
                try:
                    metadata = json.loads(record.record_metadata)
                except:
                    pass
            
            # Add record data
            record_data.append({
                'id': record.id,
                'title': record.title,
                'type': record.type,
                'description': record.description,
                'date': record.date.isoformat() if record.date else None,
                'metadata': metadata
            })
        
        # Run anomaly detection
        anomalies = detect_anomalies(record_data)
        
        return jsonify({
            'success': True,
            'patient_id': patient_id,
            'patient_name': patient.user.name,
            'anomalies': anomalies
        })
        
    except Exception as e:
        current_app.logger.error(f"Error running anomaly detection: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error running anomaly detection: {str(e)}'
        }), 500

@ai_bp.route('/health-prediction', methods=['POST'])
@token_required
def run_health_prediction(current_user):
    """Run health prediction for a patient"""
    data = request.json
    
    if not data or not data.get('patient_id'):
        return jsonify({
            'success': False,
            'message': 'Patient ID is required'
        }), 400
    
    patient_id = data.get('patient_id')
    
    # Check permissions
    if current_user.user_type == 'patient' and current_user.patient.id != patient_id:
        return jsonify({
            'success': False,
            'message': 'You can only run health prediction for yourself'
        }), 403
    
    # Check if patient exists
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    try:
        # Get patient medical records
        records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
        
        if not records:
            return jsonify({
                'success': False,
                'message': 'No medical records found for this patient'
            }), 404
        
        # Prepare data for health prediction
        record_data = []
        for record in records:
            # Extract metadata if available
            metadata = {}
            if record.record_metadata:
                try:
                    metadata = json.loads(record.record_metadata)
                except:
                    pass
            
            # Add record data
            record_data.append({
                'id': record.id,
                'title': record.title,
                'type': record.type,
                'description': record.description,
                'date': record.date.isoformat() if record.date else None,
                'metadata': metadata
            })
        
        # Get patient age
        age = patient.get_age()
        
        # Run health prediction
        predictions = predict_health_risks(record_data, age=age)
        
        return jsonify({
            'success': True,
            'patient_id': patient_id,
            'patient_name': patient.user.name,
            'predictions': predictions
        })
        
    except Exception as e:
        current_app.logger.error(f"Error running health prediction: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error running health prediction: {str(e)}'
        }), 500

# Create AI module files
def create_ai_modules():
    """Create AI module files if they don't exist"""
    import os
    
    # Create AI directory if it doesn't exist
    ai_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai')
    os.makedirs(ai_dir, exist_ok=True)
    
    # Create __init__.py
    init_path = os.path.join(ai_dir, '__init__.py')
    if not os.path.exists(init_path):
        with open(init_path, 'w') as f:
            f.write('"""AI modules for the Healthcare EHR Backend"""\n')
    
    # Create anomaly_detection.py
    anomaly_path = os.path.join(ai_dir, 'anomaly_detection.py')
    if not os.path.exists(anomaly_path):
        with open(anomaly_path, 'w') as f:
            f.write('''"""
Anomaly detection module for the Healthcare EHR Backend
"""

import numpy as np
from datetime import datetime

def detect_anomalies(record_data):
    """
    Detect anomalies in patient medical records
    
    Args:
        record_data (list): List of medical record data
        
    Returns:
        list: List of detected anomalies
    """
    # This is a simplified implementation for demonstration purposes
    # In a real application, this would use more sophisticated algorithms
    
    anomalies = []
    
    # Sort records by date
    sorted_records = sorted(record_data, key=lambda x: x.get('date', ''))
    
    # Check for rapid changes in vital signs
    for i in range(1, len(sorted_records)):
        current = sorted_records[i]
        previous = sorted_records[i-1]
        
        # Extract metadata
        current_meta = current.get('metadata', {})
        previous_meta = previous.get('metadata', {})
        
        # Check blood pressure if available
        if 'blood_pressure' in current_meta and 'blood_pressure' in previous_meta:
            current_bp = current_meta['blood_pressure']
            previous_bp = previous_meta['blood_pressure']
            
            # Check for significant changes
            if isinstance(current_bp, dict) and isinstance(previous_bp, dict):
                systolic_change = abs(current_bp.get('systolic', 0) - previous_bp.get('systolic', 0))
                diastolic_change = abs(current_bp.get('diastolic', 0) - previous_bp.get('diastolic', 0))
                
                if systolic_change > 30 or diastolic_change > 20:
                    anomalies.append({
                        'type': 'blood_pressure_change',
                        'severity': 'high' if systolic_change > 50 or diastolic_change > 30 else 'medium',
                        'description': f'Significant change in blood pressure between records',
                        'record_ids': [previous['id'], current['id']],
                        'details': {
                            'previous': previous_bp,
                            'current': current_bp,
                            'change': {
                                'systolic': systolic_change,
                                'diastolic': diastolic_change
                            }
                        }
                    })
        
        # Check heart rate if available
        if 'heart_rate' in current_meta and 'heart_rate' in previous_meta:
            current_hr = current_meta['heart_rate']
            previous_hr = previous_meta['heart_rate']
            
            # Check for significant changes
            if isinstance(current_hr, (int, float)) and isinstance(previous_hr, (int, float)):
                hr_change = abs(current_hr - previous_hr)
                
                if hr_change > 20:
                    anomalies.append({
                        'type': 'heart_rate_change',
                        'severity': 'high' if hr_change > 40 else 'medium',
                        'description': f'Significant change in heart rate between records',
                        'record_ids': [previous['id'], current['id']],
                        'details': {
                            'previous': previous_hr,
                            'current': current_hr,
                            'change': hr_change
                        }
                    })
    
    # Check for abnormal lab results
    for record in record_data:
        if record.get('type') == 'Lab Results':
            meta = record.get('metadata', {})
            
            # Check blood glucose if available
            if 'blood_glucose' in meta:
                glucose = meta['blood_glucose']
                
                if isinstance(glucose, (int, float)) and (glucose < 70 or glucose > 180):
                    anomalies.append({
                        'type': 'abnormal_blood_glucose',
                        'severity': 'high' if glucose < 50 or glucose > 250 else 'medium',
                        'description': f'Abnormal blood glucose level: {glucose} mg/dL',
                        'record_ids': [record['id']],
                        'details': {
                            'value': glucose,
                            'normal_range': '70-180 mg/dL'
                        }
                    })
            
            # Check cholesterol if available
            if 'cholesterol' in meta:
                chol = meta.get('cholesterol', {})
                
                if isinstance(chol, dict) and 'ldl' in chol and isinstance(chol['ldl'], (int, float)) and chol['ldl'] > 130:
                    anomalies.append({
                        'type': 'high_ldl_cholesterol',
                        'severity': 'high' if chol['ldl'] > 160 else 'medium',
                        'description': f'High LDL cholesterol level: {chol["ldl"]} mg/dL',
                        'record_ids': [record['id']],
                        'details': {
                            'value': chol['ldl'],
                            'normal_range': '<130 mg/dL'
                        }
                    })
    
    return anomalies
''')
    
    # Create health_prediction.py
    prediction_path = os.path.join(ai_dir, 'health_prediction.py')
    if not os.path.exists(prediction_path):
        with open(prediction_path, 'w') as f:
            f.write('''"""
Health prediction module for the Healthcare EHR Backend
"""

import numpy as np
from datetime import datetime

def predict_health_risks(record_data, age=None):
    """
    Predict health risks based on patient medical records
    
    Args:
        record_data (list): List of medical record data
        age (int, optional): Patient age
        
    Returns:
        dict: Dictionary of health risk predictions
    """
    # This is a simplified implementation for demonstration purposes
    # In a real application, this would use trained machine learning models
    
    # Initialize risk scores
    risk_scores = {
        'cardiovascular': 0.0,
        'diabetes': 0.0,
        'respiratory': 0.0
    }
    
    # Risk factors from records
    has_hypertension = False
    has_high_cholesterol = False
    has_high_glucose = False
    has_smoking_history = False
    has_family_history_heart_disease = False
    has_obesity = False
    has_asthma = False
    
    # Extract risk factors from records
    for record in record_data:
        description = record.get('description', '').lower()
        title = record.get('title', '').lower()
        meta = record.get('metadata', {})
        
        # Check for hypertension
        if 'hypertension' in description or 'high blood pressure' in description:
            has_hypertension = True
            risk_scores['cardiovascular'] += 0.2
        
        # Check for high cholesterol
        if 'cholesterol' in meta:
            chol = meta.get('cholesterol', {})
            if isinstance(chol, dict) and 'ldl' in chol and isinstance(chol['ldl'], (int, float)) and chol['ldl'] > 130:
                has_high_cholesterol = True
                risk_scores['cardiovascular'] += 0.2
        
        # Check for high blood glucose
        if 'blood_glucose' in meta:
            glucose = meta['blood_glucose']
            if isinstance(glucose, (int, float)) and glucose > 126:
                has_high_glucose = True
                risk_scores['diabetes'] += 0.3
        
        # Check for smoking history
        if 'smoking' in description or 'smoker' in description:
            has_smoking_history = True
            risk_scores['cardiovascular'] += 0.2
            risk_scores['respiratory'] += 0.3
        
        # Check for family history of heart disease
        if 'family history' in description and ('heart' in description or 'cardiac' in description):
            has_family_history_heart_disease = True
            risk_scores['cardiovascular'] += 0.15
        
        # Check for obesity
        if 'obesity' in description or 'obese' in description:
            has_obesity = True
            risk_scores['cardiovascular'] += 0.15
            risk_scores['diabetes'] += 0.2
        
        # Check for asthma
        if 'asthma' in description or 'asthma' in title:
            has_asthma = True
            risk_scores['respiratory'] += 0.3
    
    # Adjust risk based on age
    if age is not None:
        if age > 50:
            risk_scores['cardiovascular'] += 0.1
        if age > 60:
            risk_scores['cardiovascular'] += 0.1
        if age > 70:
            risk_scores['cardiovascular'] += 0.1
    
    # Calculate risk levels
    risk_levels = {}
    for risk_type, score in risk_scores.items():
        if score < 0.2:
            risk_levels[risk_type] = 'low'
        elif score < 0.5:
            risk_levels[risk_type] = 'moderate'
        else:
            risk_levels[risk_type] = 'high'
    
    # Generate recommendations
    recommendations = []
    
    if risk_scores['cardiovascular'] >= 0.3:
        recommendations.append({
            'type': 'cardiovascular',
            'description': 'Regular cardiovascular check-ups recommended',
            'frequency': 'Every 6 months' if risk_scores['cardiovascular'] >= 0.5 else 'Yearly'
        })
    
    if has_hypertension:
        recommendations.append({
            'type': 'cardiovascular',
            'description': 'Monitor blood pressure regularly',
            'frequency': 'Weekly'
        })
    
    if has_high_cholesterol:
        recommendations.append({
            'type': 'cardiovascular',
            'description': 'Cholesterol management and follow-up testing',
            'frequency': 'Every 3 months'
        })
    
    if risk_scores['diabetes'] >= 0.3:
        recommendations.append({
            'type': 'diabetes',
            'description': 'Diabetes screening and glucose monitoring',
            'frequency': 'Every 3 months' if risk_scores['diabetes'] >= 0.5 else 'Every 6 months'
        })
    
    if has_asthma or risk_scores['respiratory'] >= 0.3:
        recommendations.append({
            'type': 'respiratory',
            'description': 'Pulmonary function testing',
            'frequency': 'Every 6 months'
        })
    
    return {
        'risk_scores': risk_scores,
        'risk_levels': risk_levels,
        'risk_factors': {
            'hypertension': has_hypertension,
            'high_cholesterol': has_high_cholesterol,
            'high_glucose': has_high_glucose,
            'smoking_history': has_smoking_history,
            'family_history_heart_disease': has_family_history_heart_disease,
            'obesity': has_obesity,
            'asthma': has_asthma
        },
        'recommendations': recommendations
    }
''')

# Create AI modules when this module is imported
create_ai_modules() 