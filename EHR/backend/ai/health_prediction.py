"""
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