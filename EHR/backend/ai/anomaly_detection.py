"""
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